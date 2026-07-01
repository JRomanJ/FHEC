import { supabase, getAuthedClient } from './supabaseClient.js';
import { createProduct} from './productos.js';


export const processInventoryEntry = async(productoData: any, sedeId: string) =>{
    //Avisar a supabase que el administrador esta autenticado
    const supabase = await getAuthedClient();


    const producto = await createProduct(productoData);
    
    const { error: errStock } = await (supabase as any)
        .rpc('incrementar_stock', {
            p_producto_id: producto.id,
            p_sede_id: sedeId
        });
    if (errStock) {
        throw new Error(`Fallo en la actualizacion de inventario: ${errStock.message}`)
    }
    
    return { success: true, productoId: producto.id }
}