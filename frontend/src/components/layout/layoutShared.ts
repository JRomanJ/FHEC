import type React from "react";
import type { Product } from "../../app/types";
import { getCategoriasParaFiltro } from "../../services";

export const H9: React.CSSProperties = { fontFamily: "\"Barlow Condensed\", sans-serif", fontWeight: 900 };
export const H7: React.CSSProperties = { fontFamily: "\"Barlow Condensed\", sans-serif", fontWeight: 700 };
export const fmtUSD = (u: number) => "$" + u.toFixed(2);
export const effectivePrice = (p: Product) => p.discount ? p.priceUSD * (1 - p.discount / 100) : p.priceUSD;
export const CATS = getCategoriasParaFiltro();
