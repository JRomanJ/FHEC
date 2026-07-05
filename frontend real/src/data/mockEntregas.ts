import type { EntregaDelivery, EntregaPickup, PedidoPreparado } from "../domain";
import { PEDIDO_IDS } from "./mockPedidos";
import { PERSONAL_OPERATIVO_IDS } from "./mockPersonalOperativo";

export const mockPedidosPreparados: PedidoPreparado[] = [
  { id_pedido: PEDIDO_IDS.EnPreparacion, id_personal_operativo: PERSONAL_OPERATIVO_IDS.Auxiliar, fecha_preparacion: "2026-07-05T12:35:00.000Z" },
  { id_pedido: PEDIDO_IDS.PorRetirar, id_personal_operativo: PERSONAL_OPERATIVO_IDS.Auxiliar, fecha_preparacion: "2026-07-05T12:50:00.000Z" },
  { id_pedido: PEDIDO_IDS.ListoDelivery, id_personal_operativo: PERSONAL_OPERATIVO_IDS.Auxiliar, fecha_preparacion: "2026-07-05T13:30:00.000Z" },
  { id_pedido: PEDIDO_IDS.EnCamino, id_personal_operativo: PERSONAL_OPERATIVO_IDS.Auxiliar, fecha_preparacion: "2026-07-05T13:35:00.000Z" },
  { id_pedido: PEDIDO_IDS.Entregado, id_personal_operativo: PERSONAL_OPERATIVO_IDS.Auxiliar, fecha_preparacion: "2026-07-04T16:35:00.000Z" },
];

export const mockEntregasPickup: EntregaPickup[] = [];

export const mockEntregasDelivery: EntregaDelivery[] = [
  {
    id_pedido: PEDIDO_IDS.EnCamino,
    id_personal_operativo: PERSONAL_OPERATIVO_IDS.Repartidor,
    fecha_asignacion: "2026-07-05T13:45:00.000Z",
    fecha_entrega: null,
  },
  {
    id_pedido: PEDIDO_IDS.Entregado,
    id_personal_operativo: PERSONAL_OPERATIVO_IDS.Repartidor,
    fecha_asignacion: "2026-07-04T17:10:00.000Z",
    fecha_entrega: "2026-07-04T18:00:00.000Z",
  },
];
