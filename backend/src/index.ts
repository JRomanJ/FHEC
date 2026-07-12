import { userLogger } from './db/usuarios.js';
import { loginUser } from './authService.js';
import { findUserAuth, findUserByCedula } from './db/usuarios.js'
import { processInventoryEntry } from './db/inventario.js';
import { updateBranchPrice, getBranchByName, createBranch } from './db/sedes.js';
import { findProduct } from './db/productos.js';
import { insertRole, assingnRole } from './db/roles.js';
import { supabase } from './db/supabaseClient.js';
import { cargarTodoEnSede } from './db/cargarProductosdePrueba.js';
import { getProducosWithFilters } from './db/inventario.js';



// 2. ID de la sede (debe ser un UUID que exista previamente en la tabla de sedes)
const sedeIdSimulada = '123e4567-e89b-12d3-a456-426614174000';

// Ejemplo de uso
const runSystem = async () => {
    try{
        //REGISTRAR NUEVO USUARIO
        console.log('---Registrando usuario---');
        const newUser = await userLogger({
            email: 'anatorres@gmail.com',
            password: 'clave123',
            nombre_completo: 'Ana Torres',
            tipo_documento_identidad: 'V',
            documento_identidad: '21346234',
            telefono: '+58-0201893',
            codigo_area: '0286',
            acepta_terminos: true,
            acepta_promociones: true,
            acepta_promociones_sms: true,
            acepta_promociones_correo: true,
            acepta_notificaciones: true,
            acepta_notificaciones_sms: true,
            acepta_notificaciones_correo: true
        });
        //await userLogger('carlosvega@gmail.com', 'clave123', 'Carlos Vega', 'V', '32145897', '+58-0201893', '0286', true, true, true, true, true, true, true);
        console.log('Usuario registrado con exito!', newUser);


        //INICIAR SESION
        console.log('\n---Iniciando sesión---');
        const loggedUser = await loginUser('anatorres@gmail.com', 'clave123');
        console.log('Usuario autenticado con exito!', loggedUser);
        
        //REGISTRAR SEDE
        /*const sedes = await createBranch('Farmacia San Felix', 'Calle 321', 840, -72.65);
        const nuevoSedeId = sedes[0].id;*/
        //OBTENER SEDE
        //const sede = await getBranchByName('Farmacia Pzo');
        
        //PROCESAR PRODUCTOS DE PRUEBA
        //console.log('\n--- Cargando productos de prueba ---');
        //await cargarTodoEnSede(sede.id);

       /* const filtros = {
            //principio_activo: 'Amox', // Buscará todo lo que contenga "Amox"
            //categoria: 'alergias',
            principio_activo: 'Loratadina'
        }

        // Llamada a la función ensambladora
        const productos = await getProducosWithFilters(sede.id, filtros);

        console.log('--- Inventario en Sede ---');

        // O un formato más detallado
        productos.forEach(p => {
            console.log(`--- ${p.marca_comercial} (${p.concentracion}) ---`);
            console.log(`Stock: ${p.stock_disponible} | Precio: ${p.precio_usd}$`);
            console.log(`ID: ${p.id_producto}`);
        });*/
        /*
        
        if (!user || !sede) {
            console.error("No se pudo encontrar el usuario o la sede. Verifica los datos.");
            return;
        }

        //ACTUALIZAR SEDE DE PERFIL
        console.log('\n--- Actualizando Sede de Perfil ---');
        
        cambiarSedePerfil(user.id, sede.id)
        .then((respuesta) => {
            console.log('--- PRUEBA EXITOSA ---');
            console.log('La sede de su perfil ha sido modificada correctamente')
        })
        .catch((error) => {
            console.error('--- ERROR EN LA PRUEBA ---');
            console.error('Detalles del fallo: ', error.message);
        });
*/
        //REGISTRAR ROL
        /*console.log('\n--- Registrando Rol ---');
        await insertRole('cliente');
        await insertRole('repartidor');
        await insertRole('auxiliar');
        await insertRole('auditor');
        await insertRole('admin');
        await insertRole('super_admin');
        console.log('Rol registrado con exito!');*/

        //BUSCAR USUARIO POR CEDULA Y ASIGNAR ROL
        /*console.log('\n--- Asignando Rol a Usuario ---');
        const user = await findUserByCedula('V', '32145897');
        if (!user){
            console.error("No se pudo encontrar el usuario. Verifica los datos.");
            return;
        }
        await assingnRole(user.id, 'auditor');*/
        


    } catch (error) {
        console.error('Error en el sistema:', error);
    }
};
runSystem();