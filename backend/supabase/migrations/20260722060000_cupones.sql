begin;

create table if not exists public.cupones (
    id_cupon uuid primary key default gen_random_uuid(),
    codigo_cupon text not null,
    descuento_porcentaje numeric(5,2) not null check (descuento_porcentaje > 0 and descuento_porcentaje <= 100),
    fecha_inicio date not null,
    fecha_vencimiento date not null,
    id_usuario uuid references public.usuarios(id) on delete restrict,
    usado_en timestamptz,
    id_pedido_uso uuid unique references public.pedidos(id_pedido) on delete restrict,
    fecha_creacion timestamptz not null default now(),
    fecha_actualizacion timestamptz not null default now(),
    constraint cupones_codigo_formato_check check (codigo_cupon = upper(trim(codigo_cupon)) and codigo_cupon ~ '^[A-Z0-9_-]{3,50}$'),
    constraint cupones_fechas_check check (fecha_vencimiento >= fecha_inicio),
    constraint cupones_uso_asignado_check check (
        (id_usuario is not null) or (usado_en is null and id_pedido_uso is null)
    ),
    constraint cupones_uso_completo_check check (
        (usado_en is null and id_pedido_uso is null) or (usado_en is not null and id_pedido_uso is not null)
    )
);

create unique index if not exists cupones_codigo_unico_idx on public.cupones (lower(codigo_cupon));
create index if not exists cupones_usuario_idx on public.cupones (id_usuario) where id_usuario is not null;
create index if not exists cupones_vigencia_idx on public.cupones (fecha_inicio, fecha_vencimiento);

alter table public.pedidos add column if not exists id_cupon uuid;
do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'pedidos_id_cupon_fkey' and conrelid = 'public.pedidos'::regclass
    ) then
        alter table public.pedidos add constraint pedidos_id_cupon_fkey
            foreign key (id_cupon) references public.cupones(id_cupon) on delete restrict;
    end if;
end $$;

alter table public.cupones enable row level security;

drop policy if exists "cupones_visible_read" on public.cupones;
drop policy if exists "cupones_superadmin_insert" on public.cupones;
drop policy if exists "cupones_superadmin_update" on public.cupones;
drop policy if exists "cupones_superadmin_delete" on public.cupones;

create policy "cupones_visible_read" on public.cupones for select to authenticated
using (
    id_usuario is null
    or id_usuario = auth.uid()
    or exists (
        select 1 from public.usuarios u
        where u.id = auth.uid() and lower(u.rol) in ('superadmin', 'super_admin')
    )
);
create policy "cupones_superadmin_insert" on public.cupones for insert to authenticated
with check (exists (
    select 1 from public.usuarios u
    where u.id = auth.uid() and lower(u.rol) in ('superadmin', 'super_admin')
));
create policy "cupones_superadmin_update" on public.cupones for update to authenticated
using (exists (
    select 1 from public.usuarios u
    where u.id = auth.uid() and lower(u.rol) in ('superadmin', 'super_admin')
))
with check (exists (
    select 1 from public.usuarios u
    where u.id = auth.uid() and lower(u.rol) in ('superadmin', 'super_admin')
));
create policy "cupones_superadmin_delete" on public.cupones for delete to authenticated
using (exists (
    select 1 from public.usuarios u
    where u.id = auth.uid() and lower(u.rol) in ('superadmin', 'super_admin')
));

insert into public.cupones (codigo_cupon, descuento_porcentaje, fecha_inicio, fecha_vencimiento)
select 'FHEC10', 10, date '2026-01-01', date '2026-12-31'
where not exists (select 1 from public.cupones where lower(codigo_cupon) = 'fhec10');

insert into public.cupones (codigo_cupon, descuento_porcentaje, fecha_inicio, fecha_vencimiento)
select 'SALUD15', 15, date '2026-06-01', date '2026-09-30'
where not exists (select 1 from public.cupones where lower(codigo_cupon) = 'salud15');

insert into public.cupones (codigo_cupon, descuento_porcentaje, fecha_inicio, fecha_vencimiento)
select 'FHEC2024', 20, date '2024-01-01', date '2024-12-31'
where not exists (select 1 from public.cupones where lower(codigo_cupon) = 'fhec2024');

