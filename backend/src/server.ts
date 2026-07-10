import express, { Request, Response } from 'express';
import cors from 'cors';
import { loginUser } from './authService.js';
import { userLogger } from './db/usuarios.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/log', async (req: Request, res: Response) => {
    // DEBUG: Ver qué llega realmente desde el frontend
    console.log("Cuerpo recibido:", JSON.stringify(req.body, null, 2));

    try {
        await userLogger(req.body);
        res.status(200).json({ success: true, message: 'Usuario registrado' });
    } catch (error: any) {
        console.error('Error en el registro:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/login', async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;

        const user = await loginUser(email, password);
        res.status(200).json({ success: true, message: 'Inicio de sesion exitoso', data: user});
    
    }catch (error) {
        res.status(401).json({success: false, message: 'Credenciales invalidas'});
    }
})

// Encender el servidor
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));