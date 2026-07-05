import type React from "react";
import {
  BRAND_SYNONYMS,
  CATS,
  DEFAULT_SLIDES as CENTRAL_DEFAULT_SLIDES,
  DEMO_ACCOUNTS as CENTRAL_DEMO_ACCOUNTS,
  DEMO_CONTACT,
  DEMO_ORDERS,
  DISCOUNT_CODES,
  FREQUENTLY_BOUGHT_TOGETHER,
  NOTIF_DATA,
  PRODUCTS as CENTRAL_PRODUCTS,
  SEDES,
  STATUS_COLORS,
} from "../data";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const VES_RATE = 40.50;
export const fmtVES = (u: number) =>
  `Bs.S ${(u * VES_RATE).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fmtUSD = (u: number) => `$${u.toFixed(2)}`;
export const H9: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 };
export const H7: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 };
export const effectivePrice = (p: Product) => p.discount ? p.priceUSD * (1 - p.discount / 100) : p.priceUSD;

// ─── Types kept for compatibility with generated Figma components ────────────
export type Page = "home" | "catalog" | "product" | "cart" | "deliverySelect" | "preCheckout" | "checkout" | "orderComplete" | "tracking" | "favorites" | "login" | "register" | "banners" | "profile" | "delivery" | "admin" | "notifications";
export interface Slide { title: string; subtitle: string; badge: string; from: string; via: string; to: string; img: string; cta: string; ctaLink?: string; }
export type UserRole = "cliente" | "repartidor" | "auxiliar" | "auditor" | "superadmin";
export interface AuthUser { name: string; email: string; role: UserRole; cedula: string; }

export interface Product {
  id: number; name: string; brand: string; category: string;
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

// ─── Centralized mock bridge exports ──────────────────────────────────────────
export { BRAND_SYNONYMS, CATS, DEMO_CONTACT, DEMO_ORDERS, DISCOUNT_CODES, FREQUENTLY_BOUGHT_TOGETHER, NOTIF_DATA, SEDES, STATUS_COLORS };

export const DEMO_ACCOUNTS: (AuthUser & { password: string })[] = CENTRAL_DEMO_ACCOUNTS;
export const PRODUCTS: Product[] = CENTRAL_PRODUCTS;
export const DEFAULT_SLIDES: Slide[] = CENTRAL_DEFAULT_SLIDES;
