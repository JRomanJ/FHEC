import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { loginUser } from './authService.js';
import { userLogger, findUserAuth, findUserByCedula, updateUserAuthEmail, updateUserProfile } from './db/usuarios.js';
import { processInventoryEntry, getProducosWithFilters } from './db/inventario.js';
import { updateBranchPrice, getBranchByName, createBranch } from './db/sedes.js';
import { findProduct } from './db/productos.js';
import { insertRole, assingnRole } from './db/roles.js';
import { cargarTodoEnSede } from './db/cargarProductosdePrueba.js';
import { supabase } from './db/supabaseClient.js';
import {
    agregarProductoCarrito,
    disminuirProductoCarrito,
    eliminarProductoCarrito,
    establecerCantidadProductoCarrito,
    obtenerCarrito,
    vaciarCarrito,
} from './db/carritos.js';


const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_ROLES = new Set(['admin', 'super_admin', 'superadmin']);
const STAFF_ROLES = new Set(['auxiliar', 'auditor', 'repartidor', ...ADMIN_ROLES]);

type AuthenticatedRequest = Request & {
    auth?: { userId: string; role: string };
};

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

const requireFields = (body: Record<string, unknown> | undefined, fields: string[]) => {
    const source = body ?? {};
    const missing = fields.filter((field) => source[field] === undefined || source[field] === null || source[field] === '');
    if (missing.length) throw Object.assign(new Error(`Campos obligatorios: ${missing.join(', ')}`), { status: 400 });
};

const getAccessToken = (req: Request) => {
    const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!accessToken) throw Object.assign(new Error('Debes iniciar sesion.'), { status: 401 });
    return accessToken;
};

const parseInteger = (value: unknown, field: string, defaultValue?: number) => {
    const resolvedValue = value ?? defaultValue;
    const parsedValue = typeof resolvedValue === 'number'
        ? resolvedValue
        : typeof resolvedValue === 'string' && resolvedValue.trim() !== ''
            ? Number(resolvedValue)
            : Number.NaN;

    if (!Number.isInteger(parsedValue)) {
        throw Object.assign(new Error(`${field} debe ser un numero entero.`), { status: 400 });
    }

    return parsedValue;
};

const asyncRoute = (handler: (req: Request, res: Response) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) => void handler(req, res).catch(next);

const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, '');
        const refreshToken = req.header('x-refresh-token');
        if (!accessToken) {
            res.status(401).json({ success: false, message: 'Debes iniciar sesión.' });
            return;
        }

        if (refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
        }

        const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
        if (authError || !authData.user) throw authError ?? new Error('Sesión inválida.');

        const { data: profile, error: profileError } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', authData.user.id)
            .single();
        if (profileError) throw profileError;

        req.auth = { userId: authData.user.id, role: String(profile?.rol ?? 'cliente') };
        next();
    } catch {
        res.status(401).json({ success: false, message: 'La sesión expiró o no es válida.' });
    }
};

const authorize = (allowedRoles: Set<string>) =>
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.auth || !allowedRoles.has(req.auth.role)) {
            res.status(403).json({ success: false, message: 'No tienes permiso para realizar esta operación.' });
            return;
        }
        next();
    };

app.get('/api/health', (_req, res) => res.json({ success: true }));

app.post('/api/log', asyncRoute(async (req, res) => {
    requireFields(req.body, ['email', 'password', 'nombre_completo', 'documento_identidad', 'acepta_terminos']);
    const data = await userLogger(req.body);
    res.status(201).json({ success: true, message: 'Usuario registrado.', data });
}));

