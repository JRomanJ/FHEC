import {
  DEMO_GLOBAL_ORDERS,
  PRODUCTS,
  STATUS_COLORS,
  mockPersonalOperativo,
  mockPedidos,
} from "../data";
import { getCupones } from "./couponService";
import { getInventario } from "./inventoryService";
import { getPedidosPorPreparar } from "./orderService";
import { getRefundAdminViewModels } from "./refundService";
import { getRecipeAuditViewModels } from "./recipeService";

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
  return DEMO_GLOBAL_ORDERS;
}

export function getResenasServicio() {
  return mockPedidos.filter((pedido) => pedido.calificacion_servicio != null);
}

export function getCuponesAdmin() {
  return getCupones();
}

export function getReembolsosAdmin() {
  return getRefundAdminViewModels();
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
