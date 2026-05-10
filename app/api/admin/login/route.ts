import { NextResponse } from "next/server";
import { getAdminPassword } from "@/lib/mock/admin";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const password = body.password ?? "";
  if (password === getAdminPassword()) {
    return NextResponse.json({ success: true, token: getAdminPassword() });
  }
  return NextResponse.json(
    { error: "パスワードが正しくありません" },
    { status: 401 }
  );
}
