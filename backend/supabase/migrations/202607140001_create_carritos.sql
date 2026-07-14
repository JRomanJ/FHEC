-- Gestion de productos dentro del carrito.
-- Esta migracion solamente crea objetos nuevos; no modifica tablas existentes.

begin;

create table public.carritos (
    id_usuario uuid not null,
    id_inventario uuid not null,
    cantidad integer not null,
    fecha_agregado timestamptz not null default now(),
    fecha_actualizacion timestamptz not null default now(),

    constraint carritos_pkey
        primary key (id_usuario, id_inventario),
    constraint carritos_id_usuario_fkey
        foreign key (id_usuario)
        references public.usuarios (id)
        on delete cascade,
    constraint carritos_id_inventario_fkey
        foreign key (id_inventario)
        references public.inventario (id)
        on delete cascade,
    constraint carritos_cantidad_check
        check (cantidad > 0)
);

comment on table public.carritos is
    'Productos agregados al carrito de cada usuario autenticado.';

comment on column public.carritos.id_inventario is
    'Referencia al producto disponible en una sede mediante la tabla inventario.';

create index carritos_id_inventario_idx
    on public.carritos (id_inventario);

create function public.validar_stock_carrito()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_stock integer;
begin
    select i.stock_disponible
      into v_stock
      from public.inventario as i
     where i.id = new.id_inventario;

    if not found then
        raise exception 'El producto seleccionado no existe en el inventario.'
            using errcode = '23503';
    end if;

    if new.cantidad > coalesce(v_stock, 0) then
        raise exception 'La cantidad solicitada supera el stock disponible.'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

create trigger validar_stock_carrito_antes_de_escribir
    before insert or update of id_inventario, cantidad
    on public.carritos
    for each row
    execute function public.validar_stock_carrito();

create function public.actualizar_fecha_carrito()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.fecha_actualizacion := now();
    return new;
end;
$$;

create trigger actualizar_fecha_carrito_antes_de_actualizar
    before update
    on public.carritos
    for each row
    execute function public.actualizar_fecha_carrito();

alter table public.carritos enable row level security;

create policy "Los usuarios pueden consultar su propio carrito"
    on public.carritos
    for select
    to authenticated
    using (id_usuario = (select auth.uid()));

create policy "Los usuarios pueden agregar a su propio carrito"
    on public.carritos
    for insert
    to authenticated
    with check (id_usuario = (select auth.uid()));

create policy "Los usuarios pueden actualizar su propio carrito"
    on public.carritos
    for update
    to authenticated
    using (id_usuario = (select auth.uid()))
    with check (id_usuario = (select auth.uid()));

create policy "Los usuarios pueden eliminar de su propio carrito"
    on public.carritos
    for delete
    to authenticated
    using (id_usuario = (select auth.uid()));

revoke all on table public.carritos from anon;
grant select, insert, update, delete on table public.carritos to authenticated;

create function public.agregar_producto_carrito(
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

create function public.establecer_cantidad_producto_carrito(
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

create function public.disminuir_producto_carrito(
    p_id_inventario uuid,
    p_cantidad integer default 1
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_cantidad_actual integer;
begin
    if auth.uid() is null then
        raise exception 'Debes iniciar sesion para gestionar el carrito.'
            using errcode = '42501';
    end if;

    if p_cantidad <= 0 then
        raise exception 'La cantidad a disminuir debe ser mayor que cero.'
            using errcode = '22023';
    end if;

    select c.cantidad
      into v_cantidad_actual
      from public.carritos as c
     where c.id_usuario = auth.uid()
       and c.id_inventario = p_id_inventario
     for update;

    if not found then
        return 0;
    end if;

    if v_cantidad_actual <= p_cantidad then
        delete from public.carritos as c
         where c.id_usuario = auth.uid()
           and c.id_inventario = p_id_inventario;

        return 0;
    end if;

    v_cantidad_actual := v_cantidad_actual - p_cantidad;

    update public.carritos as c
       set cantidad = v_cantidad_actual,
           fecha_actualizacion = now()
     where c.id_usuario = auth.uid()
       and c.id_inventario = p_id_inventario;

    return v_cantidad_actual;
end;
$$;

create function public.eliminar_producto_carrito(
    p_id_inventario uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_filas_eliminadas integer;
begin
    if auth.uid() is null then
        raise exception 'Debes iniciar sesion para gestionar el carrito.'
            using errcode = '42501';
    end if;

    delete from public.carritos as c
     where c.id_usuario = auth.uid()
       and c.id_inventario = p_id_inventario;

    get diagnostics v_filas_eliminadas = row_count;
    return v_filas_eliminadas > 0;
end;
$$;

create function public.vaciar_carrito()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_filas_eliminadas integer;
begin
    if auth.uid() is null then
        raise exception 'Debes iniciar sesion para gestionar el carrito.'
            using errcode = '42501';
    end if;

    delete from public.carritos as c
     where c.id_usuario = auth.uid();

    get diagnostics v_filas_eliminadas = row_count;
    return v_filas_eliminadas;
end;
$$;

revoke all on function public.agregar_producto_carrito(uuid, integer) from public, anon;
revoke all on function public.establecer_cantidad_producto_carrito(uuid, integer) from public, anon;
revoke all on function public.disminuir_producto_carrito(uuid, integer) from public, anon;
revoke all on function public.eliminar_producto_carrito(uuid) from public, anon;
revoke all on function public.vaciar_carrito() from public, anon;

grant execute on function public.agregar_producto_carrito(uuid, integer) to authenticated;
grant execute on function public.establecer_cantidad_producto_carrito(uuid, integer) to authenticated;
grant execute on function public.disminuir_producto_carrito(uuid, integer) to authenticated;
grant execute on function public.eliminar_producto_carrito(uuid) to authenticated;
grant execute on function public.vaciar_carrito() to authenticated;

commit;
