import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { sendInvitationEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/utils";

export async function POST(
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

  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  if (!guest.email) return NextResponse.json({ error: "Guest has no email address" }, { status: 400 });

  const settings = await prisma.eventSetting.findFirst({ orderBy: { id: "asc" } });

  const inviteLink = `${getBaseUrl()}/invite/${guest.inviteToken}`;

  try {
    await sendInvitationEmail({
      to: guest.email,
      guestName: guest.fullName,
      eventName: settings?.eventName ?? "Our Special Event",
      inviteLink,
      eventDate: settings?.eventDate?.toISOString(),
      venueName: settings?.venueName,
      venueAddress: settings?.venueAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
