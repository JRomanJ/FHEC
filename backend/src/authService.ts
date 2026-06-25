import bcrypt from 'bcryptjs';
import { insertUser, getUserCredentials } from './dataAdapter.js';

export const userLogger = async (email: string, password: string, rol: string, nombre: string,  cedula: string, telefono: string) => {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await insertUser(email, passwordHash, rol, nombre, cedula, telefono);
    return newUser;
};

export const loginUser = async (email: string, plainPassword: string) => {
    
    const user = await getUserCredentials(email);
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(plainPassword, user.password_hash);
    
    if (!isValidPassword) {
        throw new Error('Invalid credentials');
    }
    return user;
};