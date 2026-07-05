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
