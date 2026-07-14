import type React from "react";
import type { Product, Slide } from "./types";
import {
  BRAND_SYNONYMS,
  CATS,
  DEFAULT_SLIDES as CENTRAL_DEFAULT_SLIDES,
  DEMO_ACCOUNTS as CENTRAL_DEMO_ACCOUNTS,
  DEMO_CONTACT,
  FREQUENTLY_BOUGHT_TOGETHER,
  SEDES,
  SEDES_LIST,
  STATUS_COLORS,
} from "../data";
import {
  getAppProductViewModels,
  getCouponApplyCodeMap,
  getLegacyAdminMonitorOrderViewModels,
  getLegacyAdminOrderViewModels,
  getLegacyAdminRefundViewModels,
  getLegacyOrderHistoryViewModels,
  getLegacyRecipeAuditViewModels,
} from "../viewModels";

// Temporary compatibility bridge for Figma Make generated modules.
// The mounted App.tsx still owns its inline visual data until the next phase.
export const VES_RATE = 40.50;
export const fmtVES = (u: number) =>
  `Bs.S ${(u * VES_RATE).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fmtUSD = (u: number) => `$${u.toFixed(2)}`;
export const H9: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 };
export const H7: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 };
export const effectivePrice = (p: Product) => p.discount ? p.priceUSD * (1 - p.discount / 100) : p.priceUSD;

export { BRAND_SYNONYMS, CATS, DEMO_CONTACT, FREQUENTLY_BOUGHT_TOGETHER, SEDES, SEDES_LIST, STATUS_COLORS };

export const DEMO_ACCOUNTS: (import("./types").AuthUser & { password: string })[] = CENTRAL_DEMO_ACCOUNTS;
export const PRODUCTS: Product[] = getAppProductViewModels();
export const DEFAULT_SLIDES: Slide[] = CENTRAL_DEFAULT_SLIDES;
export const DISCOUNT_CODES: Record<string, number> = getCouponApplyCodeMap();
export const DEMO_GLOBAL_ORDERS = getLegacyAdminMonitorOrderViewModels();
export const DEMO_ORDERS = getLegacyOrderHistoryViewModels();
export const DEMO_RECIPES = getLegacyRecipeAuditViewModels();
export const DEMO_ADMIN_ORDERS = getLegacyAdminOrderViewModels();
export const DEMO_REFUNDS = getLegacyAdminRefundViewModels();
