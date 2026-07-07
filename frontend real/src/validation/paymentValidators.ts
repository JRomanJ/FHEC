import { createValidationResult, isPositiveNumber, isRequired, isValidPhone } from "./commonValidators";

export const validatePaymentForm = ({
  method,
  bank,
  amountBs,
  reference,
  totalUsd,
  rate,
  phoneArea,
  phone,
  billingName,
  billingDocument,
  billingPhoneArea,
  billingPhone,
  billingAddress,
}: {
  method: "pago_movil" | "transferencia";
  bank: string;
  amountBs: string;
  reference: string;
  totalUsd: number;
  rate: number;
  phoneArea?: string;
  phone?: string;
  billingName: string;
  billingDocument: string;
  billingPhoneArea: string;
  billingPhone: string;
  billingAddress: string;
}) => {
  const paidBs = Number(String(amountBs ?? "").replace(",", "."));
  const paidUsd = Number.isFinite(paidBs) ? +(paidBs / rate).toFixed(2) : 0;
  const diff = Math.abs(+(paidUsd - totalUsd).toFixed(2));
  const threshold = 0.1;

  return createValidationResult({
    ...(!isRequired(bank) ? { bank: "El banco emisor es obligatorio." } : {}),
    ...(!isRequired(amountBs) ? { amount: "Ingresa el monto transferido." } : {}),
    ...(isRequired(amountBs) && !isPositiveNumber(amountBs) ? { amount: "Monto inválido." } : {}),
    ...(isRequired(amountBs) && isPositiveNumber(amountBs) && diff > threshold
      ? { amount: `El monto reportado no coincide con el total del pedido. Debes transferir el monto exacto.` }
      : {}),
    ...(!isRequired(reference) ? { reference: "Ingresa el número de referencia." } : {}),
    ...(method === "pago_movil" && !isRequired(phoneArea) ? { phoneArea: "Selecciona el código de área emisor." } : {}),
    ...(method === "pago_movil" && !isRequired(phone) ? { phone: "El teléfono emisor es obligatorio." } : {}),
    ...(method === "pago_movil" && isRequired(phone) && !isValidPhone(phone) ? { phone: "Ingresa un teléfono emisor válido." } : {}),
    ...(!isRequired(billingName) ? { billingName: "El nombre de facturación es obligatorio." } : {}),
    ...(!isRequired(billingDocument) ? { billingDocument: "El documento fiscal es obligatorio." } : {}),
    ...(!isRequired(billingPhoneArea) ? { billingPhoneArea: "Selecciona el código de área de facturación." } : {}),
    ...(!isRequired(billingPhone) ? { billingPhone: "El teléfono de facturación es obligatorio." } : {}),
    ...(isRequired(billingPhone) && !isValidPhone(billingPhone) ? { billingPhone: "Ingresa un teléfono de facturación válido." } : {}),
    ...(!isRequired(billingAddress) ? { billingAddress: "La dirección fiscal es obligatoria." } : {}),
  });
};
