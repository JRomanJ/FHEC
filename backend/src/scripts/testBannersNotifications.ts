import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.TEST_API_BASE_URL ?? 'http://127.0.0.1:3101';
const password = process.env.DEMO_ACCOUNT_PASSWORD ?? 'clave123';
const supabaseUrl = process.env.SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

type JsonRecord = Record<string, unknown>;
type Session = { accessToken: string };
type ApiUser = {
    id: string;
    acepta_promociones: boolean;
    acepta_promociones_sms: boolean;
    acepta_promociones_correo: boolean;
    acepta_notificaciones: boolean;
    acepta_notificaciones_sms: boolean;
    acepta_notificaciones_correo: boolean;
};

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(message);
}

const api = async <T>(path: string, init: RequestInit = {}, expectedStatus = 200): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init.headers },
    });
    const payload = await response.json().catch(() => null) as T | { message?: string } | null;
    if (response.status !== expectedStatus) {
        const message = payload && typeof payload === 'object' && 'message' in payload ? payload.message : undefined;
        throw new Error(`${init.method ?? 'GET'} ${path}: esperado ${expectedStatus}, recibido ${response.status}: ${message ?? 'sin detalle'}`);
    }
    return payload as T;
};

const authHeaders = (session: Session) => ({ Authorization: `Bearer ${session.accessToken}` });

