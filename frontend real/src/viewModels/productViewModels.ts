import {
  FREQUENTLY_BOUGHT_TOGETHER,
  SEDE_IDS,
  mockCategorias,
  mockDetallePedidos,
  mockInventarioSedes,
  mockProductoVisual,
  mockProductos,
  mockSedes,
} from "../data";
import {
  EstadoProducto,
  calcularPrecioConDescuento,
  requiereRecipeDigital,
  requiereRecipeFisico,
} from "../domain";
import type { Carrito, DetallePedido, InventarioSede, Pedido, Producto, Recipe, Sede } from "../domain";

export interface ProductCardViewModel {
  id: number;
  name: string;
  brand: string;
  category: string;
  presentation: string;
  packSize: string;
  priceUSD: number;
  stock: number;
  needsRecipe: boolean;
  rating: number;
  reviews: number;
  bgColor: string;
  accentColor: string;
  imageUrl?: string;
  description: string;
  activeIngredient: string;
  contraindications: string;
  posology: string;
  discount?: number;
  controlledSubstance?: boolean;
  stockSedes?: { principal: number; clinica: number };
  concentration?: string;
  concentrationUnit?: string;
  enabled?: boolean;
}

export type ProductDetailViewModel = ProductCardViewModel;
export type ProductSearchViewModel = ProductCardViewModel;
export type ProductSimilarViewModel = ProductCardViewModel;
export type ProductAdminCatalogViewModel = ProductCardViewModel;

export interface ProductCartItemViewModel {
  product: ProductCardViewModel;
  quantity: number;
  subtotalUSD: number;
  stockDisponible: number;
}

export interface ProductAdminInventoryViewModel extends ProductCardViewModel {
  id_sede?: number;
  sede?: string;
  stockDisponible?: number;
}

export interface ProductRecipeAuditViewModel {
  id: number;
  orderId: string;
  clientName: string;
  product: string;
  activeIngredient: string;
  concentration: string;
  concentrationUnit: string;
  packSize: string;
  quantity: number;
  uploadDate: string;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
}

export interface ProductViewModelOptions {
  selectedSedeId?: number;
}

function getCategoriaName(id_categoria: number | null): string {
  return mockCategorias.find((categoria) => categoria.id_categoria === id_categoria)?.nombre_categoria ?? "";
}

function getStockSedes(id_producto: number) {
  return {
    principal:
      mockInventarioSedes.find(
        (item) => item.id_producto === id_producto && item.id_sede === SEDE_IDS.Principal,
      )?.stock_disponible ?? 0,
    clinica:
      mockInventarioSedes.find(
        (item) => item.id_producto === id_producto && item.id_sede === SEDE_IDS.ClinicaHumana,
      )?.stock_disponible ?? 0,
  };
}

function getProductoVisual(id_producto: number) {
  return mockProductoVisual[id_producto as keyof typeof mockProductoVisual];
}

function toOptionalString(value: number | string | null): string | undefined {
  if (value === null || value === "") return undefined;
  return String(value);
}

function formatRecipeStatus(status: Recipe["estado_recipe"]): ProductRecipeAuditViewModel["status"] {
  if (status === "Aprobado") return "approved";
  if (status === "Rechazado") return "rejected";
  return "pending";
}

export function toProductCardViewModel(
  producto: Producto,
  _options: ProductViewModelOptions = {},
): ProductCardViewModel {
  const visual = getProductoVisual(producto.id_producto);
  const stockSedes = getStockSedes(producto.id_producto);
  const viewModel: ProductCardViewModel = {
    id: producto.id_producto,
    name: producto.nombre_producto,
    brand: producto.marca_comercial,
    category: getCategoriaName(producto.id_categoria),
    presentation: producto.forma_farmaceutica,
    packSize: producto.unidades == null ? "" : String(producto.unidades),
    priceUSD: producto.precio_usd,
    stock: stockSedes.principal + stockSedes.clinica,
    needsRecipe: requiereRecipeDigital(producto),
    rating: visual?.rating ?? 4.5,
    reviews: visual?.reviews ?? 0,
    bgColor: visual?.bgColor ?? "#f8fafc",
    accentColor: visual?.accentColor ?? "#179150",
    description: producto.descripcion ?? "",
    activeIngredient: producto.principio_activo,
    contraindications: visual?.contraindications ?? "",
    posology: visual?.posology ?? "",
    stockSedes,
  };

  const concentration = toOptionalString(producto.concentracion);
  if (concentration) viewModel.concentration = concentration;
  if (producto.unidad_concentracion) viewModel.concentrationUnit = producto.unidad_concentracion;
  if (producto.imagen_producto) viewModel.imageUrl = producto.imagen_producto;
  if (producto.descuento_porcentaje && producto.descuento_porcentaje > 0) {
    viewModel.discount = producto.descuento_porcentaje;
  }
  if (requiereRecipeFisico(producto)) viewModel.controlledSubstance = true;
  if (producto.estado_producto !== EstadoProducto.Habilitado) viewModel.enabled = false;

  return viewModel;
}

