# Plan: Correcciones visuales y funcionales — Farmahumana

## Contexto
El usuario entregó un documento con las correcciones finales a realizar antes de pasar a desarrollo real. El objetivo es alinear el prototipo con el flujo real del negocio sin rediseñar la app, sin backend real y sin reestructuración responsive profunda. Se conserva la identidad visual actual.

**Archivos principales a modificar:**
- `src/app/App.tsx` — monolítico (~6600 líneas), contiene casi todo
- `src/app/components/LoginPageComponent.tsx` — login/registro
- `src/app/components/ProductCard.tsx` — tarjetas de producto

---

## Grupo 1 — General: Teléfono y Documento en campos separados

**Aplica en:** registro, perfil, facturación en checkout, RefundForm, formulario de reembolso en perfil, datos bancarios.

**Patrón:** Reemplazar cada input de teléfono por dos inputs `grid-cols-[auto_1fr]`:
```tsx
<input placeholder="+58" className="w-20 ..." />   // código de área
<input placeholder="412-1234567" type="tel" ... />  // número
```
Reemplazar cada input de cédula/doc por dos inputs `grid-cols-[auto_1fr]`:
```tsx
<select>  // tipo: V, E, J, P, G
<input placeholder="12345678" ... />
```

Ubicaciones concretas:
- **Registro** (`LoginPage` view="register"): campo `regPhone` → split en `regPhoneCode` + `regPhoneNum`; campo `regCedula` → split en `regDocType` + `regDocNum` (ya es select+input, solo ordenar lado a lado)
- **Checkout billing card**: `billPhone` → split; `billCedula` → split en tipo+número
- **RefundForm**: campos `cedula` y `phone` → split ambos
- **ProfilePage**: campos de edición de cédula y teléfono → split
- **Facturación en OrderCompletePage** (si existe): aplicar mismo patrón

---

## Grupo 2 — Tarjetas de producto

**Archivo:** `src/app/components/ProductCard.tsx` (líneas ~122-172) y la definición en `App.tsx` (líneas ~136+).

**Problema actual:** El descuento aparece dos veces — un ribbon en la esquina y un badge inline junto al precio.

**Cambios:**
1. Eliminar el badge de descuento que aparece junto al precio (mantener solo el ribbon superior)
2. Mover el ribbon de descuento a la zona inferior de la card (debajo del bloque de precio), reservando la zona superior para etiquetas de récipe/control
3. Cambiar la etiqueta "Uso controlado" (`controlledSubstance`) a color rojo (`bg-red-100 text-red-700` o similar), igual que la etiqueta de récipe
4. Asegurar que en la zona superior de la card solo aparezcan etiquetas de récipe y control; el descuento va abajo/separado

---

## Grupo 3 — Inicio de sesión

**Archivo:** `src/app/App.tsx` (función `LoginPage`, ~línea 3926) y `src/app/components/LoginPageComponent.tsx`.

### 3a. Label del campo de email
- Cambiar `"Correo electrónico y/o Número Telefónico"` → `"Correo electrónico"`

### 3b. Flujo de recuperación de contraseña (fpStep)
**Problema:** En `fpStep === "enterCode"`, el OtpInput existe pero se describe que no se ve el campo. Revisar que esté visualmente claro y accesible.

**Cambios en `fpStep === "sendCode"`:**
- El campo actual acepta "correo o teléfono". Cambiar a que por defecto pida **correo electrónico**
- Agregar un enlace pequeño debajo del campo: `"Ingresar número de teléfono"` que alterna el modo a `fpMode: "email" | "phone"`
- Cuando `fpMode === "phone"`: mostrar dos campos (código de área + número) en lugar del campo único

### 3c. Registrar cuenta — eliminar teléfono
- Eliminar el campo `regPhone` / `regPhoneCode` / `regPhoneNum` del formulario de registro
- El OTP se envía únicamente al correo
- Eliminar toda lógica de `otpPhase === "phone"` en el flujo de registro (ya que no hay teléfono al registrar)
- Asegurar que el modal OTP muestre claramente el campo `OtpInput` (ya existe, verificar que sea visible)

---

## Grupo 4 — Detalle de producto

**Archivo:** `src/app/components/ProductDetailPage.tsx` (o la definición en `App.tsx`, ~línea 1278+).

- Eliminar completamente la sección "Comprados Frecuentemente Juntos" (líneas ~329-408 en ProductDetailPage.tsx)
- Mantener la sección "Equivalentes (Mismo principio activo)" / "Productos similares"

---

## Grupo 5 — Carrito: validación de stock por sede

**Archivo:** `App.tsx`, función `CartPage` (~línea 1496+) y `handleProcesar`.

