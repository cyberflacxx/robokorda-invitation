import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { tableSchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const tables = await prisma.eventTable.findMany({
    include: {
      _count: { select: { guests: true } },
      guests: { select: { id: true, fullName: true, rsvpStatus: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tables });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  try {
    const payload = await request.json();
    const parsed = tableSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid table payload" }, { status: 400 });
    }

    const table = await prisma.eventTable.create({ data: parsed.data });
    return NextResponse.json({ success: true, table });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create table";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
