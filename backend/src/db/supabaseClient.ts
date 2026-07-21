import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim() ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';

const assertSupabaseConfig = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw Object.assign(new Error('Faltan SUPABASE_URL y/o SUPABASE_ANON_KEY.'), { status: 503 });
    }
};

const isolatedAuthOptions = {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
} as const;

/** Cliente sin estado para registro, login, refresh y lecturas publicas. */
export const createPublicClient = (): SupabaseClient => {
    assertSupabaseConfig();
    return createClient(supabaseUrl, supabaseAnonKey, { auth: isolatedAuthOptions });
};

/** Cliente aislado por solicitud; nunca comparte una sesion con otro usuario. */
export const createAuthedClient = (accessToken: string): SupabaseClient => {
    assertSupabaseConfig();
    if (!accessToken) throw Object.assign(new Error('Falta el token de acceso.'), { status: 401 });

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: isolatedAuthOptions,
    });
};

/** Solo para tareas administrativas del servidor y scripts controlados. */
export const createAdminClient = (): SupabaseClient => {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw Object.assign(new Error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.'), { status: 503 });
    }
    return createClient(supabaseUrl, supabaseServiceRoleKey, { auth: isolatedAuthOptions });
};

export const adminAuthRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw Object.assign(new Error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.'), { status: 503 });
    }
    const response = await fetch(`${supabaseUrl}/auth/v1/admin${path}`, {
        ...init,
        headers: {
            apikey: supabaseServiceRoleKey,
            Authorization: `Bearer ${supabaseServiceRoleKey}`,
            'Content-Type': 'application/json',
            ...init.headers,
        },
    });
    if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string; msg?: string; error?: string } | null;
        throw Object.assign(new Error(payload?.message ?? payload?.msg ?? payload?.error ?? `Supabase Auth respondio ${response.status}.`), {
            status: response.status,
        });
    }
    return response.json() as Promise<T>;
};

/**
 * Compatibilidad para consultas publicas existentes. Este cliente no persiste ni
 * recibe sesiones; las operaciones autenticadas deben usar createAuthedClient.
 */
export const supabase = createClient(
    supabaseUrl || 'http://127.0.0.1:54321',
    supabaseAnonKey || 'configuration-missing',
    { auth: isolatedAuthOptions },
);
