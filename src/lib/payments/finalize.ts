import { prisma } from "@/lib/db";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";

export async function finalizePaystackPayment(reference: string) {
  const payment = await prisma.payment.findUnique({
    where: { providerReference: reference },
    include: {
      order: {
        include: {
          items: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!payment || payment.provider !== "PAYSTACK") {
    return { status: "NOT_FOUND" as const };
  }

  if (payment.status !== "PENDING") {
    return {
      status: payment.status as "SUCCESS" | "FAILED",
      orderStatus: payment.order.status,
    };
  }

  const verification = await verifyPaystackTransaction(reference);

  if (
    verification.reference !== payment.providerReference ||
    verification.amountMinor !== payment.amountMinor ||
    verification.amountMinor !== payment.order.totalMinor ||
    verification.currency !== payment.order.currency ||
    verification.currency !== "NGN" ||
    verification.orderReference !== payment.order.reference
  ) {
    return { status: "VERIFICATION_MISMATCH" as const };
  }

  if (verification.status === "PENDING") {
    return { status: "PENDING" as const };
  }

  if (verification.status === "FAILED") {
    await prisma.$transaction(async (tx) => {
      const changed = await tx.payment.updateMany({
        where: { id: payment.id, status: "PENDING" },
        data: { status: "FAILED" },
      });

      if (changed.count === 1) {
        await tx.order.updateMany({
          where: { id: payment.orderId, status: "PENDING" },
          data: { status: "FAILED" },
        });
      }
    });

    return { status: "FAILED" as const };
  }

  const finalized = await prisma.$transaction(async (tx) => {
    const changed = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: {
        status: "SUCCESS",
        verifiedAt: new Date(),
      },
    });

    if (changed.count === 0) {
      const current = await tx.payment.findUniqueOrThrow({
        where: { id: payment.id },
      });

      return current.status;
    }

    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" },
    });

    const productLabel = payment.order.items
      .map((item) => `${item.quantity}x ${item.product.name}`)
      .join(", ");

    await tx.transaction.create({
      data: {
        businessId: payment.order.businessId,
        orderId: payment.order.id,
        source: "ONLINE_PAYMENT",
        amountMinor: payment.order.totalMinor,
        productLabel,
        occurredAt: new Date(),
        syncStatus: "SYNCED",
      },
    });

    return "SUCCESS";
  });

  return {
    status: finalized as "SUCCESS" | "FAILED",
    orderStatus: finalized === "SUCCESS" ? "PAID" : payment.order.status,
  };
}
