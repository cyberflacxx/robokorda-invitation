import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { mealSchema } from "@/lib/validators";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const mealId = Number(id);

  if (Number.isNaN(mealId)) {
    return NextResponse.json({ error: "Invalid meal id" }, { status: 400 });
  }

  try {
    const payload = await request.json();
    const parsed = mealSchema.partial().safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const meal = await prisma.meal.update({
      where: { id: mealId },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, meal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update meal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const mealId = Number(id);

  if (Number.isNaN(mealId)) {
    return NextResponse.json({ error: "Invalid meal id" }, { status: 400 });
  }

  try {
    const meal = await prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    if (meal.reservedQuantity > 0) {
      return NextResponse.json({ error: "Cannot delete meal with reservations" }, { status: 400 });
    }

    await prisma.meal.delete({ where: { id: mealId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete meal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