create or replace function public.fhec_crear_pedido_20260722(p_pedido jsonb, p_items jsonb, p_ttl_minutes integer default 15)
returns jsonb language plpgsql security definer set search_path = public, auth
as $$
declare
    v_user uuid := auth.uid();
    v_order_id uuid := gen_random_uuid();
    v_sede uuid;
    v_method text;
    v_item jsonb;
    v_inventory record;
    v_coupon_row public.cupones%rowtype;
    v_qty integer;
    v_line numeric(12,2);
    v_subtotal numeric(12,2) := 0;
    v_coupon text := upper(trim(coalesce(p_pedido->>'codigo_cupon', '')));
    v_coupon_pct numeric(5,2) := 0;
    v_discount numeric(12,2) := 0;
    v_iva numeric(12,2) := 0;
    v_delivery numeric(12,2) := 0;
    v_total numeric(12,2) := 0;
    v_ttl integer := greatest(1, least(coalesce(p_ttl_minutes, 15), 120));
begin
    if v_user is null then raise exception 'Debes iniciar sesion.' using errcode = '42501'; end if;
    if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'El pedido no contiene productos.' using errcode = '22023'; end if;
    v_sede := (p_pedido->>'id_sede')::uuid;
    v_method := lower(trim(p_pedido->>'metodo_entrega'));
    if v_method not in ('delivery', 'pickup') then raise exception 'Metodo de entrega invalido.' using errcode = '22023'; end if;
    if v_method = 'delivery' and nullif(trim(p_pedido->>'direccion_entrega'), '') is null then raise exception 'La direccion de entrega es obligatoria.' using errcode = '22023'; end if;
    if exists (select 1 from public.pedidos where id_usuario = v_user and estado_pedido = 'pendiente') then raise exception 'Ya tienes un pedido pendiente.' using errcode = '23505'; end if;
    if not exists (select 1 from public.sedes where id = v_sede) then raise exception 'La sede no existe.' using errcode = 'P0002'; end if;

    if v_coupon <> '' then
        select * into v_coupon_row
        from public.cupones
        where lower(codigo_cupon) = lower(v_coupon)
        for update;
        if not found then raise exception 'El cupon no existe.' using errcode = 'P0002'; end if;
        if current_date < v_coupon_row.fecha_inicio or current_date > v_coupon_row.fecha_vencimiento then
            raise exception 'El cupon no esta vigente.' using errcode = '22023';
        end if;
        if v_coupon_row.id_usuario is not null and v_coupon_row.id_usuario <> v_user then
            raise exception 'El cupon esta asignado a otro usuario.' using errcode = '42501';
        end if;
        if v_coupon_row.id_usuario is not null and v_coupon_row.usado_en is not null then
            raise exception 'El cupon asignado ya fue usado.' using errcode = '23514';
        end if;
        v_coupon_pct := v_coupon_row.descuento_porcentaje;
    end if;

    insert into public.pedidos (
        id_pedido, id_usuario, id_sede, metodo_entrega, nombre_receptor, codigo_area_receptor,
        telefono_receptor, direccion_entrega, coordenadas_entrega, nombre_factura,
        codigo_area_factura, telefono_factura, tipo_documento_fiscal, documento_fiscal,
        direccion_fiscal, id_cupon, codigo_cupon, tasa_bcv, fecha_limite
    ) values (
        v_order_id, v_user, v_sede, v_method, trim(p_pedido->>'nombre_receptor'),
        trim(p_pedido->>'codigo_area_receptor'), trim(p_pedido->>'telefono_receptor'),
        nullif(trim(p_pedido->>'direccion_entrega'), ''), nullif(trim(p_pedido->>'coordenadas_entrega'), ''),
        coalesce(nullif(trim(p_pedido->>'nombre_factura'), ''), trim(p_pedido->>'nombre_receptor')),
        nullif(trim(p_pedido->>'codigo_area_factura'), ''), nullif(trim(p_pedido->>'telefono_factura'), ''),
        nullif(trim(p_pedido->>'tipo_documento_fiscal'), ''), nullif(trim(p_pedido->>'documento_fiscal'), ''),
        nullif(trim(p_pedido->>'direccion_fiscal'), ''),
        case when v_coupon = '' then null else v_coupon_row.id_cupon end,
        nullif(v_coupon, ''),
        greatest(coalesce(nullif(p_pedido->>'tasa_bcv', '')::numeric, 1), 0.0001), now() + make_interval(mins => v_ttl)
    );

    for v_item in select value from jsonb_array_elements(p_items)
    loop
        v_qty := coalesce((v_item->>'cantidad')::integer, 0);
        if v_qty <= 0 then raise exception 'Cantidad de producto invalida.' using errcode = '22023'; end if;
        select i.id, i.id_producto, i.id_sede, i.stock_disponible, coalesce(i.precio_usd, 0) precio_usd,
               coalesce(i.descuento_porcentaje, 0) descuento_porcentaje, p.nivel_control
          into v_inventory
          from public.inventario i join public.productos p on p.id = i.id_producto
         where i.id = (v_item->>'id_inventario')::uuid and i.id_sede = v_sede for update of i;
        if not found then raise exception 'Producto no disponible en la sede seleccionada.' using errcode = 'P0002'; end if;
        if coalesce(v_inventory.stock_disponible, 0) < v_qty then raise exception 'Stock insuficiente para uno de los productos.' using errcode = '23514'; end if;
        update public.inventario set stock_disponible = stock_disponible - v_qty where id = v_inventory.id;
        v_line := round((v_inventory.precio_usd * (1 - v_inventory.descuento_porcentaje / 100)) * v_qty, 2);
        v_subtotal := v_subtotal + v_line;
        insert into public.detalles_pedidos (id_pedido, id_inventario, id_producto, cantidad, precio_unitario, descuento_porcentaje, subtotal_linea, requiere_recipe, nivel_control)
        values (v_order_id, v_inventory.id, v_inventory.id_producto, v_qty, v_inventory.precio_usd, v_inventory.descuento_porcentaje, v_line,
            lower(coalesce(v_inventory.nivel_control, '')) ~ '(receta|recipe|control|f.sico)', v_inventory.nivel_control);
    end loop;

    if v_method = 'delivery' and exists (select 1 from public.detalles_pedidos where id_pedido = v_order_id and lower(coalesce(nivel_control, '')) ~ '(control|f.sico)') then
        raise exception 'Los productos controlados solo pueden retirarse por pickup.' using errcode = '23514';
    end if;
    v_discount := round(v_subtotal * v_coupon_pct / 100, 2);
    v_iva := round(v_subtotal * 0.16, 2);
    v_delivery := case when v_method = 'delivery' then 2.50 else 0 end;
    v_total := round(v_subtotal + v_iva + v_delivery - v_discount, 2);
    update public.pedidos set subtotal = v_subtotal, iva = v_iva, costo_entrega = v_delivery,
        descuento_aplicado = v_discount, total_pedido = v_total where id_pedido = v_order_id;

    if v_method = 'delivery' then
        insert into public.entregas_delivery (id_pedido, direccion_entrega, coordenadas_entrega)
        values (v_order_id, trim(p_pedido->>'direccion_entrega'), nullif(trim(p_pedido->>'coordenadas_entrega'), ''));
    else
        insert into public.entregas_pickup (id_pedido, id_sede) values (v_order_id, v_sede);
    end if;

    if v_coupon <> '' and v_coupon_row.id_usuario is not null then
        update public.cupones
        set usado_en = now(), id_pedido_uso = v_order_id, fecha_actualizacion = now()
        where id_cupon = v_coupon_row.id_cupon and usado_en is null;
        if not found then raise exception 'El cupon asignado ya fue usado.' using errcode = '23514'; end if;
    end if;

    delete from public.carritos where id_usuario = v_user;
    return (select jsonb_build_object('pedido', to_jsonb(p), 'detalles', coalesce((select jsonb_agg(to_jsonb(d)) from public.detalles_pedidos d where d.id_pedido = v_order_id), '[]'::jsonb)) from public.pedidos p where p.id_pedido = v_order_id);
end;
$$;

revoke all on function public.fhec_crear_pedido_20260722(jsonb, jsonb, integer) from public;
grant execute on function public.fhec_crear_pedido_20260722(jsonb, jsonb, integer) to authenticated;
grant select, insert, update, delete on public.cupones to authenticated;

notify pgrst, 'reload schema';

commit;
