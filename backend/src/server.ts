import { randomUUID } from 'node:crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { loginUser, refreshUserSession, registerUser, revokeUserSession, sessionPayload } from './authService.js';
import { findUserAuth, findUserByCedula, getAuthEmailsByIds, updateOtherUserAuthEmail, updateUserAuthEmail, updateUserProfile, getStaffMembers } from './db/usuarios.js';
import { processInventoryEntry, getProducosWithFilters } from './db/inventario.js';
import { updateBranchPrice, getBranchByName, createBranch } from './db/sedes.js';
import { findProduct } from './db/productos.js';
import { insertRole, assingnRole } from './db/roles.js';
import { cargarTodoEnSede } from './db/cargarProductosdePrueba.js';
import { createAdminClient, createAuthedClient, createPublicClient } from './db/supabaseClient.js';
import {
    agregarProductoCarrito,
    disminuirProductoCarrito,
    eliminarProductoCarrito,
    establecerCantidadProductoCarrito,
    obtenerCarrito,
    vaciarCarrito,
} from './db/carritos.js';
import { agregarFavorito, listarFavoritos, quitarFavorito, vaciarFavoritos } from './db/favoritos.js';
import { actualizarBanner, eliminarBanner, insertarBanner, listarBanners, obtenerBanner, type BannerInput } from './db/banners.js';
import { eliminarNotificacion, listarNotificacionesUsuario, marcarNotificacionLeida, marcarTodasLeidas } from './db/notificaciones.js';
import { enviarNotificacionesBanner } from './notificationDelivery.js';
import { bannerPathFromPublicUrl, crearCargaFirmadaBanner, crearCargaFirmadaLogo, eliminarImagenBanner, eliminarLogoPersonalizado, obtenerLogoPersonalizado } from './bannerStorage.js';
import { confirmarPagoPedido, crearPedido, expirarPedidos, listarPedidos, obtenerPedido } from './db/pedidos.js';
import { actualizarTransaccion, anularTransaccion, listarTransacciones, obtenerTransaccion } from './db/transacciones.js';
import { actualizarArchivoRecipe, auditarRecipe, crearRecipe, eliminarRecipe, listarRecipes } from './db/recipes.js';
import { crearCargaFirmadaRecipe, eliminarArchivoRecipe } from './recipeStorage.js';
import { actualizarCupon, eliminarCupon, insertarCupon, listarCupones, listarCuponesUsuario, obtenerCuponPorCodigo, type CuponInput } from './db/cupones.js';

type AppRole = 'cliente' | 'repartidor' | 'auxiliar' | 'auditor' | 'superadmin';
type Profile = Record<string, unknown> & { rol?: string | null };

type AuthenticatedRequest = Request & {
    auth?: {
        accessToken: string;
        user: User;
        userId: string;
        role: AppRole;
        profile: Profile;
        db: SupabaseClient;
    };
};

type HttpError = Error & { status?: number; code?: string; type?: string };

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SUPERADMIN = new Set<AppRole>(['superadmin']);
const RECIPE_AUDITORS = new Set<AppRole>(['auditor', 'superadmin']);
const INVENTORY_EDITORS = new Set<AppRole>(['auxiliar', 'superadmin']);
const VALID_ROLES = new Set(['cliente', 'repartidor', 'auxiliar', 'auditor', 'superadmin', 'super_admin']);
const PROFILE_COLUMNS = 'id, nombre_completo, rol, tipo_documento_identidad, documento_identidad, telefono, codigo_area, direccion_fiscal, acepta_promociones, acepta_promociones_sms, acepta_promociones_correo, acepta_notificaciones, acepta_notificaciones_sms, acepta_notificaciones_correo';

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeRole = (role: unknown): AppRole => {
    const value = String(role ?? 'cliente').trim().toLowerCase();
    if (value === 'super_admin' || value === 'admin' || value === 'superadmin') return 'superadmin';
    if (value === 'repartidor' || value === 'auxiliar' || value === 'auditor') return value;
    return 'cliente';
};

const databaseRole = (role: string) => role === 'superadmin' ? 'super_admin' : role;

