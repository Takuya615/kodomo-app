import { NextResponse } from "next/server";
import {
  getSettings,
  updateSettings,
  verifyAdminToken,
} from "@/lib/mock/store";

function parseSettingsPatch(body: Record<string, unknown>) {
  const patch: Parameters<typeof updateSettings>[0] = {};
  if (typeof body.shopName === "string") patch.shopName = body.shopName;
  if (typeof body.location === "string") patch.location = body.location;
  if (typeof body.ownerName === "string") patch.ownerName = body.ownerName;
  if (body.shopImageUrl === null || typeof body.shopImageUrl === "string") {
    patch.shopImageUrl = body.shopImageUrl as string | null;
  }
  if (body.nextEventDate === null) {
    patch.nextEventDate = null;
  } else if (typeof body.nextEventDate === "string") {
    patch.nextEventDate = new Date(body.nextEventDate);
  }
  if (typeof body.stampGoal === "number") patch.stampGoal = body.stampGoal;
  return patch;
}

export async function GET() {
  return NextResponse.json(getSettings());
}

/** 設定の部分更新（ダミーAPI・PATCH） */
export async function PATCH(request: Request) {
  if (!verifyAdminToken(request.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as Record<string, unknown>;
  return NextResponse.json(updateSettings(parseSettingsPatch(body)));
}

/**
 * POST /api/settings
 * - body に base64 + mimeType → 店舗画像アップロード（data URL）
 * - それ以外 → 設定更新（工程4の「POST で更新」相当。PATCH と同じ処理）
 */
export async function POST(request: Request) {
  if (!verifyAdminToken(request.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as Record<string, unknown>;
  if (typeof body.base64 === "string" && typeof body.mimeType === "string") {
    const url = `data:${body.mimeType};base64,${body.base64}`;
    updateSettings({ shopImageUrl: url });
    return NextResponse.json({ url });
  }
  return NextResponse.json(updateSettings(parseSettingsPatch(body)));
}
