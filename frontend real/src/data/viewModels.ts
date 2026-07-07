import type { AuthUser, Page, Slide } from "../app/types";

export type LegacySlide = Slide & { ctaLink?: string };
export type LegacyPage = Page;
export type LegacyAuthUser = AuthUser & { password: string };

export interface LegacyProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  presentation: string;
  packSize: string;
  priceUSD: number;
  stock: number;
  needsRecipe: boolean;
  rating: number;
  reviews: number;
  bgColor: string;
  accentColor: string;
  imageUrl?: string;
  description: string;
  activeIngredient: string;
  contraindications: string;
  posology: string;
  discount?: number;
  controlledSubstance?: boolean;
  stockSedes?: { principal: number; clinica: number };
  concentration?: string;
  concentrationUnit?: string;
  enabled?: boolean;
}

export interface LegacyCategory {
  name: string;
  count: number;
  emoji: string;
  color: string;
}

export interface LegacySedeListItem {
  id: string;
  name: string;
  city: string;
  address: string;
}

export interface LegacySede {
  id: string;
  name: string;
  address: string;
  hours: string;
  mapsUrl: string;
}

export interface LegacyDemoOrder {
  id: string;
  date: string;
  status: string;
  items: number;
  totalBs: number;
  totalUsd: number;
  products: string[];
}

export interface LegacyGlobalOrder {
  id: string;
  date: string;
  client: string;
  sede: string;
  status: string;
  total: number;
  approvedBy: string;
  preparedBy: string;
  dispatchedBy: string;
}
