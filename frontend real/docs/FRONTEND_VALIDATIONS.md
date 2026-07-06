# Validaciones frontend ligeras

Fecha de actualizacion: 2026-07-06.

Este documento registra las validaciones frontend agregadas en la fase 17. Son validaciones de apoyo visual para evitar entradas claramente invalidas en el prototipo modularizado. No sustituyen la validacion definitiva del backend.

## Alcance

Se agrego la carpeta `src/validation/` con funciones puras de TypeScript, sin dependencias de React y sin librerias externas.

Archivos creados:

- `src/validation/commonValidators.ts`
- `src/validation/authValidators.ts`
- `src/validation/profileValidators.ts`
- `src/validation/cartValidators.ts`
- `src/validation/checkoutValidators.ts`
- `src/validation/paymentValidators.ts`
- `src/validation/recipeValidators.ts`
- `src/validation/couponValidators.ts`
- `src/validation/adminValidators.ts`
- `src/validation/refundValidators.ts`
- `src/validation/index.ts`

## Validadores comunes

Se agregaron helpers reutilizables para:

- campo requerido;
- correo con formato basico;
- telefono con formato basico;
- numero positivo;
- entero no negativo;
- porcentaje entre 0 y 100;
- rango de fechas valido;
- normalizacion de texto;
- normalizacion de codigos de cupon;
- comparacion de monto exacto con tolerancia decimal.

## Formularios cubiertos

Auth y registro:

- login valida correo requerido, formato de correo y contrasena requerida;
- registro valida nombre, correo, contrasena minima, confirmacion y terminos aceptados;
- recuperacion valida correo o telefono segun modo;
- OTP/PIN valida longitud minima del codigo visual.

Perfil:

- datos personales validan nombre y documento;
- cambio de correo valida formato antes de abrir OTP;
- cambio de telefono valida codigo de area y telefono antes de abrir OTP;
- seguridad conserva la validacion existente de contrasena;
- solicitud de reembolso valida transaccion, monto, fecha y datos bancarios segun metodo.

Carrito y cupones:

- no se permite avanzar con carrito vacio;
- cantidades deben ser mayores que cero;
- stock por sede se valida antes de continuar;
- cupon en carrito/checkout exige codigo no vacio, normalizado en mayusculas;
- cupon inexistente o no vigente muestra error visual existente;
- cupon admin valida codigo, descuento, fechas, correo opcional y duplicado vigente.

Checkout y entrega:

- metodo de entrega debe ser compatible con productos pickup obligatorio;
- pickup requiere sede seleccionada;
- delivery requiere direccion;
- receptor requiere nombre, codigo de area y telefono valido.

Pago:

- metodo de pago conserva el flujo visual existente;
- banco, referencia y monto son obligatorios;
- pago movil requiere telefono emisor;
- facturacion requiere nombre, documento, telefono y direccion fiscal;
- el monto reportado debe coincidir con el total del pedido;
- no se agregaron pagos parciales, subpagos ni pagos de diferencia.

Recipes:

- productos con recipe digital requieren archivo cargado visualmente;
- productos con recipe digital y fisico mantienen aviso de recipe fisico y tambien requieren foto de referencia;
- no se implemento subida real ni storage.

Admin:

- producto valida nombre, principio activo, marca, forma farmaceutica, precio, descuento y valores numericos opcionales;
- inventario valida stock entero no negativo;
- personal operativo valida correo, rol y evita duplicado visual de usuario operativo;
- cupones usan las validaciones de cupon admin.

## Responsabilidad del backend

Estas validaciones no sustituyen reglas reales de servidor. El backend/API debe validar de forma definitiva:

- identidad y autenticacion;
- permisos por rol;
- existencia y estado real de productos, sedes, usuarios, cupones y pedidos;
- stock disponible por sede;
- vigencia y asignacion real de cupones;
- unicidad de cupon vigente por codigo;
- exactitud de pagos y transacciones;
- asociacion de recipes a detalle de pedido;
- auditoria real de recipes;
- reembolsos y estados administrativos;
- persistencia de cambios.

## Restricciones respetadas

- No se implemento backend real.
- No se agrego Supabase.
- No se agrego API real.
- No se agrego `fetch`.
- No se agrego persistencia real.
- No se instalaron dependencias.
- No se cambio el diseno visual aprobado.

## Recomendacion

Cuando se conecte backend, mantener el flujo:

```text
UI Feature -> ViewModel/Adapter -> Service -> API/Backend -> DB
```

Las validaciones frontend deben quedar como apoyo visual. Las reglas criticas del negocio deben vivir y ejecutarse tambien en backend.
