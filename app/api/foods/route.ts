import { NextResponse } from "next/server";
import { createFood, listFoods, verifyAdminToken } from "@/lib/mock/store";

export async function GET() {
  return NextResponse.json(listFoods());
}

export async function POST(request: Request) {
  if (!verifyAdminToken(request.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    name?: string;
    quantity?: number;
    price?: number;
  };
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const quantity =
    typeof body.quantity === "number" ? Math.max(0, Math.floor(body.quantity)) : 0;
  const price =
    typeof body.price === "number" ? Math.max(0, Math.floor(body.price)) : 0;
  return NextResponse.json(
    createFood({ name: body.name.trim(), quantity, price })
  );
}
