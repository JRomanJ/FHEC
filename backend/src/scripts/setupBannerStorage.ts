import 'dotenv/config';
import { createAdminClient } from '../db/supabaseClient.js';
import { BANNER_IMAGE_BUCKET, BANNER_IMAGE_MAX_BYTES, BANNER_IMAGE_MIME_TYPES } from '../bannerStorage.js';

const db = createAdminClient();
const { data: existing, error: getError } = await db.storage.getBucket(BANNER_IMAGE_BUCKET);

if (existing) {
    const allowed = [...(existing.allowed_mime_types ?? [])].sort();
    const expected = [...BANNER_IMAGE_MIME_TYPES].sort();
    const compatible = existing.public
        && existing.file_size_limit === BANNER_IMAGE_MAX_BYTES
        && JSON.stringify(allowed) === JSON.stringify(expected);
    if (!compatible) {
        throw new Error(`El bucket ${BANNER_IMAGE_BUCKET} ya existe con otra configuracion; no se modifico.`);
    }
    console.log(`Bucket ${BANNER_IMAGE_BUCKET} ya existe y su configuracion es correcta.`);
} else {
    const storageError = getError as { status?: number; message?: string } | null;
    const notFound = storageError && (Number(storageError.status) === 404 || String(storageError.message ?? '').toLowerCase().includes('not found'));
    if (getError && !notFound) throw getError;
    const { error } = await db.storage.createBucket(BANNER_IMAGE_BUCKET, {
        public: true,
        fileSizeLimit: BANNER_IMAGE_MAX_BYTES,
        allowedMimeTypes: [...BANNER_IMAGE_MIME_TYPES],
    });
    if (error) throw error;
    console.log(`Bucket ${BANNER_IMAGE_BUCKET} creado correctamente.`);
}
