import type { FoodDTO } from "@/lib/mock/types";
import { adminHeaders, apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/http";

export async function fetchFoods(): Promise<FoodDTO[]> {
  return apiGet<FoodDTO[]>("/api/foods");
}

export async function createFood(
  token: string,
  input: { name: string; quantity: number; price: number }
): Promise<FoodDTO> {
  return apiPost<FoodDTO>("/api/foods", input, adminHeaders(token));
}

export async function updateFoodFields(
  token: string,
  id: number,
  patch: { name?: string; quantity?: number; price?: number }
): Promise<FoodDTO> {
  return apiPatch<FoodDTO>(`/api/foods/${id}`, patch, adminHeaders(token));
}

export async function deleteFood(token: string, id: number): Promise<void> {
  await apiDelete(`/api/foods/${id}`, adminHeaders(token));
}

export async function incrementFoodQuantity(
  token: string,
  id: number
): Promise<FoodDTO> {
  return apiPatch<FoodDTO>(
    `/api/foods/${id}`,
    { _action: "increment" },
    adminHeaders(token)
  );
}

export async function decrementFoodQuantity(
  token: string,
  id: number
): Promise<FoodDTO> {
  return apiPatch<FoodDTO>(
    `/api/foods/${id}`,
    { _action: "decrement" },
    adminHeaders(token)
  );
}

export async function uploadFoodImage(
  token: string,
  id: number,
  input: { base64: string; mimeType: string }
): Promise<{ url: string }> {
  return apiPatch<{ url: string }>(
    `/api/foods/${id}`,
    { imageBase64: input.base64, mimeType: input.mimeType },
    adminHeaders(token)
  );
}
