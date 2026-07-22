import type { SupabaseClient } from '@supabase/supabase-js';

export interface CrearPedidoInput {
    pedido: Record<string, unknown>;
    items: Array<{ id_inventario: string; cantidad: number }>;
    ttlMinutes?: number;
}

const ORDER_COLUMNS = 'id_pedido, id_usuario, id_sede, id_transaccion, metodo_entrega, nombre_receptor, codigo_area_receptor, telefono_receptor, direccion_entrega, coordenadas_entrega, nombre_factura, codigo_area_factura, telefono_factura, tipo_documento_fiscal, documento_fiscal, direccion_fiscal, codigo_cupon, subtotal, iva, costo_entrega, descuento_aplicado, total_pedido, tasa_bcv, estado_pedido, fecha_creacion, fecha_limite, fecha_completado, fecha_expiracion, stock_restaurado';

const throwDbError = (message: string, error: { message: string; code?: string }): never => {
    const statusByCode: Record<string, number> = { '22023': 400, '23505': 409, '23514': 409, '42501': 403, P0002: 404 };
    throw Object.assign(new Error(`${message}: ${error.message}`), { status: statusByCode[error.code ?? ''] ?? 500, code: error.code });
};

export const crearPedido = async (client: SupabaseClient, input: CrearPedidoInput) => {
    const { data, error } = await client.rpc('fhec_crear_pedido_20260722', {
        p_pedido: input.pedido,
        p_items: input.items,
        p_ttl_minutes: input.ttlMinutes ?? 15,
    });
    if (error) throwDbError('No se pudo crear el pedido', error);
    return data as { pedido: Record<string, unknown>; detalles: Array<Record<string, unknown>> };
};

export const expirarPedidos = async (adminClient: SupabaseClient) => {
    const { data, error } = await adminClient.rpc('fhec_expirar_pedidos_20260722');
    if (error) throwDbError('No se pudieron expirar los pedidos', error);
    return Number(data ?? 0);
};

export const listarPedidos = async (client: SupabaseClient, userId?: string) => {
    let query = client.from('pedidos').select(`${ORDER_COLUMNS}, detalles_pedidos(*), entregas_delivery(*), entregas_pickup(*)`).order('fecha_creacion', { ascending: false });
    if (userId) query = query.eq('id_usuario', userId);
    const { data, error } = await query;
    if (error) throwDbError('No se pudieron consultar los pedidos', error);
    return data ?? [];
};

export const obtenerPedido = async (client: SupabaseClient, orderId: string) => {
    const { data, error } = await client.from('pedidos').select(`${ORDER_COLUMNS}, detalles_pedidos(*), entregas_delivery(*), entregas_pickup(*)`).eq('id_pedido', orderId).maybeSingle();
    if (error) throwDbError('No se pudo consultar el pedido', error);
    return data;
};

export const confirmarPagoPedido = async (client: SupabaseClient, orderId: string, payment: Record<string, unknown>) => {
    const { data, error } = await client.rpc('fhec_confirmar_transaccion_20260722', { p_id_pedido: orderId, p_pago: payment });
    if (error) throwDbError('No se pudo confirmar el pago', error);
    return data as { pedido: Record<string, unknown>; transaccion: Record<string, unknown> };
};
