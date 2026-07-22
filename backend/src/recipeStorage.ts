import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export const RECIPE_BUCKET = 'recipe-files';
export const RECIPE_MAX_BYTES = 10 * 1024 * 1024;
export const RECIPE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;

const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };

const validate = (mimeValue: unknown, sizeValue: unknown) => {
    const mimeType = String(mimeValue ?? '').toLowerCase();
    const size = Number(sizeValue);
    if (!RECIPE_MIME_TYPES.includes(mimeType as (typeof RECIPE_MIME_TYPES)[number])) throw Object.assign(new Error('Usa JPG, PNG, WEBP o PDF.'), { status: 400 });
    if (!Number.isInteger(size) || size <= 0 || size > RECIPE_MAX_BYTES) throw Object.assign(new Error('El archivo debe pesar entre 1 byte y 10 MB.'), { status: 400 });
    return { mimeType, size };
};

export const crearCargaFirmadaRecipe = async (adminClient: SupabaseClient, userId: string, orderId: string, input: { mimeType: unknown; size: unknown }) => {
    const { mimeType, size } = validate(input.mimeType, input.size);
    const path = `${userId}/${orderId}/${Date.now()}-${randomUUID()}.${extensions[mimeType]}`;
    const bucket = adminClient.storage.from(RECIPE_BUCKET);
    const { data, error } = await bucket.createSignedUploadUrl(path, { upsert: false });
    if (error || !data) throw Object.assign(new Error(`No se pudo autorizar la carga: ${error?.message ?? 'respuesta vacia'}`), { status: 502 });
    return { path, signedUrl: data.signedUrl, token: data.token, mimeType, size, expiresInSeconds: 7200 };
};

export const firmarLecturaRecipe = async (adminClient: SupabaseClient, path: string) => {
    const { data, error } = await adminClient.storage.from(RECIPE_BUCKET).createSignedUrl(path, 15 * 60);
    if (error || !data) return null;
    return data.signedUrl;
};

export const eliminarArchivoRecipe = async (adminClient: SupabaseClient, path: string) => {
    if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[A-Za-z0-9._-]+$/i.test(path)) throw Object.assign(new Error('Ruta de recipe invalida.'), { status: 400 });
    const { error } = await adminClient.storage.from(RECIPE_BUCKET).remove([path]);
    if (error) throw Object.assign(new Error(`No se pudo eliminar el archivo: ${error.message}`), { status: 502 });
};
