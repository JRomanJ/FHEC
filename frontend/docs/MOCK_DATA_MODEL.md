# MOCK_DATA_MODEL - Farmahumana / FHEC

La fuente mock centralizada vive en `src/data`. Estos archivos no implementan backend ni llamadas reales a API; preparan contratos consistentes para la siguiente fase.

## Ubicacion

- `src/data/mockCategorias.ts`: categorias base y metadata visual temporal.
- `src/data/mockSedes.ts`: sedes en formato de base de datos y metadata para compatibilidad UI.
- `src/data/mockProductos.ts`: productos alineados con `Producto` y metadata visual separada.
- `src/data/mockInventarioSedes.ts`: stock disponible por producto y sede.
- `src/data/mockUsuarios.ts`: usuarios demo.
- `src/data/mockPersonalOperativo.ts`: roles operativos por usuario.
- `src/data/mockCupones.ts`: cupones generales, de usuario, vigentes y vencidos.
- `src/data/mockCarritos.ts`: carrito por usuario, producto y sede.
- `src/data/mockPedidos.ts`: pedidos en estados principales.
- `src/data/mockDetallePedidos.ts`: lineas de pedido por producto.
- `src/data/mockRecipes.ts`: recipes asociados a detalle de pedido.
- `src/data/mockAuditoriaRecipes.ts`: auditoria asociada a recipe.
- `src/data/mockTransacciones.ts`: pagos exactos mock.
- `src/data/mockSolicitudesReembolso.ts`: solicitudes de reembolso.
- `src/data/mockEntregas.ts`: preparacion y entregas.
- `src/data/mockNotificaciones.ts`: notificaciones por usuario.
- `src/data/mockBanners.ts`: banners con imagen plana.
- `src/data/selectors.ts`: funciones puras de consulta.
- `src/data/adapters.ts`: adaptadores temporales para formatos legacy.
- `src/data/viewModels.ts`: tipos auxiliares de vista.
- `src/data/index.ts`: re-export general.

## Relacion general

- `Producto.id_categoria` conecta con `Categoria.id_categoria`.
- `InventarioSede` conecta `Producto` y `Sede` y es la fuente de stock.
- `Carrito` conecta usuario, producto y sede.
- `Pedido` conecta usuario, sede, transaccion opcional y cupon opcional.
- `DetallePedido` conecta pedido y producto.
- `Recipe` conecta con `DetallePedido`, no con pedido directo.
- `AuditoriaRecipe` conecta con `Recipe` y `PersonalOperativo`.
- `EntregaDelivery`, `EntregaPickup` y `PedidoPreparado` conectan pedido y personal operativo.
- `SolicitudReembolso` conecta usuario y transaccion.
- `Notificacion` conecta usuario y tipo de notificacion.

## Stock por sede

El stock se calcula desde `mockInventarioSedes`, no desde un campo global del producto.

Funciones relevantes:

- `getInventarioProductoEnSede(id_producto, id_sede)`
- `getStockDisponible(id_producto, id_sede)`
- `getProductosDisponiblesPorSede(id_sede)`

Los adaptadores legacy calculan `stock` como suma total y `stockSedes` como `{ principal, clinica }` solo para mantener compatibilidad con componentes actuales.

## Productos similares

Los productos similares se calculan por `principio_activo`:

- `getProductosSimilares(id_producto, id_sede?)`

Si se pasa sede, la funcion solo devuelve productos similares con stock disponible en esa sede.

## Cupones

Los cupones no tienen estado persistido.

- Vigente o vencido se deriva con `fecha_inicio` y `fecha_fin`.
- General: `id_usuario === null`.
- De usuario: `id_usuario !== null`.

Funciones relevantes:

- `getCupones()`
- `getCuponesGenerales(fechaReferencia?)`
- `getCuponesDeUsuario(id_usuario)`
- `getCuponByCodigo(codigo)`

## Pedidos y detalles

`mockPedidos` contiene el encabezado transaccional. `mockDetallePedidos` contiene lineas de producto.

Funciones relevantes:

- `getPedidosByUsuario(id_usuario)`
- `getPedidoActivoByUsuario(id_usuario)`
- `getDetallesByPedido(id_pedido)`
- `getPedidosPorPreparar()`
- `getPedidosSinRepartidor()`
- `getPedidosAsignadosARepartidor(id_personal_operativo)`

## Recipes y auditoria

`mockRecipes` se asocia a `id_detalle_pedido`. La auditoria se asocia a `id_recipe`.

Funciones relevantes:

- `getRecipesByPedido(id_pedido)`
- `getRecipesPendientes()`
- `getAuditoriaByRecipe(id_recipe)`

## Adaptadores legacy

`src/data/adapters.ts` mantiene formatos usados por el prototipo generado:

- `PRODUCTS`
- `CATS`
- `SEDES`
- `SEDES_LIST`
- `DEMO_ACCOUNTS`
- `DEMO_CONTACT`
- `DEMO_ORDERS`
- `DEMO_GLOBAL_ORDERS`
- `DISCOUNT_CODES`
- `NOTIF_DATA`
- `DEFAULT_SLIDES`
- `STATUS_COLORS`

Estos exports se consumen desde los puentes:

- `src/app/data.ts`
- `src/app/shared.ts`

## Reemplazo futuro por API

La futura capa de servicios mock/API debe reemplazar progresivamente cada archivo `mock*.ts` por funciones equivalentes:

- Listar categorias.
- Listar productos por sede.
- Obtener inventario por sede.
- Obtener carrito de usuario.
- Crear pedido.
- Adjuntar recipes a detalles.
- Auditar recipes.
- Confirmar transaccion exacta.
- Solicitar reembolso.
- Leer notificaciones.

Los componentes no deberian depender directamente de arrays mock en fases futuras. La ruta recomendada es:

1. Mantener `src/data/selectors.ts` como contrato de lectura local.
2. Crear servicios mock con la misma forma de respuesta.
3. Sustituir internamente datos locales por llamadas de servicio.
4. Reemplazar servicios mock por API real cuando backend este disponible.

## Pendiente intencional

`src/app/App.tsx` todavia contiene mocks inline. No se migraron en esta fase para evitar tocar el prototipo visual aprobado. La siguiente fase debe centralizar esos datos o conectar `App.tsx` a los puentes de forma incremental, validando build y paridad visual en cada paso.
