import type { FoodDTO, SettingsDTO } from "./types";
import { getAdminPassword } from "./admin";

function iso(d: Date): string {
  return d.toISOString();
}

function todayAt(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

type SettingsInternal = {
  id: number;
  shopName: string;
  location: string;
  ownerName: string;
  shopImageUrl: string | null;
  eventDate: Date | null;
  nextEventDate: Date | null;
  stampGoal: number;
  createdAt: Date;
  updatedAt: Date;
};

let settingsRow: SettingsInternal = {
  id: 1,
  shopName: "デモ・こども食堂",
  location: "〇〇区公民館 多目的室",
  ownerName: "山田 太郎",
  shopImageUrl: null,
  eventDate: null,
  nextEventDate: todayAt(11, 0),
  stampGoal: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

let foodsInternal: Array<{
  id: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}> = [
  {
    id: 1,
    name: "カレーライス",
    quantity: 12,
    price: 0,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "みそ汁",
    quantity: 20,
    price: 0,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "サラダ",
    quantity: 8,
    price: 100,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let nextFoodId = 4;

function toSettingsDTO(row: SettingsInternal): SettingsDTO {
  return {
    id: row.id,
    shopName: row.shopName,
    location: row.location,
    ownerName: row.ownerName,
    shopImageUrl: row.shopImageUrl,
    eventDate: row.eventDate ? iso(row.eventDate) : null,
    nextEventDate: row.nextEventDate ? iso(row.nextEventDate) : null,
    stampGoal: row.stampGoal,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

function toFoodDTO(f: (typeof foodsInternal)[number]): FoodDTO {
  return {
    id: f.id,
    name: f.name,
    quantity: f.quantity,
    price: f.price,
    imageUrl: f.imageUrl,
    createdAt: iso(f.createdAt),
    updatedAt: iso(f.updatedAt),
  };
}

export function getSettings(): SettingsDTO {
  return toSettingsDTO(settingsRow);
}

export function updateSettings(
  patch: Partial<{
    shopName: string;
    location: string;
    ownerName: string;
    shopImageUrl: string | null;
    nextEventDate: Date | null;
    stampGoal: number;
  }>
): SettingsDTO {
  const now = new Date();
  const next = { ...settingsRow, updatedAt: now };
  if (patch.shopName !== undefined) next.shopName = patch.shopName;
  if (patch.location !== undefined) next.location = patch.location;
  if (patch.ownerName !== undefined) next.ownerName = patch.ownerName;
  if (patch.shopImageUrl !== undefined) next.shopImageUrl = patch.shopImageUrl;
  if (patch.nextEventDate !== undefined) next.nextEventDate = patch.nextEventDate;
  if (patch.stampGoal !== undefined) next.stampGoal = patch.stampGoal;
  settingsRow = next;
  return getSettings();
}

export function listFoods(): FoodDTO[] {
  return foodsInternal.map(toFoodDTO);
}

export function createFood(input: {
  name: string;
  quantity: number;
  price: number;
}): FoodDTO {
  const now = new Date();
  const row = {
    id: nextFoodId++,
    name: input.name,
    quantity: input.quantity,
    price: input.price,
    imageUrl: null as string | null,
    createdAt: now,
    updatedAt: now,
  };
  foodsInternal.push(row);
  return toFoodDTO(row);
}

export function getFoodById(id: number) {
  return foodsInternal.find((f) => f.id === id) ?? null;
}

export function updateFood(
  id: number,
  patch: Partial<{
    name: string;
    quantity: number;
    price: number;
    imageUrl: string | null;
  }>
): FoodDTO | null {
  const idx = foodsInternal.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  const now = new Date();
  foodsInternal[idx] = {
    ...foodsInternal[idx],
    ...patch,
    updatedAt: now,
  };
  return toFoodDTO(foodsInternal[idx]);
}

export function deleteFood(id: number): boolean {
  const before = foodsInternal.length;
  foodsInternal = foodsInternal.filter((f) => f.id !== id);
  return foodsInternal.length < before;
}

export function incrementFoodQuantity(id: number): FoodDTO | null {
  const f = getFoodById(id);
  if (!f) return null;
  return updateFood(id, { quantity: f.quantity + 1 });
}

export function decrementFoodQuantity(id: number): FoodDTO | null {
  const f = getFoodById(id);
  if (!f) return null;
  return updateFood(id, { quantity: Math.max(0, f.quantity - 1) });
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  return token === getAdminPassword();
}
