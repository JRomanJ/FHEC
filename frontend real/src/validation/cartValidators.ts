import { createValidationResult, isNonNegativeInteger } from "./commonValidators";

export const validateCartCanContinue = ({ itemCount }: { itemCount: number }) =>
  createValidationResult({
    ...(itemCount <= 0 ? { cart: "El carrito está vacío." } : {}),
  });

export const validateCartItemQuantity = ({ quantity, stock }: { quantity: number; stock?: number }) =>
  createValidationResult({
    ...(!isNonNegativeInteger(quantity) || quantity <= 0 ? { quantity: "La cantidad debe ser mayor que cero." } : {}),
    ...(typeof stock === "number" && quantity > stock ? { stock: "El stock disponible no es suficiente." } : {}),
  });