app.use(cors({
  origin: [
    'https://fhec-frontend.onrender.com', // El sitio en producción
    'http://localhost:5173',              // Puerto común de Vite 
    'http://localhost:3000'               // Por si el frontend corre aquí
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

const requireFields = (body: Record<string, unknown> | undefined, fields: string[]) => {
    const source = body ?? {};
    const missing = fields.filter((field) => source[field] === undefined || source[field] === null || source[field] === '');
    if (missing.length) throw Object.assign(new Error(`Campos obligatorios: ${missing.join(', ')}`), { status: 400 });
};

const validateUuid = (value: unknown, field: string) => {
    const resolved = typeof value === 'string' ? value : '';
    if (!UUID_PATTERN.test(resolved)) throw Object.assign(new Error(`${field} debe ser un UUID valido.`), { status: 400 });
    return resolved;
};

const parseInteger = (value: unknown, field: string, defaultValue?: number) => {
    const resolved = value ?? defaultValue;
    const parsed = typeof resolved === 'number' ? resolved : Number(resolved);
    if (!Number.isInteger(parsed)) throw Object.assign(new Error(`${field} debe ser un numero entero.`), { status: 400 });
    return parsed;
};

const parsePositiveId = (value: unknown, field: string) => {
    const parsed = parseInteger(value, field);
    if (parsed <= 0) throw Object.assign(new Error(`${field} debe ser mayor que cero.`), { status: 400 });
    return parsed;
};

const bannerPayload = (body: Record<string, unknown>, partial = false): Partial<BannerInput> => {
    const mapping: Array<[keyof BannerInput, string]> = [
        ['titulo', 'titulo'],
        ['subtitulo', 'subtitulo'],
        ['etiqueta', 'etiqueta'],
        ['texto_accion', 'texto_accion'],
        ['url_accion', 'url_accion'],
        ['url_imagen', 'url_imagen'],
        ['color_inicio', 'color_inicio'],
        ['color_medio', 'color_medio'],
        ['color_fin', 'color_fin'],
    ];
    const nullableFields = new Set<keyof BannerInput>(['subtitulo', 'etiqueta', 'texto_accion', 'url_accion']);
    const payload: Record<string, string | null> = {};
    for (const [field, inputField] of mapping) {
        const value = body[inputField];
        if (value === undefined) continue;
        if (value === null) {
            if (!nullableFields.has(field)) throw Object.assign(new Error(`${inputField} no puede ser nulo.`), { status: 400 });
            payload[field] = null;
        } else {
            payload[field] = String(value).trim();
        }
    }
    if (!partial) {
        requireFields(body, ['titulo', 'url_imagen']);
        if (!payload.titulo || !payload.url_imagen) throw Object.assign(new Error('Titulo e imagen son obligatorios.'), { status: 400 });
    }
    if (Object.keys(payload).length === 0) throw Object.assign(new Error('No se enviaron campos editables.'), { status: 400 });
    return payload as Partial<BannerInput>;
};

const couponPayload = (body: Record<string, unknown>, partial = false): Partial<CuponInput> => {
    if (!partial) requireFields(body, ['code', 'discount', 'startDate', 'endDate']);
    const payload: Partial<CuponInput> = {};

    if (body.code !== undefined) {
        const code = String(body.code).trim().toUpperCase();
        if (!/^[A-Z0-9_-]{3,50}$/.test(code)) {
            throw Object.assign(new Error('El codigo debe tener entre 3 y 50 caracteres alfanumericos.'), { status: 400 });
        }
        payload.codigo_cupon = code;
    }
    if (body.discount !== undefined) {
        const discount = Number(body.discount);
        if (!Number.isFinite(discount) || discount <= 0 || discount > 100) {
            throw Object.assign(new Error('El descuento debe estar entre 1 y 100.'), { status: 400 });
        }
        payload.descuento_porcentaje = discount;
    }
    const readDate = (value: unknown, field: string) => {
        const date = String(value ?? '').trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
            throw Object.assign(new Error(`${field} debe ser una fecha valida.`), { status: 400 });
        }
        return date;
    };
    if (body.startDate !== undefined) payload.fecha_inicio = readDate(body.startDate, 'startDate');
    if (body.endDate !== undefined) payload.fecha_vencimiento = readDate(body.endDate, 'endDate');
    if (payload.fecha_inicio && payload.fecha_vencimiento && payload.fecha_vencimiento < payload.fecha_inicio) {
        throw Object.assign(new Error('La fecha de vencimiento no puede ser anterior a la fecha de inicio.'), { status: 400 });
    }
    if (Object.keys(payload).length === 0 && body.userEmail === undefined) {
        throw Object.assign(new Error('No se enviaron campos editables.'), { status: 400 });
    }
    return payload;
};

const couponRowsWithEmails = async (rows: Array<Record<string, unknown>>, req: AuthenticatedRequest) => {
    const assignedIds = rows.map((row) => String(row.id_usuario ?? '')).filter(Boolean);
    const emails = req.auth!.role === 'superadmin'
        ? await getAuthEmailsByIds(assignedIds)
        : new Map(req.auth!.user.email ? [[req.auth!.userId, req.auth!.user.email]] : []);
    return rows.map((row) => {
        const usages = Array.isArray(row.cupones_usuario)
            ? row.cupones_usuario as Array<Record<string, unknown>>
            : [];
        const usageUserId = req.auth!.role === 'superadmin' ? row.id_usuario : req.auth!.userId;
        const usage = usages.find((item) => item.id_usuario === usageUserId);
        const { cupones_usuario: _usages, ...coupon } = row;
        return {
            ...coupon,
            correo_usuario: row.id_usuario ? emails.get(String(row.id_usuario)) ?? null : null,
            asignado_en: usage?.asignado_en ?? null,
            usado_en: usage?.usado_en ?? null,
            id_pedido_uso: usage?.id_pedido_uso ?? null,
        };
    });
};

const couponUserRowsToCoupons = (rows: Array<Record<string, unknown>>) => rows.flatMap((row) => {
    const related = Array.isArray(row.cupones) ? row.cupones[0] : row.cupones;
    if (!related || typeof related !== 'object') return [];
    return [{
        ...(related as Record<string, unknown>),
        cupones_usuario: [{
            id_usuario: row.id_usuario,
            asignado_en: row.asignado_en,
            usado_en: row.usado_en,
            id_pedido_uso: row.id_pedido_uso,
        }],
    }];
});

const asyncRoute = (handler: (req: AuthenticatedRequest, res: Response) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) => void handler(req as AuthenticatedRequest, res).catch(next);

const getAuthedDb = (req: AuthenticatedRequest) => {
    if (!req.auth) throw Object.assign(new Error('Debes iniciar sesion.'), { status: 401 });
    return req.auth.db;
};

const loadProfile = async (db: SupabaseClient, user: User): Promise<Profile> => {
    const { data, error } = await db.from('usuarios').select(PROFILE_COLUMNS).eq('id', user.id).maybeSingle();
    if (error) throw error;
    if (data) return data as Profile;

    return {
        id: user.id,
        nombre_completo: user.user_metadata?.nombre_completo ?? '',
        rol: user.user_metadata?.rol ?? 'cliente',
        tipo_documento_identidad: user.user_metadata?.tipo_documento_identidad ?? '',
        documento_identidad: user.user_metadata?.documento_identidad ?? '',
        telefono: user.user_metadata?.telefono ?? '',
        codigo_area: user.user_metadata?.codigo_area ?? '',
        direccion_fiscal: user.user_metadata?.direccion_fiscal ?? '',
    };
};

const serializeUser = (user: User, profile: Profile) => ({
    id: user.id,
    name: String(profile.nombre_completo ?? user.user_metadata?.nombre_completo ?? ''),
    email: String(user.email ?? ''),
    role: normalizeRole(profile.rol ?? user.user_metadata?.rol),
    documentType: String(profile.tipo_documento_identidad ?? ''),
    document: String(profile.documento_identidad ?? ''),
    phone: String(profile.telefono ?? ''),
    areaCode: String(profile.codigo_area ?? ''),
    address: String(profile.direccion_fiscal ?? ''),
    acepta_promociones: Boolean(profile.acepta_promociones),
    acepta_promociones_sms: Boolean(profile.acepta_promociones_sms),
    acepta_promociones_correo: Boolean(profile.acepta_promociones_correo),
    acepta_notificaciones: Boolean(profile.acepta_notificaciones),
    acepta_notificaciones_sms: Boolean(profile.acepta_notificaciones_sms),
    acepta_notificaciones_correo: Boolean(profile.acepta_notificaciones_correo),
});

app.disable('x-powered-by');
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

app.use((req, res, next) => {
    const incoming = req.header('x-request-id');
    const requestId = incoming && /^[A-Za-z0-9._:-]{1,80}$/.test(incoming) ? incoming : randomUUID();
    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
    next();
});

const configuredOrigins = (process.env.CORS_ORIGINS ?? 'https://fhec-frontend.onrender.com,http://localhost:5173,http://127.0.0.1:5173')
    .split(',').map((origin) => origin.trim()).filter(Boolean);
const allowEveryOrigin = configuredOrigins.includes('*');
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowEveryOrigin || configuredOrigins.includes(origin)) return callback(null, true);
        return callback(Object.assign(new Error('Origen no permitido por CORS.'), { status: 403 }));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Authorization', 'Content-Type', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 600,
}));

