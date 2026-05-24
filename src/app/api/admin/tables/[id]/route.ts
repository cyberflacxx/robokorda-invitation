import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { tableSchema } from "@/lib/validators";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const tableId = Number(id);

  if (Number.isNaN(tableId)) {
    return NextResponse.json({ error: "Invalid table id" }, { status: 400 });
  }

  try {
    const payload = await request.json();
    const parsed = tableSchema.partial().safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const current = await prisma.eventTable.findUnique({ where: { id: tableId } });
    if (!current) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    if (
      typeof parsed.data.capacity === "number" &&
      parsed.data.capacity < current.reservedSeats
    ) {
      return NextResponse.json({ error: "Capacity cannot be less than reserved seats" }, { status: 400 });
    }

    const table = await prisma.eventTable.update({
      where: { id: tableId },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, table });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update table";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const tableId = Number(id);

  if (Number.isNaN(tableId)) {
    return NextResponse.json({ error: "Invalid table id" }, { status: 400 });
  }

  try {
    const table = await prisma.eventTable.findUnique({ where: { id: tableId } });
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    if (table.reservedSeats > 0) {
      return NextResponse.json({ error: "Cannot delete a table with reservations" }, { status: 400 });
    }

    await prisma.eventTable.delete({ where: { id: tableId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete table";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
