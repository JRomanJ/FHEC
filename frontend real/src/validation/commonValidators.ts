export type ValidationErrors = Record<string, string>;

export type ValidationResult = {
  valid: boolean;
  errors: ValidationErrors;
};

export const normalizeText = (value: unknown) => String(value ?? "").trim();

export const normalizeCouponCode = (value: unknown) => normalizeText(value).toUpperCase();

export const isRequired = (value: unknown) => normalizeText(value).length > 0;

export const isValidEmail = (email: unknown) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeText(email));

export const isValidPhone = (phone: unknown) => {
  const digits = normalizeText(phone).replace(/\D/g, "");
  return digits.length >= 7;
};

export const isPositiveNumber = (value: unknown) => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(num) && num > 0;
};

export const isNonNegativeInteger = (value: unknown) => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isInteger(num) && num >= 0;
};

export const isPercentage = (value: unknown) => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) && num >= 0 && num <= 100;
};

export const isValidDateRange = (start: unknown, end: unknown) => {
  const startValue = normalizeText(start);
  const endValue = normalizeText(end);
  if (!startValue || !endValue) return false;
  return endValue >= startValue;
};

export const hasExactAmount = (reported: unknown, expected: number, tolerance = 0.01) => {
  const amount = typeof reported === "number" ? reported : Number(String(reported ?? "").replace(",", "."));
  return Number.isFinite(amount) && Math.abs(amount - expected) <= tolerance;
};

export const createValidationResult = (errors: ValidationErrors): ValidationResult => ({
  valid: Object.keys(errors).length === 0,
  errors,
});

export const firstError = (result: ValidationResult, fallback = "Revisa los datos ingresados.") =>
  Object.values(result.errors)[0] ?? fallback;