type RateEntry = { count: number; resetAt: number };
const createRateLimiter = (windowMs: number, maxRequests: number) => {
    const entries = new Map<string, RateEntry>();
    return (req: Request, res: Response, next: NextFunction) => {
        const now = Date.now();
        const key = req.ip || req.socket.remoteAddress || 'unknown';
        const current = entries.get(key);
        const entry = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
        entry.count += 1;
        entries.set(key, entry);
        res.setHeader('RateLimit-Limit', String(maxRequests));
        res.setHeader('RateLimit-Remaining', String(Math.max(0, maxRequests - entry.count)));
        res.setHeader('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));
        if (entry.count > maxRequests) {
            res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
            res.status(429).json({ success: false, message: 'Demasiadas solicitudes. Intenta nuevamente mas tarde.' });
            return;
        }
        if (entries.size > 5_000) {
            for (const [storedKey, stored] of entries) if (stored.resetAt <= now) entries.delete(storedKey);
        }
        next();
    };
};

app.use(createRateLimiter(
    parsePositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60_000),
    parsePositiveInteger(process.env.RATE_LIMIT_MAX, 300),
));
const authRateLimiter = createRateLimiter(
    parsePositiveInteger(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60_000),
    parsePositiveInteger(process.env.AUTH_RATE_LIMIT_MAX, 20),
);

app.use(express.json({ limit: process.env.JSON_LIMIT ?? '256kb' }));

const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authorization = req.header('authorization') ?? '';
        const match = authorization.match(/^Bearer\s+(.+)$/i);
        if (!match?.[1]) {
            res.status(401).json({ success: false, message: 'Debes iniciar sesion.' });
            return;
        }

        const accessToken = match[1];
        const db = createAuthedClient(accessToken);
        const { data, error } = await db.auth.getUser(accessToken);
        if (error || !data.user) throw Object.assign(new Error('Sesion invalida.'), { status: 401 });
        const profile = await loadProfile(db, data.user);
        req.auth = {
            accessToken,
            user: data.user,
            userId: data.user.id,
            role: normalizeRole(profile.rol ?? data.user.user_metadata?.rol),
            profile,
            db,
        };
        next();
    } catch {
        res.status(401).json({ success: false, message: 'La sesion expiro o no es valida.' });
    }
};

const authorize = (allowedRoles: Set<AppRole>) =>
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.auth || !allowedRoles.has(req.auth.role)) {
            res.status(403).json({ success: false, message: 'No tienes permiso para realizar esta operacion.' });
            return;
        }
        next();
    };

app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

app.get('/banners', asyncRoute(async (_req, res) => {
    res.json({ success: true, data: await listarBanners(createPublicClient()) });
}));

app.get('/branding/logo', asyncRoute(async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, data: { url: await obtenerLogoPersonalizado(createAdminClient()) } });
}));

