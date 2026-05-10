import { NextResponse } from "next/server";
import {
  decrementFoodQuantity,
  deleteFood,
  incrementFoodQuantity,
  updateFood,
  verifyAdminToken,
} from "@/lib/mock/store";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: RouteCtx) {
  if (!verifyAdminToken(request.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const foodId = parseInt(id, 10);
  if (Number.isNaN(foodId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as Record<string, unknown>;

  if (body._action === "increment") {
    const row = incrementFoodQuantity(foodId);
    if (!row)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  }
  if (body._action === "decrement") {
    const row = decrementFoodQuantity(foodId);
    if (!row)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  }

  if (
    typeof body.imageBase64 === "string" &&
    typeof body.mimeType === "string"
  ) {
    const url = `data:${body.mimeType};base64,${body.imageBase64}`;
    const row = updateFood(foodId, { imageUrl: url });
    if (!row)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ url });
  }

  const patch: {
    name?: string;
    quantity?: number;
    price?: number;
  } = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.quantity === "number") patch.quantity = body.quantity;
  if (typeof body.price === "number") patch.price = body.price;

  const row = updateFood(foodId, patch);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(request: Request, ctx: RouteCtx) {
  if (!verifyAdminToken(request.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const foodId = parseInt(id, 10);
  if (Number.isNaN(foodId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const ok = deleteFood(foodId);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
