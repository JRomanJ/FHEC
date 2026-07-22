import {
  getAuditoriaByRecipe,
  getProductoById,
  getRecipesByPedido as selectRecipesByPedido,
  mockAuditoriaRecipes,
  mockDetallePedidos,
  mockRecipes,
} from "../data";
import { EstadoRecipe } from "../domain";
import { requestJson } from "./httpClient";
import type { RecipeAuditViewModel } from "../viewModels/recipeViewModels";

interface ApiEnvelope<T> { success: boolean; message?: string; data: T }

export interface RemoteRecipe {
  id_recipe: string;
  id_detalle_pedido: string;
  archivo_path: string;
  archivo_url: string | null;
  nombre_archivo: string;
  mime_type: string;
  tamano_bytes: number;
  estado_recipe: "pendiente" | "aprobado" | "rechazado";
  razones_rechazo: string[] | null;
  comentario_auditoria: string | null;
  fecha_carga: string;
  detalles_pedidos: {
    id_pedido: string;
    id_producto: string;
    cantidad: number;
    pedidos: { id_pedido: string; nombre_receptor: string; fecha_creacion: string };
    productos: { principio_activo: string; marca_comercial: string; concentracion: string | null; cantidad_presentacion: string | null };
  };
}

export async function getRemoteRecipes(): Promise<RemoteRecipe[]> {
  const response = await requestJson<ApiEnvelope<RemoteRecipe[]>>("/recipes");
  return response.data;
}

async function uploadRecipeFile(orderId: string, file: File): Promise<{ path: string }> {
  const ticket = await requestJson<ApiEnvelope<{ signedUrl: string; path: string; mimeType: string; size: number }>>("/recipes/upload-url", {
    method: "POST", body: { orderId, mimeType: file.type, size: file.size },
  });
  const form = new FormData();
  form.append("cacheControl", "3600");
  form.append("", file);
  const uploaded = await fetch(ticket.data.signedUrl, { method: "PUT", headers: { "x-upsert": "false" }, body: form });
  if (!uploaded.ok) throw new Error("Supabase no pudo guardar el recipe.");
  return { path: ticket.data.path };
}

export async function uploadRemoteRecipe(orderId: string, detailId: string, file: File): Promise<RemoteRecipe> {
  const uploaded = await uploadRecipeFile(orderId, file);
  const response = await requestJson<ApiEnvelope<RemoteRecipe>>("/recipes", {
    method: "POST",
    body: { id_detalle_pedido: detailId, archivo_path: uploaded.path, nombre_archivo: file.name, mime_type: file.type, tamano_bytes: file.size },
  });
  return response.data;
}

export async function replaceRemoteRecipe(orderId: string, recipeId: string, file: File): Promise<RemoteRecipe> {
  const uploaded = await uploadRecipeFile(orderId, file);
  const response = await requestJson<ApiEnvelope<RemoteRecipe>>(`/recipes/${encodeURIComponent(recipeId)}/file`, {
    method: "PATCH",
    body: { archivo_path: uploaded.path, nombre_archivo: file.name, mime_type: file.type, tamano_bytes: file.size },
  });
  return response.data;
}

export async function auditRemoteRecipe(recipeId: string, estado: "aprobado" | "rechazado", razones: string[] = [], comentario = ""): Promise<void> {
  await requestJson<ApiEnvelope<unknown>>(`/recipes/${encodeURIComponent(recipeId)}/audit`, { method: "PATCH", body: { estado, razones, comentario } });
}

export async function deleteRemoteRecipe(recipeId: string): Promise<void> {
  await requestJson<ApiEnvelope<unknown>>(`/recipes/${encodeURIComponent(recipeId)}`, { method: "DELETE" });
}

export const toRemoteRecipeAuditViewModel = (recipe: RemoteRecipe): RecipeAuditViewModel => {
  const detail = recipe.detalles_pedidos;
  const product = detail.productos;
  return {
    id: recipe.id_recipe,
    orderId: `ORD-${detail.pedidos.fecha_creacion.slice(0, 4)}-${detail.id_pedido.slice(0, 8).toUpperCase()}`,
    clientName: detail.pedidos.nombre_receptor,
    product: [product.principio_activo, product.concentracion].filter(Boolean).join(" "),
    activeIngredient: product.principio_activo,
    concentration: product.concentracion ?? "",
    concentrationUnit: "",
    packSize: product.cantidad_presentacion ?? "",
    quantity: detail.cantidad,
    uploadDate: new Date(recipe.fecha_carga).toLocaleString("es-VE"),
    imageUrl: recipe.archivo_url ?? "",
    status: recipe.estado_recipe === "aprobado" ? "approved" : recipe.estado_recipe === "rechazado" ? "rejected" : "pending",
  };
};

export async function getRemoteRecipeAuditViewModels(): Promise<RecipeAuditViewModel[]> {
  return (await getRemoteRecipes()).map(toRemoteRecipeAuditViewModel);
}

export {
  getAuditedRecipeViewModels,
  getLegacyAuditedRecipeViewModels,
  getLegacyPendingRecipeViewModels,
  getLegacyRecipeAuditViewModels,
  getPendingRecipeViewModels,
  getRecipeAuditViewModelsFromData,
  toRecipeAuditViewModel,
  toRecipeDetailModalViewModel,
  toRecipeOrderContextViewModel,
  toRecipeStatusViewModel,
} from "../viewModels/recipeViewModels";

export function getRecipes() {
  return mockRecipes;
}

export function getRecipeById(id_recipe: number | null | undefined) {
  if (id_recipe == null) return null;
  return mockRecipes.find((recipe) => recipe.id_recipe === id_recipe) ?? null;
}

export function getRecipesByPedido(id_pedido: number) {
  return selectRecipesByPedido(id_pedido);
}

export function getRecipesByDetallePedido(id_detalle_pedido: number) {
  return mockRecipes.filter((recipe) => recipe.id_detalle_pedido === id_detalle_pedido);
}

export function getRecipesPendientes() {
  return mockRecipes.filter((recipe) => recipe.estado_recipe === EstadoRecipe.Pendiente);
}

export function getRecipesAuditados() {
  const auditedIds = new Set(mockAuditoriaRecipes.map((auditoria) => auditoria.id_recipe));
  return mockRecipes.filter((recipe) => auditedIds.has(recipe.id_recipe));
}

export function getRecipeAuditViewModels() {
  return mockRecipes.map((recipe) => {
    const detalle = mockDetallePedidos.find(
      (item) => item.id_detalle_pedido === recipe.id_detalle_pedido,
    );
    const producto = detalle ? getProductoById(detalle.id_producto) : null;
    const auditoria = getAuditoriaByRecipe(recipe.id_recipe);
    return { recipe, detalle: detalle ?? null, producto, auditoria };
  });
}