app.post('/log', authRateLimiter, asyncRoute(async (req, res) => {
    requireFields(req.body, ['email', 'password', 'nombre_completo', 'tipo_documento_identidad', 'documento_identidad', 'acepta_terminos']);
    if (req.body.acepta_terminos !== true) throw Object.assign(new Error('Debes aceptar los terminos.'), { status: 400 });
    const data = await registerUser(req.body);
    res.status(201).json({
        success: true,
        message: data.emailConfirmationRequired
            ? 'Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesion.'
            : 'Cuenta creada correctamente.',
        data,
    });
}));

app.post('/login', authRateLimiter, asyncRoute(async (req, res) => {
    requireFields(req.body, ['email', 'password']);
    const { user, session } = await loginUser(String(req.body.email), String(req.body.password));
    const profile = await loadProfile(createAuthedClient(session.access_token), user);
    res.setHeader('Cache-Control', 'no-store');
    res.json({
        success: true,
        message: 'Inicio de sesion exitoso.',
        data: { user: serializeUser(user, profile), session: sessionPayload(session) },
    });
}));

app.get('/auth/me', authenticate, asyncRoute(async (req, res) => {
    const auth = req.auth!;
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, data: { user: serializeUser(auth.user, auth.profile) } });
}));

app.post('/auth/refresh', authRateLimiter, asyncRoute(async (req, res) => {
    requireFields(req.body, ['refreshToken']);
    const refreshed = await refreshUserSession(String(req.body.refreshToken));
    const profile = await loadProfile(createAuthedClient(refreshed.session.access_token), refreshed.user);
    res.setHeader('Cache-Control', 'no-store');
    res.json({
        success: true,
        message: 'Sesion renovada.',
        data: { user: serializeUser(refreshed.user, profile), session: refreshed.payload },
    });
}));

app.post('/logout', authenticate, asyncRoute(async (req, res) => {
    requireFields(req.body, ['refreshToken']);
    await revokeUserSession(req.auth!.accessToken, String(req.body.refreshToken));
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, message: 'Sesion cerrada.' });
}));

app.patch('/users/:userId', authenticate, asyncRoute(async (req, res) => {
    const userId = validateUuid(req.params.userId, 'userId');
    if (req.auth!.userId !== userId && req.auth!.role !== 'superadmin') {
        res.status(403).json({ success: false, message: 'No tienes permiso para modificar este perfil.' });
        return;
    }

    const updatePayload = { ...req.body } as Record<string, unknown>;
    const requestedEmail = typeof updatePayload.email === 'string'
        ? updatePayload.email.trim().toLowerCase()
        : undefined;
    if (requestedEmail) {
        if (req.auth!.userId === userId) await updateUserAuthEmail(getAuthedDb(req), requestedEmail);
        else await updateOtherUserAuthEmail(userId, requestedEmail);
        delete updatePayload.email;
    }
    let profile: Profile;
    if (Object.keys(updatePayload).length > 0) {
        profile = await updateUserProfile(getAuthedDb(req), userId, updatePayload);
    } else if (req.auth!.userId === userId) {
        profile = req.auth!.profile;
    } else {
        const { data, error } = await getAuthedDb(req).from('usuarios').select(PROFILE_COLUMNS).eq('id', userId).single();
        if (error) throw error;
        profile = data as Profile;
    }
    const authUser = req.auth!.user;
    const serialized = serializeUser({ ...authUser, email: requestedEmail ?? authUser.email } as User, profile);
    res.json({ success: true, message: 'Perfil actualizado correctamente.', data: serialized });
}));

app.get('/inventory/:sedeId', asyncRoute(async (req, res) => {
    const sedeId = validateUuid(req.params.sedeId, 'sedeId');
    const data = await getProducosWithFilters(sedeId, {
        principio_activo: req.query.principio_activo,
        marca_comercial: req.query.marca_comercial,
        categoria: req.query.categoria,
    });
    res.json({ success: true, data });
}));

app.get('/products/search', authenticate, asyncRoute(async (req, res) => {
    const criteria: { principio_activo?: string; marca_comercial?: string; forma_farmaceutica?: string } = {};
    if (typeof req.query.principio_activo === 'string') criteria.principio_activo = req.query.principio_activo;
    if (typeof req.query.marca_comercial === 'string') criteria.marca_comercial = req.query.marca_comercial;
    if (typeof req.query.forma_farmaceutica === 'string') criteria.forma_farmaceutica = req.query.forma_farmaceutica;
    res.json({ success: true, data: await findProduct(getAuthedDb(req), criteria) });
}));

app.get('/cart', authenticate, asyncRoute(async (req, res) => {
    res.json({ success: true, data: await obtenerCarrito(getAuthedDb(req)) });
}));

app.post('/cart/items', authenticate, asyncRoute(async (req, res) => {
    requireFields(req.body, ['idInventario']);
    const inventoryId = validateUuid(req.body.idInventario, 'idInventario');
    const data = await agregarProductoCarrito(getAuthedDb(req), inventoryId, parseInteger(req.body.cantidad, 'cantidad', 1));
    res.status(201).json({ success: true, data });
}));

app.put('/cart/items/:idInventario', authenticate, asyncRoute(async (req, res) => {
    requireFields(req.body, ['cantidad']);
    const inventoryId = validateUuid(req.params.idInventario, 'idInventario');
    const cantidad = parseInteger(req.body.cantidad, 'cantidad');
    await establecerCantidadProductoCarrito(getAuthedDb(req), inventoryId, cantidad);
    res.json({ success: true, data: { cantidad } });
}));

