import { requestJson } from "./httpClient";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const LOGO_MAX_BYTES = 5 * 1024 * 1024;
const LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function getCustomLogoUrl(): Promise<string | null> {
  const response = await requestJson<ApiEnvelope<{ url: string | null }>>("/branding/logo");
  return response.data.url;
}

export async function uploadCustomLogo(file: File): Promise<string> {
  if (!LOGO_TYPES.has(file.type)) throw new Error("Usa una imagen JPG, PNG, WEBP o AVIF.");
  if (file.size <= 0 || file.size > LOGO_MAX_BYTES) throw new Error("La imagen debe pesar menos de 5 MB.");

  const ticket = await requestJson<ApiEnvelope<{ signedUrl: string; publicUrl: string }>>("/branding/logo/upload-url", {
    method: "POST",
    body: { mimeType: file.type, size: file.size },
  });
  const form = new FormData();
  form.append("cacheControl", "0");
  form.append("", file);
  const upload = await fetch(ticket.data.signedUrl, {
    method: "PUT",
    headers: { "x-upsert": "true" },
    body: form,
  });
  if (!upload.ok) {
    const payload = await upload.json().catch(() => null) as { message?: string; error?: string } | null;
    throw new Error(payload?.message ?? payload?.error ?? "Supabase no pudo guardar el logotipo.");
  }
  return `${ticket.data.publicUrl}?v=${Date.now()}`;
}

export async function restoreOriginalLogo(): Promise<void> {
  await requestJson<ApiEnvelope<unknown>>("/branding/logo", { method: "DELETE" });
}
