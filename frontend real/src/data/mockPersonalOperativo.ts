import { EstadoPersonalOperativo, RolPersonalOperativo } from "../domain";
import type { PersonalOperativo } from "../domain";
import { SEDE_IDS } from "./mockSedes";
import { USUARIO_IDS } from "./mockUsuarios";

export const PERSONAL_OPERATIVO_IDS = {
  Repartidor: 1,
  Auxiliar: 2,
  Auditor: 3,
  Superadmin: 4,
} as const;

export const mockPersonalOperativo: PersonalOperativo[] = [
  {
    id_personal_operativo: PERSONAL_OPERATIVO_IDS.Repartidor,
    id_usuario: USUARIO_IDS.Repartidor,
    id_sede: SEDE_IDS.Principal,
    rol: RolPersonalOperativo.Delivery,
    estado_personal: EstadoPersonalOperativo.Habilitado,
  },
  {
    id_personal_operativo: PERSONAL_OPERATIVO_IDS.Auxiliar,
    id_usuario: USUARIO_IDS.Auxiliar,
    id_sede: SEDE_IDS.Principal,
    rol: RolPersonalOperativo.Auxiliar,
    estado_personal: EstadoPersonalOperativo.Habilitado,
  },
  {
    id_personal_operativo: PERSONAL_OPERATIVO_IDS.Auditor,
    id_usuario: USUARIO_IDS.Auditor,
    id_sede: null,
    rol: RolPersonalOperativo.Auditor,
    estado_personal: EstadoPersonalOperativo.Habilitado,
  },
  {
    id_personal_operativo: PERSONAL_OPERATIVO_IDS.Superadmin,
    id_usuario: USUARIO_IDS.Superadmin,
    id_sede: null,
    rol: RolPersonalOperativo.Superadministrador,
    estado_personal: EstadoPersonalOperativo.Habilitado,
  },
];
