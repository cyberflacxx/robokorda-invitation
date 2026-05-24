import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const imageId = Number(id);

  if (Number.isNaN(imageId)) {
    return NextResponse.json({ error: "Invalid image id" }, { status: 400 });
  }

  try {
    await prisma.galleryImage.delete({ where: { id: imageId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete image";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
