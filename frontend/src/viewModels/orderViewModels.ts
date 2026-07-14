import {
  mockCupones,
  mockDetallePedidos,
  mockPedidos,
  mockProductos,
  mockSedes,
  mockTransacciones,
  mockUsuarios,
} from "../data";
import { EstadoPedido, MetodoEntrega, esPickupObligatorio, requiereRecipeDigital } from "../domain";
import type { DetallePedido, Pedido } from "../domain";

export interface OrderDetailLineViewModel {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number | null;
  subtotal: number;
  label: string;
}

export interface OrderSummaryViewModel {
  id: number;
  displayId: string;
  subtotal: number;
  iva: number;
  shippingCost: number;
  discount: number;
  total: number;
  totalLabel: string;
  lines: OrderDetailLineViewModel[];
}

export interface OrderHistoryViewModel {
  id: string;
  date: string;
  status: string;
  items: number;
  totalBs: number;
  totalUsd: number;
  products: string[];
}

export interface ActiveOrderViewModel extends OrderHistoryViewModel {
  deliveryMethod?: string;
  sede?: string;
  pin?: string | null;
}

export interface AdminOrderViewModel {
  id: string;
  clientName: string;
  sede: string;
  status: string;
  items: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
  products: string[];
  deliveryAddress?: string;
  controlled?: boolean;
}

export interface AdminMonitorOrderViewModel {
  id: string;
  date: string;
  client: string;
  sede: string;
  status: string;
  total: number;
  shippingCost: number;
  payRef?: string;
  approvedBy: string;
  preparedBy: string;
  dispatchedBy: string;
}

export type OrderPreparationViewModel = AdminOrderViewModel;
export type PickupOrderViewModel = AdminOrderViewModel;
export type DeliveryOrderViewModel = AdminOrderViewModel;

export interface OrderReviewViewModel {
  id: string;
  client: string;
  rating: number;
  comment: string;
  date: string;
  products: string[];
}

const LEGACY_PROFILE_ORDERS: OrderHistoryViewModel[] = [
  {
    id: "ORD-2024-001",
    date: "2024-05-28",
    status: "En curso",
    items: 3,
    totalBs: 125.5,
    totalUsd: 3.1,
    products: ["Metformina 500mg", "Vitamina C 1000mg", "Paracetamol 500mg"],
  },
  {
    id: "ORD-2024-002",
    date: "2024-05-25",
    status: "Entregado",
    items: 2,
    totalBs: 89,
    totalUsd: 2.2,
    products: ["Losartán 50mg", "Omeprazol 20mg"],
  },
  {
    id: "ORD-2024-003",
    date: "2024-05-20",
    status: "Entregado",
    items: 5,
    totalBs: 234.75,
    totalUsd: 5.79,
    products: [
      "Amoxicilina 500mg",
      "Paracetamol 500mg",
      "Vitamina C 1000mg",
      "Metformina 500mg",
      "Atorvastatina 20mg",
    ],
  },
  {
    id: "ORD-2024-004",
    date: "2024-05-10",
    status: "Entregado",
    items: 4,
    totalBs: 189.9,
    totalUsd: 4.69,
    products: ["Losartán 50mg", "Atorvastatina 20mg", "Metformina 500mg", "Paracetamol 500mg"],
  },
  {
    id: "ORD-2024-005",
    date: "2024-05-05",
    status: "Entregado",
    items: 2,
    totalBs: 67.5,
    totalUsd: 1.67,
    products: ["Vitamina C 1000mg", "Paracetamol 500mg"],
  },
  {
    id: "ORD-2024-006",
    date: "2024-04-28",
    status: "Entregado",
    items: 3,
    totalBs: 156,
    totalUsd: 3.85,
    products: ["Amoxicilina 500mg", "Omeprazol 20mg", "Metformina 500mg"],
  },
  {
    id: "ORD-2024-007",
    date: "2024-04-20",
    status: "Entregado",
    items: 1,
    totalBs: 45.5,
    totalUsd: 1.12,
    products: ["Paracetamol 500mg"],
  },
];

