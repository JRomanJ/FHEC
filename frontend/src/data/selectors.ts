import {
  EstadoPedido,
  EstadoRecipe,
  FORMAS_FARMACEUTICAS_BASE,
  cuponEsDeUsuario,
  cuponEsGeneral,
  cuponEstaVigente,
  esProductoHabilitado,
  esSedeHabilitada,
} from "../domain";
import type { Cupon, Pedido, Producto, Recipe } from "../domain";
import { mockAuditoriaRecipes } from "./mockAuditoriaRecipes";
import { mockBanners } from "./mockBanners";
import { mockCarritos } from "./mockCarritos";
import { mockCategorias } from "./mockCategorias";
import { mockCupones } from "./mockCupones";
import { mockDetallePedidos } from "./mockDetallePedidos";
import { mockEntregasDelivery } from "./mockEntregas";
import { mockInventarioSedes } from "./mockInventarioSedes";
import { mockNotificaciones } from "./mockNotificaciones";
import { mockPedidos } from "./mockPedidos";
import { mockPersonalOperativo } from "./mockPersonalOperativo";
import { mockProductos } from "./mockProductos";
import { mockRecipes } from "./mockRecipes";
import { mockSedes } from "./mockSedes";
import { mockSolicitudesReembolso } from "./mockSolicitudesReembolso";
import { mockTransacciones } from "./mockTransacciones";

export interface DatabaseOrderHistoryDetail {
  id_producto: string;
  cantidad: number;
  productos?: {
    principio_activo: string | null;
    concentracion: string | number | null;
    marca_comercial: string | null;
  } | null;
}

export interface DatabaseOrderHistoryRow {
  id_pedido: string;
  id_usuario: string;
  total_pedido: number;
  tasa_bcv: number;
  estado_pedido: "pendiente" | "completado" | "expirado";
  fecha_creacion: string;
  detalles_pedidos?: DatabaseOrderHistoryDetail[];
  detalles?: DatabaseOrderHistoryDetail[];
}

export interface DatabaseOrderHistoryViewModel {
  id: string;
  date: string;
  status: string;
  items: number;
  totalBs: number;
  totalUsd: number;
  products: string[];
}

const DATABASE_ORDER_STATUS_LABELS: Record<DatabaseOrderHistoryRow["estado_pedido"], string> = {
  pendiente: "En curso",
  completado: "Completado",
  expirado: "Expirado",
};

const getDatabaseProductLabel = (detail: DatabaseOrderHistoryDetail) => {
  const product = detail.productos;
  const name = [product?.principio_activo, product?.concentracion]
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
    .join(" ");
  const fallback = product?.marca_comercial?.trim() || `Producto ${detail.id_producto.slice(0, 8)}`;
  return `${name || fallback} x${detail.cantidad}`;
};

export function selectDatabaseOrderHistory(
  orders: DatabaseOrderHistoryRow[],
  userId?: string,
): DatabaseOrderHistoryViewModel[] {
  return [...orders]
    .filter((order) => userId === undefined || order.id_usuario === userId)
    .sort((left, right) => Date.parse(right.fecha_creacion) - Date.parse(left.fecha_creacion))
    .map((order) => {
      const details = order.detalles_pedidos ?? order.detalles ?? [];
      const totalUsd = Number(order.total_pedido ?? 0);
      const exchangeRate = Number(order.tasa_bcv ?? 0);

      return {
        id: `PED-${order.id_pedido.slice(0, 8).toUpperCase()}`,
        date: order.fecha_creacion.slice(0, 10),
        status: DATABASE_ORDER_STATUS_LABELS[order.estado_pedido] ?? "En curso",
        items: details.reduce((total, detail) => total + Number(detail.cantidad ?? 0), 0),
        totalBs: Number((totalUsd * exchangeRate).toFixed(2)),
        totalUsd,
        products: details.map(getDatabaseProductLabel),
      };
    });
}

export function getCategoriaById(id_categoria: number | null | undefined) {
  if (id_categoria == null) return null;
  return mockCategorias.find((categoria) => categoria.id_categoria === id_categoria) ?? null;
}

export function getCategorias() {
  return mockCategorias;
}

export function getFormasFarmaceuticas() {
  return [...FORMAS_FARMACEUTICAS_BASE];
}

export function getSedes() {
  return mockSedes;
}

export function getSedesHabilitadas() {
  return mockSedes.filter(esSedeHabilitada);
}

export function getProductoById(id_producto: number | null | undefined): Producto | null {
  if (id_producto == null) return null;
  return mockProductos.find((producto) => producto.id_producto === id_producto) ?? null;
}

export function getProductos() {
  return mockProductos;
}

export function getProductosHabilitados() {
  return mockProductos.filter(esProductoHabilitado);
}

