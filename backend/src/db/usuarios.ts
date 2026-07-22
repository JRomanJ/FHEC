import type { SupabaseClient } from '@supabase/supabase-js';
import { adminAuthRequest } from './supabaseClient.js';

interface UserData {
    nombre_completo: string;
    tipo_documento_identidad: string;
    documento_identidad: string;
    telefono: string;
    codigo_area: string;
    direccion_fiscal?: string;
    correo?: string;
    acepta_terminos: boolean;
    acepta_promociones: boolean;
    acepta_promociones_sms: boolean;
    acepta_promociones_correo: boolean;
    acepta_notificaciones: boolean;
    acepta_notificaciones_sms: boolean;
    acepta_notificaciones_correo: boolean;
}

const SAFE_PROFILE_COLUMNS = 'id, nombre_completo, rol, tipo_documento_identidad, documento_identidad, telefono, codigo_area, direccion_fiscal, acepta_promociones, acepta_promociones_sms, acepta_promociones_correo, acepta_notificaciones, acepta_notificaciones_sms, acepta_notificaciones_correo';

export const findUserAuth = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const data = await adminAuthRequest<{ users: Array<{ id: string; email?: string }> }>('/users?page=1&per_page=1000');
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);
    return user ? { id: user.id, correo: user.email ?? normalizedEmail } : null;
};

export const getAuthEmailsByIds = async (userIds: string[]) => {
    const ids = new Set(userIds);
    if (ids.size === 0) return new Map<string, string>();
    const data = await adminAuthRequest<{ users: Array<{ id: string; email?: string }> }>('/users?page=1&per_page=1000');
    return new Map(
        data.users
            .filter((user) => ids.has(user.id) && user.email)
            .map((user) => [user.id, String(user.email)]),
    );
};

export const findUserByCedula = async (client: SupabaseClient, documentType: string, document: string) => {
    const { data, error } = await client
        .from('usuarios')
        .select(SAFE_PROFILE_COLUMNS)
        .eq('tipo_documento_identidad', documentType)
        .eq('documento_identidad', document)
        .maybeSingle();
    if (error) throw error;
    return data;
};

export const updateUserAuthEmail = async (client: SupabaseClient, email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await client.auth.updateUser({ email: normalizedEmail });
    if (error || !data.user) {
        throw Object.assign(new Error(`No se pudo actualizar el correo de autenticacion: ${error?.message ?? 'respuesta vacia'}`), {
            status: error?.status ?? 502,
        });
    }
    return data.user;
};

export const updateOtherUserAuthEmail = async (userId: string, email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    return adminAuthRequest<{ id: string; email?: string }>(`/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        body: JSON.stringify({ email: normalizedEmail }),
    });
};

export const updateUserProfile = async (client: SupabaseClient, userId: string, data: Partial<UserData> & Record<string, unknown>) => {
    const allowedFields: Record<string, unknown> = {};
    const mapping: Record<string, string> = {
        name: 'nombre_completo',
        documentType: 'tipo_documento_identidad',
        document: 'documento_identidad',
        phone: 'telefono',
        areaCode: 'codigo_area',
        address: 'direccion_fiscal',
        nombre_completo: 'nombre_completo',
        tipo_documento_identidad: 'tipo_documento_identidad',
        documento_identidad: 'documento_identidad',
        telefono: 'telefono',
        codigo_area: 'codigo_area',
        direccion_fiscal: 'direccion_fiscal',
        acepta_terminos: 'acepta_terminos',
        acepta_promociones: 'acepta_promociones',
        acepta_promociones_sms: 'acepta_promociones_sms',
        acepta_promociones_correo: 'acepta_promociones_correo',
        acepta_notificaciones: 'acepta_notificaciones',
        acepta_notificaciones_sms: 'acepta_notificaciones_sms',
        acepta_notificaciones_correo: 'acepta_notificaciones_correo',
    };

    for (const [inputField, databaseField] of Object.entries(mapping)) {
        if (data[inputField] !== undefined) allowedFields[databaseField] = data[inputField];
    }
    if (Object.keys(allowedFields).length === 0) {
        throw Object.assign(new Error('No se enviaron campos editables.'), { status: 400 });
    }

    const { data: updated, error } = await client
        .from('usuarios')
        .update(allowedFields)
        .eq('id', userId)
        .select(SAFE_PROFILE_COLUMNS)
        .single();
    if (error) throw new Error(`Error en actualizacion: ${error.message}`);
    return updated;
};

export const getStaffMembers = async (client: SupabaseClient) => {
    const { data, error } = await client
        .from('personal_operativo')
        .select(`
            id_usuario,
            id_sede,
            created_at,
            usuarios!inner (
                id,
                nombre_completo,
                tipo_documento_identidad,
                documento_identidad,
                rol
            )
        `);

    if (error) throw error;

    return (data || []).map((item: any) => {
        const u = item.usuarios || {};
        return {
            id: item.id_usuario,
            nombre_completo: u.nombre_completo,
            tipo_documento_identidad: u.tipo_documento_identidad,
            documento_identidad: u.documento_identidad,
            rol: u.rol,
            id_sede: item.id_sede,
            created_at: item.created_at,
        };
    });
};
