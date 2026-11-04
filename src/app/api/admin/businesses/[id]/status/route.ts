import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { BusinessStatus } from "@/lib/enums";
import { writeAudit } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser(["ADMIN"]);

    const body = await req.json().catch(() => null);
    const parsed = BusinessStatus.safeParse(body?.status);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const business = await prisma.business.update({ where: { id }, data: { status: parsed.data } });

    await writeAudit({
      actorUserId: user.id,
      actorRole: user.role,
      action: "BUSINESS_STATUS_UPDATED",
      entityType: "Business",
      entityId: id,
      metadata: { status: parsed.data },
    });

    return NextResponse.json({ business });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
