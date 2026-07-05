BLOQUE RESPONSIVE - AJUSTES PUNTUALES EN MÓVIL

Necesito aplicar únicamente estos ajustes responsive puntuales al prototipo actual de Farmahumana. No rediseñes toda la aplicación, no cambies la identidad visual general, no hagas backend real, no modularices código y no rehagas todo el responsive desde cero. Solo corrige los problemas específicos en móvil indicados aquí.

IMPORTANTE:
- No cambies el diseño de escritorio.
- Estos cambios deben aplicarse principalmente cuando la pantalla sea pequeña, tipo móvil.
- Mantén el estilo visual actual de la página.
- No alteres la lógica visual de las secciones que ya funcionan bien.

BARRA DE NAVEGACIÓN - BARRA SUPERIOR BLANCA

- En escritorio, conserva la barra superior blanca tal como está.
- En móvil, los accesos de Notificaciones, Favoritos, Mi carrito y Mi perfil no caben bien en la barra.
- Cuando la pantalla sea pequeña, agrupa esas opciones en una lista desplegable compacta.
- Esta lista debe funcionar visualmente similar a la lista de sedes o categorías.
- En móvil, en lugar de mostrar los cuatro iconos separados, debe aparecer un botón o selector compacto que despliegue estas opciones:
  1. Notificaciones.
  2. Favoritos.
  3. Mi carrito.
  4. Mi perfil.

- Al seleccionar cada opción, debe llevar a la sección correspondiente.
- No uses emojis.
- No uses iconos decorativos raros.
- La lista debe verse limpia, textual y ordenada.

- Si el usuario NO ha iniciado sesión, no deben aparecer Notificaciones ni Favoritos.
- Si el usuario no ha iniciado sesión, debe mantenerse únicamente “Iniciar sesión”, tal como está actualmente.
- No agregues accesos de usuario autenticado cuando no haya sesión iniciada.

BARRA DE NAVEGACIÓN - SEGUNDA BARRA CON DEGRADADO

- En escritorio, conserva la segunda barra con degradado tal como está.
- En móvil, cuando aparezcan muchas opciones como Inicio, Categorías, Mi pedido, Delivery, Administración y Sede, no deben desbordarse horizontalmente.
- No quiero que las opciones se salgan del ancho de la pantalla.
- Preferiblemente, conserva las opciones visibles como botones normales, pero permite que se acomoden en dos líneas cuando no quepan.
- Es decir, si no caben todas en una sola línea, una de las opciones debe saltar hacia abajo.
- Preferiblemente, si alguna opción debe saltar hacia abajo, que sea “Mi pedido”, “Delivery” o “Administración”.
- Evita que “Inicio”, “Categorías” o “Sede” se vean raras o queden aisladas.
- La opción de sede debe mantenerse visualmente clara y no debe quedar cortada.
- Solo si no es posible resolverlo bien con salto de línea, puedes usar un menú compacto, pero la opción preferida es que las opciones se acomoden en dos líneas.

BARRA DE BÚSQUEDA

- En móvil, cuando el usuario escribe en la barra de búsqueda, no debe mostrarse directamente el menú flotante de resultados/sugerencias.
- Ese menú flotante se ve mal en pantallas pequeñas.
- En móvil, oculta ese menú flotante.
- La búsqueda puede seguir funcionando visualmente, pero sin desplegar ese panel flotante encima de la interfaz.
- En escritorio, mantén el comportamiento actual si se ve bien.

PANTALLA DE BÚSQUEDA / CATÁLOGO

- En móvil, el texto que aparece junto a filtros, por ejemplo “16 resultados”, no debe mostrarse.
- Ese texto se ve muy apretado junto con filtros y ordenamiento.
- En móvil, deja solo los controles principales de Filtros y Ordenar.
- En escritorio, conserva el texto de cantidad de resultados si se ve bien.

MI PERFIL - TABLAS EN MÓVIL

