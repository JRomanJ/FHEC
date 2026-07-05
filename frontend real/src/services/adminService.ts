import {
  PRODUCTS,
  STATUS_COLORS,
  mockPersonalOperativo,
  mockPedidos,
} from "../data";
import { getCupones } from "./couponService";
import { getInventario } from "./inventoryService";
import { getPedidosPorPreparar } from "./orderService";
import { getRecipeAuditViewModels } from "./recipeService";
import { getAdminRefundViewModels, getLegacyAdminMonitorOrderViewModels } from "../viewModels";

export function getCatalogoAdmin() {
  return PRODUCTS;
}

export function getInventarioAdmin() {
  return getInventario();
}

export function getPersonalOperativoAdmin() {
  return mockPersonalOperativo;
}

export function getMonitorGlobalPedidos() {
  return getLegacyAdminMonitorOrderViewModels();
}

export function getResenasServicio() {
  return mockPedidos.filter((pedido) => pedido.calificacion_servicio != null);
}

export function getCuponesAdmin() {
  return getCupones();
}

export function getReembolsosAdmin() {
  return getAdminRefundViewModels();
}

export function getOperacionesAdmin() {
  return getPedidosPorPreparar();
}

export function getAuditoriaAdmin() {
  return getRecipeAuditViewModels();
}

export function getStatusColorsAdmin() {
  return STATUS_COLORS;
}