app.patch('/cart/items/:idInventario/decrement', authenticate, asyncRoute(async (req, res) => {
    const inventoryId = validateUuid(req.params.idInventario, 'idInventario');
    const cantidad = await disminuirProductoCarrito(getAuthedDb(req), inventoryId, parseInteger(req.body?.cantidad, 'cantidad', 1));
    res.json({ success: true, data: { cantidad } });
}));

app.delete('/cart/items/:idInventario', authenticate, asyncRoute(async (req, res) => {
    const inventoryId = validateUuid(req.params.idInventario, 'idInventario');
    const eliminado = await eliminarProductoCarrito(getAuthedDb(req), inventoryId);
    res.json({ success: true, data: { eliminado } });
}));

app.delete('/cart', authenticate, asyncRoute(async (req, res) => {
    res.json({ success: true, data: { productosEliminados: await vaciarCarrito(getAuthedDb(req)) } });
}));

app.get('/favorites', authenticate, asyncRoute(async (req, res) => {
    res.json({ success: true, data: await listarFavoritos(getAuthedDb(req)) });
}));

app.post('/favorites/:productId', authenticate, asyncRoute(async (req, res) => {
    const productId = validateUuid(req.params.productId, 'productId');
    const agregado = await agregarFavorito(getAuthedDb(req), productId);
    res.status(201).json({ success: true, data: { agregado, idProducto: productId } });
}));

app.delete('/favorites/:productId', authenticate, asyncRoute(async (req, res) => {
    const productId = validateUuid(req.params.productId, 'productId');
    const eliminado = await quitarFavorito(getAuthedDb(req), productId);
    res.json({ success: true, data: { eliminado, idProducto: productId } });
}));

app.delete('/favorites', authenticate, asyncRoute(async (req, res) => {
    res.json({ success: true, data: { productosEliminados: await vaciarFavoritos(getAuthedDb(req)) } });
}));

app.post('/orders', authenticate, asyncRoute(async (req, res) => {
    requireFields(req.body, ['pedido', 'items']);
    if (!Array.isArray(req.body.items)) throw Object.assign(new Error('items debe ser una lista.'), { status: 400 });
    await expirarPedidos(createAdminClient());
    const ttlMinutes = parsePositiveInteger(process.env.ORDER_PAYMENT_TTL_MINUTES, 15);
    const data = await crearPedido(getAuthedDb(req), { pedido: req.body.pedido, items: req.body.items, ttlMinutes });
    res.status(201).json({ success: true, message: 'Pedido creado y stock reservado.', data });
}));

app.get('/orders', authenticate, asyncRoute(async (req, res) => {
    await expirarPedidos(createAdminClient());
    const userId = req.auth!.role === 'cliente' ? req.auth!.userId : undefined;
    res.json({ success: true, data: await listarPedidos(getAuthedDb(req), userId) });
}));

app.get('/orders/:orderId', authenticate, asyncRoute(async (req, res) => {
    const orderId = validateUuid(req.params.orderId, 'orderId');
    await expirarPedidos(createAdminClient());
    const order = await obtenerPedido(getAuthedDb(req), orderId);
    if (!order) throw Object.assign(new Error('Pedido no encontrado.'), { status: 404 });
    res.json({ success: true, data: order });
}));

app.post('/orders/:orderId/transactions', authenticate, asyncRoute(async (req, res) => {
    const orderId = validateUuid(req.params.orderId, 'orderId');
    await expirarPedidos(createAdminClient());
    const data = await confirmarPagoPedido(getAuthedDb(req), orderId, req.body ?? {});
    res.status(201).json({ success: true, message: 'Transaccion confirmada y pedido completado.', data });
}));

app.get('/transactions', authenticate, asyncRoute(async (req, res) => {
    const userId = req.auth!.role === 'cliente' ? req.auth!.userId : undefined;
    res.json({ success: true, data: await listarTransacciones(getAuthedDb(req), userId) });
}));

app.get('/transactions/:transactionId', authenticate, asyncRoute(async (req, res) => {
    const transactionId = validateUuid(req.params.transactionId, 'transactionId');
    const transaction = await obtenerTransaccion(getAuthedDb(req), transactionId);
    if (!transaction) throw Object.assign(new Error('Transaccion no encontrada.'), { status: 404 });
    res.json({ success: true, data: transaction });
}));

app.patch('/transactions/:transactionId', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    const transactionId = validateUuid(req.params.transactionId, 'transactionId');
    const transaction = await actualizarTransaccion(createAdminClient(), transactionId, req.body ?? {});
    if (!transaction) throw Object.assign(new Error('Transaccion no encontrada.'), { status: 404 });
    res.json({ success: true, message: 'Transaccion actualizada.', data: transaction });
}));

app.delete('/transactions/:transactionId', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    const transactionId = validateUuid(req.params.transactionId, 'transactionId');
    requireFields(req.body, ['motivo']);
    const transaction = await anularTransaccion(createAdminClient(), transactionId, req.auth!.userId, String(req.body.motivo));
    if (!transaction) throw Object.assign(new Error('Transaccion no encontrada o ya anulada.'), { status: 404 });
    res.json({ success: true, message: 'Transaccion anulada sin destruir el historial.', data: transaction });
}));

app.get('/recipes', authenticate, asyncRoute(async (req, res) => {
    res.json({ success: true, data: await listarRecipes(getAuthedDb(req), createAdminClient()) });
}));

