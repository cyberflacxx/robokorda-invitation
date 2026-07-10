import { Prisma, RSVPStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rsvpSchema } from "@/lib/validators";

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

        const rsvp = await tx.rSVP.create({
          data: {
            guestId: guest.id,
            status: payload.status,
            gender: guest.gender,
            notes: payload.notes ?? null,
          },
        });

        await tx.guest.update({
          where: { id: guest.id },
          data: {
            rsvpStatus: payload.status,
            selectedStarterId: null,
            selectedMainId: null,
            selectedDessertId: null,
            selectedTableId: null,
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
      message.includes("missing gender")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
