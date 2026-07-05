import type { DetallePedido } from "../domain";
import { PEDIDO_IDS } from "./mockPedidos";
import { PRODUCTO_IDS } from "./mockProductos";

export const DETALLE_PEDIDO_IDS = {
  RevisionLosartan: 9001,
  RevisionClonazepam: 9002,
  PendienteMetformina: 9003,
  PendienteVitamina: 9004,
  PreparacionMetformina: 9005,
  PreparacionParacetamol: 9006,
  RetirarAtorvastatina: 9007,
  RetirarLosartan: 9008,
  ListoAmoxicilina: 9009,
  ListoVitamina: 9010,
  CaminoOmeprazol: 9011,
  CaminoParacetamol: 9012,
  EntregadoMetformina850: 9013,
  EntregadoOmeprazol40: 9014,
  CanceladoParacetamol: 9015,
} as const;

export const mockDetallePedidos: DetallePedido[] = [
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.RevisionLosartan, id_pedido: PEDIDO_IDS.RevisionMedica, id_producto: PRODUCTO_IDS.Losartan50, cantidad: 2, precio_unitario: 12, descuento_unitario: null, subtotal_linea: 24 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.RevisionClonazepam, id_pedido: PEDIDO_IDS.RevisionMedica, id_producto: PRODUCTO_IDS.Clonazepam05, cantidad: 2, precio_unitario: 22, descuento_unitario: null, subtotal_linea: 44 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.PendienteMetformina, id_pedido: PEDIDO_IDS.PendientePago, id_producto: PRODUCTO_IDS.Metformina500, cantidad: 1, precio_unitario: 8.5, descuento_unitario: 0.85, subtotal_linea: 7.65 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.PendienteVitamina, id_pedido: PEDIDO_IDS.PendientePago, id_producto: PRODUCTO_IDS.VitaminaC1000, cantidad: 1, precio_unitario: 6.25, descuento_unitario: 0.31, subtotal_linea: 5.95 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.PreparacionMetformina, id_pedido: PEDIDO_IDS.EnPreparacion, id_producto: PRODUCTO_IDS.Metformina500, cantidad: 2, precio_unitario: 8.5, descuento_unitario: 0.85, subtotal_linea: 15.3 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.PreparacionParacetamol, id_pedido: PEDIDO_IDS.EnPreparacion, id_producto: PRODUCTO_IDS.Paracetamol500, cantidad: 4, precio_unitario: 4.5, descuento_unitario: 0.45, subtotal_linea: 16.2 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.RetirarAtorvastatina, id_pedido: PEDIDO_IDS.PorRetirar, id_producto: PRODUCTO_IDS.Atorvastatina20, cantidad: 1, precio_unitario: 18.9, descuento_unitario: null, subtotal_linea: 18.9 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.RetirarLosartan, id_pedido: PEDIDO_IDS.PorRetirar, id_producto: PRODUCTO_IDS.Losartan50, cantidad: 2, precio_unitario: 12, descuento_unitario: null, subtotal_linea: 24 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.ListoAmoxicilina, id_pedido: PEDIDO_IDS.ListoDelivery, id_producto: PRODUCTO_IDS.Amoxicilina250, cantidad: 3, precio_unitario: 8.9, descuento_unitario: null, subtotal_linea: 26.7 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.ListoVitamina, id_pedido: PEDIDO_IDS.ListoDelivery, id_producto: PRODUCTO_IDS.VitaminaC500, cantidad: 5, precio_unitario: 4.8, descuento_unitario: null, subtotal_linea: 24 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.CaminoOmeprazol, id_pedido: PEDIDO_IDS.EnCamino, id_producto: PRODUCTO_IDS.Omeprazol20, cantidad: 1, precio_unitario: 9.3, descuento_unitario: 0.47, subtotal_linea: 8.84 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.CaminoParacetamol, id_pedido: PEDIDO_IDS.EnCamino, id_producto: PRODUCTO_IDS.Paracetamol500, cantidad: 2, precio_unitario: 4.5, descuento_unitario: 0.45, subtotal_linea: 8.1 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.EntregadoMetformina850, id_pedido: PEDIDO_IDS.Entregado, id_producto: PRODUCTO_IDS.Metformina850, cantidad: 1, precio_unitario: 10.2, descuento_unitario: null, subtotal_linea: 10.2 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.EntregadoOmeprazol40, id_pedido: PEDIDO_IDS.Entregado, id_producto: PRODUCTO_IDS.Omeprazol40, cantidad: 1, precio_unitario: 12, descuento_unitario: null, subtotal_linea: 12 },
  { id_detalle_pedido: DETALLE_PEDIDO_IDS.CanceladoParacetamol, id_pedido: PEDIDO_IDS.Cancelado, id_producto: PRODUCTO_IDS.Paracetamol1000, cantidad: 1, precio_unitario: 8, descuento_unitario: null, subtotal_linea: 8 },
];
