# OPERATIONAL_VIEW_MODELS - Farmahumana / FHEC

La Fase 6 agrega adaptadores visuales para pedidos, recipes, auditoria, delivery, reembolsos y notificaciones. Estos adaptadores no cambian el modelo de dominio ni la UI aprobada; convierten datos centralizados o metadata legacy al shape exacto que consume `src/app/App.tsx`.

## Archivos creados

- `src/viewModels/orderViewModels.ts`
- `src/viewModels/recipeViewModels.ts`
- `src/viewModels/deliveryViewModels.ts`
- `src/viewModels/refundViewModels.ts`
- `src/viewModels/notificationViewModels.ts`

## Pedidos

View models creados:

- `OrderHistoryViewModel`
- `ActiveOrderViewModel`
- `AdminOrderViewModel`
- `AdminMonitorOrderViewModel`
- `OrderPreparationViewModel`
- `PickupOrderViewModel`
- `DeliveryOrderViewModel`
- `OrderReviewViewModel`
- `OrderDetailLineViewModel`
- `OrderSummaryViewModel`

Adaptadores creados:

- `toOrderHistoryViewModel(pedido)`
- `toActiveOrderViewModel(pedido)`
- `toAdminOrderViewModel(pedido)`
- `toAdminMonitorOrderViewModel(pedido)`
- `toOrderPreparationViewModel(pedido)`
- `toPickupOrderViewModel(pedido)`
- `toDeliveryOrderViewModel(pedido)`
- `toOrderReviewViewModel(pedido)`
- `toOrderDetailLineViewModel(detallePedido)`
- `toOrderSummaryViewModel(pedido)`
- `getLegacyOrderHistoryViewModels()`
- `getLegacyAdminOrderViewModels()`
- `getLegacyAdminMonitorOrderViewModels()`

Relaciones resueltas:

- `pedidos.id_usuario` hacia `usuarios`.
- `pedidos.id_sede` hacia `sedes`.
- `pedidos.id_transaccion` hacia `transacciones`.
- `detalle_pedidos.id_pedido` hacia `pedidos`.
- `detalle_pedidos.id_producto` hacia `productos`.

Metadata visual temporal:

- Los snapshots legacy de historial, operaciones admin y monitor global viven en `orderViewModels.ts` para mantener textos, ids, fechas y columnas exactas del prototipo.
- Los adapters de dominio existen para migracion futura, pero `App.tsx` usa por ahora los getters `getLegacy...`.

## Recipes y auditoria

View models creados:

- `RecipeAuditViewModel`
- `RecipeDetailModalViewModel`
- `RecipeStatusViewModel`
- `RecipeOrderContextViewModel`

Adaptadores creados:

- `toRecipeAuditViewModel(recipe)`
- `toRecipeDetailModalViewModel(recipe)`
- `toRecipeStatusViewModel(recipe)`
- `toRecipeOrderContextViewModel(recipe)`
- `getLegacyRecipeAuditViewModels()`
- `getLegacyPendingRecipeViewModels()`
- `getLegacyAuditedRecipeViewModels()`

Relaciones resueltas:

- `recipes.id_detalle_pedido` hacia `detalle_pedidos`.
- `detalle_pedidos.id_pedido` hacia `pedidos`.
- `detalle_pedidos.id_producto` hacia `productos`.
- `auditoria_recipes.id_recipe` hacia `recipes`.

Metadata visual temporal:

- Las imagenes de recipes siguen siendo `recipe-Maria.jpg`, `recipe-Jose.jpg` y `recipe-Ana.jpg`.
- La lista legacy conserva `ORD-2024-123`, `ORD-2024-124` y `ORD-2024-125` porque esos ids visuales no coinciden todavia con los ids centralizados.

## Delivery

View models creados:

- `DeliveryAvailableOrderViewModel`
- `DeliveryAssignedOrderViewModel`
- `DeliveryCompletedTripViewModel`
- `DeliveryDashboardStatsViewModel`

Adaptadores creados:

