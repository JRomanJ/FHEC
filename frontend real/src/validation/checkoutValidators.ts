import { createValidationResult, isRequired, isValidPhone } from "./commonValidators";

export const validateDeliverySelection = ({
  mode,
  hasPickupOnlyItems,
  selectedSede,
  deliveryAddress,
  receiverName,
  receiverPhoneArea,
  receiverPhone,
}: {
  mode: "delivery" | "pickup";
  hasPickupOnlyItems: boolean;
  selectedSede: string;
  deliveryAddress: string;
  receiverName: string;
  receiverPhoneArea: string;
  receiverPhone: string;
}) =>
  createValidationResult({
    ...(hasPickupOnlyItems && mode === "delivery" ? { mode: "Este pedido requiere retiro en tienda." } : {}),
    ...(mode === "pickup" && !isRequired(selectedSede) ? { selectedSede: "Selecciona una sede de retiro." } : {}),
    ...(mode === "delivery" && !isRequired(deliveryAddress) ? { deliveryAddress: "La dirección de entrega es obligatoria." } : {}),
    ...(!isRequired(receiverName) ? { receiverName: "Completa el nombre del receptor para continuar." } : {}),
    ...(!isRequired(receiverPhoneArea) ? { receiverPhoneArea: "Selecciona el código de área del receptor." } : {}),
    ...(!isRequired(receiverPhone) ? { receiverPhone: "El teléfono del receptor es obligatorio." } : {}),
    ...(isRequired(receiverPhone) && !isValidPhone(receiverPhone) ? { receiverPhone: "Ingresa un teléfono válido." } : {}),
  });