**Lógica a agregar en `handleProcesar`:**
```
Antes de navegar a deliverySelect:
- Para cada item en cartItems, comparar item.quantity con stock disponible en la sede seleccionada (stockSedes[checkoutSede] ?? item.product.stock)
- Si algún item supera el stock disponible → mostrar modal centrado de alerta
```

**Modal de stock insuficiente:**
- Título: `"No hay suficientes unidades disponibles de [nombre del producto]"`
- Subtítulo: `"Recomendamos reemplazar las unidades restantes con los siguientes productos:"`
- Carrusel pequeño de productos de la misma categoría
- Botones: `"Ver productos similares"` → navega a catálogo con esa categoría; `"Seguir en el carrito"` → cierra modal y ajusta cantidad al stock disponible automáticamente
- Al cerrar (cualquier opción), las unidades excedentes se descuentan del carrito automáticamente (`Math.min(item.quantity, stockDisponible)`)
- Estado: `const [stockModal, setStockModal] = useState<{product: Product; available: number} | null>(null)`

---

## Grupo 6 — Pago: eliminar flujos de pago incompleto

**Eliminar completamente de `App.tsx`:**
- `alreadyPaid` prop en `CheckoutPage`
- `remaining` variable en `CheckoutPage`
- Bloque `{alreadyPaid > 0 && <> ... </>}` en el resumen del sidebar
- La lógica de `diff < -THRESH` (underpayment) en `handleConfirm` — solo debe proceder si el monto es exacto o ligeramente mayor (overpayment muestra refund)
- `orderPaidAmount` state en App
- Pasar `paidAmount` a TrackingPage
- En TrackingPage: eliminar `underTimer`, `underExpired`, `showRefundModal`, `orderCancelled` states y toda su UI asociada (`hasUnderpayment`, la tarjeta de "Pago Incompleto", el modal de reembolso de pago incompleto)
- El placeholder del monto en checkout debe usar `fmtVES(total)` en vez de `fmtVES(remaining)`
- `RefundForm` puede mantenerse para la sección de Solicitudes de Reembolso (Grupo 11) pero debe desacoplarse del flujo de pago

**El flujo de pago simplificado:**
```
paidUSD ≈ total (exact) → onClearCart(total) → onNav("tracking")
paidUSD > total + THRESH → showOverRefund modal → onNav("tracking")
paidUSD < total - THRESH → mostrar error "El monto no coincide con el total del pedido"
```

---

## Grupo 7 — Mi Perfil: reorganización completa

**Archivo:** `App.tsx`, función `ProfilePage` (~línea 5970+).

**Estructura nueva (tabs en sidebar):**

| Tab | Contenido |
|-----|-----------|
| Información personal | Nombre completo, Tipo+Número doc, Dirección fiscal — editable sin verificación |
| Correo electrónico | Correo actual + botón "Editar" → campo nuevo correo + OTP visible |
| Número de teléfono | Teléfono actual (código área + número) + botón "Editar" → campos nuevos + OTP visible |
| Notificaciones | 6 switches (ver abajo) |
| Solicitudes de reembolso | Tabla + modal nueva solicitud |
| Historial de pedidos | (solo clientes, igual que ahora) |
| Seguridad | Cambio de contraseña (igual que ahora) |

**Switches de notificaciones (6):**
1. Notificaciones promocionales (activo/inactivo)
2. Promociones por SMS
3. Promociones por correo
4. Notificaciones generales de pedidos
5. Notificaciones generales por SMS
6. Notificaciones generales por correo

Implementar con `useState<Record<string,boolean>>` inicializado en `true` para todos.
UI: `<label className="flex items-center justify-between ..."><span>...</span><toggle/></label>`
Toggle: div estilizado con `bg-[#179150]`/`bg-muted` y bolita blanca animada con `translate-x`.

**Sección "Solicitudes de reembolso" (cliente):**
- Tabla: Método transferencia reportada, Banco emisor, Referencia bancaria, Monto, Estado
- Botón "Nueva solicitud de reembolso" → modal dividido en dos bloques:
  - **Bloque 1 — Datos de la transacción:** Método de pago (select: Pago Móvil/Transferencia), Banco emisor, Código de área + Teléfono, Tipo doc + Número doc, Referencia bancaria, Monto, Fecha
  - **Bloque 2 — Datos para el reembolso:** Método de reembolso, Banco, Código de área + Teléfono, Tipo doc + Número doc, Nombre del titular, Número de cuenta
  - Botón "Enviar solicitud de reembolso"

Estado demo:
```tsx
const [refunds, setRefunds] = useState([
  { id: 1, method: "Pago Móvil", bank: "Banesco", ref: "00291847362", amount: 34.75, status: "Pendiente" },
]);
```

---

## Grupo 8 — Panel de reparto

**Archivo:** `App.tsx`, función `DeliveryPanel` (~línea 3504+).

