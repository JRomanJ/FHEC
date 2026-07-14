import { createValidationResult } from "./commonValidators";

export const validateRecipeUploads = <T extends { id: number }>({
  requiredProducts,
  files,
}: {
  requiredProducts: T[];
  files: Record<number, File | null>;
}) =>
  createValidationResult({
    ...(requiredProducts.some(product => !files[product.id])
      ? { recipe: "Este producto requiere récipe médico." }
      : {}),
  });
