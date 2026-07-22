import 'dotenv/config';
import { createAdminClient } from '../db/supabaseClient.js';
import { RECIPE_BUCKET, RECIPE_MAX_BYTES, RECIPE_MIME_TYPES } from '../recipeStorage.js';

const db = createAdminClient();
const { data: existing, error: getError } = await db.storage.getBucket(RECIPE_BUCKET);
if (existing) {
    const compatible = !existing.public && existing.file_size_limit === RECIPE_MAX_BYTES
        && JSON.stringify([...(existing.allowed_mime_types ?? [])].sort()) === JSON.stringify([...RECIPE_MIME_TYPES].sort());
    if (!compatible) throw new Error(`El bucket ${RECIPE_BUCKET} existe con otra configuracion; no se modifico.`);
    console.log(`Bucket privado ${RECIPE_BUCKET} verificado.`);
} else {
    const notFound = getError && (Number((getError as { status?: number }).status) === 404 || String(getError.message).toLowerCase().includes('not found'));
    if (getError && !notFound) throw getError;
    const { error } = await db.storage.createBucket(RECIPE_BUCKET, { public: false, fileSizeLimit: RECIPE_MAX_BYTES, allowedMimeTypes: [...RECIPE_MIME_TYPES] });
    if (error) throw error;
    console.log(`Bucket privado ${RECIPE_BUCKET} creado.`);
}
