import { DEMO_ACCOUNTS } from "../data";

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
}
