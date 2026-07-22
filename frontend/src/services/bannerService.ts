import { DEFAULT_SLIDES, mockBanners } from "../data";
import type { Slide } from "../app/types";
import { requestJson } from "./httpClient";

interface BackendBanner {
  id_banner: number;
  titulo: string;
  subtitulo: string | null;
  etiqueta: string | null;
  texto_accion: string | null;
  url_accion: string | null;
  url_imagen: string;
  color_inicio: string;
  color_medio: string;
  color_fin: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const BANNER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const BANNER_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export interface UploadedBannerImage {
  path: string;
  publicUrl: string;
}

const toSlide = (banner: BackendBanner): Slide => ({
  id: banner.id_banner,
  title: banner.titulo,
  subtitle: banner.subtitulo ?? "",
  badge: banner.etiqueta ?? "",
  cta: banner.texto_accion ?? "",
  ctaLink: banner.url_accion ?? undefined,
  img: banner.url_imagen,
  from: banner.color_inicio,
  via: banner.color_medio,
  to: banner.color_fin,
});

const toPayload = (slide: Slide) => ({
  titulo: slide.title,
  subtitulo: slide.subtitle,
  etiqueta: slide.badge,
  texto_accion: slide.cta,
  url_accion: slide.ctaLink ?? null,
  url_imagen: slide.img,
  color_inicio: slide.from,
  color_medio: slide.via,
  color_fin: slide.to,
});

export async function getRemoteBanners(): Promise<Slide[]> {
  const response = await requestJson<ApiEnvelope<BackendBanner[]>>("/banners");
  return response.data.map(toSlide);
}

export async function createRemoteBanner(slide: Slide): Promise<Slide> {
  const response = await requestJson<ApiEnvelope<{ banner: BackendBanner }>>("/banners", {
    method: "POST",
    body: toPayload(slide),
  });
  return toSlide(response.data.banner);
}

export async function updateRemoteBanner(slide: Slide): Promise<Slide> {
  if (slide.id == null) return createRemoteBanner(slide);
  const response = await requestJson<ApiEnvelope<BackendBanner>>(`/banners/${slide.id}`, {
    method: "PATCH",
    body: toPayload(slide),
  });
  return toSlide(response.data);
}

export async function deleteRemoteBanner(id: number): Promise<void> {
  await requestJson<ApiEnvelope<unknown>>(`/banners/${id}`, { method: "DELETE" });
}

export async function uploadRemoteBannerImage(file: File): Promise<UploadedBannerImage> {
  if (!BANNER_IMAGE_TYPES.has(file.type)) throw new Error("Usa una imagen JPG, PNG, WEBP o AVIF.");
  if (file.size <= 0 || file.size > BANNER_IMAGE_MAX_BYTES) throw new Error("La imagen debe pesar menos de 5 MB.");

  const ticket = await requestJson<ApiEnvelope<{
    signedUrl: string;
    path: string;
    publicUrl: string;
  }>>("/banners/images/upload-url", {
    method: "POST",
    body: { fileName: file.name, mimeType: file.type, size: file.size },
  });

  const form = new FormData();
  form.append("cacheControl", "31536000");
  form.append("", file);
  const response = await fetch(ticket.data.signedUrl, {
    method: "PUT",
    headers: { "x-upsert": "false" },
    body: form,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string; error?: string } | null;
    throw new Error(payload?.message ?? payload?.error ?? "Supabase no pudo guardar la imagen.");
  }
  return { path: ticket.data.path, publicUrl: ticket.data.publicUrl };
}

export async function deleteRemoteBannerImage(path: string): Promise<void> {
  await requestJson<ApiEnvelope<unknown>>("/banners/images/delete", {
    method: "POST",
    body: { path },
  });
}

export function getBanners() {
  return mockBanners;
}

export function getBannerById(id_banner: number | null | undefined) {
  if (id_banner == null) return null;
  return mockBanners.find((banner) => banner.id_banner === id_banner) ?? null;
}

export function getBannersLegacy() {
  return DEFAULT_SLIDES;
}
