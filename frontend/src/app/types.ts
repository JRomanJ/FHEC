// ─── Types ───────────────────────────────────────────────────────────────────
export type Page = "home" | "catalog" | "product" | "cart" | "deliverySelect" | "preCheckout" | "checkout" | "orderComplete" | "tracking" | "favorites" | "login" | "register" | "banners" | "profile" | "delivery" | "admin" | "notifications";

export interface Slide { id?: number; title: string; subtitle: string; badge: string; from: string; via: string; to: string; img: string; cta: string; ctaLink?: string; }

export type UserRole = "cliente" | "repartidor" | "auxiliar" | "auditor" | "superadmin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cedula: string;
  phone?: string;
  areaCode?: string;
  address?: string;
  acepta_promociones: boolean;
  acepta_promociones_sms: boolean;
  acepta_promociones_correo: boolean;
  acepta_notificaciones: boolean;
  acepta_notificaciones_sms: boolean;
  acepta_notificaciones_correo: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hours: string;
  mapsUrl: string;
}

export interface Product {
  id: number; name: string; brand: string; category: string;
  backendId?: string;
  inventoryId?: string;
  barcode?: string;
  presentation: string; packSize: string; priceUSD: number;
  stock: number; needsRecipe: boolean; rating: number; reviews: number;
  bgColor: string; accentColor: string; imageUrl?: string; description: string;
  activeIngredient: string; contraindications: string;
  posology: string;
  discount?: number;
  controlledSubstance?: boolean;
  stockSedes?: { principal: number; clinica: number };
  concentration?: string;
  concentrationUnit?: string;
  enabled?: boolean;
}

export interface CartItem { product: Product; quantity: number; }
