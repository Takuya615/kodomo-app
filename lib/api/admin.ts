import type { LoginResponse } from "@/lib/mock/types";
import { apiPost } from "@/lib/api/http";

export async function adminLogin(password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/api/admin/login", { password });
}
