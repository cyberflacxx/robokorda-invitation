import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { gallerySchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const images = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  try {
    const payload = await request.json();
    const parsed = gallerySchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid gallery payload" }, { status: 400 });
    }

    const data = parsed.data;

    const image = await prisma.$transaction(async (tx) => {
      const heroFlag = data.isHero || data.type === "HERO";
      if (heroFlag) {
        await tx.galleryImage.updateMany({ data: { isHero: false } });
      }

      return tx.galleryImage.create({
        data: {
          title: data.title,
          imageUrl: data.imageUrl,
          type: heroFlag ? "HERO" : "GALLERY",
          isHero: heroFlag,
        },
      });
    });

    return NextResponse.json({ success: true, image });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save image";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