app.post('/api/login', asyncRoute(async (req, res) => {
    requireFields(req.body, ['email', 'password']);
    const login = await loginUser(String(req.body.email).trim().toLowerCase(), String(req.body.password));

    if (login.status === 'PENDING_VERIFICATION') {
        res.status(403).json({ success: false, status: login.status, message: login.message });
        return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const authUser = login.user;
    if (!authUser) throw new Error('Supabase no devolvió el usuario autenticado.');
    const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authUser.id)
        .single();
    if (profileError) throw profileError;

    res.json({
        success: true,
        message: 'Inicio de sesión exitoso.',
        data: {
            user: {
                id: authUser.id,
                name: profile.nombre_completo ?? authUser.user_metadata?.nombre_completo ?? '',
                email: authUser.email ?? req.body.email,
                role: profile.rol ?? 'cliente',
                documentType: profile.tipo_documento_identidad ?? '',
                document: profile.documento_identidad ?? '',
                phone: profile.telefono ?? '',
                areaCode: profile.codigo_area ?? '',
                address: profile.direccion_fiscal ?? '',
            },
            session: sessionData.session ? {
                accessToken: sessionData.session.access_token,
                refreshToken: sessionData.session.refresh_token,
                expiresAt: sessionData.session.expires_at,
            } : null,
        },
    });
}));

app.patch('/api/users/:userId', authenticate, asyncRoute(async (req: AuthenticatedRequest, res: Response) => {
    const userId = String(req.params.userId);

    if (req.auth?.userId !== userId && !ADMIN_ROLES.has(req.auth?.role ?? '')) {
        res.status(403).json({ success: false, message: 'No tienes permiso para modificar este usuario.' });
        return;
    }

    const updatePayload = { ...req.body } as Record<string, unknown>;
    const requestedEmail = typeof updatePayload.email === 'string' ? String(updatePayload.email).trim().toLowerCase() : undefined;

    if (requestedEmail !== undefined) {
        delete updatePayload.email;
        await updateUserAuthEmail(requestedEmail);
    }

    const profileData = await updateUserProfile(userId, updatePayload);
    const { data: authUserData } = await supabase.auth.getUser();

    res.json({
        success: true,
        message: 'Usuario actualizado correctamente.',
        data: {
            id: profileData.id,
            name: profileData.nombre_completo ?? '',
            email: authUserData.user?.email ?? requestedEmail ?? '',
            role: profileData.rol ?? 'cliente',
            documentType: profileData.tipo_documento_identidad ?? '',
            document: profileData.documento_identidad ?? '',
            phone: profileData.telefono ?? '',
            areaCode: profileData.codigo_area ?? '',
            address: profileData.direccion_fiscal ?? '',
        },
    });
}));

app.get('/api/inventory/:sedeId', asyncRoute(async (req, res) => {
    const filters = {
        principio_activo: req.query.principio_activo,
        marca_comercial: req.query.marca_comercial,
        categoria: req.query.categoria,
    };
    const data = await getProducosWithFilters(String(req.params.sedeId), filters);
    res.json({ success: true, data });
}));

app.get('/api/products/search', authenticate, asyncRoute(async (req, res) => {
    const criteria: { principio_activo?: string; marca_comercial?: string; forma_farmaceutica?: string } = {};
    if (typeof req.query.principio_activo === 'string') criteria.principio_activo = req.query.principio_activo;
    if (typeof req.query.marca_comercial === 'string') criteria.marca_comercial = req.query.marca_comercial;
    if (typeof req.query.forma_farmaceutica === 'string') criteria.forma_farmaceutica = req.query.forma_farmaceutica;
    const data = await findProduct(criteria);
    res.json({ success: true, data });
}));

app.get('/api/cart', authenticate, asyncRoute(async (req, res) => {
    const data = await obtenerCarrito(getAccessToken(req));
    res.json({ success: true, data });
}));

app.post('/api/cart/items', authenticate, asyncRoute(async (req, res) => {
    requireFields(req.body, ['idInventario']);
    const cantidad = parseInteger(req.body.cantidad, 'cantidad', 1);
    const data = await agregarProductoCarrito(
        getAccessToken(req),
        String(req.body.idInventario),
        cantidad,
    );
    res.status(201).json({ success: true, data });
}));

app.put('/api/cart/items/:idInventario', authenticate, asyncRoute(async (req, res) => {
    requireFields(req.body, ['cantidad']);
    const cantidad = parseInteger(req.body.cantidad, 'cantidad');
    const data = await establecerCantidadProductoCarrito(
        getAccessToken(req),
        String(req.params.idInventario),
        cantidad,
    );
    res.json({ success: true, data: { cantidad } });
}));

