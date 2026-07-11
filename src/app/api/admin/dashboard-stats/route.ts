import { RSVPStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  try {
    const [
      totalInvited,
      accepted,
      declined,
      maybe,
      pending,
      checkedIn,
    ] = await Promise.all([
      prisma.guest.count(),
      prisma.guest.count({ where: { rsvpStatus: RSVPStatus.ACCEPT } }),
      prisma.guest.count({ where: { rsvpStatus: RSVPStatus.DECLINE } }),
      prisma.guest.count({ where: { rsvpStatus: RSVPStatus.MAYBE } }),
      prisma.guest.count({ where: { rsvpStatus: RSVPStatus.PENDING } }),
      prisma.guest.count({ where: { isCheckedIn: true } }),
    ]);

    return NextResponse.json({
      totalInvited,
      accepted,
      declined,
      maybe,
      pending,
      checkedIn,
    });
  } catch {
    return NextResponse.json({
      totalInvited: 0,
      accepted: 0,
      declined: 0,
      maybe: 0,
      pending: 0,
      checkedIn: 0,
      degraded: true,
    });
  }
}
