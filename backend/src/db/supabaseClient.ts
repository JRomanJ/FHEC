import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las variables de entorno de Supabase');
}

export const getAuthedClient = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error("No hay una sesión activa.");
    }

    // Configura el cliente con el token actual
    supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
    });

    return supabase;
};

export const supabase = createClient(supabaseUrl, supabaseKey);

export const createAuthedClient = (accessToken: string) => {
    if (!accessToken) {
        throw new Error('Falta el token de acceso de Supabase');
    }

    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        auth: {
            autoRefreshToken: false,
            detectSessionInUrl: false,
            persistSession: false,
        },
    });
};
console.log("DEBUG URL:", process.env.SUPABASE_URL);
console.log("DEBUG KEY:", process.env.SUPABASE_ANON_KEY ? "DEFINIDA" : "VACÍA");
