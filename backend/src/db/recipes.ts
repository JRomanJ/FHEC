import type { SupabaseClient } from '@supabase/supabase-js';
import { firmarLecturaRecipe } from '../recipeStorage.js';

const RECIPE_SELECT = 'id_recipe, id_detalle_pedido, id_usuario, archivo_path, nombre_archivo, mime_type, tamano_bytes, estado_recipe, razones_rechazo, comentario_auditoria, fecha_carga, fecha_actualizacion, detalles_pedidos!inner(id_pedido, id_producto, cantidad, nivel_control, pedidos!inner(id_pedido, id_usuario, id_sede, nombre_receptor, fecha_creacion), productos!inner(id, principio_activo, marca_comercial, concentracion, cantidad_presentacion))';

export const listarRecipes = async (client: SupabaseClient, adminClient: SupabaseClient) => {
    const { data, error } = await client.from('recipes').select(RECIPE_SELECT).is('eliminado_en', null).order('fecha_carga', { ascending: false });
    if (error) throw error;
    return Promise.all((data ?? []).map(async (recipe) => ({ ...recipe, archivo_url: await firmarLecturaRecipe(adminClient, String(recipe.archivo_path)) })));
};

export const crearRecipe = async (client: SupabaseClient, userId: string, input: Record<string, unknown>) => {
    if (!String(input.archivo_path ?? '').startsWith(`${userId}/`)) throw Object.assign(new Error('La ruta del recipe no pertenece al usuario.'), { status: 403 });
    const payload = { id_detalle_pedido: input.id_detalle_pedido, id_usuario: userId, archivo_path: input.archivo_path, nombre_archivo: input.nombre_archivo, mime_type: input.mime_type, tamano_bytes: input.tamano_bytes, estado_recipe: 'pendiente' };
    const { data, error } = await client.from('recipes').insert(payload).select('id_recipe, id_detalle_pedido, id_usuario, archivo_path, nombre_archivo, mime_type, tamano_bytes, estado_recipe, fecha_carga, fecha_actualizacion').single();
    if (error) throw error;
    return data;
};

export const actualizarArchivoRecipe = async (client: SupabaseClient, recipeId: string, input: Record<string, unknown>) => {
    const payload = { archivo_path: input.archivo_path, nombre_archivo: input.nombre_archivo, mime_type: input.mime_type, tamano_bytes: input.tamano_bytes, estado_recipe: 'pendiente', razones_rechazo: null, comentario_auditoria: null, fecha_actualizacion: new Date().toISOString() };
    const { data, error } = await client.from('recipes').update(payload).eq('id_recipe', recipeId).is('eliminado_en', null).select('*').maybeSingle();
    if (error) throw error;
    return data;
};

export const auditarRecipe = async (client: SupabaseClient, recipeId: string, input: { estado: string; razones?: string[]; comentario?: string }) => {
    if (!['aprobado', 'rechazado'].includes(input.estado)) throw Object.assign(new Error('Estado de auditoria invalido.'), { status: 400 });
    if (input.estado === 'rechazado' && (!input.razones || input.razones.length === 0)) throw Object.assign(new Error('Indica al menos una razon de rechazo.'), { status: 400 });
    const { data, error } = await client.from('recipes').update({ estado_recipe: input.estado, razones_rechazo: input.estado === 'rechazado' ? input.razones : null, comentario_auditoria: input.comentario?.trim() || null }).eq('id_recipe', recipeId).is('eliminado_en', null).select('*').maybeSingle();
    if (error) throw error;
    return data;
};

export const eliminarRecipe = async (client: SupabaseClient, recipeId: string, userId: string) => {
    const { data, error } = await client.from('recipes').update({ eliminado_en: new Date().toISOString(), eliminado_por: userId }).eq('id_recipe', recipeId).eq('estado_recipe', 'pendiente').is('eliminado_en', null).select('id_recipe, archivo_path').maybeSingle();
    if (error) throw error;
    return data;
};