export function toProductDetailViewModel(
  producto: Producto,
  options: ProductViewModelOptions = {},
): ProductDetailViewModel {
  return toProductCardViewModel(producto, options);
}

export function toProductSearchViewModel(
  producto: Producto,
  options: ProductViewModelOptions = {},
): ProductSearchViewModel {
  return toProductCardViewModel(producto, options);
}

export function toProductSimilarViewModel(
  producto: Producto,
  options: ProductViewModelOptions = {},
): ProductSimilarViewModel {
  return toProductCardViewModel(producto, options);
}

export function toProductAdminCatalogViewModel(
  producto: Producto,
  options: ProductViewModelOptions = {},
): ProductAdminCatalogViewModel {
  return toProductCardViewModel(producto, options);
}

export function toProductCartItemViewModel(
  carritoItem: Carrito,
  producto: Producto,
  _sede?: Sede | null,
  options: ProductViewModelOptions = {},
): ProductCartItemViewModel {
  const product = toProductCardViewModel(producto, options);
  return {
    product,
    quantity: carritoItem.cantidad,
    subtotalUSD: Number((calcularPrecioConDescuento(producto) * carritoItem.cantidad).toFixed(2)),
    stockDisponible:
      mockInventarioSedes.find(
        (item) => item.id_producto === producto.id_producto && item.id_sede === carritoItem.id_sede,
      )?.stock_disponible ?? 0,
  };
}

export function toProductAdminInventoryViewModel(
  producto: Producto,
  inventario?: InventarioSede | null,
  sede?: Sede | null,
  options: ProductViewModelOptions = {},
): ProductAdminInventoryViewModel {
  return {
    ...toProductCardViewModel(producto, options),
    id_sede: inventario?.id_sede,
    sede: sede?.nombre_sede,
    stockDisponible: inventario?.stock_disponible,
  };
}

export function toProductRecipeAuditViewModel(
  recipe: Recipe,
  detallePedido: DetallePedido,
  producto: Producto,
  pedido: Pedido,
  options: { imageUrl?: string; status?: ProductRecipeAuditViewModel["status"] } = {},
): ProductRecipeAuditViewModel {
  return {
    id: recipe.id_recipe,
    orderId: `ORD-${pedido.fecha_creacion.slice(0, 4)}-${String(pedido.id_pedido).slice(-3)}`,
    clientName: pedido.nombre_receptor,
    product: producto.nombre_producto,
    activeIngredient: producto.principio_activo,
    concentration: toOptionalString(producto.concentracion) ?? "",
    concentrationUnit: producto.unidad_concentracion ?? "",
    packSize: producto.unidades == null ? "" : String(producto.unidades),
    quantity: detallePedido.cantidad,
    uploadDate: recipe.fecha_carga.replace("T", " ").slice(0, 16),
    imageUrl: options.imageUrl ?? recipe.archivo_recipe,
    status: options.status ?? formatRecipeStatus(recipe.estado_recipe),
  };
}

export function getAppProductViewModels(): ProductCardViewModel[] {
  return mockProductos.map((producto) => toProductCardViewModel(producto));
}

export function getProductCardViewModels(): ProductCardViewModel[] {
  return getAppProductViewModels();
}

export function getFrequentlyBoughtTogetherProductIds() {
  return FREQUENTLY_BOUGHT_TOGETHER;
}

export function getProductRecipeAuditViewModels() {
  return mockDetallePedidos
    .map((detalle) => {
      const producto = mockProductos.find((item) => item.id_producto === detalle.id_producto);
      const sede = mockSedes[0];
      if (!producto) return null;
      return { detalle, producto, sede };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);
}
