/** JSON/API でやりとりする設定（日付は ISO 文字列） */
export type SettingsDTO = {
  id: number;
  shopName: string;
  location: string;
  ownerName: string;
  shopImageUrl: string | null;
  eventDate: string | null;
  nextEventDate: string | null;
  stampGoal: number;
  createdAt: string;
  updatedAt: string;
};

export type FoodDTO = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  success: boolean;
  token: string;
};
