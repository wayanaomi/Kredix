import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { revokePassportShare } from "@/lib/passport";
import { writeAudit } from "@/lib/audit";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const share = await prisma.passportShare.findUnique({
      where: { id },
      include: { passport: true },
    });
    if (!share || share.passport.businessId !== business.id) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 });
    }

    await revokePassportShare(id);
    await writeAudit({
      actorUserId: user.id,
      actorRole: user.role,
      action: "PASSPORT_SHARE_REVOKED",
      entityType: "PassportShare",
      entityId: id,
    });

    return NextResponse.json({ revoked: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
