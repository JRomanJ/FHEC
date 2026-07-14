import { mockDetallePedidos, mockEntregasDelivery, mockPedidos, mockProductos } from "../data";
import { EstadoPedido } from "../domain";
import type { EntregaDelivery, Pedido } from "../domain";

export interface DeliveryAvailableOrderViewModel {
  id: string;
  customer: string;
  phone: string;
  sede: string;
  address: string;
  items: number;
  total: number;
  pin: string;
  distance: string;
  products: string[];
  notes: string;
}

export type DeliveryAssignedOrderViewModel = DeliveryAvailableOrderViewModel;

export interface DeliveryCompletedTripViewModel {
  id: string;
  date: string;
  customer: string;
  sede: string;
  shippingCost: number;
}

export interface DeliveryDashboardStatsViewModel {
  activeTrips: number;
  completedTrips: number;
  completedShippingTotal: number;
  maxActiveTrips: number;
  canAssignMoreTrips: boolean;
}

const MAX_ACTIVE_DELIVERY_TRIPS = 3;

const LEGACY_DELIVERY_COMPLETED_TRIPS: DeliveryCompletedTripViewModel[] = [
  {
    id: "FHEC-20241201-8101",
    date: "2024-12-01",
    customer: "Ana Martínez",
    sede: "principal",
    shippingCost: 3.5,
  },
  {
    id: "FHEC-20241202-8210",
    date: "2024-12-02",
    customer: "Pedro Castillo",
    sede: "clinica",
    shippingCost: 4,
  },
  {
    id: "FHEC-20241202-8215",
    date: "2024-12-02",
    customer: "Luisa Mora",
    sede: "principal",
    shippingCost: 3.5,
  },
  {
    id: "FHEC-20241203-8312",
    date: "2024-12-03",
    customer: "Roberto Silva",
    sede: "principal",
    shippingCost: 5,
  },
  {
    id: "FHEC-20241203-8320",
    date: "2024-12-03",
    customer: "Carmen Ríos",
    sede: "clinica",
    shippingCost: 4.5,
  },
  {
    id: "FHEC-20241204-8401",
    date: "2024-12-04",
    customer: "Miguel Torres",
    sede: "principal",
    shippingCost: 3.5,
  },
];

const LEGACY_DELIVERY_AVAILABLE_ORDERS: DeliveryAvailableOrderViewModel[] = [
  {
    id: "FHEC-20241204-8471",
    customer: "Carlos Rodríguez",
    phone: "+58 412-1234567",
    sede: "principal",
    address: "Calle 07, Manzana 04, Ciudad Guayana 8050, Bolívar",
    items: 3,
    total: 45.5,
    pin: "1234",
    distance: "2.4 km",
    products: ["Metformina 500mg ×2", "Vitamina C 1000mg ×1"],
    notes: "Entregar en recepción del edificio",
  },
  {
    id: "FHEC-20241204-8472",
    customer: "María González",
    phone: "+58 424-9876543",
    sede: "principal",
    address: "Av. Las Américas, Torre Mar, Piso 5, Apto 5B",
    items: 2,
    total: 32,
    pin: "5678",
    distance: "4.1 km",
    products: ["Losartán 50mg ×1", "Omeprazol 20mg ×1"],
    notes: "",
  },
  {
    id: "FHEC-20241204-8473",
    customer: "Luis Pérez",
    phone: "+58 414-5551234",
    sede: "clinica",
    address: "Frente a la Mezquita, Av. José Gumilla, Ciudad Guayana",
    items: 5,
    total: 67.9,
    pin: "9012",
    distance: "1.2 km",
    products: ["Paracetamol 500mg ×3", "Atorvastatina 20mg ×1", "Clonazepam 0.5mg ×1"],
    notes: "Cliente espera en la puerta — llamar al llegar",
  },
];

function cloneDeliveryOrder(order: DeliveryAvailableOrderViewModel): DeliveryAvailableOrderViewModel {
  return { ...order, products: [...order.products] };
}

function formatDeliveryOrderId(pedido: Pedido): string {
  return `FHEC-${pedido.fecha_creacion.slice(0, 10).replace(/-/g, "")}-${String(pedido.id_pedido).slice(-4)}`;
}

function getSedeSlug(pedido: Pedido): string {
  return pedido.id_sede === 2 ? "clinica" : "principal";
}

function getProductLabels(pedido: Pedido): string[] {
  return mockDetallePedidos
    .filter((detalle) => detalle.id_pedido === pedido.id_pedido)
    .map((detalle) => {
      const producto = mockProductos.find((item) => item.id_producto === detalle.id_producto);
      return `${producto?.nombre_producto ?? `Producto ${detalle.id_producto}`} ×${detalle.cantidad}`;
    });
}

