import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { getEnv } from "@/lib/env";

export const runtime = "nodejs";

const folders = {
  "business-logo": "kredix/business-logos",
  "product-image": "kredix/product-images",
} as const;

export async function POST(req: NextRequest) {
  try {
    await requireUser(["SME_OWNER"]);

    const body = await req.json().catch(() => null);
    const kind = body?.kind as keyof typeof folders;

    if (!kind || !Object.prototype.hasOwnProperty.call(folders, kind)) {
      return NextResponse.json({ error: "Invalid image type." }, { status: 400 });
    }

    const env = getEnv();

    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Image uploads are not configured yet. Please contact support." },
        { status: 503 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = folders[kind];
    const toSign = `folder=${folder}&timestamp=${timestamp}`;

    const signature = createHash("sha1")
      .update(toSign + env.CLOUDINARY_API_SECRET)
      .digest("hex");

    return NextResponse.json({
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