### 8a. Tercera pestaña "Viajes completados"
- Añadir tab `"completed"` al estado `activeTab`
- Tabla con columnas: N° de pedido, Fecha, Cliente, Sede, Costo de envío
- Datos demo: usar `myTripOrders` completados (los que pasan por el flujo de PIN exitoso se agregan a un array `completedTrips`)
- Filtros: Fecha desde, Fecha hasta, Sede — state `completedFilters`
- Total acumulado de costos de envío filtrados al pie

### 8b. Eliminar botón "Asignarme" pequeño de la fila
- Líneas ~3749-3755 en el card header: remover el botón `"Asignarme"` de la fila
- Mantener solo el botón `"Asignarme a este pedido"` dentro del panel expandido (líneas ~3804-3810)

### 8c. Límite de 3 pedidos activos
- En `handleAssignOrder`: verificar `myTrips.length >= 3` antes de asignar
- Si se supera, mostrar modal centrado con mensaje: `"No puedes seleccionar más de 3 pedidos al mismo tiempo"`
- Estado: `const [showMaxTripsModal, setShowMaxTripsModal] = useState(false)`

---

## Grupo 9 — Admin Operaciones: "Listo para delivery" sin PIN

**Archivo:** `App.tsx`, tab `activeTab === "auxiliar"`, modal de detalle de pedido (~línea 5811+).

**Cambio:** Para órdenes con `status === "Listo para delivery"`, no mostrar el input de PIN ni el botón "Despachar Pedido".

En su lugar, mostrar únicamente:
```tsx
<button onClick={() => { /* marcar como En tránsito */ }}>
  Confirmar entrega al repartidor
</button>
```

Esto equivale a cambiar el status a `"En tránsito"` sin requerir PIN. El PIN se usa para el cliente final, no para entregar al repartidor.

---

## Grupo 10 — Admin Catálogo: campos y tabla

**Archivo:** `App.tsx`, SuperadminModules `superTab === "catalogo"` (~línea 4942+).

### Formulario de producto — eliminar:
- `presentation` (Presentación)
- `packSize` (Tamaño del empaque)
- `needsRecipe` checkbox
- `controlledSubstance` checkbox

### Formulario de producto — agregar/cambiar:
- `controlLevel` selector: `"ninguno" | "recipeDigital" | "recipesFisico"` con opciones "Ninguno", "Requiere récipe digital", "Requiere récipe en físico"
- `concentration` (Concentración) — input de texto
- `concentrationUnit` (Unidad de concentración) — input de texto o select (mg, g, ml, UI, etc.)
- `units` (Unidades) — input número
- `pharmaceuticalForm` (Forma farmacéutica) — input de texto

Mantener: nombre, marca, categoría, principio activo, descripción, imagen, precio, descuento, relevancia, colores.

### Tabla del catálogo — columnas:
`["Nombre / Marca", "Categoría", "Forma farmacéutica", "Nivel de control", "Relevancia", "Precio", "Descuento", "Acciones"]`

### Opciones de ordenamiento:
Agregar select: `"Relevancia" | "Precio" | "Descuento"` que ordena `filteredCat`.

### Actualizar tipo `Product` e inicialización:
```tsx
interface Product {
  // ... existing fields
  controlLevel?: "ninguno" | "recipeDigital" | "recipeFisico";
  concentration?: string;
  concentrationUnit?: string;
  units?: number;
  pharmaceuticalForm?: string;
  // mantener needsRecipe y controlledSubstance para compatibilidad retroactiva
}
```
Mapeo de compatibilidad: `controlLevel === "recipeDigital"` → `needsRecipe = true`; `"recipeFisico"` → `controlledSubstance = true`.

---

## Grupo 11 — Admin Inventario: solo stock

**Archivo:** `App.tsx`, función `InventarioTab` (~línea 4472+).

**Eliminar de la tabla y del estado `rows`:** `priceUSD`, `discount`, `rating`

**Mantener:** `stock` por sede

**Tabla simplificada — columnas:**
`["Producto", "Marca", "Categoría", "Forma farmacéutica", "Stock disponible", ""]`

El botón "Guardar" solo actualiza `stockSedes[sede]`.

---

## Grupo 12 — Admin Personal operativo

**Archivo:** `App.tsx`, `superTab === "personal"` (~línea 5121+).

### Renombrar:
- Título `"Gestor de Personal"` → `"Personal Operativo"`
- Botón `"Nuevo empleado"` → `"Añadir personal operativo"`

### Tabla — columnas:
`["Nombre completo", "Correo", "Tipo/N° Documento", "Rol", "Sede", "⋮"]`
- Eliminar columnas "Alta" y "Acción" como columnas principales
- El botón ⋮ (o ícono de lápiz) abre el formulario de edición

