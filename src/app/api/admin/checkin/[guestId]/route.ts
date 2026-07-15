import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { checkInSchema } from "@/lib/validators";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ guestId: string }> },
) {
  const auth = await requireAdmin();
  if (auth.response || !auth.session) {
    return auth.response ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { guestId } = await params;
  const id = Number(guestId);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid guest id" }, { status: 400 });
  }

  try {
    const payload = await request.json().catch(() => ({}));
    const parsed = checkInSchema.partial().safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid check-in payload" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const guest = await tx.guest.findUnique({ where: { id } });
      if (!guest) {
        throw new Error("Guest not found");
      }

      if (parsed.data.rsvpCode && parsed.data.rsvpCode !== guest.rsvpCode) {
        throw new Error("Invalid RSVP code");
      }

      if (guest.rsvpStatus !== "ACCEPT") {
        throw new Error("Only accepted guests can be checked in");
      }

      if (guest.isCheckedIn) {
        throw new Error("Guest is already checked in");
      }

      const checkIn = await tx.checkIn.create({
        data: {
          guestId: guest.id,
          checkedInBy: auth.session.userId,
        },
      });

      await tx.guest.update({
        where: { id: guest.id },
        data: { isCheckedIn: true },
      });

      return checkIn;
    });

    return NextResponse.json({ success: true, checkIn: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check-in failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ guestId: string }> },
) {
  const auth = await requireAdmin();
  if (auth.response || !auth.session) {
    return auth.response ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { guestId } = await params;
  const id = Number(guestId);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid guest id" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const guest = await tx.guest.findUnique({ where: { id } });
      if (!guest) {
        throw new Error("Guest not found");
      }

      if (!guest.isCheckedIn) {
        throw new Error("Guest is not checked in");
      }

      await tx.checkIn.delete({
        where: { guestId: guest.id },
      });

      await tx.guest.update({
        where: { id: guest.id },
        data: { isCheckedIn: false },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Undo check-in failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
