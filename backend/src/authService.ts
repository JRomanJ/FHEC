import bcrypt from 'bcryptjs';
import { insertUser, getUserCredentials } from './dataAdapter.js';

export const userLogger = async (correo: string, password: string, nombre_completo: string, tipo_documento_identidad: string, documento_identidad: string, telefono: string, codigo_area: string, acepta_terminos: boolean, acepta_promociones: boolean) => {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await insertUser(correo, passwordHash, nombre_completo, tipo_documento_identidad, documento_identidad, telefono, codigo_area, acepta_terminos, acepta_promociones);
    return newUser;
};

export const loginUser = async (correo: string, plainPassword: string) => {
    
    const user = await getUserCredentials(correo);
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(plainPassword, user.password_hash);
    
    if (!isValidPassword) {
        throw new Error('Invalid credentials');
    }
    return user;
};