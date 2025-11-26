export interface Item {
  id: string;
  name: string;
  imageUrl: string;
  value?: number;
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