- En móvil, las tablas de Mi Perfil no deben ocupar más ancho del permitido por la pantalla.
- No deben romper el layout ni hacer que toda la página se desborde horizontalmente.
- Haz que estas tablas se comporten como las tablas del panel administrativo que ya funcionan bien:
  1. La tabla debe ocupar como máximo el ancho disponible de la pantalla.
  2. Si la tabla tiene muchas columnas, debe permitir desplazamiento horizontal interno.
  3. El scroll horizontal debe estar dentro del contenedor de la tabla.
  4. La página completa no debe desplazarse horizontalmente por culpa de la tabla.

- Aplica esto específicamente a:
  1. Historial de pedidos.
  2. Solicitudes de reembolso.
  3. Cupones.

MI PERFIL - HISTORIAL DE PEDIDOS

- En móvil, la tabla de Historial de pedidos debe mantenerse dentro del ancho de la pantalla.
- Puede usar scroll horizontal interno.
- Si decides simplificar columnas en móvil, deja como mínimo:
  1. ID pedido.
  2. Estado.
  3. Total.
  4. Detalles.

- No permitas que la tabla empuje el ancho completo de la página.

MI PERFIL - SOLICITUDES DE REEMBOLSO

- En móvil, la tabla de Solicitudes de reembolso debe mantenerse dentro del ancho de la pantalla.
- Puede usar scroll horizontal interno.
- Si decides simplificar columnas en móvil, deja como mínimo:
  1. Referencia.
  2. Monto.
  3. Estado.

- No permitas que la tabla empuje el ancho completo de la página.

- En el formulario para añadir una nueva solicitud de reembolso, reduce un poco el ancho visual del campo “Fecha de la transacción” en móvil.
- Actualmente ese campo ocupa demasiado ancho.
- Debe alinearse mejor con el resto de campos del formulario.
- No cambies la estructura general del formulario.

MI PERFIL - CUPONES

- En móvil, la tabla de Cupones debe mantenerse dentro del ancho de la pantalla.
- Puede usar scroll horizontal interno.
- Si decides simplificar columnas en móvil, deja como mínimo:
  1. Código.
  2. Descuento.
  3. Estado.

- No permitas que la tabla empuje el ancho completo de la página.

PANEL DE ADMINISTRACIÓN - INVENTARIO

- En móvil, la tabla de Inventario debe comportarse igual que las demás tablas del panel administrativo.
- Las otras tablas administrativas permiten deslizar horizontalmente para ver columnas largas.
- La tabla de Inventario también debe permitir scroll horizontal interno.
- La tabla debe ocupar como máximo el ancho disponible de la pantalla.
- No debe desbordar toda la página.
- No ocultes columnas importantes.
- Solo haz que se pueda deslizar horizontalmente dentro de su propio contenedor.

PANEL DE ADMINISTRACIÓN - CUPONES

- En móvil, en la tabla de Cupones, la etiqueta visual del descuento se está partiendo en dos líneas y se ve mal.
- Corrige esa etiqueta para que se mantenga en una sola línea.
- La etiqueta de descuento debe comportarse como la etiqueta de estado, que no se parte aunque la pantalla sea pequeña.
- Evita que el texto del descuento haga salto de línea dentro del badge.
- Si hace falta, aumenta ligeramente el ancho mínimo de esa columna o del badge.
- El badge de descuento debe mantenerse horizontal, compacto y legible.

RESTRICCIONES GENERALES

- No cambies el diseño de escritorio.
- No cambies la identidad visual general.
- No rehagas todo el responsive.
- No conviertas toda la navegación en un menú hamburguesa global.
- No ocultes secciones importantes.
- No rompas el comportamiento actual de las tablas administrativas que ya funcionan bien.
- No cambies la estructura funcional de Mi Perfil.
- No cambies la estructura funcional del panel administrativo.
- Solo corrige los problemas responsive indicados.