export function getInventarioProductoEnSede(id_producto: number, id_sede: number) {
  return (
    mockInventarioSedes.find(
      (inventario) => inventario.id_producto === id_producto && inventario.id_sede === id_sede,
    ) ?? null
  );
}

export function getStockDisponible(id_producto: number, id_sede: number): number {
  return getInventarioProductoEnSede(id_producto, id_sede)?.stock_disponible ?? 0;
}

export function getProductosDisponiblesPorSede(id_sede: number) {
  return getProductosHabilitados().filter(
    (producto) => getStockDisponible(producto.id_producto, id_sede) > 0,
  );
}

export function getProductosSimilares(id_producto: number, id_sede?: number) {
  const productoBase = getProductoById(id_producto);
  if (!productoBase) return [];

  return getProductosHabilitados().filter((producto) => {
    const mismoPrincipio = producto.principio_activo === productoBase.principio_activo;
    const distintoProducto = producto.id_producto !== productoBase.id_producto;
    const disponible = id_sede == null || getStockDisponible(producto.id_producto, id_sede) > 0;
    return mismoPrincipio && distintoProducto && disponible;
  });
}

export function getCupones() {
  return mockCupones;
}

export function getCuponesGenerales(fechaReferencia?: string) {
  return mockCupones.filter(
    (cupon) => cuponEsGeneral(cupon) && cuponEstaVigente(cupon, fechaReferencia),
  );
}

export function getCuponesDeUsuario(id_usuario: number) {
  return mockCupones.filter(
    (cupon) => cuponEsDeUsuario(cupon) && cupon.id_usuario === id_usuario,
  );
}

export function getCuponByCodigo(codigo: string): Cupon | null {
  const normalized = codigo.trim().toUpperCase();
  return mockCupones.find((cupon) => cupon.codigo_cupon.toUpperCase() === normalized) ?? null;
}

export function getPedidosByUsuario(id_usuario: number) {
  return mockPedidos.filter((pedido) => pedido.id_usuario === id_usuario);
}

export function getPedidoActivoByUsuario(id_usuario: number): Pedido | null {
  return (
    getPedidosByUsuario(id_usuario).find(
      (pedido) =>
        pedido.estado_pedido !== EstadoPedido.Entregado &&
        pedido.estado_pedido !== EstadoPedido.Cancelado,
    ) ?? null
  );
}

export function getDetallesByPedido(id_pedido: number) {
  return mockDetallePedidos.filter((detalle) => detalle.id_pedido === id_pedido);
}

export function getRecipesByPedido(id_pedido: number): Recipe[] {
  const detalleIds = new Set(getDetallesByPedido(id_pedido).map((detalle) => detalle.id_detalle_pedido));
  return mockRecipes.filter((recipe) => detalleIds.has(recipe.id_detalle_pedido));
}

export function getRecipesPendientes() {
  return mockRecipes.filter((recipe) => recipe.estado_recipe === EstadoRecipe.Pendiente);
}

export function getPedidosPorPreparar() {
  return mockPedidos.filter((pedido) => pedido.estado_pedido === EstadoPedido.EnPreparacion);
}

export function getPedidosSinRepartidor() {
  const pedidosAsignados = new Set(mockEntregasDelivery.map((entrega) => entrega.id_pedido));
  return mockPedidos.filter(
    (pedido) =>
      pedido.estado_pedido === EstadoPedido.ListoParaDelivery &&
      !pedidosAsignados.has(pedido.id_pedido),
  );
}

export function getPedidosAsignadosARepartidor(id_personal_operativo: number) {
  const pedidosAsignados = mockEntregasDelivery
    .filter((entrega) => entrega.id_personal_operativo === id_personal_operativo)
    .map((entrega) => entrega.id_pedido);
  return mockPedidos.filter((pedido) => pedidosAsignados.includes(pedido.id_pedido));
}

export function getSolicitudesReembolsoByUsuario(id_usuario: number) {
  return mockSolicitudesReembolso.filter((solicitud) => solicitud.id_usuario === id_usuario);
}

export function getNotificacionesByUsuario(id_usuario: number) {
  return mockNotificaciones.filter((notificacion) => notificacion.id_usuario === id_usuario);
}

export function getAuditoriaByRecipe(id_recipe: number) {
  return mockAuditoriaRecipes.find((auditoria) => auditoria.id_recipe === id_recipe) ?? null;
}

export function getTransaccionById(id_transaccion: number | null | undefined) {
  if (id_transaccion == null) return null;
  return mockTransacciones.find((transaccion) => transaccion.id_transaccion === id_transaccion) ?? null;
}

export function getPersonalOperativoByUsuario(id_usuario: number) {
  return mockPersonalOperativo.find((personal) => personal.id_usuario === id_usuario) ?? null;
}

export function getBanners() {
  return mockBanners;
}

export function getCarritoByUsuario(id_usuario: number) {
  return mockCarritos.filter((carrito) => carrito.id_usuario === id_usuario);
}
