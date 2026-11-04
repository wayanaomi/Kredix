import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validation/sales";
import {
  initializePaystackTransaction,
  isPaystackConfigured,
} from "@/lib/payments/paystack";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isPaystackConfigured()) {
      return NextResponse.json(
        { error: "Online payments are temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const { slug } = await params;

    const storefront = await prisma.storefront.findUnique({
      where: { slug },
    });

    if (!storefront || !storefront.isPublished) {
      return NextResponse.json(
        { error: "Storefront not found" },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const customerInput = parsed.data.customer;
    const email = customerInput.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "A valid email address is required for payment." },
        { status: 400 }
      );
    }

    const productIds = parsed.data.items.map((item) => item.productId);

    if (new Set(productIds).size !== productIds.length) {
      return NextResponse.json(
        { error: "Duplicate products are not allowed in the cart." },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        businessId: storefront.businessId,
        deletedAt: null,
        isAvailable: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products are unavailable." },
        { status: 400 }
      );
    }

    const priceById = new Map(
      products.map((product) => [product.id, product.priceMinor])
    );

    const totalMinor = parsed.data.items.reduce(
      (sum, item) =>
        sum + (priceById.get(item.productId) ?? 0) * item.quantity,
      0
    );

    if (!Number.isSafeInteger(totalMinor) || totalMinor <= 0) {
      return NextResponse.json(
        { error: "The order amount is invalid." },
        { status: 400 }
      );
    }

    const orderReference = `KDX-${crypto.randomUUID()}`;

    const initiated = await initializePaystackTransaction({
      email,
      reference: orderReference,
      amountMinor: totalMinor,
      orderId: orderReference,
    });

    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          name: customerInput.name,
          phone: customerInput.phone,
          email,
        },
      });

      const createdOrder = await tx.order.create({
        data: {
          businessId: storefront.businessId,
          customerId: customer.id,
          reference: orderReference,
          totalMinor,
          currency: "NGN",
          status: "PENDING",
          items: {
            create: parsed.data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPriceMinor: priceById.get(item.productId) ?? 0,
            })),
          },
        },
      });

      await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          provider: "PAYSTACK",
          providerReference: initiated.reference,
          amountMinor: totalMinor,
          status: "PENDING",
        },
      });

      return createdOrder;
    });

    return NextResponse.json({
      redirectUrl: initiated.authorizationUrl,
      orderReference: order.reference,
    });
  } catch (error) {
    console.error(
      "Storefront checkout failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "We could not start your payment. Please try again." },
      { status: 502 }
    );
  }
}
