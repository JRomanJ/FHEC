import {
  SEDES,
  SEDES_LIST,
  getSedes as selectSedes,
  getSedesHabilitadas as selectSedesHabilitadas,
} from "../data";
import { esSedeHabilitada } from "../domain";

export function getSedes() {
  return selectSedes();
}

export function getSedesHabilitadas() {
  return selectSedesHabilitadas();
}

export function getSedeById(id_sede: number | null | undefined) {
  if (id_sede == null) return null;
  return selectSedes().find((sede) => sede.id_sede === id_sede) ?? null;
}

export function sedeEsSeleccionable(id_sede: number): boolean {
  const sede = getSedeById(id_sede);
  return sede != null && esSedeHabilitada(sede);
}

export function getSedesListLegacy() {
  return SEDES_LIST;
}

export function getSedesLegacy() {
  return SEDES;
}
