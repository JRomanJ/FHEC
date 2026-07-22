import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export const BANNER_IMAGE_BUCKET = 'banner-images';
export const BANNER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const BANNER_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;

const extensionByMimeType: Record<(typeof BANNER_IMAGE_MIME_TYPES)[number], string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
};

const parseMimeType = (value: unknown) => {
    const mimeType = String(value ?? '').trim().toLowerCase();
    if (!BANNER_IMAGE_MIME_TYPES.includes(mimeType as (typeof BANNER_IMAGE_MIME_TYPES)[number])) {
        throw Object.assign(new Error('Formato no permitido. Usa JPG, PNG, WEBP o AVIF.'), { status: 400 });
    }
    return mimeType as (typeof BANNER_IMAGE_MIME_TYPES)[number];
};

const parseFileSize = (value: unknown) => {
    const size = Number(value);
    if (!Number.isInteger(size) || size <= 0) {
        throw Object.assign(new Error('El tamano del archivo no es valido.'), { status: 400 });
    }
    if (size > BANNER_IMAGE_MAX_BYTES) {
        throw Object.assign(new Error('La imagen supera el limite de 5 MB.'), { status: 413 });
    }
    return size;
};

export const crearCargaFirmadaLogo = async (
    adminDb: SupabaseClient,
    input: { mimeType: unknown; size: unknown },
) => {
    const mimeType = parseMimeType(input.mimeType);
    const size = parseFileSize(input.size);
    const path = 'branding/logo';
    const bucket = adminDb.storage.from(BANNER_IMAGE_BUCKET);
    const { data, error } = await bucket.createSignedUploadUrl(path, { upsert: true });
    if (error || !data) throw Object.assign(new Error(`No se pudo autorizar la carga: ${error?.message ?? 'respuesta vacia'}`), { status: 502 });
    const { data: publicData } = bucket.getPublicUrl(path);
    return {
        bucket: BANNER_IMAGE_BUCKET,
        path,
        token: data.token,
        signedUrl: data.signedUrl,
        publicUrl: publicData.publicUrl,
        mimeType,
        size,
        maxBytes: BANNER_IMAGE_MAX_BYTES,
        expiresInSeconds: 2 * 60 * 60,
    };
};

export const obtenerLogoPersonalizado = async (adminDb: SupabaseClient) => {
    const bucket = adminDb.storage.from(BANNER_IMAGE_BUCKET);
    const { data, error } = await bucket.list('branding', { search: 'logo', limit: 10 });
    if (error) throw Object.assign(new Error(`No se pudo consultar el logotipo: ${error.message}`), { status: 502 });
    const logo = data?.find((item) => item.name === 'logo');
    if (!logo) return null;
    const { data: publicData } = bucket.getPublicUrl('branding/logo');
    const version = logo.updated_at ?? logo.created_at ?? logo.id;
    return `${publicData.publicUrl}?v=${encodeURIComponent(String(version ?? '1'))}`;
};

export const eliminarLogoPersonalizado = async (adminDb: SupabaseClient) => {
    const { data, error } = await adminDb.storage.from(BANNER_IMAGE_BUCKET).remove(['branding/logo']);
    if (error) throw Object.assign(new Error(`No se pudo restaurar el logotipo: ${error.message}`), { status: 502 });
    return data ?? [];
};

export const crearCargaFirmadaBanner = async (
    adminDb: SupabaseClient,
    userId: string,
    input: { mimeType: unknown; size: unknown },
) => {
    const mimeType = parseMimeType(input.mimeType);
    const size = parseFileSize(input.size);
    const extension = extensionByMimeType[mimeType];
    const path = `uploads/${userId}/${Date.now()}-${randomUUID()}.${extension}`;
    const bucket = adminDb.storage.from(BANNER_IMAGE_BUCKET);
    const { data, error } = await bucket.createSignedUploadUrl(path, { upsert: false });
    if (error || !data) throw Object.assign(new Error(`No se pudo autorizar la carga: ${error?.message ?? 'respuesta vacia'}`), { status: 502 });
    const { data: publicData } = bucket.getPublicUrl(path);

    return {
        bucket: BANNER_IMAGE_BUCKET,
        path,
        token: data.token,
        signedUrl: data.signedUrl,
        publicUrl: publicData.publicUrl,
        mimeType,
        size,
        maxBytes: BANNER_IMAGE_MAX_BYTES,
        expiresInSeconds: 2 * 60 * 60,
    };
};

export const eliminarImagenBanner = async (adminDb: SupabaseClient, path: string) => {
    const normalized = path.replace(/^\/+/, '');
    if (!/^uploads\/[0-9a-f-]{36}\/[A-Za-z0-9._-]+$/i.test(normalized)) {
        throw Object.assign(new Error('Ruta de imagen no valida.'), { status: 400 });
    }
    const { data, error } = await adminDb.storage.from(BANNER_IMAGE_BUCKET).remove([normalized]);
    if (error) throw Object.assign(new Error(`No se pudo eliminar la imagen: ${error.message}`), { status: 502 });
    return data ?? [];
};

export const bannerPathFromPublicUrl = (url: unknown) => {
    if (typeof url !== 'string') return null;
    const marker = `/storage/v1/object/public/${BANNER_IMAGE_BUCKET}/`;
    try {
        const parsed = new URL(url);
        const configuredOrigin = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : null;
        if (!configuredOrigin || parsed.origin !== configuredOrigin) return null;
        const markerIndex = parsed.pathname.indexOf(marker);
        if (markerIndex < 0) return null;
        const path = decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
        return /^uploads\/[0-9a-f-]{36}\/[A-Za-z0-9._-]+$/i.test(path) ? path : null;
    } catch {
        return null;
    }
};
