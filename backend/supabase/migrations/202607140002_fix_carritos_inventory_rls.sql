-- Corrige la lectura de inventario desde las funciones del carrito.
-- SELECT ... FOR UPDATE requiere permisos de actualizacion sobre inventario;
-- los usuarios del carrito solamente necesitan leer el stock.

begin;

create or replace function public.agregar_producto_carrito(
    p_id_inventario uuid,
    p_cantidad integer default 1
)
returns public.carritos
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_stock integer;
    v_cantidad_actual integer;
    v_resultado public.carritos;
begin
    if auth.uid() is null then
        raise exception 'Debes iniciar sesion para gestionar el carrito.'
            using errcode = '42501';
    end if;

    if p_cantidad <= 0 then
        raise exception 'La cantidad a agregar debe ser mayor que cero.'
            using errcode = '22023';
    end if;

    select i.stock_disponible
      into v_stock
      from public.inventario as i
     where i.id = p_id_inventario;

    if not found then
        raise exception 'El producto seleccionado no existe en el inventario.'
            using errcode = 'P0002';
    end if;

    select c.cantidad
      into v_cantidad_actual
      from public.carritos as c
     where c.id_usuario = auth.uid()
       and c.id_inventario = p_id_inventario
     for update;

    v_cantidad_actual := coalesce(v_cantidad_actual, 0) + p_cantidad;

    if v_cantidad_actual > coalesce(v_stock, 0) then
        raise exception 'La cantidad solicitada supera el stock disponible.'
            using errcode = '22023';
    end if;

    insert into public.carritos as carrito (
        id_usuario,
        id_inventario,
        cantidad
    )
    values (
        auth.uid(),
        p_id_inventario,
        p_cantidad
    )
    on conflict (id_usuario, id_inventario)
    do update
       set cantidad = excluded.cantidad + carrito.cantidad,
           fecha_actualizacion = now()
     where excluded.cantidad + carrito.cantidad <= v_stock
    returning * into v_resultado;

    if not found then
        raise exception 'La cantidad solicitada supera el stock disponible.'
            using errcode = '22023';
    end if;

    return v_resultado;
end;
$$;

create or replace function public.establecer_cantidad_producto_carrito(
    p_id_inventario uuid,
    p_cantidad integer
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_stock integer;
begin
    if auth.uid() is null then
        raise exception 'Debes iniciar sesion para gestionar el carrito.'
            using errcode = '42501';
    end if;

    if p_cantidad < 0 then
        raise exception 'La cantidad no puede ser negativa.'
            using errcode = '22023';
    end if;

    if p_cantidad = 0 then
        delete from public.carritos as c
         where c.id_usuario = auth.uid()
           and c.id_inventario = p_id_inventario;

        return 0;
    end if;

    select i.stock_disponible
      into v_stock
      from public.inventario as i
     where i.id = p_id_inventario;

    if not found then
        raise exception 'El producto seleccionado no existe en el inventario.'
            using errcode = 'P0002';
    end if;

    if p_cantidad > coalesce(v_stock, 0) then
        raise exception 'La cantidad solicitada supera el stock disponible.'
            using errcode = '22023';
    end if;

    update public.carritos as c
       set cantidad = p_cantidad,
           fecha_actualizacion = now()
     where c.id_usuario = auth.uid()
       and c.id_inventario = p_id_inventario;

    if not found then
        raise exception 'El producto no se encuentra en el carrito.'
            using errcode = 'P0002';
    end if;

    return p_cantidad;
end;
$$;

commit;