app.post('/recipes/upload-url', authenticate, asyncRoute(async (req, res) => {
    requireFields(req.body, ['orderId', 'mimeType', 'size']);
    const orderId = validateUuid(req.body.orderId, 'orderId');
    const order = await obtenerPedido(getAuthedDb(req), orderId);
    if (!order || String(order.id_usuario) !== req.auth!.userId || order.estado_pedido !== 'pendiente') throw Object.assign(new Error('Pedido pendiente no encontrado.'), { status: 404 });
    const data = await crearCargaFirmadaRecipe(createAdminClient(), req.auth!.userId, orderId, { mimeType: req.body.mimeType, size: req.body.size });
    res.status(201).json({ success: true, message: 'Carga de recipe autorizada.', data });
}));

app.post('/recipes', authenticate, asyncRoute(async (req, res) => {
    requireFields(req.body, ['id_detalle_pedido', 'archivo_path', 'nombre_archivo', 'mime_type', 'tamano_bytes']);
    const data = await crearRecipe(getAuthedDb(req), req.auth!.userId, req.body);
    res.status(201).json({ success: true, message: 'Recipe registrado.', data });
}));

app.patch('/recipes/:recipeId/file', authenticate, asyncRoute(async (req, res) => {
    const recipeId = validateUuid(req.params.recipeId, 'recipeId');
    requireFields(req.body, ['archivo_path', 'nombre_archivo', 'mime_type', 'tamano_bytes']);
    if (!String(req.body.archivo_path).startsWith(`${req.auth!.userId}/`)) throw Object.assign(new Error('La ruta del recipe no pertenece al usuario.'), { status: 403 });
    const admin = createAdminClient();
    const { data: previous } = await admin.from('recipes').select('id_usuario, archivo_path').eq('id_recipe', recipeId).is('eliminado_en', null).maybeSingle();
    if (!previous || previous.id_usuario !== req.auth!.userId) throw Object.assign(new Error('Recipe no encontrado.'), { status: 404 });
    const updated = await actualizarArchivoRecipe(getAuthedDb(req), recipeId, req.body);
    if (!updated) throw Object.assign(new Error('Recipe no encontrado o no editable.'), { status: 404 });
    if (previous.archivo_path !== req.body.archivo_path) await eliminarArchivoRecipe(admin, previous.archivo_path).catch(console.error);
    res.json({ success: true, message: 'Recipe reemplazado y reenviado a auditoria.', data: updated });
}));

app.patch('/recipes/:recipeId/audit', authenticate, authorize(RECIPE_AUDITORS), asyncRoute(async (req, res) => {
    const recipeId = validateUuid(req.params.recipeId, 'recipeId');
    requireFields(req.body, ['estado']);
    const data = await auditarRecipe(getAuthedDb(req), recipeId, { estado: String(req.body.estado), razones: Array.isArray(req.body.razones) ? req.body.razones.map(String) : undefined, comentario: typeof req.body.comentario === 'string' ? req.body.comentario : undefined });
    if (!data) throw Object.assign(new Error('Recipe no encontrado.'), { status: 404 });
    res.json({ success: true, message: 'Recipe auditado y auditoria registrada.', data });
}));

app.delete('/recipes/:recipeId', authenticate, asyncRoute(async (req, res) => {
    const recipeId = validateUuid(req.params.recipeId, 'recipeId');
    const admin = createAdminClient();
    const { data: existing } = await admin.from('recipes').select('id_usuario, archivo_path').eq('id_recipe', recipeId).is('eliminado_en', null).maybeSingle();
    if (!existing || (existing.id_usuario !== req.auth!.userId && req.auth!.role !== 'superadmin')) throw Object.assign(new Error('Recipe no encontrado.'), { status: 404 });
    const deleted = req.auth!.role === 'superadmin'
        ? (await admin.from('recipes').update({ eliminado_en: new Date().toISOString(), eliminado_por: req.auth!.userId }).eq('id_recipe', recipeId).is('eliminado_en', null).select('id_recipe, archivo_path').maybeSingle()).data
        : await eliminarRecipe(getAuthedDb(req), recipeId, req.auth!.userId);
    if (!deleted) throw Object.assign(new Error('Recipe no encontrado o no eliminable.'), { status: 404 });
    await eliminarArchivoRecipe(admin, String(deleted.archivo_path)).catch(console.error);
    res.json({ success: true, message: 'Recipe eliminado.', data: { eliminado: true, idRecipe: recipeId } });
}));

app.post('/banners', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    const banner = await insertarBanner(getAuthedDb(req), bannerPayload(req.body) as BannerInput);
    let envios: Awaited<ReturnType<typeof enviarNotificacionesBanner>> | null = null;
    try {
        envios = await enviarNotificacionesBanner(createAdminClient(), Number(banner.id_banner));
    } catch (error) {
        console.error('El banner se registro, pero fallo el procesamiento de envios:', error);
    }
    res.status(201).json({
        success: true,
        message: envios
            ? 'Banner y notificaciones promocionales registrados.'
            : 'Banner registrado; las notificaciones externas quedaron pendientes.',
        data: { banner, envios },
    });
}));

app.post('/banners/images/upload-url', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    requireFields(req.body, ['mimeType', 'size']);
    const data = await crearCargaFirmadaBanner(createAdminClient(), req.auth!.userId, {
        mimeType: req.body.mimeType,
        size: req.body.size,
    });
    res.status(201).json({ success: true, message: 'Carga autorizada.', data });
}));

app.post('/banners/images/delete', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    requireFields(req.body, ['path']);
    const data = await eliminarImagenBanner(createAdminClient(), String(req.body.path));
    res.json({ success: true, message: 'Imagen eliminada.', data });
}));