- `toDeliveryAvailableOrderViewModel(pedido)`
- `toDeliveryAssignedOrderViewModel(pedido)`
- `toDeliveryCompletedTripViewModel(pedido, entrega)`
- `getLegacyDeliveryAvailableOrderViewModels()`
- `getLegacyDeliveryAssignedOrderViewModels()`
- `getLegacyDeliveryCompletedTripViewModels()`
- `getLegacyDeliveryDashboardStats()`

Relaciones resueltas:

- `entregas_delivery.id_pedido` hacia `pedidos`.
- `pedidos` hacia `detalle_pedidos` y `productos`.
- `entregas_delivery.id_personal_operativo` queda disponible para asignacion futura.

Metadata visual temporal:

- Distancias, notas de entrega y direcciones exactas se preservan como snapshot legacy.
- La regla visual de maximo 3 pedidos activos queda representada en `DeliveryDashboardStatsViewModel`, sin persistencia real.

## Reembolsos

View models creados:

- `RefundProfileViewModel`
- `RefundAdminViewModel`
- `RefundRequestFormViewModel`
- `RefundStatusViewModel`

Adaptadores creados:

- `toRefundProfileViewModel(solicitud)`
- `toRefundAdminViewModel(solicitud)`
- `toRefundRequestFormViewModel()`
- `toRefundStatusViewModel(status)`
- `getLegacyProfileRefundViewModels()`
- `getLegacyAdminRefundViewModels()`

Relaciones resueltas:

- `solicitudes_reembolso.id_transaccion` hacia `transacciones`.
- `solicitudes_reembolso.id_usuario` queda disponible para filtrar perfil.

Metadata visual temporal:

- Perfil usa estados `Pendiente`, `En revision`, `Aprobado`, `Rechazado`.
- Admin usa estados `Pendiente` y `Realizada`.
- El reembolso sigue siendo flujo separado del pago; no hay persistencia real.

## Notificaciones

View models creados:

- `NotificationViewModel`
- `NotificationDropdownViewModel`
- `NotificationPanelViewModel`
- `NotificationBadgeViewModel`

Adaptadores creados:

- `toNotificationViewModel(notificacion)`
- `toNotificationBadgeViewModel(notificaciones)`
- `getLegacyNotificationViewModels()`
- `getLegacyUnreadNotificationCount()`

Relaciones resueltas:

- `notificaciones.id_usuario` queda disponible para filtros futuros.

Metadata visual temporal:

- La lista legacy conserva 7 notificaciones, iconos, tiempos relativos y textos exactos.
- La fuente central puede tener otra cantidad de notificaciones; conectarla directo cambiaria la UI.

## Conexiones hechas en App.tsx

Se reemplazaron estas constantes locales por getters legacy:

- `COMPLETED_TRIPS_DEMO` -> `getLegacyDeliveryCompletedTripViewModels()`
- `ALL_ORDERS` -> `getLegacyDeliveryAvailableOrderViewModels()`
- `DEMO_GLOBAL_ORDERS` -> `getLegacyAdminMonitorOrderViewModels()`
- `DEMO_RECIPES` -> `getLegacyRecipeAuditViewModels()`
- `DEMO_ADMIN_ORDERS` -> `getLegacyAdminOrderViewModels()`
- `DEMO_REFUNDS` -> `getLegacyAdminRefundViewModels()`
- `DEMO_ORDERS` -> `getLegacyOrderHistoryViewModels()`
- `refundRequests` inicial -> `getLegacyProfileRefundViewModels()`
- `NOTIF_DATA` -> `getLegacyNotificationViewModels()`

## Pendiente para modularizacion

- Extraer auth/login y `DEMO_ACCOUNTS`.
- Extraer perfil completo y `DEMO_CONTACT`.
- Extraer asignacion usuario-sede y `USER_SEDE_MAP`.
- Extraer personal operativo/staff y `STAFF_SEDES`.
- Reemplazar snapshots legacy por adapters de dominio cuando existan pruebas visuales o flujo modular por feature.

## Riesgos

- Conectar pedidos reales de `mockPedidos` directo al monitor cambiaria ids, fechas y sedes visibles.
- Conectar recipes reales directo cambiaria ids de orden y estados visibles.
- Conectar notificaciones reales directo cambiaria cantidad y textos.
- Delivery mezcla estado local de asignacion con datos mock; la modularizacion debe conservar la regla de maximo 3 pedidos activos.
