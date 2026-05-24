import { RSVPStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { makeInviteToken, makeRsvpCode } from "@/lib/server-utils";
import { guestCreateSchema } from "@/lib/validators";
import { sendInvitationEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/utils";

type ImportGuest = {
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "PREFER_NOT_TO_SAY";
};

const toGender = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.toUpperCase().replace(/\s+/g, "_");
  if (normalized === "MALE" || normalized === "FEMALE" || normalized === "PREFER_NOT_TO_SAY") {
    return normalized;
  }
  return null;
};

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
    const status = request.nextUrl.searchParams.get("status") as RSVPStatus | null;

    const guests = await prisma.guest.findMany({
      where: {
        ...(status ? { rsvpStatus: status } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { rsvpCode: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        selectedStarter: true,
        selectedMain: true,
        selectedDessert: true,
        selectedTable: true,
        rsvp: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ guests });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load guests";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();

    if (Array.isArray(body.importRows)) {
      const rows = body.importRows as ImportGuest[];
      const cleanRows = rows.filter((row) => row.fullName && row.fullName.trim().length > 1);

      const created = await prisma.$transaction(
        cleanRows.map((row) =>
          prisma.guest.create({
            data: {
              fullName: row.fullName!.trim(),
              email: row.email?.trim() || null,
              phone: row.phone?.trim() || null,
              gender: toGender(row.gender) ?? "PREFER_NOT_TO_SAY",
              inviteToken: makeInviteToken(),
              rsvpCode: makeRsvpCode(),
              rsvpStatus: RSVPStatus.PENDING,
            },
          }),
        ),
      );

      return NextResponse.json({ success: true, count: created.length });
    }

    const parsed = guestCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid guest payload" }, { status: 400 });
    }

    const data = parsed.data;

    const guest = await prisma.guest.create({
      data: {
        fullName: data.fullName,
        gender: data.gender,
        email: data.email ?? null,
        phone: data.phone ?? null,
        inviteToken: makeInviteToken(),
        rsvpCode: makeRsvpCode(),
        rsvpStatus: data.rsvpStatus ?? RSVPStatus.PENDING,
      },
    });

    // Auto-send invitation email if guest has an email address
    if (guest.email) {
      const settings = await prisma.eventSetting.findFirst({ orderBy: { id: "asc" } });
      const inviteLink = `${getBaseUrl()}/invite/${guest.inviteToken}`;

      try {
        await sendInvitationEmail({
          to: guest.email,
          guestName: guest.fullName,
          eventName: settings?.eventName ?? "Our Special Event",
          rsvpCode: guest.rsvpCode,
          inviteLink,
          eventDate: settings?.eventDate?.toISOString(),
          venueName: settings?.venueName,
          venueAddress: settings?.venueAddress,
        });
      } catch {
        // Email failure is non-fatal — guest is still created
      }
    }

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create guest";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