app.post('/branding/logo/upload-url', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    requireFields(req.body, ['mimeType', 'size']);
    const data = await crearCargaFirmadaLogo(createAdminClient(), {
        mimeType: req.body.mimeType,
        size: req.body.size,
    });
    res.status(201).json({ success: true, message: 'Carga del logotipo autorizada.', data });
}));

app.delete('/branding/logo', authenticate, authorize(SUPERADMIN), asyncRoute(async (_req, res) => {
    await eliminarLogoPersonalizado(createAdminClient());
    res.json({ success: true, message: 'Logotipo original restaurado.', data: { url: null } });
}));

app.patch('/banners/:bannerId', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    const bannerId = parsePositiveId(req.params.bannerId, 'bannerId');
    const previous = await obtenerBanner(getAuthedDb(req), bannerId);
    if (!previous) throw Object.assign(new Error('Banner no encontrado.'), { status: 404 });
    const banner = await actualizarBanner(getAuthedDb(req), bannerId, bannerPayload(req.body, true));
    const previousPath = bannerPathFromPublicUrl(previous.url_imagen);
    if (previousPath && previous.url_imagen !== banner.url_imagen) {
        await eliminarImagenBanner(createAdminClient(), previousPath).catch((error) => {
            console.error('El banner se actualizo, pero no se pudo limpiar la imagen anterior:', error);
        });
    }
    res.json({ success: true, message: 'Banner actualizado.', data: banner });
}));

app.delete('/banners/:bannerId', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    const bannerId = parsePositiveId(req.params.bannerId, 'bannerId');
    const eliminado = await eliminarBanner(getAuthedDb(req), bannerId);
    if (!eliminado) throw Object.assign(new Error('Banner no encontrado.'), { status: 404 });
    const imagePath = bannerPathFromPublicUrl(eliminado.url_imagen);
    if (imagePath) {
        await eliminarImagenBanner(createAdminClient(), imagePath).catch((error) => {
            console.error('El banner se elimino, pero no se pudo limpiar su imagen:', error);
        });
    }
    res.json({ success: true, message: 'Banner eliminado.', data: { eliminado: true, idBanner: bannerId } });
}));

app.post('/banners/:bannerId/notifications/dispatch', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    const bannerId = parsePositiveId(req.params.bannerId, 'bannerId');
    const envios = await enviarNotificacionesBanner(createAdminClient(), bannerId);
    res.json({ success: true, message: 'Envios pendientes procesados.', data: envios });
}));

app.get('/notifications', authenticate, asyncRoute(async (req, res) => {
    res.json({ success: true, data: await listarNotificacionesUsuario(getAuthedDb(req), req.auth!.userId) });
}));

app.patch('/notifications/read-all', authenticate, asyncRoute(async (req, res) => {
    const actualizadas = await marcarTodasLeidas(getAuthedDb(req), req.auth!.userId);
    res.json({ success: true, data: { actualizadas } });
}));

app.patch('/notifications/:notificationId/read', authenticate, asyncRoute(async (req, res) => {
    const notificationId = parsePositiveId(req.params.notificationId, 'notificationId');
    const notification = await marcarNotificacionLeida(getAuthedDb(req), req.auth!.userId, notificationId);
    if (!notification) throw Object.assign(new Error('Notificacion no encontrada.'), { status: 404 });
    res.json({ success: true, data: notification });
}));

app.delete('/notifications/:notificationId', authenticate, asyncRoute(async (req, res) => {
    const notificationId = parsePositiveId(req.params.notificationId, 'notificationId');
    const eliminada = await eliminarNotificacion(getAuthedDb(req), req.auth!.userId, notificationId);
    if (!eliminada) throw Object.assign(new Error('Notificacion no encontrada.'), { status: 404 });
    res.json({ success: true, data: { eliminada: true, idNotificacion: notificationId } });
}));

app.get('/coupons', authenticate, asyncRoute(async (req, res) => {
    const rows = await listarCupones(getAuthedDb(req)) as Array<Record<string, unknown>>;
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, data: await couponRowsWithEmails(rows, req) });
}));

app.get('/coupons/validate', authenticate, asyncRoute(async (req, res) => {
    requireFields(req.query as Record<string, unknown>, ['code']);
    const code = String(req.query.code).trim().toUpperCase();
    const coupon = await obtenerCuponPorCodigo(getAuthedDb(req), code);
    if (!coupon) throw Object.assign(new Error('El cupon no existe o no esta disponible para este usuario.'), { status: 404 });
    const today = new Date().toISOString().slice(0, 10);
    if (today < coupon.fecha_inicio || today > coupon.fecha_vencimiento) {
        throw Object.assign(new Error('El cupon no esta vigente.'), { status: 400 });
    }
    if (coupon.id_usuario && coupon.usado_en) {
        throw Object.assign(new Error('El cupon asignado ya fue usado.'), { status: 409 });
    }
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, data: coupon });
}));

app.post('/coupons', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    const payload = couponPayload(req.body) as CuponInput;
    const userEmail = typeof req.body.userEmail === 'string' ? req.body.userEmail.trim().toLowerCase() : '';
    if (userEmail) {
        const user = await findUserAuth(userEmail);
        if (!user) throw Object.assign(new Error('No existe un usuario con ese correo.'), { status: 404 });
        payload.id_usuario = user.id;
    } else {
        payload.id_usuario = null;
    }
    const coupon = await insertarCupon(getAuthedDb(req), payload);
    res.status(201).json({
        success: true,
        message: 'Cupon creado.',
        data: { ...coupon, correo_usuario: userEmail || null },
    });
}));

