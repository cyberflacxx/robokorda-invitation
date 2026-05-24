import { Prisma, RSVPStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rsvpSchema } from "@/lib/validators";

async function reserveMeal(tx: Prisma.TransactionClient, mealId: number | null | undefined) {
  if (!mealId) return;
  const meal = await tx.meal.findUnique({ where: { id: mealId } });
  if (!meal || !meal.isActive) throw new Error(`Meal (id ${mealId}) is not available`);
  if (meal.reservedQuantity >= meal.availableQuantity) throw new Error(`${meal.name} is fully booked`);
  await tx.meal.update({ where: { id: meal.id }, data: { reservedQuantity: { increment: 1 } } });
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = rsvpSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid RSVP payload" }, { status: 400 });
    }

    const payload = parsed.data;

    const result = await prisma.$transaction(
      async (tx) => {
        const guest = await tx.guest.findUnique({
          where: { inviteToken: payload.token },
          include: { rsvp: true },
        });

        if (!guest || guest.rsvpCode !== payload.rsvpCode) {
          throw new Error("Invalid invitation token or RSVP code");
        }

        if (guest.rsvp || guest.rsvpStatus !== RSVPStatus.PENDING) {
          throw new Error("RSVP has already been submitted");
        }

        if (!guest.gender) {
          throw new Error("Guest profile is missing gender. Please contact the host.");
        }

        const needsReservation =
          payload.status === RSVPStatus.ACCEPT || payload.status === RSVPStatus.MAYBE;

        if (needsReservation && (!payload.mainId || !payload.tableId)) {
          throw new Error("A main course and table selection are required when accepting");
        }

        await reserveMeal(tx, payload.starterId);
        await reserveMeal(tx, payload.mainId);
        await reserveMeal(tx, payload.dessertId);

        if (payload.tableId) {
          const table = await tx.eventTable.findUnique({ where: { id: payload.tableId } });
          if (!table || !table.isActive) throw new Error("Selected table is not available");
          if (table.reservedSeats >= table.capacity) throw new Error("Selected table is fully booked");
          await tx.eventTable.update({
            where: { id: table.id },
            data: { reservedSeats: { increment: 1 } },
          });
        }

        const rsvp = await tx.rSVP.create({
          data: {
            guestId: guest.id,
            status: payload.status,
            gender: guest.gender,
            starterId: payload.starterId ?? null,
            mainId: payload.mainId ?? null,
            dessertId: payload.dessertId ?? null,
            tableId: payload.tableId ?? null,
            notes: payload.notes ?? null,
          },
        });

        await tx.guest.update({
          where: { id: guest.id },
          data: {
            rsvpStatus: payload.status,
            selectedStarterId: payload.starterId ?? null,
            selectedMainId: payload.mainId ?? null,
            selectedDessertId: payload.dessertId ?? null,
            selectedTableId: payload.tableId ?? null,
          },
        });

        return rsvp;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return NextResponse.json({ success: true, rsvp: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit RSVP";
    const status =
      message.includes("already") ||
      message.includes("Invalid") ||
      message.includes("required") ||
      message.includes("missing gender") ||
      message.includes("booked") ||
      message.includes("available")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
