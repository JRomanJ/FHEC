import {
  getDetallesByPedido as selectDetallesByPedido,
  getPedidoActivoByUsuario as selectPedidoActivoByUsuario,
  getPedidosByUsuario as selectPedidosByUsuario,
  getProductoById,
  getRecipesByPedido,
  getTransaccionById,
  mockCupones,
  mockPedidos,
} from "../data";
import { EstadoPedido, esPickupObligatorio, requiereRecipeDigital, requiereRecipeFisico } from "../domain";
import type { EstadoPedido as EstadoPedidoType } from "../domain";
import { selectDatabaseOrderHistory } from "../data/selectors";
import type { DatabaseOrderHistoryViewModel } from "../data/selectors";
import { requestJson } from "./httpClient";

interface ApiEnvelope<T> { success: boolean; message?: string; data: T }

export interface RemoteOrderDetail {
  id_detalle_pedido: string;
  id_pedido: string;
  id_inventario: string;
  id_producto: string;
  cantidad: number;
  precio_unitario: number;
  descuento_porcentaje: number;
  subtotal_linea: number;
  requiere_recipe: boolean;
  nivel_control: string | null;
  productos?: {
    principio_activo: string | null;
    concentracion: string | number | null;
    marca_comercial: string | null;
  } | null;
}

export interface RemoteOrder {
  id_pedido: string;
  id_usuario: string;
  id_sede: string;
  id_transaccion: string | null;
  metodo_entrega: "delivery" | "pickup";
  nombre_receptor: string;
  codigo_area_receptor: string;
  telefono_receptor: string;
  direccion_entrega: string | null;
  subtotal: number;
  iva: number;
  costo_entrega: number;
  descuento_aplicado: number;
  total_pedido: number;
  tasa_bcv: number;
  estado_pedido: "pendiente" | "completado" | "expirado";
  fecha_creacion: string;
  fecha_limite: string;
  fecha_completado: string | null;
  detalles_pedidos?: RemoteOrderDetail[];
  detalles?: RemoteOrderDetail[];
}

export interface CreateRemoteOrderInput {
  pedido: Record<string, unknown>;
  items: Array<{ id_inventario: string; cantidad: number }>;
}

export async function createRemoteOrder(input: CreateRemoteOrderInput): Promise<{ pedido: RemoteOrder; detalles: RemoteOrderDetail[] }> {
  const response = await requestJson<ApiEnvelope<{ pedido: RemoteOrder; detalles: RemoteOrderDetail[] }>>("/orders", { method: "POST", body: input });
  return response.data;
}

export async function getRemoteOrders(): Promise<RemoteOrder[]> {
  const response = await requestJson<ApiEnvelope<RemoteOrder[]>>("/orders");
  return response.data;
}

export async function getRemoteOrderHistory(userId: string): Promise<DatabaseOrderHistoryViewModel[]> {
  return selectDatabaseOrderHistory(await getRemoteOrders(), userId);
}

export async function getRemoteOrder(orderId: string): Promise<RemoteOrder> {
  const response = await requestJson<ApiEnvelope<RemoteOrder>>(`/orders/${encodeURIComponent(orderId)}`);
  return response.data;
}

export async function confirmRemoteOrderPayment(orderId: string, payment: Record<string, unknown>): Promise<{ pedido: RemoteOrder; transaccion: RemoteTransaction }> {
  const response = await requestJson<ApiEnvelope<{ pedido: RemoteOrder; transaccion: RemoteTransaction }>>(`/orders/${encodeURIComponent(orderId)}/transactions`, { method: "POST", body: payment });
  return response.data;
}

export interface RemoteTransaction {
  id_transaccion: string;
  id_pedido: string;
  metodo_pago: string;
  banco_emisor: string;
  referencia_bancaria: string;
  monto_confirmado_usd: number;
  monto_confirmado_bs: number;
  estado_transaccion: "confirmada" | "anulada";
  fecha_confirmacion: string;
}

