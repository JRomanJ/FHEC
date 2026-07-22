-- SOLO LECTURA. Ejecutar despues de la migracion.

select
  nombre as tabla,
  case when to_regclass('public.' || nombre) is not null then 'OK' else 'FALTA' end as estado
from unnest(array[
  'pedidos',
  'detalles_pedidos',
  'entregas_delivery',
  'entregas_pickup',
  'transacciones',
  'recipes',
  'auditoria_recipes'
]) as nombre;

select
  routine_name as funcion,
  'OK' as estado
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'fhec_crear_pedido_20260722',
    'fhec_expirar_pedidos_20260722',
    'fhec_confirmar_transaccion_20260722'
  )
order by routine_name;

select
  trigger_name,
  event_manipulation,
  event_object_table
from information_schema.triggers
where trigger_schema = 'public'
  and trigger_name = 'recipes_registrar_auditoria_20260722';

select
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'pedidos',
    'detalles_pedidos',
    'entregas_delivery',
    'entregas_pickup',
    'transacciones',
    'recipes',
    'auditoria_recipes'
  )
order by tablename;

