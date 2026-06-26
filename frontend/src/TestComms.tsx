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
                correo: "prueba2@correo.com",
                password: "clave123",
                nombre_completo: "Carlos", 
                tipo_documento_identidad: "V",
                documento_identidad: "153451923",
                acepta_terminos: true,
                acepta_promociones: true, 
                telefono: "+58-0208023",
                codigo_area: "0286"                
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
