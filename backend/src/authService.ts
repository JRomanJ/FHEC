import type { Session, User } from '@supabase/supabase-js';
import { createAuthedClient, createPublicClient } from './db/supabaseClient.js';

export interface RegistrationData {
    email: string;
    password: string;
    nombre_completo: string;
    tipo_documento_identidad: string;
    documento_identidad: string;
    telefono?: string;
    codigo_area?: string;
    direccion_fiscal?: string;
    acepta_terminos: boolean;
    acepta_promociones?: boolean;
    acepta_promociones_sms?: boolean;
    acepta_promociones_correo?: boolean;
    acepta_notificaciones?: boolean;
    acepta_notificaciones_sms?: boolean;
    acepta_notificaciones_correo?: boolean;
}

const sessionPayload = (session: Session) => ({
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
});

export const registerUser = async (input: RegistrationData) => {
    const email = input.email.trim().toLowerCase();
    const { password, ...metadata } = input;
    const client = createPublicClient();
    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { ...metadata, email, rol: 'cliente' } },
    });

    if (error) throw Object.assign(new Error(error.message), { status: error.status ?? 400 });
    if (!data.user) throw Object.assign(new Error('No se pudo crear el usuario.'), { status: 502 });

    return {
        userId: data.user.id,
        emailConfirmationRequired: !data.session,
    };
};

export const loginUser = async (email: string, password: string): Promise<{ user: User; session: Session }> => {
    const client = createPublicClient();
    const { data, error } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
    });

    if (error) {
        const pending = error.message.toLowerCase().includes('email not confirmed');
        throw Object.assign(new Error(pending ? 'Confirma tu correo antes de iniciar sesion.' : 'Correo o contrasena incorrectos.'), {
            status: pending ? 403 : 401,
            code: pending ? 'PENDING_VERIFICATION' : 'INVALID_CREDENTIALS',
        });
    }
    if (!data.user || !data.session) throw Object.assign(new Error('Supabase no devolvio una sesion valida.'), { status: 502 });
    return { user: data.user, session: data.session };
};

export const refreshUserSession = async (refreshToken: string) => {
    const client = createPublicClient();
    const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.user || !data.session) {
        throw Object.assign(new Error('La sesion no se pudo renovar.'), { status: 401, code: 'INVALID_REFRESH_TOKEN' });
    }
    return { user: data.user, session: data.session, payload: sessionPayload(data.session) };
};

export const revokeUserSession = async (accessToken: string, refreshToken: string) => {
    const client = createAuthedClient(accessToken);
    const { error: setSessionError } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    });
    if (setSessionError) throw Object.assign(new Error('La sesion ya no es valida.'), { status: 401 });

    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) throw Object.assign(new Error('No se pudo revocar la sesion.'), { status: error.status ?? 502 });
};

export { sessionPayload };
