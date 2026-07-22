import { getCuponByCodigo as selectCuponByCodigo, mockCupones } from "../data";
import {
  cuponEsDeUsuario,
  cuponEsGeneral,
  cuponEstaVigente as domainCuponEstaVigente,
} from "../domain";
import type { Cupon } from "../domain";
import { requestJson } from "./httpClient";
import {
  formatCouponDateRange,
  formatCouponDiscount,
  getCouponAdminViewModels,
  getCouponApplyCodeMap,
  getCouponApplyViewModels,
  getCouponProfileViewModels,
  getCouponVisualStatus,
  getLegacyAdminCouponViewModels,
  getLegacyProfileCouponViewModels,
  toCouponAdminViewModel,
  toCouponApplyViewModel,
  toCouponBadgeViewModel,
  toCouponProfileViewModel,
} from "../viewModels";

export interface CuponValidationResult {
  valido: boolean;
  cupon: Cupon | null;
  motivo: "vigente" | "no_existe" | "vencido" | "no_pertenece_usuario";
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface BackendCoupon {
  id_cupon: string;
  codigo_cupon: string;
  descuento_porcentaje: number | string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  id_usuario: string | null;
  correo_usuario?: string | null;
  usado_en: string | null;
  id_pedido_uso: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface RemoteCoupon {
  id: string;
  code: string;
  discount: number;
  startDate: string;
  endDate: string;
  userId: string | null;
  userEmail?: string;
  usedAt: string | null;
  usedOnOrder: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RemoteCouponInput {
  code: string;
  discount: number;
  startDate: string;
  endDate: string;
  userEmail?: string;
}

const toRemoteCoupon = (coupon: BackendCoupon): RemoteCoupon => ({
  id: coupon.id_cupon,
  code: coupon.codigo_cupon,
  discount: Number(coupon.descuento_porcentaje),
  startDate: coupon.fecha_inicio,
  endDate: coupon.fecha_vencimiento,
  userId: coupon.id_usuario,
  ...(coupon.correo_usuario ? { userEmail: coupon.correo_usuario } : {}),
  usedAt: coupon.usado_en,
  usedOnOrder: coupon.id_pedido_uso,
  createdAt: coupon.fecha_creacion,
  updatedAt: coupon.fecha_actualizacion,
});

export async function getRemoteCoupons(): Promise<RemoteCoupon[]> {
  const response = await requestJson<ApiEnvelope<BackendCoupon[]>>("/coupons");
  return response.data.map(toRemoteCoupon);
}

export async function createRemoteCoupon(input: RemoteCouponInput): Promise<RemoteCoupon> {
  const response = await requestJson<ApiEnvelope<BackendCoupon>>("/coupons", {
    method: "POST",
    body: input,
  });
  return toRemoteCoupon(response.data);
}

export async function updateRemoteCoupon(id: string, input: RemoteCouponInput): Promise<RemoteCoupon> {
  const response = await requestJson<ApiEnvelope<BackendCoupon>>(`/coupons/${id}`, {
    method: "PATCH",
    body: input,
  });
  return toRemoteCoupon(response.data);
}

export async function validateRemoteCoupon(code: string): Promise<RemoteCoupon> {
  const response = await requestJson<ApiEnvelope<BackendCoupon>>(`/coupons/validate?code=${encodeURIComponent(code)}`);
  return toRemoteCoupon(response.data);
}

export function getCupones() {
  return mockCupones;
}

export function getCuponByCodigo(codigo: string) {
  return selectCuponByCodigo(codigo);
}

export function getCuponesGenerales() {
  return mockCupones.filter(cuponEsGeneral);
}

export function getCuponesDeUsuario(id_usuario: number) {
  return mockCupones.filter((cupon) => cuponEsDeUsuario(cupon) && cupon.id_usuario === id_usuario);
}

export function getCuponesVisiblesParaUsuario(id_usuario: number) {
  return mockCupones.filter((cupon) => cuponEsGeneral(cupon) || cupon.id_usuario === id_usuario);
}

export function cuponEstaVigente(cupon: Cupon, fechaReferencia?: string) {
  return domainCuponEstaVigente(cupon, fechaReferencia);
}

export function validarCuponParaUsuario(
  codigo: string,
  id_usuario: number,
  fechaReferencia?: string,
): CuponValidationResult {
  const cupon = getCuponByCodigo(codigo);
  if (!cupon) return { valido: false, cupon: null, motivo: "no_existe" };
  if (!cuponEstaVigente(cupon, fechaReferencia)) {
    return { valido: false, cupon, motivo: "vencido" };
  }
  if (cuponEsDeUsuario(cupon) && cupon.id_usuario !== id_usuario) {
    return { valido: false, cupon, motivo: "no_pertenece_usuario" };
  }

  return { valido: true, cupon, motivo: "vigente" };
}

export function existeCuponVigenteConCodigo(codigo: string, fechaReferencia?: string) {
  const normalized = codigo.trim().toUpperCase();
  return mockCupones.some(
    (cupon) =>
      cupon.codigo_cupon.toUpperCase() === normalized && cuponEstaVigente(cupon, fechaReferencia),
  );
}

export function getEstadoVisualCupon(cupon: Cupon, id_usuario?: number) {
  if (!cuponEstaVigente(cupon)) return "vencido";
  if (cuponEsGeneral(cupon)) return "general";
  if (id_usuario != null && cupon.id_usuario !== id_usuario) return "exclusivo_otro_usuario";
  return "usuario";
}

export {
  formatCouponDateRange,
  formatCouponDiscount,
  getCouponAdminViewModels,
  getCouponApplyCodeMap,
  getCouponApplyViewModels,
  getCouponProfileViewModels,
  getCouponVisualStatus,
  getLegacyAdminCouponViewModels,
  getLegacyProfileCouponViewModels,
  toCouponAdminViewModel,
  toCouponApplyViewModel,
  toCouponBadgeViewModel,
  toCouponProfileViewModel,
};
