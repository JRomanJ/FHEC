-- Diagnostico de solo lectura. Este archivo no crea, modifica ni elimina nada.
select
    to_regclass('public.usuarios') as tabla_usuarios,
    to_regclass('public.banners') as tabla_banners,
    to_regclass('public.notificaciones') as tabla_notificaciones,
    to_regprocedure('public.fhec_registrar_notificaciones_banner_20260722()') as funcion_promociones;

select
    required.column_name as columna_requerida,
    case when c.column_name is null then 'FALTA' else 'OK' end as estado,
    c.data_type
from unnest(array[
    'id',
    'rol',
    'telefono',
    'codigo_area',
    'acepta_promociones',
    'acepta_promociones_sms',
    'acepta_promociones_correo',
    'acepta_notificaciones',
    'acepta_notificaciones_sms',
    'acepta_notificaciones_correo'
]) with ordinality as required(column_name, posicion)
left join information_schema.columns c
    on c.table_schema = 'public'
   and c.table_name = 'usuarios'
   and c.column_name = required.column_name
order by required.posicion;
