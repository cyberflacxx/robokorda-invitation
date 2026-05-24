import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { guestUpdateSchema } from "@/lib/validators";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { id } = await params;
  const guestId = Number(id);

  if (Number.isNaN(guestId)) {
    return NextResponse.json({ error: "Invalid guest id" }, { status: 400 });
  }

  try {
    const payload = await request.json();
    const parsed = guestUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const guest = await prisma.guest.update({ where: { id: guestId }, data: parsed.data });
    return NextResponse.json({ success: true, guest });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update guest";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { id } = await params;
  const guestId = Number(id);

  if (Number.isNaN(guestId)) {
    return NextResponse.json({ error: "Invalid guest id" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const guest = await tx.guest.findUnique({ where: { id: guestId } });
      if (!guest) throw new Error("Guest not found");

      for (const mealId of [guest.selectedStarterId, guest.selectedMainId, guest.selectedDessertId]) {
        if (mealId) {
          await tx.meal.update({
            where: { id: mealId },
            data: { reservedQuantity: { decrement: 1 } },
          });
        }
      }

      if (guest.selectedTableId) {
        await tx.eventTable.update({
          where: { id: guest.selectedTableId },
          data: { reservedSeats: { decrement: 1 } },
        });
      }

      await tx.guest.delete({ where: { id: guestId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete guest";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
