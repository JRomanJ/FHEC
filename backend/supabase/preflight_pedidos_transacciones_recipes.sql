-- SOLO LECTURA. No crea, modifica ni elimina ningun dato.
-- Todos los resultados de "estado" deben ser OK antes de aplicar la migracion.

with requeridas(tabla, columna) as (
  values
    ('usuarios', 'id'),
    ('usuarios', 'rol'),
    ('sedes', 'id'),
    ('productos', 'id'),
    ('productos', 'nivel_control'),
    ('inventario', 'id'),
    ('inventario', 'id_producto'),
    ('inventario', 'id_sede'),
    ('inventario', 'stock_disponible'),
    ('inventario', 'precio_usd'),
    ('inventario', 'descuento_porcentaje'),
    ('carritos', 'id_usuario')
)
select
  r.tabla,
  r.columna,
  case when c.column_name is not null then 'OK' else 'FALTA' end as estado,
  c.data_type
from requeridas r
left join information_schema.columns c
  on c.table_schema = 'public'
 and c.table_name = r.tabla
 and c.column_name = r.columna
order by r.tabla, r.columna;

select
  nombre as objeto_nuevo,
  case when to_regclass('public.' || nombre) is null then 'OK_NO_EXISTE' else 'OK_EXISTE_RECONCILIAR' end as estado
from unnest(array[
  'pedidos',
  'detalles_pedidos',
  'entregas_delivery',
  'entregas_pickup',
  'transacciones',
  'recipes',
  'auditoria_recipes'
]) as nombre;
