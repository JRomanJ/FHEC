import {
  createValidationResult,
  isPercentage,
  isRequired,
  isValidDateRange,
  isValidEmail,
  normalizeCouponCode,
} from "./commonValidators";

export const validateCouponCodeInput = (code: string) =>
  createValidationResult({
    ...(!isRequired(normalizeCouponCode(code)) ? { code: "Ingresa un código de cupón." } : {}),
  });

export const validateAdminCouponForm = ({
  code,
  discount,
  startDate,
  endDate,
  userEmail,
  duplicateActive,
}: {
  code: string;
  discount: number;
  startDate: string;
  endDate: string;
  userEmail?: string;
  duplicateActive?: boolean;
}) =>
  createValidationResult({
    ...(!isRequired(normalizeCouponCode(code)) ? { code: "El código del cupón es obligatorio." } : {}),
    ...(!isPercentage(discount) || discount <= 0 ? { discount: "El descuento debe estar entre 1 y 100." } : {}),
    ...(!isRequired(startDate) ? { startDate: "La fecha de inicio es obligatoria." } : {}),
    ...(!isRequired(endDate) ? { endDate: "La fecha de fin es obligatoria." } : {}),
    ...(isRequired(startDate) && isRequired(endDate) && !isValidDateRange(startDate, endDate)
      ? { endDate: "La fecha de fin debe ser posterior o igual a la fecha de inicio." }
      : {}),
    ...(userEmail && !isValidEmail(userEmail) ? { userEmail: "Ingresa un correo de usuario válido." } : {}),
    ...(duplicateActive ? { duplicateActive: "Ya existe un cupón vigente con este código." } : {}),
  });
