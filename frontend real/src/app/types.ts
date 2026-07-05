// ─── Types ───────────────────────────────────────────────────────────────────
export type Page = "home" | "catalog" | "product" | "cart" | "deliverySelect" | "preCheckout" | "checkout" | "orderComplete" | "tracking" | "favorites" | "login" | "banners" | "profile" | "delivery" | "admin" | "notifications";

export interface Slide { title: string; subtitle: string; badge: string; from: string; via: string; to: string; img: string; cta: string; }

export type UserRole = "cliente" | "repartidor" | "auxiliar" | "auditor" | "superadmin";

export interface AuthUser { name: string; email: string; role: UserRole; cedula: string; }

export interface Product {
  id: number; name: string; brand: string; category: string;
  presentation: string; packSize: string; priceUSD: number;
  stock: number; needsRecipe: boolean; rating: number; reviews: number;
  bgColor: string; accentColor: string; description: string;
  activeIngredient: string; contraindications: string;
  posology: string;
  discount?: number;
  controlledSubstance?: boolean;
  stockSedes?: { principal: number; clinica: number };
}

export interface CartItem { product: Product; quantity: number; }
