import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { mealSchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const meals = await prisma.meal.findMany({
    include: {
      starterGuests: { select: { id: true, fullName: true } },
      mainGuests:    { select: { id: true, fullName: true } },
      dessertGuests: { select: { id: true, fullName: true } },
    },
    orderBy: [{ course: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ meals });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const payload = await request.json();
    const parsed = mealSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid meal payload" }, { status: 400 });
    }

    const meal = await prisma.meal.create({ data: parsed.data });
    return NextResponse.json({ success: true, meal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create meal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
