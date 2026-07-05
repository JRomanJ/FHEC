import type React from "react";
import type { Product } from "../../../app/types";

export const VES_RATE = 40.50;
export const fmtVES = (u: number) => "Bs.S " + (u * VES_RATE).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtUSD = (u: number) => "$" + u.toFixed(2);
export const H9: React.CSSProperties = { fontFamily: "\"Barlow Condensed\", sans-serif", fontWeight: 900 };
export const H7: React.CSSProperties = { fontFamily: "\"Barlow Condensed\", sans-serif", fontWeight: 700 };
export const effectivePrice = (p: Product) => p.discount ? p.priceUSD * (1 - p.discount / 100) : p.priceUSD;