const login = async (email: string) => {
    return api<{ data: { user: ApiUser; session: Session } }>('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

const adminDb = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

const testTitle = `E2E CODEX ${new Date().toISOString()}`;
let bannerId: number | null = null;
let clientSession: Session | null = null;
let adminSession: Session | null = null;
let clientUser: ApiUser | null = null;
let uploadedPath: string | null = null;

const originalPreferences: Partial<ApiUser> = {};

try {
    const health = await api<{ data: { status: string } }>('/health');
    assert(health.data.status === 'ok', 'El health check no devolvio ok.');

    const initialBanners = await api<{ data: JsonRecord[] }>('/banners');
    assert(initialBanners.data.length >= 3, 'No se encontraron los banners iniciales.');

    const adminLogin = await login('admin@fhec.com');
    adminSession = adminLogin.data.session;
    const clientLogin = await login('cliente@fhec.com');
    clientSession = clientLogin.data.session;
    clientUser = clientLogin.data.user;

    Object.assign(originalPreferences, {
        acepta_promociones: clientUser.acepta_promociones,
        acepta_promociones_sms: clientUser.acepta_promociones_sms,
        acepta_promociones_correo: clientUser.acepta_promociones_correo,
        acepta_notificaciones: clientUser.acepta_notificaciones,
        acepta_notificaciones_sms: clientUser.acepta_notificaciones_sms,
        acepta_notificaciones_correo: clientUser.acepta_notificaciones_correo,
    });

    const preferencePayload = {
        acepta_promociones: true,
        acepta_promociones_sms: true,
        acepta_promociones_correo: true,
        acepta_notificaciones: true,
        acepta_notificaciones_sms: true,
        acepta_notificaciones_correo: true,
    };
    await api(`/users/${clientUser.id}`, {
        method: 'PATCH',
        headers: authHeaders(clientSession),
        body: JSON.stringify(preferencePayload),
    });

    await api('/banners', {
        method: 'POST',
        headers: authHeaders(clientSession),
        body: JSON.stringify({ titulo: testTitle, url_imagen: 'https://example.com/no-autorizado.png' }),
    }, 403);

    await api('/banners/images/upload-url', {
        method: 'POST',
        headers: authHeaders(clientSession),
        body: JSON.stringify({ fileName: 'no-autorizada.png', mimeType: 'image/png', size: 68 }),
    }, 403);

    await api('/banners/images/upload-url', {
        method: 'POST',
        headers: authHeaders(adminSession),
        body: JSON.stringify({ fileName: 'archivo.svg', mimeType: 'image/svg+xml', size: 100 }),
    }, 400);

    await api('/banners/images/upload-url', {
        method: 'POST',
        headers: authHeaders(adminSession),
        body: JSON.stringify({ fileName: 'grande.png', mimeType: 'image/png', size: (5 * 1024 * 1024) + 1 }),
    }, 413);

    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
    const uploadTicket = await api<{ data: { signedUrl: string; path: string; publicUrl: string } }>('/banners/images/upload-url', {
        method: 'POST',
        headers: authHeaders(adminSession),
        body: JSON.stringify({ fileName: 'e2e.png', mimeType: 'image/png', size: png.byteLength }),
    }, 201);
    uploadedPath = uploadTicket.data.path;
    const uploadForm = new FormData();
    uploadForm.append('cacheControl', '60');
    uploadForm.append('', new Blob([png], { type: 'image/png' }), 'e2e.png');
    const uploadResponse = await fetch(uploadTicket.data.signedUrl, {
        method: 'PUT',
        headers: { 'x-upsert': 'false' },
        body: uploadForm,
    });
    assert(uploadResponse.ok, `La carga firmada fallo con ${uploadResponse.status}.`);
    const publicImage = await fetch(uploadTicket.data.publicUrl);
    assert(publicImage.ok, `La imagen publica no responde: ${publicImage.status}.`);
    assert(publicImage.headers.get('content-type')?.startsWith('image/png'), 'La imagen publica no conserva su tipo MIME.');

    const created = await api<{ data: { banner: { id_banner: number; titulo: string } } }>('/banners', {
        method: 'POST',
        headers: authHeaders(adminSession),
        body: JSON.stringify({
            titulo: testTitle,
            subtitulo: 'Prueba integral reversible de banners y notificaciones.',
            etiqueta: 'E2E',
            texto_accion: 'Ver prueba',
            url_accion: null,
            url_imagen: uploadTicket.data.publicUrl,
            color_inicio: '#031b24',
            color_medio: '#00546a',
            color_fin: '#50e9f8',
        }),
    }, 201);
    bannerId = Number(created.data.banner.id_banner);
    assert(Number.isInteger(bannerId) && bannerId > 0, 'El backend no devolvio un id de banner valido.');

    const updatedTitle = `${testTitle} ACTUALIZADO`;
    const updated = await api<{ data: { titulo: string } }>(`/banners/${bannerId}`, {
        method: 'PATCH',
        headers: authHeaders(adminSession),
        body: JSON.stringify({ titulo: updatedTitle }),
    });
    assert(updated.data.titulo === updatedTitle, 'La actualizacion del banner no persistio.');

    const notifications = await api<{ data: Array<{
        id_notificacion: number;
        id_banner: number;
        titulo: string;
        leida: boolean;
        canales_solicitados: string[];
        canales_enviados: string[];
        estado_envio: Record<string, string>;
    }> }>('/notifications', { headers: authHeaders(clientSession) });
    const notification = notifications.data.find((item) => item.id_banner === bannerId);
    assert(notification, 'No se genero la notificacion del cliente para el banner.');
    assert(notification.titulo === testTitle, 'La notificacion no conserva el titulo original de la promocion.');
    assert(notification.leida === false, 'La notificacion nueva aparecio leida.');
    assert(notification.canales_solicitados.includes('in_app'), 'Falta el canal interno.');
    assert(notification.canales_solicitados.includes('correo'), 'Falta el canal correo aceptado.');
    assert(notification.canales_solicitados.includes('sms'), 'Falta el canal SMS aceptado.');
    assert(notification.canales_enviados.includes('in_app'), 'El canal interno no figura como enviado.');
    assert(notification.estado_envio.in_app === 'enviado', 'El envio interno no quedo auditado.');

    const marked = await api<{ data: { leida: boolean } }>(`/notifications/${notification.id_notificacion}/read`, {
        method: 'PATCH',
        headers: authHeaders(clientSession),
    });
    assert(marked.data.leida === true, 'No se marco la notificacion como leida.');

    await api('/notifications/read-all', {
        method: 'PATCH',
        headers: authHeaders(clientSession),
    });

    await api(`/notifications/${notification.id_notificacion}`, {
        method: 'DELETE',
        headers: authHeaders(clientSession),
    });

    const afterDelete = await api<{ data: Array<{ id_notificacion: number }> }>('/notifications', {
        headers: authHeaders(clientSession),
    });
    assert(!afterDelete.data.some((item) => item.id_notificacion === notification.id_notificacion), 'La notificacion eliminada sigue visible.');

    const { error: cleanupNotificationError } = await adminDb.from('notificaciones').delete().eq('id_banner', bannerId);
    if (cleanupNotificationError) throw cleanupNotificationError;
    await api(`/banners/${bannerId}`, { method: 'DELETE', headers: authHeaders(adminSession) });
    bannerId = null;
    const { data: imageStillExists, error: existsError } = await adminDb.storage.from('banner-images').exists(uploadedPath);
    if (existsError && ![400, 404].includes(Number('status' in existsError ? existsError.status : 0))) throw existsError;
    assert(imageStillExists === false, 'La imagen local no se elimino junto con el banner.');
    uploadedPath = null;

    console.log(JSON.stringify({
        success: true,
        checks: [
            'health',
            'listado publico de banners',
            'login y middleware JWT',
            'persistencia de preferencias',
            'bloqueo 403 para cliente',
            'rechazo de formato y tamano de imagen invalidos',
            'carga firmada y lectura publica de imagen local',
            'creacion y actualizacion de banner',
            'trigger de notificacion y canales',
            'lectura, lectura masiva y eliminacion de notificacion',
        ],
    }, null, 2));
} finally {
    if (bannerId != null) {
        const { error } = await adminDb.from('notificaciones').delete().eq('id_banner', bannerId);
        if (error) console.error(`No se pudieron limpiar notificaciones E2E: ${error.message}`);
    }
    if (bannerId != null && adminSession) {
        await api(`/banners/${bannerId}`, { method: 'DELETE', headers: authHeaders(adminSession) }).catch((error) => {
            console.error(`No se pudo limpiar el banner E2E: ${error instanceof Error ? error.message : String(error)}`);
        });
    }
    if (uploadedPath) {
        const { error } = await adminDb.storage.from('banner-images').remove([uploadedPath]);
        if (error) console.error(`No se pudo limpiar la imagen E2E: ${error.message}`);
    }
    if (clientUser && clientSession) {
        await api(`/users/${clientUser.id}`, {
            method: 'PATCH',
            headers: authHeaders(clientSession),
            body: JSON.stringify(originalPreferences),
        }).catch((error) => {
            console.error(`No se pudieron restaurar preferencias E2E: ${error instanceof Error ? error.message : String(error)}`);
        });
    }
}