const LEGACY_ADMIN_ORDERS: AdminOrderViewModel[] = [
  {
    id: "ORD-2024-201",
    clientName: "Pedro Martínez",
    sede: "principal",
    status: "Por preparar",
    items: 3,
    total: 45.5,
    paymentMethod: "Pago Móvil",
    createdAt: "2024-06-08 15:30",
    products: ["Metformina 500mg x2", "Vitamina C 1000mg x1"],
  },
  {
    id: "ORD-2024-202",
    clientName: "Laura Díaz",
    sede: "clinica",
    status: "Por retirar",
    items: 2,
    total: 28,
    paymentMethod: "Transferencia",
    createdAt: "2024-06-08 15:15",
    products: ["Paracetamol 500mg x2"],
  },
  {
    id: "ORD-2024-203",
    clientName: "Carlos Ruiz",
    sede: "principal",
    status: "Listo para delivery",
    items: 4,
    total: 67.2,
    paymentMethod: "Pago Móvil",
    createdAt: "2024-06-08 14:50",
    products: ["Omeprazol 20mg x2", "Losartán 50mg x2"],
    deliveryAddress: "Calle 07, Manzana 04",
  },
  {
    id: "ORD-2024-204",
    clientName: "Isabel Vega",
    sede: "principal",
    status: "Por preparar",
    items: 1,
    total: 22,
    paymentMethod: "Presencial",
    createdAt: "2024-06-08 15:45",
    products: ["Clonazepam 0.5mg x1"],
    controlled: true,
  },
];

const LEGACY_ADMIN_MONITOR_ORDERS: AdminMonitorOrderViewModel[] = [
  {
    id: "ORD-2024-301",
    date: "2024-06-08 16:20",
    client: "María González",
    sede: "Principal",
    status: "Entregado",
    total: 34.75,
    shippingCost: 3.5,
    payRef: "00291847362",
    approvedBy: "Carlos Vega",
    preparedBy: "Ana Torres",
    dispatchedBy: "José Ramos",
  },
  {
    id: "ORD-2024-302",
    date: "2024-06-08 15:50",
    client: "Pedro Martínez",
    sede: "Clínica Sur",
    status: "En tránsito",
    total: 18.5,
    shippingCost: 4,
    payRef: "00384756291",
    approvedBy: "Carlos Vega",
    preparedBy: "Ana Torres",
    dispatchedBy: "José Ramos",
  },
  {
    id: "ORD-2024-303",
    date: "2024-06-08 15:30",
    client: "Laura Díaz",
    sede: "Principal",
    status: "Por preparar",
    total: 55,
    shippingCost: 3.5,
    payRef: "00473918562",
    approvedBy: "—",
    preparedBy: "—",
    dispatchedBy: "—",
  },
  {
    id: "ORD-2024-304",
    date: "2024-06-08 15:10",
    client: "Roberto Sánchez",
    sede: "Clínica Sur",
    status: "Pendiente pago",
    total: 12.25,
    shippingCost: 0,
    approvedBy: "Carlos Vega",
    preparedBy: "—",
    dispatchedBy: "—",
  },
  {
    id: "ORD-2024-305",
    date: "2024-06-08 14:45",
    client: "Sofía Jiménez",
    sede: "Maternidad",
    status: "Cancelado",
    total: 8,
    shippingCost: 0,
    approvedBy: "—",
    preparedBy: "—",
    dispatchedBy: "—",
  },
  {
    id: "ORD-2024-306",
    date: "2024-06-08 14:20",
    client: "Carlos Blanco",
    sede: "Principal",
    status: "Entregado",
    total: 22.9,
    shippingCost: 3.5,
    payRef: "00562837194",
    approvedBy: "Carlos Vega",
    preparedBy: "Ana Torres",
    dispatchedBy: "José Ramos",
  },
  {
    id: "ORD-2024-307",
    date: "2024-06-08 13:55",
    client: "Elena Rojas",
    sede: "Maternidad",
    status: "Por retirar",
    total: 41.3,
    shippingCost: 0,
    payRef: "00619283746",
    approvedBy: "Carlos Vega",
    preparedBy: "Ana Torres",
    dispatchedBy: "—",
  },
  {
    id: "ORD-2024-308",
    date: "2024-06-08 13:30",
    client: "Marcos Herrera",
    sede: "Principal",
    status: "En validación médica",
    total: 67.5,
    shippingCost: 5,
    approvedBy: "—",
    preparedBy: "—",
    dispatchedBy: "—",
  },
];

