import { apiClient } from "./apiService";

export const registerUser = async (userData: any) => {
  try {
    const response = await apiClient("/log", userData);
    return response.data;
  } catch (error) {
    console.error("Error en la peticion de registro:", error);
    return { success: false, message: (error as Error).message || "No se pudo conectar con el servidor"};
  } 
}



//Pruebas con mock de login y logout
/*import { DEMO_ACCOUNTS } from "../data";

export function validarCredencialesMock(correo: string, password: string) {
  const normalized = correo.trim().toLowerCase();
  return (
    DEMO_ACCOUNTS.find(
      (account) => account.email.toLowerCase() === normalized && account.password === password,
    ) ?? null
  );
}

export function loginMock(correo: string, password: string) {
  const user = validarCredencialesMock(correo, password);
  if (!user) return null;

  const { password: _password, ...authUser } = user;
  return authUser;
}

export function logoutMock() {
  return true;
}*/
