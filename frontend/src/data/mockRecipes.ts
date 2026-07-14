import { EstadoRecipe } from "../domain";
import type { Recipe } from "../domain";
import recipeAna from "../imports/recipe-Ana.jpg";
import recipeJose from "../imports/recipe-Jose.jpg";
import recipeMaria from "../imports/recipe-Maria.jpg";
import { DETALLE_PEDIDO_IDS } from "./mockDetallePedidos";

export const RECIPE_IDS = {
  LosartanPendiente: 7001,
  ClonazepamAprobado: 7002,
  AmoxicilinaRechazado: 7003,
} as const;

export const mockRecipes: Recipe[] = [
  {
    id_recipe: RECIPE_IDS.LosartanPendiente,
    id_detalle_pedido: DETALLE_PEDIDO_IDS.RevisionLosartan,
    archivo_recipe: recipeMaria,
    fecha_carga: "2026-07-05T11:35:00.000Z",
    estado_recipe: EstadoRecipe.Pendiente,
  },
  {
    id_recipe: RECIPE_IDS.ClonazepamAprobado,
    id_detalle_pedido: DETALLE_PEDIDO_IDS.RevisionClonazepam,
    archivo_recipe: recipeJose,
    fecha_carga: "2026-07-05T11:36:00.000Z",
    estado_recipe: EstadoRecipe.Aprobado,
  },
  {
    id_recipe: RECIPE_IDS.AmoxicilinaRechazado,
    id_detalle_pedido: DETALLE_PEDIDO_IDS.ListoAmoxicilina,
    archivo_recipe: recipeAna,
    fecha_carga: "2026-07-05T13:03:00.000Z",
    estado_recipe: EstadoRecipe.Rechazado,
  },
];
