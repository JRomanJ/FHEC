import type { SupabaseClient } from '@supabase/supabase-js';

export interface BannerInput {
    titulo: string;
    subtitulo?: string | null;
    etiqueta?: string | null;
    texto_accion?: string | null;
    url_accion?: string | null;
    url_imagen: string;
    color_inicio?: string;
    color_medio?: string;
    color_fin?: string;
}

const BANNER_COLUMNS = 'id_banner, titulo, subtitulo, etiqueta, texto_accion, url_accion, url_imagen, color_inicio, color_medio, color_fin, fecha_creacion';

export const listarBanners = async (client: SupabaseClient) => {
    const { data, error } = await client.from('banners').select(BANNER_COLUMNS).order('id_banner');
    if (error) throw error;
    return data ?? [];
};

export const obtenerBanner = async (client: SupabaseClient, idBanner: number) => {
    const { data, error } = await client.from('banners').select(BANNER_COLUMNS).eq('id_banner', idBanner).maybeSingle();
    if (error) throw error;
    return data;
};

export const insertarBanner = async (client: SupabaseClient, input: BannerInput) => {
    const { data, error } = await client.from('banners').insert(input).select(BANNER_COLUMNS).single();
    if (error) throw error;
    return data;
};

export const actualizarBanner = async (client: SupabaseClient, idBanner: number, input: Partial<BannerInput>) => {
    const { data, error } = await client.from('banners').update(input).eq('id_banner', idBanner).select(BANNER_COLUMNS).single();
    if (error) throw error;
    return data;
};

export const eliminarBanner = async (client: SupabaseClient, idBanner: number) => {
    const { data, error } = await client.from('banners').delete().eq('id_banner', idBanner).select('id_banner, url_imagen').maybeSingle();
    if (error) throw error;
    return data;
};
