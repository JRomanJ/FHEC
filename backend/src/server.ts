import express, { Request, Response } from 'express';
import cors from 'cors';
import { userLogger, loginUser } from './authService.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/log', async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;

        await userLogger(email, password);

        res.status(200).json({ success: true, message: 'Usuario registrado exitosamente' });

        // Simulacion de respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Usuario registrado exitosamente en el servidor'
        });
    }catch (error){
        console.error('Error en el registro:', error);
        res.status(500).json({ success: false, message: 'Hubo un error al procesar el registro' });
    }    
});

app.post('/api/login', async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;

        await loginUser(email, password);
        res.status(200).json({ success: true, message: 'Inicio de sesion exitoso'});
    
    }catch (error) {
        res.status(401).json({success: false, message: 'Credenciales invalidas'});
    }
})

// Encender el servidor
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));