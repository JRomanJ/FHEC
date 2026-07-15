import { supabase, getAuthedClient } from './db/supabaseClient.js';
import { insertUser } from './db/usuarios.js';


export const userLogger = async (email: string, password: string, nombre_completo: string, tipo_documento_identidad: string, 
    documento_identidad: string, telefono: string, codigo_area: string, acepta_terminos: boolean, acepta_promociones: boolean, acepta_promociones_sms: boolean, acepta_promociones_correo: boolean, 
    acepta_notificaciones: boolean, acepta_notificaciones_sms: boolean, acepta_notificaciones_correo: boolean) => {
    console.log("Intentando conectar a:", process.env.SUPABASE_URL);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password
    });
    if (authError) {
        console.error("Error completo de Supabase:", JSON.stringify(authError, null, 2));
        throw new Error(`Error en registro: ${authError.message || 'Error desconocido'}`);
    }
    if (!authData.user) {
        throw new Error('No se pudo crear el usuario en el sistema de autenticacion.');
    }
    const userId = authData.user!.id;
    await getAuthedClient(); // Asegurar de que el cliente esté autenticado antes de insertar en la base de datos

    const newUser = await insertUser(userId, {
        nombre_completo,
        tipo_documento_identidad,
        documento_identidad,
        telefono,
        codigo_area,
        acepta_terminos,
        acepta_promociones,
        acepta_promociones_sms,
        acepta_promociones_correo,
        acepta_notificaciones,
        acepta_notificaciones_sms,
        acepta_notificaciones_correo,
    });
    
    return newUser;
};

export const loginUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        if (error.message === 'Email not confirmed') {
            return { status: 'PENDING_VERIFICATION', message: 'Confirma tu correo.' };
        }
        throw error; // Lanza el error para capturarlo en el index
    }

    return { status: 'SUCCESS', user: data.user };
};