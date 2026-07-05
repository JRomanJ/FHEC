# DOMAIN_MODEL - Farmahumana / FHEC

Este documento describe la base de dominio creada para preparar el frontend para mocks centralizados, servicios mock y futura integración con API/backend. No reemplaza todavía los tipos internos del prototipo generado por Figma Make.

## Entidades base

- `Usuario`: cliente o usuario operativo del sistema. Guarda identidad, contacto, preferencias de términos, promociones y notificaciones.
- `Categoria`: agrupación comercial de productos. Puede eliminarse en backend dejando productos con `id_categoria = null`.
- `Producto`: medicamento o producto de farmacia. Incluye principio activo, marca, forma farmacéutica, precio, descuento, nivel de control y estado.
- `Sede`: ubicación física de farmacia. Tiene dirección, coordenadas GPS y estado.
- `PersonalOperativo`: relación entre un usuario y su rol operativo. Puede estar asignado a una sede o a todas si `id_sede` es `null`.
- `Banner`: contenido promocional visible para la experiencia pública o administrativa.

## Entidades transaccionales e históricas

- `Transaccion`: reporte/confirmación de pago. Un pedido puede tener como máximo una transacción.
- `Cupon`: descuento general o exclusivo de usuario, controlado por fechas.
- `InteraccionUsuario`: registro comercial de vistas, búsquedas, favoritos, carrito o compras.
- `Favorito`: producto guardado por usuario con PK compuesta `id_usuario + id_producto`.
- `InventarioSede`: stock disponible por producto y sede.
- `Carrito`: intención de compra por usuario, producto y sede.
- `Pedido`: orden principal, con datos de entrega, facturación, totales, estado, PIN, fechas y reseña.
- `DetallePedido`: línea de producto dentro de un pedido. Los récipes se asocian a este nivel.
- `Recipe`: archivo de récipe asociado a un detalle de pedido.
- `AuditoriaRecipe`: resultado de auditoría de un récipe por personal operativo.
- `PedidoPreparado`: registro histórico de preparación de pedido.
- `EntregaPickup`: registro histórico de entrega en sede.
- `EntregaDelivery`: registro histórico de asignación y entrega por delivery.
- `SolicitudReembolso`: flujo separado para devolver una transacción reportada.
- `CodigoVerificacion`: código temporal para registro, recuperación o cambio de contacto.
- `Notificacion`: mensaje enviado al usuario, leído o no leído.

## Relaciones principales

- `CodigoVerificacion.id_usuario` apunta a `Usuario.id_usuario`, pero puede ser `null` durante registro.
- `Producto.id_categoria` apunta a `Categoria.id_categoria` y puede quedar `null`.
- `Cupon.id_usuario` apunta a `Usuario.id_usuario` o queda `null` si es general.
- `PersonalOperativo.id_usuario` apunta a `Usuario.id_usuario`.
- `PersonalOperativo.id_sede` apunta a `Sede.id_sede` o queda `null` para operar todas las sedes.
- `InventarioSede` une `Producto` y `Sede`.
- `Carrito` une `Usuario`, `Producto` y `Sede`.
- `Pedido` une `Usuario`, `Sede`, opcionalmente `Transaccion` y opcionalmente `Cupon`.
- `DetallePedido` une `Pedido` y `Producto`.
- `Recipe` apunta a `DetallePedido`, no al pedido general.
- `AuditoriaRecipe` apunta a `Recipe` y `PersonalOperativo`.
- `PedidoPreparado`, `EntregaPickup` y `EntregaDelivery` apuntan a `Pedido` y `PersonalOperativo`.
- `SolicitudReembolso` apunta a `Usuario` y `Transaccion`.
- `InteraccionUsuario` apunta a `Usuario` y `Producto`.
- `Favorito` apunta a `Usuario` y `Producto`.
- `Notificacion` apunta a `Usuario`.

## Reglas de negocio importantes

- Productos se inhabilitan, no se eliminan físicamente.
- Personal operativo se inhabilita, no se elimina físicamente.
- Sedes se inhabilitan, no se eliminan físicamente.
- Categorías sí pueden eliminarse; los productos asociados quedan sin categoría.
- Productos inhabilitados no deben mostrarse en catálogo público en fases futuras.
- Sedes inhabilitadas no deben ser seleccionables por clientes, aunque pedidos históricos pueden referenciarlas.
- `nivel_control` define si un producto es normal, requiere récipe digital o requiere récipe digital y físico.
- Productos con récipe digital y físico son pickup obligatorio.
- El stock se maneja por sede usando `stock_disponible`.
- El carrito depende de usuario, producto y sede.
- Un pedido tiene máximo un cupón.
- Un pedido tiene máximo una transacción.
- El pago debe ser exacto. No hay subpagos, pagos incompletos ni pagos de diferencia.
- El reembolso es un flujo separado del pago del pedido.
- Un récipe pertenece a un detalle de pedido.
- La auditoría pertenece a un récipe.
- Un pedido puede terminar con reseña de servicio.
- Cupones no tienen estado; vigencia y desactivación se controlan con `fecha_inicio` y `fecha_fin`.
- Un cupón con `id_usuario = null` es general.
- Un cupón con `id_usuario` definido es exclusivo de usuario.
- No debe haber dos cupones vigentes con el mismo código.
- Una transacción reportada solo puede estar asociada a una solicitud de reembolso.

## Validaciones futuras de backend

- Unicidad de correo de usuario.
- Unicidad condicional de `(codigo_area, telefono)` cuando ambos existan.
- Unicidad condicional de `(tipo_documento_identidad, documento_identidad)` cuando ambos existan.
- Vigencia y unicidad de códigos activos por usuario/contacto/canal/propósito.
- Unicidad de `id_usuario` en `personal_operativo`.
- Unicidad de `id_transaccion` en `pedidos`.
- Unicidad de `id_transaccion` en `solicitudes_reembolso`.
- Unicidad de `id_pedido + id_producto` en `detalle_pedidos`.
- PK compuestas de favoritos, inventario por sede y carrito.
- Validación de stock disponible al concretar pedido.
- Validación de monto exacto de pago.
- Validación de un solo cupón por pedido.
- Validación de que no existan cupones vigentes duplicados por código.

## Validaciones que el frontend puede anticipar

- Ocultar productos inhabilitados en catálogo público cuando los mocks se centralicen.
- Mostrar solo sedes habilitadas como seleccionables.
- Marcar pickup obligatorio para productos con récipe digital y físico.
- Calcular precio con descuento.
- Calcular descuento unitario.
- Mostrar si un cupón está vigente, vencido o es de usuario/general.
- Distinguir pedidos activos, entregados o cancelados.
- Distinguir récipes pendientes, aprobados o rechazados.
- Prevalidar que el monto reportado coincida con el total esperado antes de enviar al backend.

## Archivos de dominio

- `src/domain/types.ts`: interfaces alineadas con tablas.
- `src/domain/enums.ts`: valores cerrados y labels de estados, roles, métodos y tipos.
- `src/domain/constants.ts`: IVA, métodos, documentos, códigos de área, bancos y formas farmacéuticas.
- `src/domain/helpers.ts`: funciones puras de reglas de dominio.
- `src/domain/index.ts`: re-export público de la capa de dominio.

## Alcance actual

Esta fase no conecta todavía `App.tsx`, `src/app/data.ts` ni los componentes generados por Figma Make a la nueva capa de dominio. La siguiente fase debe centralizar datos mock y empezar a mapear los datos existentes hacia estos contratos sin cambiar la interfaz visual.
