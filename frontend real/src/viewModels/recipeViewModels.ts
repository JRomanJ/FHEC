import {
  getAuditoriaByRecipe,
  mockDetallePedidos,
  mockPedidos,
  mockProductos,
  mockRecipes,
  mockSedes,
  mockUsuarios,
} from "../data";
import { EstadoRecipe } from "../domain";
import type { AuditoriaRecipe, DetallePedido, Pedido, Producto, Recipe } from "../domain";
import recipeAna from "../imports/recipe-Ana.jpg";
import recipeJose from "../imports/recipe-Jose.jpg";
import recipeMaria from "../imports/recipe-Maria.jpg";

export type RecipeVisualStatus = "pending" | "approved" | "rejected";

export interface RecipeStatusViewModel {
  status: RecipeVisualStatus;
  label: string;
}

export interface RecipeOrderContextViewModel {
  orderId: string;
  clientName: string;
  sede: string;
}

export interface RecipeAuditViewModel {
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
  status: RecipeVisualStatus;
}

export interface RecipeDetailModalViewModel extends RecipeAuditViewModel {
  rejectionReasons?: string[];
  rejectionComment?: string;
  sede?: string;
}

const LEGACY_RECIPE_AUDIT: RecipeAuditViewModel[] = [
  {
    id: 1,
    orderId: "ORD-2024-123",
    clientName: "María González",
    product: "Losartán 50mg",
    activeIngredient: "Losartán Potásico",
    concentration: "50",
    concentrationUnit: "mg",
    packSize: "28",
    quantity: 1,
    uploadDate: "2024-06-08 14:32",
    imageUrl: recipeMaria,
    status: "pending",
  },
  {
    id: 2,
    orderId: "ORD-2024-124",
    clientName: "José Ramos",
    product: "Amoxicilina 500mg",
    activeIngredient: "Amoxicilina Trihidrato",
    concentration: "500",
    concentrationUnit: "mg",
    packSize: "21",
    quantity: 2,
    uploadDate: "2024-06-08 14:28",
    imageUrl: recipeJose,
    status: "pending",
  },
  {
    id: 3,
    orderId: "ORD-2024-125",
    clientName: "Ana Torres",
    product: "Clonazepam 0.5mg",
    activeIngredient: "Clonazepam",
    concentration: "0.5",
    concentrationUnit: "mg",
    packSize: "30",
    quantity: 1,
    uploadDate: "2024-06-08 14:15",
    imageUrl: recipeAna,
    status: "pending",
  },
];

function formatOrderId(pedido: Pedido): string {
  return `ORD-${pedido.fecha_creacion.slice(0, 4)}-${String(pedido.id_pedido).slice(-3)}`;
}

function formatDateTime(timestamp: string): string {
  return timestamp.replace("T", " ").slice(0, 16);
}

function getRecipeStatus(status: Recipe["estado_recipe"]): RecipeVisualStatus {
  if (status === EstadoRecipe.Aprobado) return "approved";
  if (status === EstadoRecipe.Rechazado) return "rejected";
  return "pending";
}

function getStatusLabel(status: RecipeVisualStatus): string {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  return "Pendiente";
}

function getDetalle(recipe: Recipe): DetallePedido | null {
  return (
    mockDetallePedidos.find(
      (detalle) => detalle.id_detalle_pedido === recipe.id_detalle_pedido,
    ) ?? null
  );
}

function getPedido(detalle: DetallePedido | null): Pedido | null {
  if (!detalle) return null;
  return mockPedidos.find((pedido) => pedido.id_pedido === detalle.id_pedido) ?? null;
}

function getProducto(detalle: DetallePedido | null): Producto | null {
  if (!detalle) return null;
  return mockProductos.find((producto) => producto.id_producto === detalle.id_producto) ?? null;
}

function getClientName(pedido: Pedido | null): string {
  if (!pedido) return "";
  return (
    mockUsuarios.find((usuario) => usuario.id_usuario === pedido.id_usuario)?.nombre_completo ??
    pedido.nombre_receptor
  );
}

function getSedeName(pedido: Pedido | null): string {
  if (!pedido) return "";
  return mockSedes.find((sede) => sede.id_sede === pedido.id_sede)?.nombre_sede ?? "";
}

function cloneRecipe<T extends RecipeAuditViewModel>(recipe: T): T {
  return { ...recipe };
}

export function toRecipeStatusViewModel(recipe: Recipe): RecipeStatusViewModel {
  const status = getRecipeStatus(recipe.estado_recipe);
  return {
    status,
    label: getStatusLabel(status),
  };
}

export function toRecipeOrderContextViewModel(recipe: Recipe): RecipeOrderContextViewModel {
  const detalle = getDetalle(recipe);
  const pedido = getPedido(detalle);
  return {
    orderId: pedido ? formatOrderId(pedido) : "",
    clientName: getClientName(pedido),
    sede: getSedeName(pedido),
  };
}

export function toRecipeAuditViewModel(recipe: Recipe): RecipeAuditViewModel {
  const detalle = getDetalle(recipe);
  const pedido = getPedido(detalle);
  const producto = getProducto(detalle);
  return {
    id: recipe.id_recipe,
    orderId: pedido ? formatOrderId(pedido) : "",
    clientName: getClientName(pedido),
    product: producto?.nombre_producto ?? "",
    activeIngredient: producto?.principio_activo ?? "",
    concentration: producto?.concentracion == null ? "" : String(producto.concentracion),
    concentrationUnit: producto?.unidad_concentracion ?? "",
    packSize: producto?.unidades == null ? "" : String(producto.unidades),
    quantity: detalle?.cantidad ?? 0,
    uploadDate: formatDateTime(recipe.fecha_carga),
    imageUrl: recipe.archivo_recipe,
    status: getRecipeStatus(recipe.estado_recipe),
  };
}

export function toRecipeDetailModalViewModel(recipe: Recipe): RecipeDetailModalViewModel {
  const base = toRecipeAuditViewModel(recipe);
  const auditoria: AuditoriaRecipe | null = getAuditoriaByRecipe(recipe.id_recipe);
  const detalle = getDetalle(recipe);
  const pedido = getPedido(detalle);
  return {
    ...base,
    rejectionReasons: auditoria?.razones_rechazo
      ? auditoria.razones_rechazo.split(",").map((reason) => reason.trim()).filter(Boolean)
      : undefined,
    rejectionComment: auditoria?.comentario_rechazo ?? undefined,
    sede: getSedeName(pedido),
  };
}

export function getRecipeAuditViewModelsFromData(): RecipeAuditViewModel[] {
  return mockRecipes.map(toRecipeAuditViewModel);
}

export function getPendingRecipeViewModels(): RecipeAuditViewModel[] {
  return getRecipeAuditViewModelsFromData().filter((recipe) => recipe.status === "pending");
}

export function getAuditedRecipeViewModels(): RecipeAuditViewModel[] {
  return getRecipeAuditViewModelsFromData().filter((recipe) => recipe.status !== "pending");
}

export function getLegacyRecipeAuditViewModels(): RecipeAuditViewModel[] {
  return LEGACY_RECIPE_AUDIT.map(cloneRecipe);
}

export function getLegacyPendingRecipeViewModels(): RecipeAuditViewModel[] {
  return getLegacyRecipeAuditViewModels().filter((recipe) => recipe.status === "pending");
}

export function getLegacyAuditedRecipeViewModels(): RecipeAuditViewModel[] {
  return getLegacyRecipeAuditViewModels().filter((recipe) => recipe.status !== "pending");
}
