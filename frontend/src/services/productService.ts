import {
  BRAND_SYNONYMS,
  FREQUENTLY_BOUGHT_TOGETHER,
  getCategoriaById,
  getFormasFarmaceuticas as selectFormasFarmaceuticas,
  getProductoById as selectProductoById,
  getProductos as selectProductos,
  getProductosDisponiblesPorSede as selectProductosDisponiblesPorSede,
  getProductosHabilitados as selectProductosHabilitados,
  getProductosSimilares as selectProductosSimilares,
} from "../data";
import { esProductoHabilitado } from "../domain";
import type { Producto } from "../domain";
import {
  getAppProductViewModels,
  getProductCardViewModels,
  toProductAdminCatalogViewModel,
  toProductAdminInventoryViewModel,
  toProductCardViewModel as toVisualProductCardViewModel,
  toProductCartItemViewModel,
  toProductDetailViewModel,
  toProductRecipeAuditViewModel,
  toProductSearchViewModel,
  toProductSimilarViewModel,
} from "../viewModels";
import { getStockDisponible } from "./inventoryService";

export interface ProductSearchFilters {
  id_categoria?: number;
  id_sede?: number;
  principio_activo?: string;
  forma_farmaceutica?: string;
  soloHabilitados?: boolean;
  soloDisponibles?: boolean;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function productMatchesQuery(producto: Producto, query: string): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  const categoria = getCategoriaById(producto.id_categoria)?.nombre_categoria ?? "";
  const haystack = [
    producto.nombre_producto,
    producto.principio_activo,
    producto.marca_comercial,
    producto.forma_farmaceutica,
    categoria,
  ]
    .join(" ")
    .toLowerCase();

  const synonymHits = Object.entries(BRAND_SYNONYMS).some(([brand, values]) => {
    if (normalize(brand).includes(normalizedQuery)) {
      return values.some((value) => haystack.includes(normalize(value)));
    }

    return false;
  });

  return haystack.includes(normalizedQuery) || synonymHits;
}

export function getProductos() {
  return selectProductos();
}

export function getProductosHabilitados() {
  return selectProductosHabilitados();
}

export function getProductoById(id_producto: number | null | undefined) {
  return selectProductoById(id_producto);
}

export function getProductosByCategoria(id_categoria: number) {
  return selectProductos().filter((producto) => producto.id_categoria === id_categoria);
}

export function getProductosByPrincipioActivo(principio_activo: string) {
  const normalized = normalize(principio_activo);
  return selectProductos().filter(
    (producto) => normalize(producto.principio_activo) === normalized,
  );
}

export function getProductosSimilares(id_producto: number, id_sede?: number) {
  return selectProductosSimilares(id_producto, id_sede);
}

export function getProductosFrecuentes(id_producto: number) {
  return (FREQUENTLY_BOUGHT_TOGETHER[id_producto] ?? [])
    .map((relatedId) => selectProductoById(relatedId))
    .filter((producto): producto is Producto => producto != null);
}

export function getProductosDisponiblesPorSede(id_sede: number) {
  return selectProductosDisponiblesPorSede(id_sede);
}

export function buscarProductos(query: string, filtros: ProductSearchFilters = {}) {
  return selectProductos().filter((producto) => {
    if (filtros.soloHabilitados !== false && !esProductoHabilitado(producto)) return false;
    if (filtros.id_categoria != null && producto.id_categoria !== filtros.id_categoria) return false;
    if (
      filtros.principio_activo &&
      normalize(producto.principio_activo) !== normalize(filtros.principio_activo)
    ) {
      return false;
    }
    if (
      filtros.forma_farmaceutica &&
      normalize(producto.forma_farmaceutica) !== normalize(filtros.forma_farmaceutica)
    ) {
      return false;
    }
    if (
      filtros.id_sede != null &&
      filtros.soloDisponibles !== false &&
      getStockDisponible(producto.id_producto, filtros.id_sede) <= 0
    ) {
      return false;
    }

    return productMatchesQuery(producto, query);
  });
}

export function getFormasFarmaceuticas() {
  return selectFormasFarmaceuticas();
}

export function getProductosParaCatalogo(id_sede: number) {
  return getProductosDisponiblesPorSede(id_sede);
}

export function getProductoDetalle(id_producto: number, id_sede: number) {
  const producto = selectProductoById(id_producto);
  if (!producto) return null;

  return {
    producto,
    stock_disponible: getStockDisponible(id_producto, id_sede),
    similares: getProductosSimilares(id_producto, id_sede),
    frecuentes: getProductosFrecuentes(id_producto),
  };
}

export function getProductosLegacy() {
  return getAppProductViewModels();
}

export function getProductoLegacyById(id_producto: number) {
  return getAppProductViewModels().find((producto) => producto.id === id_producto) ?? null;
}

export function toProductCardViewModel(producto: Producto) {
  return toVisualProductCardViewModel(producto);
}

export {
  getAppProductViewModels,
  getProductCardViewModels,
  toProductAdminCatalogViewModel,
  toProductAdminInventoryViewModel,
  toProductCartItemViewModel,
  toProductDetailViewModel,
  toProductRecipeAuditViewModel,
  toProductSearchViewModel,
  toProductSimilarViewModel,
};
