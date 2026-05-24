import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getSampleGuestPayload(token: string) {
  const sampleGuests: Record<string, { fullName: string; rsvpCode: string }> = {
    "sample-dambu-token": { fullName: "Dambu", rsvpCode: "RBK10-1001" },
    "sample-maita-token": { fullName: "Maita", rsvpCode: "RBK10-1002" },
  };

  const sample = sampleGuests[token];
  if (!sample) return null;

  return {
    guest: {
      id: 0,
      fullName: sample.fullName,
      inviteToken: token,
      rsvpCode: sample.rsvpCode,
      rsvpStatus: "PENDING",
      selectedStarterId: null,
      selectedMainId: null,
      selectedDessertId: null,
      selectedTableId: null,
    },
    settings: {
      eventName: "Robokorda 10th Anniversary",
      eventDate: "2026-12-12T00:00:00.000Z",
      eventTime: "18:00",
      venueName: "Robokorda Innovation Centre",
      venueAddress: "Harare, Zimbabwe",
      dressCode: "Formal / Corporate Elegant",
      theme: "Celebrating 10 Years of Innovation",
      heroImageUrl: null,
    },
    meals: [],
    tables: [],
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
        selectedStarter: true,
        selectedMain: true,
        selectedDessert: true,
        selectedTable: true,
        rsvp: true,
      },
    });

    if (!guest) {
      const samplePayload = getSampleGuestPayload(token);
      if (samplePayload) return NextResponse.json(samplePayload);
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const [settings, meals, tables, gallery] = await Promise.all([
      prisma.eventSetting.findFirst({ orderBy: { id: "asc" } }),
      prisma.meal.findMany({ where: { isActive: true }, orderBy: [{ course: "asc" }, { name: "asc" }] }),
      prisma.eventTable.findMany({ where: { isActive: true }, orderBy: { tableName: "asc" } }),
      prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    return NextResponse.json({ guest, settings, meals, tables, gallery });
  } catch {
    const samplePayload = getSampleGuestPayload(token);
    if (samplePayload) return NextResponse.json(samplePayload);
    return NextResponse.json(
      { error: "Unable to load invitation right now. Please try again." },
      { status: 500 },
    );
  }
}
