import type { SettingsDTO } from "@/lib/mock/types";
import { adminHeaders, apiGet, apiPost } from "@/lib/api/http";

export async function fetchSettings(): Promise<SettingsDTO> {
  return apiGet<SettingsDTO>("/api/settings");
}

export async function updateSettings(
  token: string,
  patch: {
    shopName?: string;
    location?: string;
    ownerName?: string;
    shopImageUrl?: string | null;
    nextEventDate?: string | null;
    stampGoal?: number;
  }
): Promise<SettingsDTO> {
  return apiPost<SettingsDTO>("/api/settings", patch, adminHeaders(token));
}

export async function uploadShopImage(
  token: string,
  input: { base64: string; mimeType: string }
): Promise<{ url: string }> {
  return apiPost<{ url: string }>("/api/settings", input, adminHeaders(token));
}
