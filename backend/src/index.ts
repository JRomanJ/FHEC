import { userLogger, loginUser } from './authService.js';
import { getUserAuth } from './db/usuarios.js'
import { processInventoryEntry } from './db/inventario.js';
import { updateBranchPrice, getBranchByName, createBranch } from './db/sedes.js';
import { getProduct } from './db/productos.js';
import { updateProfileBranch } from './db/perfiles.js';

const productoDePrueba = {
  principio_activo: 'Loratadina',
  marca_comercial: 'Clarityne',
  id_categoria: 'cat-alergias-123', // Definido como varchar en la tabla
  presentacion: 'Jarabe',
  cantidad_presentacion: '120ml',
  descripcion: 'Antihistamínico indicado para el alivio de síntomas alérgicos.',
  imagen_producto: 'https://ejemplo.com/imagenes/clarityne-jarabe.jpg',
  relecancia: 5.0, // Se respeta la escritura exacta de la columna en la BD
  nivel_control: 'Venta libre',
  codigo_barras: '7591040001234' // Campo único utilizado para el onConflict
};

// 2. ID de la sede (debe ser un UUID que exista previamente en la tabla de sedes)
const sedeIdSimulada = '123e4567-e89b-12d3-a456-426614174000';

// Ejemplo de uso
const runSystem = async () => {
    try{
        //REGISTRAR NUEVO USUARIO
        console.log('---Registrando usuario---');
        const newUser = await userLogger('juansalazarre4@gmail.com', 'clave223', 'Nombre Usuario', 'V', '1345983', '+58-0201893', '0286', true, true);
        console.log('Usuario registrado con exito!', newUser);
/*

        //INICIAR SESION
        console.log('\n---Iniciando sesión---');
        const loggedUser = await loginUser('juansalazarre2@gmail.com', 'clave223');
        console.log('Usuario autenticado con exito!', loggedUser);

        //REGISTRAR SEDE
        const sedes = await registrarSede('Farmacia Pzo', 'Calle 123', 831, -62.65);
        const nuevoSedeId = sedes[0].id;
        
        //INGRESAR A INVENTARIO
        procesarIngresoInventario(productoDePrueba, nuevoSedeId)
        .then((respuesta) => {
            console.log('--- PRUEBA EXITOSA ---');
            console.log('El producto fue procesado correctamente con el ID:', respuesta.productoId);
        })
        .catch((error) => {
            console.error('--- ERROR EN LA PRUEBA ---');
            console.error('Detalles del fallo:', error.message);
        });

        //BUSCAR PRODUCTO
        const producto = await buscarProducto(productoDePrueba);

        //ACTUALIZAR PRECIO DE PRODUCTO
        console.log('\n--- Actualizando Precio ---');
        actualizarPrecioSede(producto.id, sedeIdSimulada, 200.777)
        .then((respuesta) => {
            console.log('--- PRUEBA EXITOSA ---');
            console.log('El precio del producto fue modificado correctamente')
        })
        .catch((error) => {
            console.error('--- ERROR EN LA PRUEBA ---');
            console.error('Detalles del fallo: ', error.message);
        });*/
/*
        //OBTENER USUARIO
        const user = await getUserCredentials('juansalazarre1@gmail.com');
        //OBTENER SEDE
        const sede = await obtenerSedePorNombre('Farmacia Pzo');
        
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

    } catch (error) {
        console.error('Error en el sistema:', error);
    }
};
runSystem();