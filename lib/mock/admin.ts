/** ダミー管理パスワード（本番では必ず環境変数で上書き） */
export function getAdminPassword(): string {
  return process.env.MOCK_ADMIN_PASSWORD ?? "admin";
}
