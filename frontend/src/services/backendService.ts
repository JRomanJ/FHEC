import { requestJson } from "./httpClient";
import type { Branch, Product } from "../app/types";

interface ApiEnvelope<T> { success: boolean; data: T; message?: string }

const query = (values: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
};

export const getInventory = <T>(sedeId: string, filters: Record<string, string | undefined> = {}) =>
  requestJson<ApiEnvelope<T>>(`/inventory/${encodeURIComponent(sedeId)}${query(filters)}`);

export const findProduct = <T>(criteria: Record<string, string | undefined>) =>
  requestJson<ApiEnvelope<T>>(`/products/search${query(criteria)}`);

export const createInventoryEntry = <T>(producto: object, sedeId: string) =>
  requestJson<ApiEnvelope<T>>("/inventory", { method: "POST", body: { producto, sedeId } });

export const updateInventoryPrice = <T>(productoId: string, sedeId: string, precioUsd: number) =>
  requestJson<ApiEnvelope<T>>("/inventory/price", { method: "PATCH", body: { productoId, sedeId, precioUsd } });

export const getBranchByName = <T>(nombre: string) =>
  requestJson<ApiEnvelope<T>>(`/branches/by-name${query({ nombre })}`);

export const createBranch = <T>(branch: object) =>
  requestJson<ApiEnvelope<T>>("/branches", { method: "POST", body: branch });

export const findUserAuth = <T>(email: string) =>
  requestJson<ApiEnvelope<T>>(`/users/auth${query({ email })}`);

export const findUserByDocument = <T>(tipo: string, documento: string) =>
  requestJson<ApiEnvelope<T>>(`/users/by-document${query({ tipo, documento })}`);

export const createRole = <T>(rol: string) =>
  requestJson<ApiEnvelope<T>>("/roles", { method: "POST", body: { rol } });

export const assignRole = <T>(userId: string, rol: string) =>
  requestJson<ApiEnvelope<T>>(`/users/${encodeURIComponent(userId)}/role`, { method: "PATCH", body: { rol } });

export const seedInventory = <T>(sedeId: string) =>
  requestJson<ApiEnvelope<T>>("/inventory/seed", { method: "POST", body: { sedeId } });

export const getFavorites = <T>() =>
  requestJson<ApiEnvelope<T>>("/favorites");

export const addFavorite = <T>(productId: string) =>
  requestJson<ApiEnvelope<T>>(`/favorites/${encodeURIComponent(productId)}`, { method: "POST" });

export const removeFavorite = <T>(productId: string) =>
  requestJson<ApiEnvelope<T>>(`/favorites/${encodeURIComponent(productId)}`, { method: "DELETE" });

export const clearFavorites = <T>() =>
  requestJson<ApiEnvelope<T>>("/favorites", { method: "DELETE" });

interface InventoryProductRow {
  id_inventario: string; id_producto: string; stock_disponible: number | null; precio_usd: number | null;
  principio_activo: string; marca_comercial: string; id_categoria: string;
  forma_farmaceutica: string; cantidad_presentacion: string | null;
  descripcion: string | null; imagen_producto: string | null; nivel_control: string;
  concentracion?: string | null; relevancia?: number | null;
  codigo_barras?: string | null;
}

const numericId = (uuid: string) => {
  let hash = 0;
  for (let index = 0; index < uuid.length; index += 1) hash = (Math.imul(31, hash) + uuid.charCodeAt(index)) | 0;
  return Math.abs(hash);
};

export async function getCatalogProducts(sedeId: string): Promise<Product[]> {
  const response = await getInventory<InventoryProductRow[]>(sedeId);
  return response.data.map((row) => {
    const control = row.nivel_control?.toLowerCase() ?? "";
    return {
      id: numericId(row.id_producto), backendId: row.id_producto, inventoryId: row.id_inventario,
      barcode: row.codigo_barras ?? undefined,
      name: [row.principio_activo, row.concentracion].filter(Boolean).join(" "),
      brand: row.marca_comercial, category: row.id_categoria,
      presentation: row.forma_farmaceutica, packSize: row.cantidad_presentacion ?? "",
      priceUSD: Number(row.precio_usd ?? 0), stock: Number(row.stock_disponible ?? 0),
      needsRecipe: control.includes("receta") || control.includes("control"),
      controlledSubstance: control.includes("control") || control.includes("físico"),
      rating: Number(row.relevancia ?? 0), reviews: 0,
      bgColor: "#e8f5e9", accentColor: "#179150", imageUrl: row.imagen_producto ?? undefined,
      description: row.descripcion ?? "", activeIngredient: row.principio_activo,
      contraindications: "", posology: "", concentration: row.concentracion ?? undefined, enabled: true,
    };
  });
}

interface BackendBranch {
  id: string;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
}

export async function getAvailableBranches(): Promise<Branch[]> {
  const names = ["Farmacia Pzo", "Farmacia San Felix"];
  const responses = await Promise.all(names.map((name) => getBranchByName<BackendBranch>(name)));
  return responses.map(({ data }) => ({
    id: data.id,
    name: data.nombre,
    address: data.direccion,
    latitude: Number(data.latitud),
    longitude: Number(data.longitud),
    hours: "Horario no disponible",
    mapsUrl: `https://maps.google.com/maps?q=${encodeURIComponent(`${data.latitud},${data.longitud}`)}`,
  }));
}
