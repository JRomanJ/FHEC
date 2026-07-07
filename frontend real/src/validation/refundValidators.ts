import { createValidationResult, isPositiveNumber, isRequired, isValidPhone } from "./commonValidators";

export const validateRefundTransactionStep = ({
  method,
  bank,
  phoneArea,
  phone,
  reference,
  amount,
  date,
}: {
  method: string;
  bank: string;
  phoneArea: string;
  phone: string;
  reference: string;
  amount: string;
  date: string;
}) =>
  createValidationResult({
    ...(!isRequired(method) ? { method: "Selecciona el método de pago realizado." } : {}),
    ...(!isRequired(bank) ? { bank: "El banco emisor es obligatorio." } : {}),
    ...(method === "Pago Móvil" && !isRequired(phoneArea) ? { phoneArea: "Selecciona el código de área." } : {}),
    ...(method === "Pago Móvil" && !isRequired(phone) ? { phone: "El teléfono es obligatorio." } : {}),
    ...(method === "Pago Móvil" && isRequired(phone) && !isValidPhone(phone) ? { phone: "Ingresa un teléfono válido." } : {}),
    ...(!isRequired(reference) ? { reference: "La referencia bancaria es obligatoria." } : {}),
    ...(!isRequired(amount) ? { amount: "El monto es obligatorio." } : {}),
    ...(isRequired(amount) && !isPositiveNumber(amount) ? { amount: "El monto debe ser mayor que cero." } : {}),
    ...(!isRequired(date) ? { date: "La fecha de transacción es obligatoria." } : {}),
  });

export const validateRefundDestinationStep = ({
  method,
  bank,
  phoneArea,
  phone,
  document,
  holder,
  account,
}: {
  method: string;
  bank: string;
  phoneArea: string;
  phone: string;
  document: string;
  holder: string;
  account: string;
}) =>
  createValidationResult({
    ...(!isRequired(method) ? { method: "Selecciona el método de reembolso." } : {}),
    ...(!isRequired(bank) ? { bank: "El banco receptor es obligatorio." } : {}),
    ...(!isRequired(document) ? { document: "El documento es obligatorio." } : {}),
    ...(method === "Pago Móvil" && !isRequired(phoneArea) ? { phoneArea: "Selecciona el código de área." } : {}),
    ...(method === "Pago Móvil" && !isRequired(phone) ? { phone: "El teléfono es obligatorio." } : {}),
    ...(method === "Pago Móvil" && isRequired(phone) && !isValidPhone(phone) ? { phone: "Ingresa un teléfono válido." } : {}),
    ...(method === "Transferencia" && !isRequired(account) ? { account: "El número de cuenta es obligatorio." } : {}),
    ...(method === "Transferencia" && !isRequired(holder) ? { holder: "El nombre del beneficiario es obligatorio." } : {}),
  });
