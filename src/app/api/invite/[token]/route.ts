import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getSampleGuestPayload(token: string) {
  const sampleGuests: Record<string, { fullName: string }> = {
    "sample-dambu-token": { fullName: "Dambu" },
    "sample-maita-token": { fullName: "Maita" },
  };

  const sample = sampleGuests[token];
  if (!sample) return null;

  return {
    guest: {
      id: 0,
      fullName: sample.fullName,
      inviteToken: token,
      rsvpStatus: "PENDING",
    },
    settings: {
      eventName: "Robokorda 10th Anniversary",
      eventDate: "2026-09-13T00:00:00.000Z",
      eventTime: "17:00",
      venueName: "Manna Safari Lodge",
      venueAddress: "Harare Zimbabwe",
      dressCode: "Formal / Corporate Elegant",
      theme: "Celebrating 10 Years of Innovation",
      heroImageUrl: null,
    },
    gallery: [],
  };
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  try {
    const guest = await prisma.guest.findUnique({
      where: { inviteToken: token },
      include: {
        rsvp: true,
      },
    });

    if (!guest) {
      const samplePayload = getSampleGuestPayload(token);
      if (samplePayload) return NextResponse.json(samplePayload);
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const [settings, gallery] = await Promise.all([
      prisma.eventSetting.findFirst({ orderBy: { id: "asc" } }),
      prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    return NextResponse.json({
      guest: {
        id: guest.id,
        fullName: guest.fullName,
        inviteToken: guest.inviteToken,
        rsvpStatus: guest.rsvpStatus,
      },
      settings,
      gallery,
    });
  } catch {
    const samplePayload = getSampleGuestPayload(token);
    if (samplePayload) return NextResponse.json(samplePayload);
    return NextResponse.json(
      { error: "Unable to load invitation right now. Please try again." },
      { status: 500 },
    );
  }
}
