Claro. Te lo dejo en formato más simple, estilo texto plano, listo para copiar y pegar:

```text
Necesito realizar una última corrección visual y funcional del prototipo de Farmahumana. El objetivo es alinear la interfaz con el flujo real del negocio y con el modelo de datos definitivo, sin rediseñar toda la aplicación desde cero.

Conserva la identidad visual actual, colores, estilo general, cards, navegación, estructura visual y jerarquía de la página. No rehagas el diseño completo. Solo corrige, elimina o agrega las secciones indicadas.

No implementes backend real. Mantén datos mock si hace falta, pero evita crear flujos visuales que contradigan la lógica final del sistema.

No hagas una reestructuración responsive profunda ni intentes rehacer todo el diseño móvil. Solo procura que los cambios visuales nuevos no rompan el diseño actual en escritorio ni en móvil. Los ajustes responsive detallados se harán después en desarrollo.

EN GENERAL

- En todos los lugares donde se solicite un número telefónico, el campo debe dividirse en dos campos separados: Código de área y Número telefónico. Por ejemplo, el código de área puede ser +58, +502, etc. Deben aparecer uno al lado del otro cuando haya espacio suficiente.

- En todos los lugares donde se solicite documento de identidad, cédula o documento fiscal, el campo debe dividirse en dos campos separados: Tipo de documento y Número de documento. También deben aparecer uno al lado del otro cuando haya espacio suficiente.

- Esto aplica en perfil, facturación, datos de receptor, pagos, solicitudes de reembolso, datos bancarios y cualquier otro formulario donde aparezca teléfono o documento.

TARJETAS DE PRODUCTOS

- Corrige las tarjetas de producto. Actualmente aparece más de una etiqueta de descuento. Debe existir una sola etiqueta de descuento.

- Elimina la etiqueta de descuento que aparece junto al precio. Deja una sola etiqueta de descuento ubicada visualmente en la parte inferior de la tarjeta o separada del precio, de forma que las etiquetas superiores queden reservadas para récipe o control del producto.

- La etiqueta de “Uso controlado” debe mostrarse en rojo, igual que la etiqueta de récipe.

- En resumen: etiquetas de récipe/control arriba, descuento una sola vez abajo o separado del precio, y no duplicar descuentos.

INICIO DE SESIÓN

- En la pantalla de inicio de sesión, cambia el texto del campo “Correo electrónico y/o Número Telefónico” por “Correo electrónico”.

- El inicio de sesión debe visualizarse como permitido únicamente mediante correo electrónico.

- En recuperación de contraseña, corrige el flujo visual del PIN. Actualmente aparece una tarjeta indicando que ya se envió el PIN, pero no aparece ningún campo para ingresarlo. Debe mostrarse claramente un campo para introducir el PIN recibido.

- En recuperación de contraseña, primero debe pedirse el correo electrónico. Debajo del campo de correo debe aparecer una opción pequeña tipo enlace que diga “Ingresar número de teléfono”.

- Al pulsar “Ingresar número de teléfono”, visualmente debe cambiar el formulario para permitir recuperar la contraseña con teléfono, usando dos campos: Código de área y Número telefónico.

- El objetivo es que el usuario pueda recuperar contraseña por correo o por teléfono, pero cada método debe tener su formulario correcto.

REGISTRAR CUENTA

- En la pantalla de registro, elimina el campo de número telefónico.

- El registro inicial debe pedir solo los datos necesarios para crear la cuenta por correo. El número telefónico se agregará después desde el perfil del usuario.

- Corrige también el flujo visual del PIN en el registro. Cuando se envía el PIN al correo electrónico, debe mostrarse claramente el campo para introducir el PIN recibido. No debe aparecer una tarjeta de “PIN enviado” sin campo de entrada.

DETALLE DE PRODUCTO

- En la pantalla de detalle de producto, elimina por completo el carrusel de “Comprados frecuentemente juntos”.

- Debe quedar únicamente el carrusel de “Productos similares”.

- El detalle del producto debe seguir mostrando correctamente precio, stock por sede, nivel de control, descripción e información principal.

CARRITO DE COMPRAS

- Corrige el flujo visual cuando el usuario intenta procesar una compra y no hay suficiente stock en la sede seleccionada.

- Si al presionar “Procesar compra” hay un producto cuya cantidad en el carrito supera la disponibilidad de la sede seleccionada, debe aparecer una alerta modal centrada en pantalla.

- La alerta debe decir: “No hay suficientes unidades disponibles de [nombre del producto]”.

- Debajo debe aparecer este subtítulo: “Recomendamos reemplazar las unidades restantes con los siguientes productos:”.

- Luego debe mostrarse un carrusel pequeño de productos similares.

- Abajo deben aparecer dos botones: “Ver productos similares” y “Seguir en el carrito”.

- Cuando el usuario seleccione cualquiera de las dos opciones, visualmente debe entenderse que las unidades no disponibles se descuentan del carrito y queda solo la cantidad disponible. No debe permitirse avanzar con más unidades de las disponibles en la sede.

MI PEDIDO Y PAGOS

- Elimina completamente todo lo relacionado con pagos incompletos, subpagos, pagos de diferencia, pago restante, diferencia pendiente, flujos para completar pago después y mensajes que sugieran que el pedido puede avanzar con un monto menor al total.

- En la sección de métodos de pago, el sistema debe visualizarse como que acepta únicamente transacciones con monto exacto.

- Si se muestra alguna validación visual del pago, debe indicar que el monto reportado debe coincidir exactamente con el total del pedido.

- No mezcles el flujo de pago del pedido con el flujo de solicitudes de reembolso. El reembolso será una sección aparte en el perfil del cliente y en el panel administrativo.

MI PERFIL

- Reorganiza la pantalla de perfil del cliente.

- Debe existir una sección llamada “Información personal”. Esta sección debe permitir editar sin verificación los siguientes datos: Nombre completo, Tipo de documento, Número de documento y Dirección fiscal.

- No mezcles correo ni teléfono dentro de la sección de información personal general.

- Agrega una sección separada llamada “Correo electrónico”. Debe mostrar el correo actual y una opción para editarlo.

- Cuando el usuario edite el correo, debe aparecer visualmente una verificación por PIN enviado al nuevo correo electrónico. Debe existir un campo visible para ingresar el PIN.

- Agrega una sección separada llamada “Número de teléfono”. Debe mostrar el teléfono actual y una opción para editarlo.

- Al editar el número de teléfono, debe pedir Código de área y Número telefónico. Luego debe aparecer visualmente una verificación por PIN enviado al nuevo número. Debe existir un campo visible para ingresar el PIN.

- Agrega una nueva sección llamada “Notificaciones”.

- Dentro de la sección de Notificaciones debe haber 6 switches:
  1. Activar/desactivar notificaciones promocionales.
  2. Activar/desactivar promociones por SMS.
  3. Activar/desactivar promociones por correo.
  4. Activar/desactivar notificaciones generales de pedidos.
  5. Activar/desactivar notificaciones generales por SMS.
  6. Activar/desactivar notificaciones generales por correo.

- Estos switches deben verse como opciones claras, no como texto suelto.

- Agrega una nueva sección en el perfil llamada “Solicitudes de reembolso”.

- Esta sección debe mostrar una tabla con las solicitudes realizadas por el usuario.

- La tabla debe tener estas columnas: Método de la transferencia reportada, Banco emisor de la transferencia reportada, Referencia bancaria, Monto y Estado de la solicitud.

- Debe existir un botón llamado “Nueva solicitud de reembolso”.

- Al presionar “Nueva solicitud de reembolso”, debe abrirse un formulario modal centrado en pantalla dividido en dos partes.

- Primera parte: “Datos de la transacción realizada”. Debe tener estos campos: Método de pago, Banco emisor, Código de área, Número telefónico, Tipo de documento, Número de documento, Referencia bancaria, Monto y Fecha.

- Segunda parte: “Datos bancarios para el reembolso”. Debe tener estos campos: Método de reembolso, Banco donde recibirá el reembolso, Código de área, Número telefónico, Tipo de documento, Número de documento, Nombre del titular y Número de cuenta.

- Abajo debe aparecer el botón “Enviar solicitud de reembolso”.

- El formulario debe verse como una solicitud independiente, no como parte del pago de un pedido.

PANEL DE REPARTO

- En el panel de repartidor, agrega una tercera sección llamada “Viajes completados”.

- Esta sección debe mostrar una tabla con: Número de pedido, Fecha del pedido, Cliente, Sede y Costo de envío.

- Debajo de la tabla debe aparecer el total acumulado de los costos de envío filtrados.

- Agrega filtros para esta tabla: Fecha desde, Fecha hasta y Sede.

- En la sección “Pedidos disponibles”, elimina el botón pequeño “Asignarme” que aparece en la fila junto a “Ver detalles”.

- Debe quedar únicamente el botón grande de asignación dentro del detalle del pedido.

- Agrega una advertencia modal centrada cuando el repartidor intente asignarse más de 3 pedidos activos. El mensaje debe decir claramente que no puede seleccionar más de 3 pedidos al mismo tiempo.

PANEL DE ADMINISTRACIÓN - OPERACIONES

- En la sección de operaciones, cuando se abre el detalle de un pedido en estado “Listo para delivery”, no debe pedirse PIN.

- En ese caso, debe aparecer únicamente la opción “Confirmar entrega al repartidor”.

- Ese flujo representa que la farmacia entrega el pedido preparado al repartidor. El PIN se usa después para la entrega al cliente, no para entregar el pedido al repartidor.

PANEL DE ADMINISTRACIÓN - CATÁLOGO DE PRODUCTOS

- Corrige la sección de catálogo de productos para que coincida con los datos reales del producto.

- Al añadir o editar un producto, elimina las cajitas de selección “Requiere récipe” y “Sustancia controlada”.

- En su lugar debe existir un campo tipo selector llamado “Nivel de control”.

- El selector “Nivel de control” debe tener tres opciones: “Ninguno”, “Requiere récipe digital” y “Requiere récipe en físico”.

- En el formulario de producto deben aparecer estas características: Nombre del producto, Marca comercial, Categoría, Principio activo, Forma farmacéutica, Concentración, Unidad de concentración, Unidades, Descripción, Imagen del producto, Nivel de control, Precio, Descuento y Relevancia.

- Elimina de este formulario “Presentación” y “Tamaño del empaque”.

- La tabla de catálogo debe mostrar estas columnas: Nombre / marca, Categoría, Forma farmacéutica, Nivel de control, Relevancia, Precio y Descuento.

- Los filtros u opciones de ordenamiento del catálogo administrativo deben permitir ordenar por Relevancia, Precio y Descuento.

PANEL DE ADMINISTRACIÓN - INVENTARIO

- Corrige la sección de inventario para que sea exclusivamente de stock por sede.

- Elimina de inventario Precio, Descuento y Relevancia.

- Esto debe eliminarse tanto de la tabla como del formulario de edición.

- La sección de inventario puede mostrar datos descriptivos del producto, como nombre, marca, categoría o forma farmacéutica, pero solo debe permitir modificar Sede y Stock disponible.

- No debe permitir editar precio, descuento ni relevancia desde inventario. Eso pertenece al catálogo.

PANEL DE ADMINISTRACIÓN - PERSONAL OPERATIVO

- Cambia el nombre de la sección o entidad de “Empleado” a “Personal operativo”.

- El personal operativo representa usuarios registrados que reciben un rol operativo dentro del sistema.

- En la tabla, elimina las columnas “Alta” y “Acción” como datos principales.

- Si necesitas mantener una forma de editar, usa un botón o ícono discreto para abrir el detalle, pero no como columna de datos relevante.

- La tabla sí puede mostrar Nombre completo, Correo, Documento de identidad, Rol y Sede.

- Al añadir o editar personal operativo, no pidas Nombre completo, Cédula ni Contraseña provisional.

- La cuenta del usuario ya debe existir previamente. Para asignarlo como personal operativo solo debe pedirse Correo electrónico del usuario, Rol y Sede.

- Cada persona puede tener un solo rol operativo.

- La sede debe ser una sola sede asignada, o una opción visual tipo “Todas las sedes” para cargos que operan globalmente.

PANEL DE ADMINISTRACIÓN - MONITOR GENERAL

- En la tabla del Monitor General, agrega una columna para “Costo de envío”.

- Además del total filtrado de ventas/pedidos, abajo debe aparecer también “Total costo de envío filtrado”.

- Ese total debe sumar visualmente los costos de envío de los pedidos que estén dentro del filtro actual.

PANEL DE ADMINISTRACIÓN - CUPONES PROMOCIONALES

- Agrega una nueva sección administrativa llamada “Cupones promocionales”.

- Debe mostrar una tabla con los cupones registrados.

- La tabla debe tener estas columnas: Código del cupón, Descuento aplicado, Fecha de inicio y Fecha de fin.

- Debe permitir visualmente Añadir cupón, Editar cupón y Eliminar cupón.

- Al añadir o editar un cupón, el formulario debe permitir modificar Código del cupón, Descuento aplicado, Fecha de inicio y Fecha de fin.

PANEL DE ADMINISTRACIÓN - SOLICITUDES DE REEMBOLSO

- Agrega una nueva sección administrativa llamada “Solicitudes de reembolso”.

- Esta sección debe parecerse visualmente a la sección de “Operaciones”, especialmente en la forma de mostrar tabla y detalle modal.

- Debe mostrar una tabla con todas las solicitudes de reembolso realizadas.

- La tabla debe tener estas columnas: Método de la transferencia reportada, Banco emisor de la transferencia reportada, Referencia bancaria, Monto, Estado de la solicitud y Ver detalles.

- Al abrir “Ver detalles”, debe aparecer un modal centrado con dos bloques de información.

- Primer bloque: “Datos de la transacción reportada”. Debe mostrar Método de pago, Banco emisor, Código de área, Número telefónico, Tipo de documento, Número de documento, Referencia bancaria, Monto y Fecha.

- Segundo bloque: “Datos bancarios para el reembolso”. Debe mostrar Método de reembolso, Banco, Código de área, Número telefónico, Tipo de documento, Número de documento, Nombre del titular y Número de cuenta.

- Abajo debe aparecer un botón “Confirmar reembolso”.

- Cuando se pulse “Confirmar reembolso”, visualmente el estado debe cambiar de “Pendiente” a “Realizada”.

- Ten en cuenta que los datos necesarios pueden variar dependiendo de si el reembolso es por pago móvil o por transferencia, pero visualmente deben contemplarse los campos necesarios para ambos casos.

- Guíate visualmente del apartado de “Operaciones”, ya que quiero que la sección y el detalle se vean similares.

COSAS QUE NO DEBES HACER

- No agregues pagos incompletos.
- No agregues pago de diferencia.
- No agregues subpago.
- No permitas que un pedido avance con un monto menor al total.
- No mezcles solicitudes de reembolso con el flujo normal de pago del pedido.
- No agregues backend real.
- No intentes limpiar o modularizar el código.
- No rehagas todo el responsive.
- No rediseñes completamente la aplicación.
- No cambies la identidad visual general.
- No dupliques secciones que ya existen; corrige las existentes cuando corresponda.
- No agregues funcionalidades complejas fuera de lo pedido.

El objetivo es dejar el prototipo visualmente coherente con el flujo final antes de pasar a desarrollo real.
```
