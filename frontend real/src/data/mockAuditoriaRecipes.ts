import { ResultadoAuditoriaRecipe } from "../domain";
import type { AuditoriaRecipe } from "../domain";
import { PERSONAL_OPERATIVO_IDS } from "./mockPersonalOperativo";
import { RECIPE_IDS } from "./mockRecipes";

export const mockAuditoriaRecipes: AuditoriaRecipe[] = [
  {
    id_recipe: RECIPE_IDS.ClonazepamAprobado,
    id_personal_operativo: PERSONAL_OPERATIVO_IDS.Auditor,
    resultado_auditoria: ResultadoAuditoriaRecipe.Aprobado,
    razones_rechazo: null,
    comentario_rechazo: null,
    fecha_auditoria: "2026-07-05T11:55:00.000Z",
  },
  {
    id_recipe: RECIPE_IDS.AmoxicilinaRechazado,
    id_personal_operativo: PERSONAL_OPERATIVO_IDS.Auditor,
    resultado_auditoria: ResultadoAuditoriaRecipe.Rechazado,
    razones_rechazo: "Foto borrosa",
    comentario_rechazo: "El sello médico no se distingue con claridad.",
    fecha_auditoria: "2026-07-05T13:20:00.000Z",
  },
];
