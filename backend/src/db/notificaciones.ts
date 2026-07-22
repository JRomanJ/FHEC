import type { SupabaseClient } from '@supabase/supabase-js';

export interface NotificationDeliveryRow {
    id_notificacion: number;
    titulo: string;
    mensaje: string;
    canales_solicitados: string[];
    canales_enviados: string[];
    estado_envio: Record<string, string>;
    correo_destino: string | null;
    telefono_destino: string | null;
}

const PUBLIC_NOTIFICATION_COLUMNS = 'id_notificacion, id_banner, titulo, mensaje, fecha_notificacion, leida, tipo_notificacion, canales_solicitados, canales_enviados, estado_envio';
const DELIVERY_NOTIFICATION_COLUMNS = `${PUBLIC_NOTIFICATION_COLUMNS}, correo_destino, telefono_destino`;

export const listarNotificacionesUsuario = async (client: SupabaseClient, userId: string) => {
    const { data, error } = await client
        .from('notificaciones')
        .select(PUBLIC_NOTIFICATION_COLUMNS)
        .eq('id_usuario', userId)
        .order('fecha_notificacion', { ascending: false });
    if (error) throw error;
    return data ?? [];
};

export const marcarNotificacionLeida = async (client: SupabaseClient, userId: string, idNotificacion: number) => {
    const { data, error } = await client
        .from('notificaciones')
        .update({ leida: true })
        .eq('id_usuario', userId)
        .eq('id_notificacion', idNotificacion)
        .select(PUBLIC_NOTIFICATION_COLUMNS)
        .maybeSingle();
    if (error) throw error;
    return data;
};

export const marcarTodasLeidas = async (client: SupabaseClient, userId: string) => {
    const { data, error } = await client
        .from('notificaciones')
        .update({ leida: true })
        .eq('id_usuario', userId)
        .eq('leida', false)
        .select('id_notificacion');
    if (error) throw error;
    return data?.length ?? 0;
};

export const eliminarNotificacion = async (client: SupabaseClient, userId: string, idNotificacion: number) => {
    const { data, error } = await client
        .from('notificaciones')
        .delete()
        .eq('id_usuario', userId)
        .eq('id_notificacion', idNotificacion)
        .select('id_notificacion')
        .maybeSingle();
    if (error) throw error;
    return Boolean(data);
};

export const listarNotificacionesBannerParaEnvio = async (client: SupabaseClient, idBanner: number) => {
    const { data, error } = await client
        .from('notificaciones')
        .select(DELIVERY_NOTIFICATION_COLUMNS)
        .eq('id_banner', idBanner);
    if (error) throw error;
    return (data ?? []) as NotificationDeliveryRow[];
};

export const actualizarResultadoEnvio = async (
    client: SupabaseClient,
    idNotificacion: number,
    canalesEnviados: string[],
    estadoEnvio: Record<string, string>,
) => {
    const { error } = await client
        .from('notificaciones')
        .update({ canales_enviados: canalesEnviados, estado_envio: estadoEnvio })
        .eq('id_notificacion', idNotificacion);
    if (error) throw error;
};