const ORDER_STATUS_LABELS: Record<Pedido["estado_pedido"], string> = {
  [EstadoPedido.EnRevisionMedica]: "En validación médica",
  [EstadoPedido.PendientePorPago]: "Pendiente pago",
  [EstadoPedido.EnPreparacion]: "Por preparar",
  [EstadoPedido.PorRetirar]: "Por retirar",
  [EstadoPedido.ListoParaDelivery]: "Listo para delivery",
  [EstadoPedido.EnCamino]: "En tránsito",
  [EstadoPedido.Entregado]: "Entregado",
  [EstadoPedido.Cancelado]: "Cancelado",
};

function cloneOrder<T extends { products?: string[] }>(order: T): T {
  return { ...order, ...(order.products ? { products: [...order.products] } : {}) };
}

function getPedidoDisplayId(pedido: Pedido): string {
  return `ORD-${pedido.fecha_creacion.slice(0, 4)}-${String(pedido.id_pedido).slice(-3)}`;
}

function getPedidoUserName(pedido: Pedido): string {
  return (
    mockUsuarios.find((usuario) => usuario.id_usuario === pedido.id_usuario)?.nombre_completo ??
    pedido.nombre_receptor
  );
}

function getPedidoSedeName(pedido: Pedido): string {
  return mockSedes.find((sede) => sede.id_sede === pedido.id_sede)?.nombre_sede ?? "";
}

function getProductoName(detalle: DetallePedido): string {
  return (
    mockProductos.find((producto) => producto.id_producto === detalle.id_producto)?.nombre_producto ??
    `Producto ${detalle.id_producto}`
  );
}

function getPedidoDetalles(pedido: Pedido) {
  return mockDetallePedidos.filter((detalle) => detalle.id_pedido === pedido.id_pedido);
}

function getPedidoProductLabels(pedido: Pedido, separator = "×") {
  return getPedidoDetalles(pedido).map((detalle) => `${getProductoName(detalle)} ${separator}${detalle.cantidad}`);
}

function getPedidoPaymentMethod(pedido: Pedido): string {
  const transaccion = mockTransacciones.find(
    (item) => item.id_transaccion === pedido.id_transaccion,
  );
  return transaccion?.metodo_pago ?? "Presencial";
}

function pedidoRequiresControlledProduct(pedido: Pedido): boolean {
  return getPedidoDetalles(pedido).some((detalle) => {
    const producto = mockProductos.find((item) => item.id_producto === detalle.id_producto);
    return producto ? requiereRecipeDigital(producto) || esPickupObligatorio(producto) : false;
  });
}

export function toOrderDetailLineViewModel(detallePedido: DetallePedido): OrderDetailLineViewModel {
  const productName = getProductoName(detallePedido);
  return {
    id: detallePedido.id_detalle_pedido,
    productName,
    quantity: detallePedido.cantidad,
    unitPrice: detallePedido.precio_unitario,
    discount: detallePedido.descuento_unitario,
    subtotal: detallePedido.subtotal_linea,
    label: `${productName} x${detallePedido.cantidad}`,
  };
}

export function toOrderSummaryViewModel(pedido: Pedido): OrderSummaryViewModel {
  return {
    id: pedido.id_pedido,
    displayId: getPedidoDisplayId(pedido),
    subtotal: pedido.subtotal,
    iva: pedido.iva,
    shippingCost: pedido.costo_entrega ?? 0,
    discount: pedido.descuento_aplicado ?? 0,
    total: pedido.total_pedido,
    totalLabel: `$${pedido.total_pedido.toFixed(2)}`,
    lines: getPedidoDetalles(pedido).map(toOrderDetailLineViewModel),
  };
}

export function getOrderSummaryViewModel(id_pedido: number): OrderSummaryViewModel | null {
  const pedido = mockPedidos.find((item) => item.id_pedido === id_pedido) ?? null;
  return pedido ? toOrderSummaryViewModel(pedido) : null;
}