### Formulario modal — simplificar:
- Eliminar: Nombre completo, Cédula, Contraseña provisional
- Mantener/agregar: Correo electrónico (del usuario existente), Rol (select, un solo rol), Sede
- Cada persona tiene un solo rol operativo (cambiar de multi-checkbox a select)

### Tipo sede — una sede o "Todas las sedes"

---

## Grupo 13 — Admin Monitor: costo de envío

**Archivo:** `App.tsx`, `superTab === "monitor"` (~línea 5262+).

### DEMO_GLOBAL_ORDERS — agregar campo `shippingCost`:
```tsx
{ id: "ORD-2024-301", ..., shippingCost: 2.50 }
// Para Pickup o cancelados: shippingCost: 0
```

### Tabla — nueva columna `"Costo de envío"` antes de `"Estado"`:
Mostrar `fmtUSD(o.shippingCost)` o `"—"` si es 0.

### Footer — añadir debajo del total filtrado:
```
Total costo de envío filtrado: $X.XX
```

---

## Grupo 14 — Admin: Nueva sección "Cupones promocionales"

**Archivo:** `App.tsx`, SuperadminModules.

### Agregar tab:
- Tipo: `type SuperTab = "... | "cupones"`
- Label: `"Cupones Promocionales"`, ícono: `<Tag size={14} />`

### Datos demo:
```tsx
const [coupons, setCoupons] = useState([
  { id: 1, code: "FHEC10", discount: 10, from: "2024-01-01", to: "2024-12-31" },
  { id: 2, code: "SALUD15", discount: 15, from: "2024-06-01", to: "2024-08-31" },
]);
```

### Tabla: Código, Descuento (%), Fecha inicio, Fecha fin, Acciones (Editar, Eliminar)

### Modal (añadir/editar): Código del cupón, Descuento (%), Fecha inicio, Fecha fin

---

## Grupo 15 — Admin: Nueva sección "Solicitudes de reembolso"

**Archivo:** `App.tsx`, SuperadminModules.

### Agregar tab:
- Tipo: `"reembolsos"`
- Label: `"Solicitudes de Reembolso"`, ícono: `<CreditCard size={14} />`

### Datos demo:
```tsx
const DEMO_REFUNDS = [
  { id: 1, method: "Pago Móvil", bank: "Banesco", ref: "00291847362", amount: 34.75, status: "Pendiente", ... },
];
```

### Tabla (similar visual a Operaciones):
`["Método de transf.", "Banco emisor", "Referencia", "Monto", "Estado", "Ver detalles"]`

### Modal de detalle (al pulsar "Ver detalles"):
- **Bloque 1 — Datos de la transacción reportada:** Método, Banco emisor, Código área + Teléfono, Tipo doc + Número doc, Referencia, Monto, Fecha
- **Bloque 2 — Datos para el reembolso:** Método de reembolso, Banco, Código área + Teléfono, Tipo doc + Número doc, Nombre titular, N° cuenta
- Botón `"Confirmar reembolso"` → cambia `status: "Pendiente"` → `"Realizada"`

---

## Orden de implementación

1. Grupo 6 (eliminar pagos incompletos) — limpia complejidad
2. Grupo 2 (tarjetas de producto)
3. Grupo 3 (login/registro)
4. Grupo 4 (detalle de producto)
5. Grupo 5 (carrito: modal de stock)
6. Grupo 1 (campos tel/doc split) — aplicar en todos los formularios ya limpios
7. Grupo 7 (perfil: reorganización completa)
8. Grupo 8 (panel de reparto)
9. Grupo 9 (operaciones: listo para delivery)
10. Grupos 10–11 (catálogo + inventario)
11. Grupos 12–13 (personal + monitor)
12. Grupos 14–15 (cupones + reembolsos admin)

---

## Verificación

- Flujo completo de compra (carrito → entrega → tracking → pago exacto) sin errores
- Tarjeta de producto: una sola etiqueta de descuento, control en rojo
- Login/Registro: campo dice "Correo", forgot-password muestra input de PIN, registro sin teléfono
- Detalle de producto: no aparece "Comprados frecuentemente juntos"
- Carrito: si stock insuficiente muestra modal y ajusta cantidades
- TrackingPage: sin secciones de pago incompleto ni timers de underpayment
- Checkout: solo acepta monto exacto (con tolerancia), sin "Ya pagado / Pendiente"
- Perfil: tabs nuevos visibles, switches de notificaciones funcionan, formulario de reembolso abre
- DeliveryPanel: 3 tabs, sin botón "Asignarme" en fila, límite 3 activos con modal
- Operaciones: "Listo para delivery" no pide PIN
- Catálogo admin: selector "Nivel de control", sin checkboxes, tabla con nuevas columnas
- Inventario: solo columna stock, sin precio/descuento/relevancia
- Monitor: columna y total de costo de envío
- Cupones y Solicitudes de reembolso: aparecen como tabs en el panel de administración
