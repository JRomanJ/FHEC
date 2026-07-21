import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '') ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const password = process.env.DEMO_ACCOUNT_PASSWORD ?? 'clave123';

const accounts = [
    { email: 'cliente@fhec.com', nombre: 'Maria Gonzalez', rol: 'cliente', documento: '12345678', codigoArea: '0414', telefono: '1234567' },
    { email: 'repartidor@fhec.com', nombre: 'Jose Ramos', rol: 'repartidor', documento: '87654321', codigoArea: '0416', telefono: '8765432' },
    { email: 'auxiliar@fhec.com', nombre: 'Ana Torres', rol: 'auxiliar', documento: '11223344', codigoArea: '0412', telefono: '1122334' },
    { email: 'auditor@fhec.com', nombre: 'Carlos Vega', rol: 'auditor', documento: '33445566', codigoArea: '0414', telefono: '3344556' },
    { email: 'admin@fhec.com', nombre: 'Luis Medina', rol: 'super_admin', documento: '55667788', codigoArea: '0424', telefono: '5566778' },
] as const;

interface AuthUser {
    id: string;
    email?: string;
    app_metadata?: Record<string, unknown>;
}

const adminHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${supabaseUrl}${path}`, {
        ...init,
        headers: { ...adminHeaders, ...init.headers },
    });
    if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string; msg?: string; error?: string } | null;
        const message = payload?.message ?? payload?.msg ?? payload?.error ?? `HTTP ${response.status}`;
        throw Object.assign(new Error(message), { status: response.status });
    }
    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
};

const run = async () => {
    if (!supabaseUrl || !serviceKey) throw new Error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.');
    if (password.length < 6) throw new Error('DEMO_ACCOUNT_PASSWORD debe tener al menos 6 caracteres.');

    console.log('Conectando con Supabase Auth...');
    const listed = await request<{ users: AuthUser[] }>('/auth/v1/admin/users?page=1&per_page=1000');

    for (const account of accounts) {
        const metadata = {
            nombre_completo: account.nombre,
            tipo_documento_identidad: 'V',
            documento_identidad: account.documento,
            codigo_area: account.codigoArea,
            telefono: account.telefono,
            rol: account.rol,
            acepta_terminos: true,
            acepta_promociones: false,
            acepta_promociones_sms: false,
            acepta_promociones_correo: false,
            acepta_notificaciones: true,
            acepta_notificaciones_sms: true,
            acepta_notificaciones_correo: true,
        };
        const existing = listed.users.find((user) => user.email?.toLowerCase() === account.email);
        const authPayload = {
            password,
            email_confirm: true,
            user_metadata: metadata,
            app_metadata: { ...(existing?.app_metadata ?? {}), role: account.rol },
            ...(!existing ? { email: account.email } : {}),
        };
        const authUser = await request<AuthUser>(
            existing ? `/auth/v1/admin/users/${encodeURIComponent(existing.id)}` : '/auth/v1/admin/users',
            { method: existing ? 'PUT' : 'POST', body: JSON.stringify(authPayload) },
        );
        if (!authUser.id) throw new Error(`Supabase no devolvio el ID de ${account.email}.`);

        const profile = {
            id: authUser.id,
            nombre_completo: account.nombre,
            rol: account.rol,
            tipo_documento_identidad: 'V',
            documento_identidad: account.documento,
            codigo_area: account.codigoArea,
            telefono: account.telefono,
            acepta_terminos: true,
            acepta_promociones: false,
            acepta_promociones_sms: false,
            acepta_promociones_correo: false,
            acepta_notificaciones: true,
            acepta_notificaciones_sms: true,
            acepta_notificaciones_correo: true,
        };
        await request<void>('/rest/v1/usuarios?on_conflict=id', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify(profile),
        });
        console.log(`OK ${account.email} -> ${account.rol}`);
    }

    console.log('Cuentas de prueba sincronizadas correctamente.');
};

run().catch((error) => {
    const candidate = error as { message?: unknown; status?: unknown; name?: unknown } | null;
    console.error('Fallo al sincronizar cuentas:', {
        name: candidate?.name ?? 'Error',
        message: candidate?.message ?? String(error),
        status: candidate?.status ?? null,
    });
    process.exitCode = 1;
});
