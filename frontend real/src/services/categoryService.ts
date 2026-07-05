import { CATS, getCategoriaById as selectCategoriaById, getCategorias as selectCategorias } from "../data";

export function getCategorias() {
  return selectCategorias();
}

export function getCategoriaById(id_categoria: number | null | undefined) {
  return selectCategoriaById(id_categoria);
}

export function getCategoriasParaFiltro() {
  return CATS;
}

export function getCategoriasParaNavbar() {
  return CATS;
}

export function getCategoriasParaFooter() {
  return CATS;
}

export function getCategoriasParaAdmin() {
  return selectCategorias();
}
