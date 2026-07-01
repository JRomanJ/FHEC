import { supabase } from './db/supabaseClient.js';
import { insertUser } from './db/usuarios.js';
import { insertProfile } from './db/perfiles.js';


export const userLogger = async (email: string, password: string, nombre_completo: string, tipo_documento_identidad: string, documento_identidad: string, telefono: string, codigo_area: string, acepta_terminos: boolean, acepta_promociones: boolean) => {
    
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

    const newUser = await insertUser(userId, nombre_completo, tipo_documento_identidad, documento_identidad, telefono, codigo_area, acepta_terminos, acepta_promociones);
    await insertProfile(userId);
    
    return newUser;
};

export const loginUser = async (email: string, password: string) => {
    
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error?.message === 'Email not confirmed') {
        // En lugar de lanzar un error, devuelves un estado especial
        return { 
            status: 'PENDING_VERIFICATION', 
            message: 'Registro exitoso. Por favor, revisa tu correo para confirmar tu cuenta.' 
        };
    }
    
    return data;
};