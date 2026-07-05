import { EstadoPedido } from "../domain";
import { getPedidosAsignadosARepartidor, getPedidosSinRepartidor, mockEntregasDelivery, mockPedidos } from "../data";

const MAX_PEDIDOS_ACTIVOS_REPARTIDOR = 3;

export function getPedidosDisponiblesDelivery() {
  return getPedidosSinRepartidor();
}

export function getPedidosAsignadosDelivery(id_personal_operativo: number) {
  return getPedidosAsignadosARepartidor(id_personal_operativo);
}

export function getViajesCompletadosDelivery(id_personal_operativo: number) {
  const entregadosIds = new Set(
    mockEntregasDelivery
      .filter(
        (entrega) =>
          entrega.id_personal_operativo === id_personal_operativo && entrega.fecha_entrega != null,
      )
      .map((entrega) => entrega.id_pedido),
  );
  return mockPedidos.filter((pedido) => entregadosIds.has(pedido.id_pedido));
}

export function repartidorPuedeAsignarsePedido(id_personal_operativo: number) {
  const pedidosActivos = getPedidosAsignadosDelivery(id_personal_operativo).filter(
    (pedido) =>
      pedido.estado_pedido === EstadoPedido.ListoParaDelivery ||
      pedido.estado_pedido === EstadoPedido.EnCamino,
  );

  return pedidosActivos.length < MAX_PEDIDOS_ACTIVOS_REPARTIDOR;
}