export {
  getActiveOrderViewModel,
  getAdminMonitorOrderViewModels,
  getAdminOrderViewModels,
  getDeliveryOrderViewModels,
  getLegacyActiveOrderViewModel,
  getLegacyAdminMonitorOrderViewModels,
  getLegacyAdminOrderViewModels,
  getLegacyDeliveryOrderViewModels,
  getLegacyOrderHistoryViewModels,
  getLegacyOrderPreparationViewModels,
  getLegacyOrderReviewViewModels,
  getLegacyPickupOrderViewModels,
  getOrderHistoryViewModels,
  getOrderPreparationViewModels,
  getOrderReviewViewModels,
  getOrderSummaryViewModel,
  getPickupOrderViewModels,
  pedidoTieneCuponUnico,
  pedidoTienePagoExacto,
  toActiveOrderViewModel,
  toAdminMonitorOrderViewModel,
  toAdminOrderViewModel,
  toDeliveryOrderViewModel,
  toOrderDetailLineViewModel,
  toOrderHistoryViewModel,
  toOrderPreparationViewModel,
  toOrderReviewViewModel,
  toOrderSummaryViewModel,
  toPickupOrderViewModel,
} from "../viewModels/orderViewModels";

export function getPedidos() {
  return mockPedidos;
}

export function getPedidoById(id_pedido: number | null | undefined) {
  if (id_pedido == null) return null;
  return mockPedidos.find((pedido) => pedido.id_pedido === id_pedido) ?? null;
}

export function getPedidosByUsuario(id_usuario: number) {
  return selectPedidosByUsuario(id_usuario);
}

export function getPedidoActivoByUsuario(id_usuario: number) {
  return selectPedidoActivoByUsuario(id_usuario);
}

export function getDetallesByPedido(id_pedido: number) {
  return selectDetallesByPedido(id_pedido);
}

export function getResumenPedido(id_pedido: number) {
  const pedido = getPedidoById(id_pedido);
  if (!pedido) return null;

  const detalles = getDetallesByPedido(id_pedido);
  const transaccion = getTransaccionById(pedido.id_transaccion);
  const cupon = pedido.id_cupon
    ? mockCupones.find((item) => item.id_cupon === pedido.id_cupon) ?? null
    : null;

  return { pedido, detalles, transaccion, cupon };
}

export function getPedidosPorEstado(estado: EstadoPedidoType) {
  return mockPedidos.filter((pedido) => pedido.estado_pedido === estado);
}

export function getPedidosPorPreparar() {
  return getPedidosPorEstado(EstadoPedido.EnPreparacion);
}

export function getPedidosPorRetirar() {
  return getPedidosPorEstado(EstadoPedido.PorRetirar);
}

export function getPedidosListosParaDelivery() {
  return getPedidosPorEstado(EstadoPedido.ListoParaDelivery);
}

export function getPedidosEnCamino() {
  return getPedidosPorEstado(EstadoPedido.EnCamino);
}

export function getPedidosEntregados() {
  return getPedidosPorEstado(EstadoPedido.Entregado);
}

export function pedidoTieneProductosControlados(id_pedido: number) {
  return getDetallesByPedido(id_pedido).some((detalle) => {
    const producto = getProductoById(detalle.id_producto);
    return producto ? requiereRecipeFisico(producto) : false;
  });
}

export function pedidoRequiereRecipe(id_pedido: number) {
  const detallesRequierenRecipe = getDetallesByPedido(id_pedido).some((detalle) => {
    const producto = getProductoById(detalle.id_producto);
    return producto ? requiereRecipeDigital(producto) : false;
  });

  return detallesRequierenRecipe || getRecipesByPedido(id_pedido).length > 0;
}

export function pedidoRequierePickupObligatorio(id_pedido: number) {
  return getDetallesByPedido(id_pedido).some((detalle) => {
    const producto = getProductoById(detalle.id_producto);
    return producto ? esPickupObligatorio(producto) : false;
  });
}
