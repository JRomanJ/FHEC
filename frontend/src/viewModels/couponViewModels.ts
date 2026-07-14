import { mockCupones, mockPedidos, mockUsuarios } from "../data";
import { cuponEsGeneral, cuponEstaVigente } from "../domain";
import type { Cupon, Pedido } from "../domain";

export type CouponVisualStatus = "vigente" | "vencido" | "usado";

export interface CouponAdminViewModel {
  id: number;
  code: string;
  discount: number;
  startDate: string;
  endDate: string;
  userEmail?: string;
}

export interface CouponProfileViewModel {
  code: string;
  discount: number;
  createdAt: string;
  expiresAt: string;
  usedOnOrder: string | null;
  status: CouponVisualStatus;
}

export interface CouponApplyViewModel {
  code: string;
  discount: number;
  vigente: boolean;
}

export interface CouponBadgeViewModel {
  text: string;
  className: string;
}

export interface CouponViewModelOptions {
  id_usuario?: number;
  fechaReferencia?: string;
  pedidos?: Pedido[];
  userEmail?: string;
}

const APPLY_COUPON_CODES = ["FHEC10", "SALUD15", "BIENVENIDO", "FHEC2024"] as const;

const LEGACY_ADMIN_COUPONS: CouponAdminViewModel[] = [
  { id: 1, code: "FARMA10", discount: 10, startDate: "2024-06-01", endDate: "2024-06-30" },
  { id: 2, code: "BIENVENIDA20", discount: 20, startDate: "2024-06-01", endDate: "2026-12-31" },
  { id: 3, code: "VERANO5", discount: 5, startDate: "2024-07-01", endDate: "2024-08-31" },
  {
    id: 4,
    code: "VIP2024",
    discount: 15,
    startDate: "2024-01-01",
    endDate: "2026-12-31",
    userEmail: "cliente@fhec.com",
  },
];

const LEGACY_PROFILE_COUPONS: CouponProfileViewModel[] = [
  {
    code: "BIENVENIDA20",
    discount: 20,
    createdAt: "2024-06-01",
    expiresAt: "2026-12-31",
    usedOnOrder: null,
    status: "vigente",
  },
  {
    code: "VIP2024",
    discount: 15,
    createdAt: "2024-01-01",
    expiresAt: "2026-12-31",
    usedOnOrder: null,
    status: "vigente",
  },
  {
    code: "FARMA10",
    discount: 10,
    createdAt: "2024-01-15",
    expiresAt: "2024-06-30",
    usedOnOrder: "ORD-2024-003",
    status: "usado",
  },
  {
    code: "VERANO5",
    discount: 5,
    createdAt: "2024-07-01",
    expiresAt: "2024-08-31",
    usedOnOrder: null,
    status: "vencido",
  },
];

function toDateOnly(timestamp: string): string {
  return timestamp.slice(0, 10);
}

function getUserEmail(id_usuario: number | null | undefined): string | undefined {
  if (id_usuario == null) return undefined;
  return mockUsuarios.find((usuario) => usuario.id_usuario === id_usuario)?.correo ?? undefined;
}

function getUsedOrder(cupon: Cupon, pedidos: Pedido[] = mockPedidos): Pedido | null {
  return pedidos.find((pedido) => pedido.id_cupon === cupon.id_cupon) ?? null;
}

export function getCouponVisualStatus(
  cupon: Cupon,
  options: CouponViewModelOptions = {},
): CouponVisualStatus {
  if (getUsedOrder(cupon, options.pedidos)) return "usado";
  return cuponEstaVigente(cupon, options.fechaReferencia) ? "vigente" : "vencido";
}

export function formatCouponDiscount(cupon: Cupon | Pick<CouponAdminViewModel, "discount">): string {
  const discount = "valor_descuento" in cupon ? cupon.valor_descuento : cupon.discount;
  return `${discount}% OFF`;
}

export function formatCouponDateRange(cupon: Cupon): string {
  return `${toDateOnly(cupon.fecha_inicio)} - ${toDateOnly(cupon.fecha_fin)}`;
}

export function toCouponAdminViewModel(
  cupon: Cupon,
  options: CouponViewModelOptions = {},
): CouponAdminViewModel {
  const userEmail = options.userEmail ?? getUserEmail(cupon.id_usuario);
  return {
    id: cupon.id_cupon,
    code: cupon.codigo_cupon,
    discount: cupon.valor_descuento,
    startDate: toDateOnly(cupon.fecha_inicio),
    endDate: toDateOnly(cupon.fecha_fin),
    ...(userEmail ? { userEmail } : {}),
  };
}

export function toCouponProfileViewModel(
  cupon: Cupon,
  options: CouponViewModelOptions = {},
): CouponProfileViewModel {
  const usedOrder = getUsedOrder(cupon, options.pedidos);
  return {
    code: cupon.codigo_cupon,
    discount: cupon.valor_descuento,
    createdAt: toDateOnly(cupon.fecha_inicio),
    expiresAt: toDateOnly(cupon.fecha_fin),
    usedOnOrder: usedOrder
      ? `ORD-${usedOrder.fecha_creacion.slice(0, 4)}-${String(usedOrder.id_pedido).slice(-3)}`
      : null,
    status: getCouponVisualStatus(cupon, options),
  };
}

export function toCouponApplyViewModel(
  cupon: Cupon,
  options: CouponViewModelOptions = {},
): CouponApplyViewModel {
  return {
    code: cupon.codigo_cupon,
    discount: cupon.valor_descuento,
    vigente: cuponEstaVigente(cupon, options.fechaReferencia),
  };
}

export function toCouponBadgeViewModel(status: CouponVisualStatus): CouponBadgeViewModel {
  if (status === "vigente") {
    return { text: "Vigente", className: "bg-[#e0f5eb] text-[#179150]" };
  }
  if (status === "usado") {
    return { text: "Usado", className: "bg-[#50e9f8]/20 text-[#006064]" };
  }
  return { text: "Vencido", className: "bg-gray-100 text-gray-500" };
}

export function getCouponApplyViewModels(): CouponApplyViewModel[] {
  return APPLY_COUPON_CODES.map((code) => mockCupones.find((cupon) => cupon.codigo_cupon === code))
    .filter((cupon): cupon is Cupon => cupon != null)
    .map((cupon) => toCouponApplyViewModel(cupon));
}

export function getCouponApplyCodeMap(): Record<string, number> {
  return Object.fromEntries(
    getCouponApplyViewModels().map((cupon) => [cupon.code, cupon.discount]),
  );
}

export function getCouponAdminViewModels(): CouponAdminViewModel[] {
  return mockCupones.map((cupon) => toCouponAdminViewModel(cupon));
}

export function getCouponProfileViewModels(id_usuario?: number): CouponProfileViewModel[] {
  return mockCupones
    .filter((cupon) => cuponEsGeneral(cupon) || id_usuario == null || cupon.id_usuario === id_usuario)
    .map((cupon) => toCouponProfileViewModel(cupon));
}

export function getLegacyAdminCouponViewModels(): CouponAdminViewModel[] {
  return LEGACY_ADMIN_COUPONS.map((cupon) => ({ ...cupon }));
}

export function getLegacyProfileCouponViewModels(): CouponProfileViewModel[] {
  return LEGACY_PROFILE_COUPONS.map((cupon) => ({ ...cupon }));
}
