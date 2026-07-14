import { createValidationResult, isRequired, isValidEmail, isValidPhone } from "./commonValidators";

export const validateProfileInfo = ({ name, document }: { name: string; document: string }) =>
  createValidationResult({
    ...(!isRequired(name) ? { name: "El nombre completo es obligatorio." } : {}),
    ...(!isRequired(document) ? { document: "El documento es obligatorio." } : {}),
  });

export const validateProfileEmail = (email: string) =>
  createValidationResult({
    ...(!isRequired(email) ? { email: "El correo electrónico es obligatorio." } : {}),
    ...(isRequired(email) && !isValidEmail(email) ? { email: "Ingresa un correo válido." } : {}),
  });

export const validateProfilePhone = ({ areaCode, phone }: { areaCode: string; phone: string }) =>
  createValidationResult({
    ...(!isRequired(areaCode) ? { areaCode: "Selecciona el código de área." } : {}),
    ...(!isRequired(phone) ? { phone: "El teléfono es obligatorio." } : {}),
    ...(isRequired(phone) && !isValidPhone(phone) ? { phone: "Ingresa un teléfono válido." } : {}),
  });
