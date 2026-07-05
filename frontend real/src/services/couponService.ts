import { getCuponByCodigo as selectCuponByCodigo, mockCupones } from "../data";
import {
  cuponEsDeUsuario,
  cuponEsGeneral,
  cuponEstaVigente as domainCuponEstaVigente,
} from "../domain";
import type { Cupon } from "../domain";

export interface CuponValidationResult {
  valido: boolean;
  cupon: Cupon | null;
  motivo: "vigente" | "no_existe" | "vencido" | "no_pertenece_usuario";
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
