#!/usr/bin/env node
/**
 * 工程7: 開発サーバー起動後に API を叩いて確認する軽いチェック。
 * 例: VERIFY_BASE=http://127.0.0.1:3000 node scripts/verify-routes.mjs
 */
const BASE = process.env.VERIFY_BASE ?? "http://127.0.0.1:3000";

async function req(method, path, init = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { method, ...init });
  return { status: res.status, res };
}

async function main() {
  let failed = false;

  const a = await req("GET", "/api/settings");
  console.log("GET", "/api/settings", a.status);
  if (!a.res.ok) failed = true;

  const b = await req("GET", "/api/foods");
  console.log("GET", "/api/foods", b.status);
  if (!b.res.ok) failed = true;

  const login = await req("POST", "/api/admin/login", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: process.env.MOCK_ADMIN_PASSWORD ?? "admin" }),
  });
  console.log("POST", "/api/admin/login", login.status);
  if (!login.res.ok) failed = true;

  const authJson = await login.res.json();
  const token = authJson.token;
  if (!token) {
    console.error("ログインレスポンスに token がありません");
    process.exit(1);
  }

  const upd = await req("POST", "/api/settings", {
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({ stampGoal: 10 }),
  });
  console.log("POST", "/api/settings (設定更新)", upd.status);
  if (!upd.res.ok) failed = true;

  const createFood = await req("POST", "/api/foods", {
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({
      name: "検証用メニュー",
      quantity: 1,
      price: 0,
    }),
  });
  console.log("POST", "/api/foods", createFood.status);
  if (!createFood.res.ok) failed = true;
  const food = await createFood.res.json();

  const patchFood = await req("PATCH", `/api/foods/${food.id}`, {
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({ name: "検証用メニュー（改名）" }),
  });
  console.log("PATCH", `/api/foods/${food.id}`, patchFood.status);
  if (!patchFood.res.ok) failed = true;

  const del = await req("DELETE", `/api/foods/${food.id}`, {
    headers: { "x-admin-token": token },
  });
  console.log("DELETE", `/api/foods/${food.id}`, del.status);
  if (!del.res.ok) failed = true;

  if (failed) {
    console.error(
      "\nいずれかのリクエストが失敗しました。dev サーバーが起動しているか確認してください。"
    );
    process.exit(1);
  }
  console.log("\nAPI 検証: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