export function toDeliveryAvailableOrderViewModel(pedido: Pedido): DeliveryAvailableOrderViewModel {
  const products = getProductLabels(pedido);
  return {
    id: formatDeliveryOrderId(pedido),
    customer: pedido.nombre_receptor,
    phone: `+58 ${pedido.codigo_area_receptor.replace(/^0/, "")}-${pedido.telefono_receptor}`,
    sede: getSedeSlug(pedido),
    address: pedido.direccion_entrega ?? "",
    items: products.length,
    total: pedido.total_pedido,
    pin: pedido.pin_entrega ?? "",
    distance: "",
    products,
    notes: "",
  };
}

export function toDeliveryAssignedOrderViewModel(pedido: Pedido): DeliveryAssignedOrderViewModel {
  return toDeliveryAvailableOrderViewModel(pedido);
}

export function toDeliveryCompletedTripViewModel(
  pedido: Pedido,
  entrega?: EntregaDelivery | null,
): DeliveryCompletedTripViewModel {
  return {
    id: formatDeliveryOrderId(pedido),
    date: (entrega?.fecha_entrega ?? pedido.fecha_entrega ?? pedido.fecha_creacion).slice(0, 10),
    customer: pedido.nombre_receptor,
    sede: getSedeSlug(pedido),
    shippingCost: pedido.costo_entrega ?? 0,
  };
}

export function getDeliveryAvailableOrderViewModels(): DeliveryAvailableOrderViewModel[] {
  return mockPedidos
    .filter((pedido) => pedido.estado_pedido === EstadoPedido.ListoParaDelivery)
    .map(toDeliveryAvailableOrderViewModel);
}

export function getDeliveryAssignedOrderViewModels(
  id_personal_operativo: number,
): DeliveryAssignedOrderViewModel[] {
  const assignedIds = new Set(
    mockEntregasDelivery
      .filter(
        (entrega) =>
          entrega.id_personal_operativo === id_personal_operativo && entrega.fecha_entrega == null,
      )
      .map((entrega) => entrega.id_pedido),
  );
  return mockPedidos
    .filter((pedido) => assignedIds.has(pedido.id_pedido))
    .map(toDeliveryAssignedOrderViewModel);
}

export function getDeliveryCompletedTripViewModels(
  id_personal_operativo?: number,
): DeliveryCompletedTripViewModel[] {
  return mockEntregasDelivery
    .filter(
      (entrega) =>
        entrega.fecha_entrega != null &&
        (id_personal_operativo == null || entrega.id_personal_operativo === id_personal_operativo),
    )
    .map((entrega) => {
      const pedido = mockPedidos.find((item) => item.id_pedido === entrega.id_pedido);
      return pedido ? toDeliveryCompletedTripViewModel(pedido, entrega) : null;
    })
    .filter((trip): trip is DeliveryCompletedTripViewModel => trip != null);
}

export function getDeliveryDashboardStats(id_personal_operativo?: number): DeliveryDashboardStatsViewModel {
  const activeTrips = id_personal_operativo == null
    ? 0
    : getDeliveryAssignedOrderViewModels(id_personal_operativo).length;
  const completedTrips = getDeliveryCompletedTripViewModels(id_personal_operativo);
  return {
    activeTrips,
    completedTrips: completedTrips.length,
    completedShippingTotal: completedTrips.reduce((sum, trip) => sum + trip.shippingCost, 0),
    maxActiveTrips: MAX_ACTIVE_DELIVERY_TRIPS,
    canAssignMoreTrips: activeTrips < MAX_ACTIVE_DELIVERY_TRIPS,
  };
}

export function getLegacyDeliveryAvailableOrderViewModels(): DeliveryAvailableOrderViewModel[] {
  return LEGACY_DELIVERY_AVAILABLE_ORDERS.map(cloneDeliveryOrder);
}

export function getLegacyDeliveryAssignedOrderViewModels(
  _id_personal_operativo?: number,
): DeliveryAssignedOrderViewModel[] {
  return [];
}

export function getLegacyDeliveryCompletedTripViewModels(
  _id_personal_operativo?: number,
): DeliveryCompletedTripViewModel[] {
  return LEGACY_DELIVERY_COMPLETED_TRIPS.map((trip) => ({ ...trip }));
}

export function getLegacyDeliveryDashboardStats(
  id_personal_operativo?: number,
): DeliveryDashboardStatsViewModel {
  const completedTrips = getLegacyDeliveryCompletedTripViewModels(id_personal_operativo);
  return {
    activeTrips: 0,
    completedTrips: completedTrips.length,
    completedShippingTotal: completedTrips.reduce((sum, trip) => sum + trip.shippingCost, 0),
    maxActiveTrips: MAX_ACTIVE_DELIVERY_TRIPS,
    canAssignMoreTrips: true,
  };
}