app.patch('/coupons/:couponId', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    const couponId = validateUuid(req.params.couponId, 'couponId');
    const payload = couponPayload(req.body, true);
    let userEmail: string | null | undefined;
    if (req.body.userEmail !== undefined) {
        userEmail = String(req.body.userEmail ?? '').trim().toLowerCase() || null;
        if (userEmail) {
            const user = await findUserAuth(userEmail);
            if (!user) throw Object.assign(new Error('No existe un usuario con ese correo.'), { status: 404 });
            payload.id_usuario = user.id;
        } else {
            payload.id_usuario = null;
        }
    }
    const coupon = await actualizarCupon(getAuthedDb(req), couponId, payload);
    if (!coupon) throw Object.assign(new Error('Cupon no encontrado.'), { status: 404 });
    const [resolved] = await couponRowsWithEmails([coupon as Record<string, unknown>], req);
    res.json({ success: true, message: 'Cupon actualizado.', data: resolved });
}));

app.delete('/coupons/:couponId', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    const couponId = validateUuid(req.params.couponId, 'couponId');
    const eliminado = await eliminarCupon(getAuthedDb(req), couponId);
    if (!eliminado) throw Object.assign(new Error('Cupon no encontrado.'), { status: 404 });
    res.json({ success: true, message: 'Cupon eliminado.', data: { eliminado: true, idCupon: couponId } });
}));

app.get('/branches/by-name', asyncRoute(async (req, res) => {
    requireFields(req.query as Record<string, unknown>, ['nombre']);
    res.json({ success: true, data: await getBranchByName(String(req.query.nombre)) });
}));

app.post('/inventory', authenticate, authorize(INVENTORY_EDITORS), asyncRoute(async (req, res) => {
    requireFields(req.body, ['producto', 'sedeId']);
    const sedeId = validateUuid(req.body.sedeId, 'sedeId');
    const data = await processInventoryEntry(getAuthedDb(req), req.body.producto, sedeId);
    res.status(201).json({ success: true, data });
}));

app.patch('/inventory/price', authenticate, authorize(INVENTORY_EDITORS), asyncRoute(async (req, res) => {
    requireFields(req.body, ['productoId', 'sedeId', 'precioUsd']);
    const productoId = validateUuid(req.body.productoId, 'productoId');
    const sedeId = validateUuid(req.body.sedeId, 'sedeId');
    const price = Number(req.body.precioUsd);
    if (!Number.isFinite(price) || price < 0) throw Object.assign(new Error('El precio debe ser un numero positivo.'), { status: 400 });
    res.json({ success: true, data: await updateBranchPrice(getAuthedDb(req), productoId, sedeId, price) });
}));

app.post('/branches', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    requireFields(req.body, ['nombre', 'direccion', 'latitud', 'longitud']);
    const data = await createBranch(getAuthedDb(req), String(req.body.nombre), String(req.body.direccion), Number(req.body.latitud), Number(req.body.longitud));
    res.status(201).json({ success: true, data });
}));

app.get('/users/auth', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    requireFields(req.query as Record<string, unknown>, ['email']);
    res.json({ success: true, data: await findUserAuth(String(req.query.email).trim().toLowerCase()) });
}));

app.get('/users/by-document', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    requireFields(req.query as Record<string, unknown>, ['tipo', 'documento']);
    const data = await findUserByCedula(getAuthedDb(req), String(req.query.tipo), String(req.query.documento));
    res.json({ success: true, data });
}));

app.post('/roles', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    requireFields(req.body, ['rol']);
    const role = String(req.body.rol).trim().toLowerCase();
    if (!VALID_ROLES.has(role)) throw Object.assign(new Error('Rol no valido.'), { status: 400 });
    res.status(201).json({ success: true, data: await insertRole(getAuthedDb(req), databaseRole(role)) });
}));

app.patch('/users/:userId/role', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    const userId = validateUuid(req.params.userId, 'userId');
    requireFields(req.body, ['rol']);
    const role = String(req.body.rol).trim().toLowerCase();
    if (!VALID_ROLES.has(role)) throw Object.assign(new Error('Rol no valido.'), { status: 400 });
    res.json({ success: true, data: await assingnRole(getAuthedDb(req), userId, databaseRole(role)) });
}));

app.get('/staff', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    const data = await getStaffMembers(getAuthedDb(req));
    res.json({ success: true, data });
}));

app.post('/inventory/seed', authenticate, authorize(SUPERADMIN), asyncRoute(async (req, res) => {
    requireFields(req.body, ['sedeId']);
    const sedeId = validateUuid(req.body.sedeId, 'sedeId');
    res.json({ success: true, data: await cargarTodoEnSede(getAuthedDb(req), sedeId) });
}));

app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada.' });
});

app.use((error: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    const status = error.type === 'entity.too.large' ? 413 : error.status && error.status >= 400 && error.status < 600 ? error.status : 500;
    if (status >= 500) console.error(error);
    res.status(status).json({
        success: false,
        message: status >= 500 ? 'Error interno del servidor.' : error.message,
        ...(error.code ? { code: error.code } : {}),
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

const expirationInterval = setInterval(() => {
    expirarPedidos(createAdminClient()).catch((error) => console.error('No se pudieron expirar pedidos:', error));
}, 60_000);
expirationInterval.unref();
expirarPedidos(createAdminClient()).catch((error) => console.error('No se pudieron expirar pedidos al iniciar:', error));

export { app };
