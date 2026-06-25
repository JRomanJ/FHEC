import { useState } from 'react';
import { apiClient } from './apiService';

export const TestComms = () => {
    const [message, setMessage] = useState<string>('');

    const handleLogin = async () => {
        try{
            const response = await apiClient('/login', { 
                email: 'prueba2@correo.com',
                password: 'clave123'
            });

            setMessage(JSON.stringify(response));

            if (response.success) {
                console.log('Exito:', response.data);
            }else{
                alert('! ' + response.message);
            }
        }catch (error){
            alert('Error critico: No se pudo conectar con el servidor.');
            console.error(error);
        }
    
    };

    const handleLogg = async () => {
        try{
            const response = await apiClient('/log', {
                //Datos que recibira el backend
                email: "prueba2@correo.com",
                password: "clave123", 
                rol: "user", 
                nombre: "Carlos",
                cedula: "12345193", 
                telefono: "+58-0001023"
            });
            setMessage(JSON.stringify(response));

            if(response.success) {
                console.log('Exito: ', response.data);
            }else {
                alert("!" + response.message);
            }
        }catch (error){
            alert('Error critico: No se pudo conectar con el servidor.');
            console.error(error);
        }

    }

    return (
        <div>   
            <button style={{ color: 'black' }} onClick={handleLogin}>Probar Loggin</button>
            <button style={{ color: 'black' }} onClick={handleLogg}>Probar Registro</button>
            <p>Respuesta del servidor: {message}</p>
        </div>
    );
    
}
