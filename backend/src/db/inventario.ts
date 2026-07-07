import { supabase, getAuthedClient } from './supabaseClient.js';
import { createProduct} from './productos.js';


export const processInventoryEntry = async (productoData: any, sedeId: string) => {
    const supabase = await getAuthedClient();

    // Crear o actualizar el producto (gracias al UPSERT que configuramos antes)
    const producto = await createProduct(productoData);
    
    // Delegar toda la lógica de inventario a la función SQL
    const { error: errStock } = await (supabase as any)
        .rpc('incrementar_stock', {
            p_producto_id: producto.id,
            p_sede_id: sedeId
        });

    if (errStock) {
        throw new Error(`Fallo en la actualización de inventario: ${errStock.message}`);
    }
    
    return { success: true, productoId: producto.id };
}
//Crear Query para obtener inventario de una sede especifica
export const getBaseInventoryQuery =  (sedeId: string) => {
    return supabase
        .from('inventario')
        .select(`id, stock_disponible, precio_usd, productos!inner(*)`)
        .eq('id_sede', sedeId)
}
//Filtros de productos
const applyFilterPrincipioActivo = (query: any, principio_activo?: string) => {
    if (!principio_activo) return query;
    return query.ilike('productos.principio_activo', `%${principio_activo}%`);
}
const applyFilterMarcaComercial = (query: any, marca_comercial?: string) => {
    if (!marca_comercial) return query;
    return query.ilike('productos.marca_comercial', `%${marca_comercial}%`);
}
const applyFilterCategoria = (query: any, categoria?: string) => {
    if(!categoria) return query;
    return query.eq('productos.id_categoria', categoria);
}
export const getProducosWithFilters = async (sedeId: string, filtros: any = {}) => {
        
    let query = getBaseInventoryQuery(sedeId);

    //Aplicar filtros si excisten
    query = applyFilterPrincipioActivo(query, filtros.principio_activo);
    query = applyFilterMarcaComercial(query, filtros.marca_comercial);
    query = applyFilterCategoria(query, filtros.categoria);
    
    const result = await query;
    if(result.error) throw result.error;
    return result.data.map((item: any) => {
        const p = item.productos || {}; // Objeto de la tabla productos
        return {
            id_inventario: item.id,
            stock_disponible: item.stock_disponible,
            precio_usd: item.precio_usd,
            // Campos de la tabla productos
            id_producto: p.id,
            principio_activo: p.principio_activo,
            marca_comercial: p.marca_comercial,
            id_categoria: p.id_categoria,
            forma_farmaceutica: p.forma_farmaceutica,
            cantidad_presentacion: p.cantidad_presentacion,
            descripcion: p.descripcion,
            imagen_producto: p.imagen_producto,
            nivel_control: p.nivel_control,
            codigo_barras: p.codigo_barras,
            concentracion: p.concentracion,
            relevancia: p.relevancia
        };
    });
}