import { supabase } from './supabaseClient.js';

interface UserData {
  nombre_completo: string;
  tipo_documento_identidad: string;
  documento_identidad: string;
  telefono: string;
  codigo_area: string;
  acepta_terminos: boolean;
  acepta_promociones: boolean;
  acepta_promociones_sms: boolean;
  acepta_promociones_correo: boolean;
  acepta_notificaciones: boolean;
  acepta_notificaciones_sms: boolean;
  acepta_notificaciones_correo: boolean;
}

export const userLogger = async (data: any) => {
    const { email, password, ...metadata } = data;

    if (!email || !password) {
        throw new Error("El correo y la contraseña son obligatorios");
    }

    const { data: authData, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                nombre_completo: metadata.nombre_completo,
                tipo_documento_identidad: metadata.tipo_documento_identidad,
                documento_identidad: metadata.documento_identidad,
                telefono: metadata.telefono,
                codigo_area: metadata.codigo_area,
                acepta_terminos: metadata.acepta_terminos,
                acepta_promociones: metadata.acepta_promociones,
                acepta_promociones_sms: metadata.acepta_promociones_sms,
                acepta_promociones_correo: metadata.acepta_promociones_correo,
                acepta_notificaciones: metadata.acepta_notificaciones,
                acepta_notificaciones_sms: metadata.acepta_notificaciones_sms,
                acepta_notificaciones_correo: metadata.acepta_notificaciones_correo
            }
        }
    });

    if (error) {
        console.error("Error detallado de Supabase:", JSON.stringify(error, null, 2));
        throw new Error(error.message || "Error en el servidor");
    }

    return authData;
};
// GUARDAR en la tabla de usuarios
export const insertUser = async (id: string, userData: UserData) => {
    const { data, error } = await supabase
    .from('usuarios')
    .insert([{id, ...userData}])
    .select()
    .single();

    if (error) {
        console.error("Error completo de Supabase:", JSON.stringify(error, null, 2));
        throw new Error(`Error en registro: ${error.message || 'Error desconocido'}`);
    }
    return data;
}
// LEER de la tabla de usuarios
export const readUsers = async () => {
    const { data, error } = await supabase
    .from('usuarios')
    .select('correo, created_at');    

    if (error) throw error;
    return data;
}
export const findUserAuth =  async (email: string) => {
    const { data, error } = await supabase
    .from('usuarios')
    .select('id, correo, password_hash')
    .eq('correo', email)
    .single();

    if (error) return null; // Si no se encuentra el usuario, devuelve null
    return data;
}
export const findUserByCedula = async (tipo_documento_identidad: string, documento_identidad: string) => {
    const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('tipo_documento_identidad', tipo_documento_identidad)
    .eq('documento_identidad', documento_identidad)
    .single();

    if (error) return null;
    return data;
}

export const updateUserAuthEmail = async (email: string) => {
    const normalizedEmail = String(email).trim().toLowerCase();

    const { data, error } = await supabase.auth.updateUser({ email: normalizedEmail });

    if (error) {
        console.error('Error al actualizar correo en Supabase Auth:', JSON.stringify(error, null, 2));
        throw new Error(`Error en actualización de correo: ${error.message || 'Error desconocido'}`);
    }

    if (!data.user) {
        throw new Error('No se pudo actualizar el correo en la autenticación.');
    }

    return data.user;
};

export const updateUserProfile = async (userId: string, data: Partial<UserData> & { nombre_completo?: string; tipo_documento_identidad?: string; documento_identidad?: string; telefono?: string; codigo_area?: string; direccion_fiscal?: string; correo?: string }) => {
    // Whitelist allowed fields to prevent role/id escalation attacks
    const allowedFields: Record<string, unknown> = {};
    const mapping: Record<string, string> = {
        name: 'nombre_completo',
        documentType: 'tipo_documento_identidad',
        document: 'documento_identidad',
        phone: 'telefono',
        areaCode: 'codigo_area',
        address: 'direccion_fiscal',
    };

    for (const [frontKey, dbCol] of Object.entries(mapping)) {
        if ((data as any)[frontKey] !== undefined) {
            allowedFields[dbCol] = (data as any)[frontKey];
        }
        if ((data as any)[dbCol] !== undefined) {
            allowedFields[dbCol] = (data as any)[dbCol];
        }
    }

    const { data: updated, error } = await supabase
        .from('usuarios')
        .update(allowedFields)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error("Error al actualizar usuario en Supabase:", JSON.stringify(error, null, 2));
        throw new Error(`Error en actualización: ${error.message || 'Error desconocido'}`);
    }

    return updated;
};