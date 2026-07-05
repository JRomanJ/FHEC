import type { Banner } from "../domain";

export const BANNER_IDS = {
  Diabetes: 1,
  Vitaminas: 2,
  Cardiovascular: 3,
} as const;

export const mockBanners: Banner[] = [
  {
    id_banner: BANNER_IDS.Diabetes,
    titulo: "Control de Diabetes",
    subtitulo: "Medicamentos de primera línea con los mejores precios del mercado venezolano.",
    etiqueta: "HASTA 20% OFF",
    texto_accion: "Ver Medicamentos →",
    url_accion: null,
    url_imagen: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=900&h=500&fit=crop&auto=format",
  },
  {
    id_banner: BANNER_IDS.Vitaminas,
    titulo: "Vitaminas & Suplementos",
    subtitulo: "Refuerza tu sistema inmune con los mejores suplementos. Entrega rápida en Ciudad Guayana.",
    etiqueta: "DESTACADOS",
    texto_accion: "Explorar Vitaminas →",
    url_accion: null,
    url_imagen: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=900&h=500&fit=crop&auto=format",
  },
  {
    id_banner: BANNER_IDS.Cardiovascular,
    titulo: "Salud Cardiovascular",
    subtitulo: "Tratamientos completos para cuidar tu corazón. Pedido con o sin récipe médico.",
    etiqueta: "RECOMENDADO",
    texto_accion: "Ver Cardioprotectores →",
    url_accion: null,
    url_imagen: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&h=500&fit=crop&auto=format",
  },
];