app.patch('/api/cart/items/:idInventario/decrement', authenticate, asyncRoute(async (req, res) => {
    const cantidadADisminuir = parseInteger(req.body?.cantidad, 'cantidad', 1);
    const cantidad = await disminuirProductoCarrito(
        getAccessToken(req),
        String(req.params.idInventario),
        cantidadADisminuir,
    );
    res.json({ success: true, data: { cantidad } });
}));

app.delete('/api/cart/items/:idInventario', authenticate, asyncRoute(async (req, res) => {
    const eliminado = await eliminarProductoCarrito(
        getAccessToken(req),
        String(req.params.idInventario),
    );
    res.json({ success: true, data: { eliminado } });
}));

app.delete('/api/cart', authenticate, asyncRoute(async (req, res) => {
    const productosEliminados = await vaciarCarrito(getAccessToken(req));
    res.json({ success: true, data: { productosEliminados } });
}));

app.get('/api/branches/by-name', asyncRoute(async (req, res) => {
    requireFields(req.query as Record<string, unknown>, ['nombre']);
    const data = await getBranchByName(String(req.query.nombre));
    res.json({ success: true, data });
}));

app.post('/api/inventory', authenticate, authorize(STAFF_ROLES), asyncRoute(async (req, res) => {
    requireFields(req.body, ['producto', 'sedeId']);
    const data = await processInventoryEntry(req.body.producto, req.body.sedeId);
    res.status(201).json({ success: true, data });
}));

app.patch('/api/inventory/price', authenticate, authorize(STAFF_ROLES), asyncRoute(async (req, res) => {
    requireFields(req.body, ['productoId', 'sedeId', 'precioUsd']);
    const price = Number(req.body.precioUsd);
    if (!Number.isFinite(price) || price < 0) throw Object.assign(new Error('El precio debe ser un número positivo.'), { status: 400 });
    const data = await updateBranchPrice(req.body.productoId, req.body.sedeId, price);
    res.json({ success: true, data });
}));

app.post('/api/branches', authenticate, authorize(ADMIN_ROLES), asyncRoute(async (req, res) => {
    requireFields(req.body, ['nombre', 'direccion', 'latitud', 'longitud']);
    const data = await createBranch(req.body.nombre, req.body.direccion, Number(req.body.latitud), Number(req.body.longitud));
    res.status(201).json({ success: true, data });
}));

app.get('/api/users/auth', authenticate, authorize(ADMIN_ROLES), asyncRoute(async (req, res) => {
    requireFields(req.query as Record<string, unknown>, ['email']);
    const user = await findUserAuth(String(req.query.email));
    const data = user ? { id: user.id, correo: user.correo } : null;
    res.json({ success: true, data });
}));

app.get('/api/users/by-document', authenticate, authorize(ADMIN_ROLES), asyncRoute(async (req, res) => {
    requireFields(req.query as Record<string, unknown>, ['tipo', 'documento']);
    const data = await findUserByCedula(String(req.query.tipo), String(req.query.documento));
    res.json({ success: true, data });
}));

app.post('/api/roles', authenticate, authorize(ADMIN_ROLES), asyncRoute(async (req, res) => {
    requireFields(req.body, ['rol']);
    const data = await insertRole(req.body.rol);
    res.status(201).json({ success: true, data });
}));

app.patch('/api/users/:userId/role', authenticate, authorize(ADMIN_ROLES), asyncRoute(async (req, res) => {
    requireFields(req.body, ['rol']);
    const data = await assingnRole(String(req.params.userId), req.body.rol);
    res.json({ success: true, data });
}));

// Operación interna de inicialización. No se publica como control visible en el frontend.
app.post('/api/inventory/seed', authenticate, authorize(ADMIN_ROLES), asyncRoute(async (req, res) => {
    requireFields(req.body, ['sedeId']);
    const data = await cargarTodoEnSede(req.body.sedeId);
    res.json({ success: true, data });
}));

app.use((error: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(error.status ?? 500).json({
        success: false,
        message: error.message || 'Error interno del servidor.',
    });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
