import { createValidationResult, isRequired, isValidEmail, isValidPhone, normalizeText } from "./commonValidators";

export const validateLoginForm = ({ email, password }: { email: string; password: string }) =>
  createValidationResult({
    ...(!isRequired(email) ? { email: "El correo electrónico es obligatorio." } : {}),
    ...(isRequired(email) && !isValidEmail(email) ? { email: "Ingresa un correo válido." } : {}),
    ...(!isRequired(password) ? { password: "La contraseña es obligatoria." } : {}),
  });

export const validateRegisterForm = ({
  name,
  email,
  phone,
  phoneArea,
  password,
  confirmPassword,
  acceptTerms,
}: {
  name: string;
  email: string;
  phone?: string;
  phoneArea?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}) =>
  createValidationResult({
    ...(!isRequired(name) ? { name: "El nombre completo es obligatorio." } : {}),
    ...(!isRequired(email) ? { email: "El correo electrónico es obligatorio." } : {}),
    ...(isRequired(email) && !isValidEmail(email) ? { email: "Ingresa un correo válido." } : {}),
    ...(isRequired(phone) && !isRequired(phoneArea) ? { phoneArea: "Selecciona el código de área." } : {}),
    ...(isRequired(phone) && !isValidPhone(phone) ? { phone: "Ingresa un teléfono válido." } : {}),
    ...(normalizeText(password).length < 8 ? { password: "La contraseña debe tener al menos 8 caracteres." } : {}),
    ...(password !== confirmPassword ? { confirmPassword: "Las contraseñas no coinciden." } : {}),
    ...(!acceptTerms ? { acceptTerms: "Debes aceptar los términos y condiciones." } : {}),
  });

export const validateRecoveryContact = ({
  mode,
  email,
  phone,
  phoneArea,
}: {
  mode: "email" | "phone";
  email: string;
  phone: string;
  phoneArea: string;
}) =>
  createValidationResult(
    mode === "email"
      ? {
          ...(!isRequired(email) ? { email: "El correo electrónico es obligatorio." } : {}),
          ...(isRequired(email) && !isValidEmail(email) ? { email: "Ingresa un correo válido." } : {}),
        }
      : {
          ...(!isRequired(phoneArea) ? { phoneArea: "Selecciona el código de área." } : {}),
          ...(!isRequired(phone) ? { phone: "El teléfono es obligatorio." } : {}),
          ...(isRequired(phone) && !isValidPhone(phone) ? { phone: "Ingresa un teléfono válido." } : {}),
        },
  );

export const validateOtpCode = (code: string, length = 6) =>
  createValidationResult({
    ...(normalizeText(code).replace(/\s/g, "").length < length ? { code: "Ingresa el código completo." } : {}),
  });
