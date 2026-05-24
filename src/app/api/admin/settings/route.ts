import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { eventSettingsSchema } from "@/lib/validators";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.response) {
      return auth.response;
    }

    const settings = await prisma.eventSetting.findFirst({ orderBy: { id: "asc" } });
    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  try {
    const payload = await request.json();
    const parsed = eventSettingsSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
    }

    const data = parsed.data;

    const settings = await prisma.eventSetting.upsert({
      where: { id: 1 },
      update: {
        ...data,
        eventDate: new Date(data.eventDate),
      },
      create: {
        ...data,
        eventDate: new Date(data.eventDate),
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
