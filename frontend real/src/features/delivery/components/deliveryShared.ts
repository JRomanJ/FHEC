import type React from "react";

export const H9: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 };
export const H7: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 };

export type DeliverySede = {
  id: string;
  name: string;
  address: string;
};

export type DeliveryOrderView = {
  id: string;
  items: number;
  total: number;
  distance: string;
  customer: string;
  phone: string;
  address: string;
  products: string[];
  notes?: string;
  sede: string;
};

export type DeliveryCompletedTripView = {
  id: string;
  date: string;
  customer: string;
  sede: string;
  shippingCost: number;
};

export function toWaLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("0") ? "58" + digits.slice(1) : digits;
  return `https://wa.me/${num}`;
}