export function toOrderHistoryViewModel(pedido: Pedido): OrderHistoryViewModel {
  const products = getPedidoDetalles(pedido).map((detalle) => getProductoName(detalle));
  return {
    id: getPedidoDisplayId(pedido),
    date: pedido.fecha_creacion.slice(0, 10),
    status:
      pedido.estado_pedido === EstadoPedido.Entregado
        ? "Entregado"
        : pedido.estado_pedido === EstadoPedido.Cancelado
          ? "Cancelado"
          : "En curso",
    items: products.length,
    totalBs: Number((pedido.total_pedido * pedido.tasa_bcv).toFixed(2)),
    totalUsd: pedido.total_pedido,
    products,
  };
}

export function toActiveOrderViewModel(pedido: Pedido): ActiveOrderViewModel {
  return {
    ...toOrderHistoryViewModel(pedido),
    deliveryMethod: pedido.metodo_entrega,
    sede: getPedidoSedeName(pedido),
    pin: pedido.pin_entrega,
  };
}

export function toAdminOrderViewModel(pedido: Pedido): AdminOrderViewModel {
  const products = getPedidoProductLabels(pedido, "x");
  const viewModel: AdminOrderViewModel = {
    id: getPedidoDisplayId(pedido),
    clientName: getPedidoUserName(pedido),
    sede: getPedidoSedeName(pedido).toLowerCase().includes("clínica") ? "clinica" : "principal",
    status: ORDER_STATUS_LABELS[pedido.estado_pedido],
    items: products.length,
    total: pedido.total_pedido,
    paymentMethod: getPedidoPaymentMethod(pedido),
    createdAt: pedido.fecha_creacion.replace("T", " ").slice(0, 16),
    products,
  };

  if (pedido.metodo_entrega === MetodoEntrega.Delivery && pedido.direccion_entrega) {
    viewModel.deliveryAddress = pedido.direccion_entrega;
  }
  if (pedidoRequiresControlledProduct(pedido)) {
    viewModel.controlled = true;
  }
  return viewModel;
}

export function toAdminMonitorOrderViewModel(pedido: Pedido): AdminMonitorOrderViewModel {
  const transaccion = mockTransacciones.find(
    (item) => item.id_transaccion === pedido.id_transaccion,
  );
  return {
    id: getPedidoDisplayId(pedido),
    date: pedido.fecha_creacion.replace("T", " ").slice(0, 16),
    client: getPedidoUserName(pedido),
    sede: getPedidoSedeName(pedido).replace("Sede ", ""),
    status: ORDER_STATUS_LABELS[pedido.estado_pedido],
    total: pedido.total_pedido,
    shippingCost: pedido.costo_entrega ?? 0,
    ...(transaccion ? { payRef: transaccion.referencia_bancaria } : {}),
    approvedBy:
      pedido.estado_pedido === EstadoPedido.EnRevisionMedica ||
      pedido.estado_pedido === EstadoPedido.Cancelado
        ? "—"
        : "Carlos Vega",
    preparedBy:
      pedido.estado_pedido === EstadoPedido.EnRevisionMedica ||
      pedido.estado_pedido === EstadoPedido.PendientePorPago ||
      pedido.estado_pedido === EstadoPedido.Cancelado
        ? "—"
        : "Ana Torres",
    dispatchedBy:
      pedido.estado_pedido === EstadoPedido.EnCamino ||
      pedido.estado_pedido === EstadoPedido.Entregado
        ? "José Ramos"
        : "—",
  };
}

export function toOrderPreparationViewModel(pedido: Pedido): OrderPreparationViewModel {
  return toAdminOrderViewModel(pedido);
}

export function toPickupOrderViewModel(pedido: Pedido): PickupOrderViewModel {
  return toAdminOrderViewModel(pedido);
}

export function toDeliveryOrderViewModel(pedido: Pedido): DeliveryOrderViewModel {
  return toAdminOrderViewModel(pedido);
}

export function toOrderReviewViewModel(pedido: Pedido): OrderReviewViewModel | null {
  if (pedido.calificacion_servicio == null || !pedido.comentario_servicio) return null;
  return {
    id: getPedidoDisplayId(pedido),
    client: getPedidoUserName(pedido),
    rating: pedido.calificacion_servicio,
    comment: pedido.comentario_servicio,
    date: (pedido.fecha_entrega ?? pedido.fecha_creacion).slice(0, 10),
    products: getPedidoDetalles(pedido).map((detalle) => getProductoName(detalle)),
  };
}

