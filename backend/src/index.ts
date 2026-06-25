import { userLogger, loginUser } from './authService.js';

// Ejemplo de uso
const runSystem = async () => {
    try{
        //Registrar un nuevo usuario
        console.log('---Registrando usuario---');
        const newUser = await userLogger('prueba1@correo.com', 'clave123', 'user', 'nombre', '12345183', '+58-0201023');
        console.log('Usuario registrado con exito!', newUser);


        //Iniciar sesion con el usuario registrado
        console.log('\n---Iniciando sesión---');
        const loggedUser = await loginUser('prueba1@correo.com', 'clave123');
        console.log('Usuario autenticado con exito!', loggedUser);

    } catch (error) {
        console.error('Error en el sistema:', error);
    }
};
runSystem();