import { createValidationResult, isNonNegativeInteger, isPercentage, isPositiveNumber, isRequired, isValidEmail } from "./commonValidators";

const hasPositiveNumericValue = (value: unknown) => {
  const number = Number.parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) && number > 0;
};

export const validateAdminProductForm = ({
  name,
  activeIngredient,
  brand,
  presentation,
  price,
  discount,
  concentration,
  units,
}: {
  name?: string;
  activeIngredient?: string;
  brand?: string;
  presentation?: string;
  price?: number;
  discount?: number;
  concentration?: string;
  units?: string;
}) =>
  createValidationResult({
    ...(!isRequired(name) ? { name: "El nombre del producto es obligatorio." } : {}),
    ...(!isRequired(activeIngredient) ? { activeIngredient: "El principio activo es obligatorio." } : {}),
    ...(!isRequired(brand) ? { brand: "La marca comercial es obligatoria." } : {}),
    ...(!isRequired(presentation) ? { presentation: "La forma farmacéutica es obligatoria." } : {}),
    ...(!isPositiveNumber(price) ? { price: "El precio debe ser mayor que cero." } : {}),
    ...(discount !== undefined && !isPercentage(discount) ? { discount: "El descuento debe estar entre 0 y 100." } : {}),
    ...(isRequired(concentration) && !hasPositiveNumericValue(concentration) ? { concentration: "La concentración debe ser positiva." } : {}),
    ...(isRequired(units) && !hasPositiveNumericValue(units) ? { units: "Las unidades deben ser positivas." } : {}),
  });

export const validateInventoryStock = (stock: number) =>
  createValidationResult({
    ...(!isNonNegativeInteger(stock) ? { stock: "El stock debe ser un entero no negativo." } : {}),
  });

export const validateStaffForm = ({
  email,
  role,
  duplicate,
}: {
  email: string;
  role: string;
  duplicate?: boolean;
}) =>
  createValidationResult({
    ...(!isRequired(email) ? { email: "El correo electrónico es obligatorio." } : {}),
    ...(isRequired(email) && !isValidEmail(email) ? { email: "Ingresa un correo válido." } : {}),
    ...(!isRequired(role) ? { role: "El rol operativo es obligatorio." } : {}),
    ...(duplicate ? { duplicate: "Este usuario ya tiene una asignación operativa." } : {}),
  });
