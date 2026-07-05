import {
  getAuditoriaByRecipe,
  getProductoById,
  getRecipesByPedido as selectRecipesByPedido,
  mockAuditoriaRecipes,
  mockDetallePedidos,
  mockRecipes,
} from "../data";
import { EstadoRecipe } from "../domain";

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