export function getOrderHistoryViewModels(id_usuario?: number): OrderHistoryViewModel[] {
  return mockPedidos
    .filter((pedido) => id_usuario == null || pedido.id_usuario === id_usuario)
    .map(toOrderHistoryViewModel);
}

export function getActiveOrderViewModel(id_usuario: number): ActiveOrderViewModel | null {
  const activeOrder =
    mockPedidos.find(
      (pedido) =>
        pedido.id_usuario === id_usuario &&
        pedido.estado_pedido !== EstadoPedido.Entregado &&
        pedido.estado_pedido !== EstadoPedido.Cancelado,
    ) ?? null;
  return activeOrder ? toActiveOrderViewModel(activeOrder) : null;
}

export function getAdminOrderViewModels(): AdminOrderViewModel[] {
  return mockPedidos.map(toAdminOrderViewModel);
}

export function getAdminMonitorOrderViewModels(): AdminMonitorOrderViewModel[] {
  return mockPedidos.map(toAdminMonitorOrderViewModel);
}

export function getOrderPreparationViewModels(): OrderPreparationViewModel[] {
  return mockPedidos
    .filter((pedido) => pedido.estado_pedido === EstadoPedido.EnPreparacion)
    .map(toOrderPreparationViewModel);
}

export function getPickupOrderViewModels(): PickupOrderViewModel[] {
  return mockPedidos
    .filter((pedido) => pedido.estado_pedido === EstadoPedido.PorRetirar)
    .map(toPickupOrderViewModel);
}

export function getDeliveryOrderViewModels(): DeliveryOrderViewModel[] {
  return mockPedidos
    .filter(
      (pedido) =>
        pedido.estado_pedido === EstadoPedido.ListoParaDelivery ||
        pedido.estado_pedido === EstadoPedido.EnCamino,
    )
    .map(toDeliveryOrderViewModel);
}

export function getOrderReviewViewModels(): OrderReviewViewModel[] {
  return mockPedidos
    .map(toOrderReviewViewModel)
    .filter((review): review is OrderReviewViewModel => review != null);
}

export function getLegacyOrderHistoryViewModels(_id_usuario?: number): OrderHistoryViewModel[] {
  return LEGACY_PROFILE_ORDERS.map(cloneOrder);
}

export function getLegacyActiveOrderViewModel(id_usuario?: number): ActiveOrderViewModel | null {
  const order = getLegacyOrderHistoryViewModels(id_usuario).find((item) => item.status === "En curso");
  return order ? { ...order, pin: null } : null;
}

export function getLegacyAdminOrderViewModels(): AdminOrderViewModel[] {
  return LEGACY_ADMIN_ORDERS.map(cloneOrder);
}

export function getLegacyAdminMonitorOrderViewModels(): AdminMonitorOrderViewModel[] {
  return LEGACY_ADMIN_MONITOR_ORDERS.map((order) => ({ ...order }));
}

export function getLegacyOrderPreparationViewModels(): OrderPreparationViewModel[] {
  return getLegacyAdminOrderViewModels().filter((order) => order.status === "Por preparar");
}

export function getLegacyPickupOrderViewModels(): PickupOrderViewModel[] {
  return getLegacyAdminOrderViewModels().filter((order) => order.status === "Por retirar");
}

export function getLegacyDeliveryOrderViewModels(): DeliveryOrderViewModel[] {
  return getLegacyAdminOrderViewModels().filter((order) => order.status === "Listo para delivery");
}

export function getLegacyOrderReviewViewModels(): OrderReviewViewModel[] {
  return mockPedidos
    .map(toOrderReviewViewModel)
    .filter((review): review is OrderReviewViewModel => review != null);
}

export function pedidoTienePagoExacto(pedido: Pedido): boolean {
  const transaccion = mockTransacciones.find(
    (item) => item.id_transaccion === pedido.id_transaccion,
  );
  return !transaccion || transaccion.monto_confirmado === pedido.total_pedido;
}

export function pedidoTieneCuponUnico(pedido: Pedido): boolean {
  if (pedido.id_cupon == null) return true;
  return mockCupones.some((cupon) => cupon.id_cupon === pedido.id_cupon);
}
