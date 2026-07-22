begin;

create table if not exists public.pedidos (
    id_pedido uuid primary key default gen_random_uuid(),
    id_usuario uuid not null references public.usuarios(id) on delete restrict,
    id_sede uuid not null references public.sedes(id) on delete restrict,
    id_transaccion uuid,
    metodo_entrega text not null check (metodo_entrega in ('delivery', 'pickup')),
    nombre_receptor text not null,
    codigo_area_receptor text not null,
    telefono_receptor text not null,
    direccion_entrega text,
    coordenadas_entrega text,
    nombre_factura text not null,
    codigo_area_factura text,
    telefono_factura text,
    tipo_documento_fiscal text,
    documento_fiscal text,
    direccion_fiscal text,
    codigo_cupon text,
    subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
    iva numeric(12,2) not null default 0 check (iva >= 0),
    costo_entrega numeric(12,2) not null default 0 check (costo_entrega >= 0),
    descuento_aplicado numeric(12,2) not null default 0 check (descuento_aplicado >= 0),
    total_pedido numeric(12,2) not null default 0 check (total_pedido >= 0),
    tasa_bcv numeric(12,4) not null default 1 check (tasa_bcv > 0),
    estado_pedido text not null default 'pendiente' check (estado_pedido in ('pendiente', 'completado', 'expirado')),
    fecha_creacion timestamptz not null default now(),
    fecha_limite timestamptz not null,
    fecha_completado timestamptz,
    fecha_expiracion timestamptz,
    stock_restaurado boolean not null default false
);

create unique index if not exists pedidos_un_pendiente_por_usuario_idx
    on public.pedidos (id_usuario) where estado_pedido = 'pendiente';
create index if not exists pedidos_usuario_fecha_idx on public.pedidos (id_usuario, fecha_creacion desc);
create index if not exists pedidos_pendientes_vencimiento_idx on public.pedidos (fecha_limite)
    where estado_pedido = 'pendiente';

create table if not exists public.detalles_pedidos (
    id_detalle_pedido uuid primary key default gen_random_uuid(),
    id_pedido uuid not null references public.pedidos(id_pedido) on delete cascade,
    id_inventario uuid not null references public.inventario(id) on delete restrict,
    id_producto uuid not null references public.productos(id) on delete restrict,
    cantidad integer not null check (cantidad > 0),
    precio_unitario numeric(12,2) not null check (precio_unitario >= 0),
    descuento_porcentaje numeric(5,2) not null default 0 check (descuento_porcentaje between 0 and 100),
    subtotal_linea numeric(12,2) not null check (subtotal_linea >= 0),
    requiere_recipe boolean not null default false,
    nivel_control text,
    unique (id_pedido, id_inventario)
);
create index if not exists detalles_pedidos_pedido_idx on public.detalles_pedidos (id_pedido);

create table if not exists public.entregas_delivery (
    id_entrega_delivery uuid primary key default gen_random_uuid(),
    id_pedido uuid not null unique references public.pedidos(id_pedido) on delete cascade,
    direccion_entrega text not null,
    coordenadas_entrega text,
    estado_entrega text not null default 'pendiente',
    fecha_creacion timestamptz not null default now(),
    fecha_asignacion timestamptz,
    fecha_entrega timestamptz
);

create table if not exists public.entregas_pickup (
    id_entrega_pickup uuid primary key default gen_random_uuid(),
    id_pedido uuid not null unique references public.pedidos(id_pedido) on delete cascade,
    id_sede uuid not null references public.sedes(id) on delete restrict,
    estado_entrega text not null default 'pendiente',
    fecha_creacion timestamptz not null default now(),
    fecha_retiro timestamptz
);

create table if not exists public.transacciones (
    id_transaccion uuid primary key default gen_random_uuid(),
    id_pedido uuid not null unique references public.pedidos(id_pedido) on delete restrict,
    id_usuario uuid not null references public.usuarios(id) on delete restrict,
    metodo_pago text not null check (metodo_pago in ('pago_movil', 'transferencia')),
    banco_emisor text not null,
    codigo_area_emisor text,
    telefono_emisor text,
    tipo_documento_emisor text,
    documento_emisor text,
    referencia_bancaria text not null,
    monto_confirmado_usd numeric(12,2) not null check (monto_confirmado_usd > 0),
    monto_confirmado_bs numeric(14,2) not null check (monto_confirmado_bs > 0),
    tasa_bcv numeric(12,4) not null check (tasa_bcv > 0),
    estado_transaccion text not null default 'confirmada' check (estado_transaccion in ('confirmada', 'anulada')),
    fecha_pago timestamptz not null default now(),
    fecha_confirmacion timestamptz not null default now(),
    fecha_actualizacion timestamptz not null default now(),
    anulada_en timestamptz,
    anulada_por uuid references public.usuarios(id) on delete set null,
    motivo_anulacion text
);
create unique index if not exists transacciones_referencia_activa_idx
    on public.transacciones (lower(banco_emisor), referencia_bancaria)
    where estado_transaccion = 'confirmada';
create index if not exists transacciones_usuario_fecha_idx on public.transacciones (id_usuario, fecha_confirmacion desc);

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'pedidos_id_transaccion_fkey' and conrelid = 'public.pedidos'::regclass) then
        alter table public.pedidos add constraint pedidos_id_transaccion_fkey
        foreign key (id_transaccion) references public.transacciones(id_transaccion) on delete set null;
    end if;
end $$;

create table if not exists public.recipes (
    id_recipe uuid primary key default gen_random_uuid(),
    id_detalle_pedido uuid not null references public.detalles_pedidos(id_detalle_pedido) on delete cascade,
    id_usuario uuid not null references public.usuarios(id) on delete restrict,
    archivo_path text not null,
    nombre_archivo text not null,
    mime_type text not null,
    tamano_bytes bigint not null check (tamano_bytes > 0),
    estado_recipe text not null default 'pendiente' check (estado_recipe in ('pendiente', 'aprobado', 'rechazado')),
    razones_rechazo text[],
    comentario_auditoria text,
    fecha_carga timestamptz not null default now(),
    fecha_actualizacion timestamptz not null default now(),
    eliminado_en timestamptz,
    eliminado_por uuid references public.usuarios(id) on delete set null
);
create index if not exists recipes_estado_fecha_idx on public.recipes (estado_recipe, fecha_carga);
create unique index if not exists recipes_detalle_activo_idx on public.recipes (id_detalle_pedido)
    where eliminado_en is null;

create table if not exists public.auditoria_recipes (
    id_auditoria uuid primary key default gen_random_uuid(),
    id_recipe uuid not null references public.recipes(id_recipe) on delete restrict,
    id_auditor uuid references public.usuarios(id) on delete set null,
    estado_anterior text not null,
    resultado_auditoria text not null check (resultado_auditoria in ('pendiente', 'aprobado', 'rechazado')),
    razones_rechazo text[],
    comentario_rechazo text,
    fecha_auditoria timestamptz not null default now()
);
create index if not exists auditoria_recipes_recipe_fecha_idx on public.auditoria_recipes (id_recipe, fecha_auditoria desc);

alter table public.pedidos enable row level security;
alter table public.detalles_pedidos enable row level security;
alter table public.entregas_delivery enable row level security;
alter table public.entregas_pickup enable row level security;
alter table public.transacciones enable row level security;
alter table public.recipes enable row level security;
alter table public.auditoria_recipes enable row level security;

create or replace function public.fhec_es_personal_20260722()
returns boolean language sql stable security definer set search_path = public, auth
as $$
    select exists (
        select 1 from public.usuarios
        where id = auth.uid() and lower(rol) in ('auxiliar', 'auditor', 'superadmin', 'super_admin')
    );
$$;

drop policy if exists "pedidos_own_or_staff_read" on public.pedidos;
drop policy if exists "detalles_own_or_staff_read" on public.detalles_pedidos;
drop policy if exists "delivery_own_or_staff_read" on public.entregas_delivery;
drop policy if exists "pickup_own_or_staff_read" on public.entregas_pickup;
drop policy if exists "transacciones_own_or_staff_read" on public.transacciones;
drop policy if exists "recipes_own_or_staff_read" on public.recipes;
drop policy if exists "recipes_own_insert" on public.recipes;
drop policy if exists "recipes_owner_pending_update" on public.recipes;
drop policy if exists "recipes_auditor_update" on public.recipes;
drop policy if exists "auditoria_own_or_staff_read" on public.auditoria_recipes;

create policy "pedidos_own_or_staff_read" on public.pedidos for select to authenticated
using (id_usuario = auth.uid() or public.fhec_es_personal_20260722());
create policy "detalles_own_or_staff_read" on public.detalles_pedidos for select to authenticated
using (exists (select 1 from public.pedidos p where p.id_pedido = detalles_pedidos.id_pedido and (p.id_usuario = auth.uid() or public.fhec_es_personal_20260722())));
create policy "delivery_own_or_staff_read" on public.entregas_delivery for select to authenticated
using (exists (select 1 from public.pedidos p where p.id_pedido = entregas_delivery.id_pedido and (p.id_usuario = auth.uid() or public.fhec_es_personal_20260722())));
create policy "pickup_own_or_staff_read" on public.entregas_pickup for select to authenticated
using (exists (select 1 from public.pedidos p where p.id_pedido = entregas_pickup.id_pedido and (p.id_usuario = auth.uid() or public.fhec_es_personal_20260722())));
create policy "transacciones_own_or_staff_read" on public.transacciones for select to authenticated
using (id_usuario = auth.uid() or public.fhec_es_personal_20260722());
create policy "recipes_own_or_staff_read" on public.recipes for select to authenticated
using (id_usuario = auth.uid() or public.fhec_es_personal_20260722());
create policy "recipes_own_insert" on public.recipes for insert to authenticated
with check (
    id_usuario = auth.uid() and estado_recipe = 'pendiente' and exists (
        select 1 from public.detalles_pedidos d join public.pedidos p on p.id_pedido = d.id_pedido
        where d.id_detalle_pedido = recipes.id_detalle_pedido and p.id_usuario = auth.uid()
          and p.estado_pedido = 'pendiente' and d.requiere_recipe
    )
);
create policy "recipes_owner_pending_update" on public.recipes for update to authenticated
using (id_usuario = auth.uid() and estado_recipe in ('pendiente', 'rechazado'))
with check (id_usuario = auth.uid() and estado_recipe = 'pendiente');
create policy "recipes_auditor_update" on public.recipes for update to authenticated
using (exists (select 1 from public.usuarios u where u.id = auth.uid() and lower(u.rol) in ('auditor', 'superadmin', 'super_admin')))
with check (exists (select 1 from public.usuarios u where u.id = auth.uid() and lower(u.rol) in ('auditor', 'superadmin', 'super_admin')));
create policy "auditoria_own_or_staff_read" on public.auditoria_recipes for select to authenticated
using (public.fhec_es_personal_20260722() or exists (select 1 from public.recipes r where r.id_recipe = auditoria_recipes.id_recipe and r.id_usuario = auth.uid()));

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

    insert into public.pedidos (
        id_pedido, id_usuario, id_sede, metodo_entrega, nombre_receptor, codigo_area_receptor,
        telefono_receptor, direccion_entrega, coordenadas_entrega, nombre_factura,
        codigo_area_factura, telefono_factura, tipo_documento_fiscal, documento_fiscal,
        direccion_fiscal, codigo_cupon, tasa_bcv, fecha_limite
    ) values (
        v_order_id, v_user, v_sede, v_method, trim(p_pedido->>'nombre_receptor'),
        trim(p_pedido->>'codigo_area_receptor'), trim(p_pedido->>'telefono_receptor'),
        nullif(trim(p_pedido->>'direccion_entrega'), ''), nullif(trim(p_pedido->>'coordenadas_entrega'), ''),
        coalesce(nullif(trim(p_pedido->>'nombre_factura'), ''), trim(p_pedido->>'nombre_receptor')),
        nullif(trim(p_pedido->>'codigo_area_factura'), ''), nullif(trim(p_pedido->>'telefono_factura'), ''),
        nullif(trim(p_pedido->>'tipo_documento_fiscal'), ''), nullif(trim(p_pedido->>'documento_fiscal'), ''),
        nullif(trim(p_pedido->>'direccion_fiscal'), ''), nullif(v_coupon, ''),
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

    v_coupon_pct := case v_coupon when 'FHEC10' then 10 when 'SALUD15' then 15 else 0 end;
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
    delete from public.carritos where id_usuario = v_user;
    return (select jsonb_build_object('pedido', to_jsonb(p), 'detalles', coalesce((select jsonb_agg(to_jsonb(d)) from public.detalles_pedidos d where d.id_pedido = v_order_id), '[]'::jsonb)) from public.pedidos p where p.id_pedido = v_order_id);
end;
$$;

create or replace function public.fhec_expirar_pedidos_20260722()
returns integer language plpgsql security definer set search_path = public
as $$
declare v_order record; v_count integer := 0;
begin
    for v_order in select id_pedido from public.pedidos where estado_pedido = 'pendiente' and not stock_restaurado and fecha_limite <= now() for update skip locked
    loop
        update public.inventario i set stock_disponible = coalesce(i.stock_disponible, 0) + d.cantidad
          from public.detalles_pedidos d where d.id_pedido = v_order.id_pedido and d.id_inventario = i.id;
        update public.pedidos set estado_pedido = 'expirado', fecha_expiracion = now(), stock_restaurado = true
         where id_pedido = v_order.id_pedido and estado_pedido = 'pendiente' and not stock_restaurado;
        if found then v_count := v_count + 1; end if;
    end loop;
    return v_count;
end;
$$;

create or replace function public.fhec_confirmar_transaccion_20260722(p_id_pedido uuid, p_pago jsonb)
returns jsonb language plpgsql security definer set search_path = public, auth
as $$
declare
    v_user uuid := auth.uid(); v_order public.pedidos%rowtype; v_transaction public.transacciones%rowtype;
    v_bs numeric(14,2); v_rate numeric(12,4); v_usd numeric(12,2);
begin
    if v_user is null then raise exception 'Debes iniciar sesion.' using errcode = '42501'; end if;
    select * into v_order from public.pedidos where id_pedido = p_id_pedido and id_usuario = v_user for update;
    if not found then raise exception 'Pedido no encontrado.' using errcode = 'P0002'; end if;
    if v_order.estado_pedido <> 'pendiente' then raise exception 'El pedido ya no esta pendiente.' using errcode = '22023'; end if;
    if v_order.fecha_limite <= now() then raise exception 'El tiempo para pagar el pedido expiro.' using errcode = '22023'; end if;
    if exists (select 1 from public.detalles_pedidos d where d.id_pedido = p_id_pedido and d.requiere_recipe and not exists (select 1 from public.recipes r where r.id_detalle_pedido = d.id_detalle_pedido and r.estado_recipe = 'aprobado' and r.eliminado_en is null)) then
        raise exception 'Todos los recipes requeridos deben estar aprobados.' using errcode = '22023';
    end if;
    v_bs := (p_pago->>'monto_bs')::numeric; v_rate := coalesce(nullif(p_pago->>'tasa_bcv', '')::numeric, v_order.tasa_bcv); v_usd := round(v_bs / v_rate, 2);
    if abs(v_usd - v_order.total_pedido) > 0.10 then raise exception 'El monto no coincide con el total del pedido.' using errcode = '23514'; end if;
    insert into public.transacciones (id_pedido, id_usuario, metodo_pago, banco_emisor, codigo_area_emisor, telefono_emisor, tipo_documento_emisor, documento_emisor, referencia_bancaria, monto_confirmado_usd, monto_confirmado_bs, tasa_bcv, fecha_pago)
    values (p_id_pedido, v_user, lower(trim(p_pago->>'metodo_pago')), trim(p_pago->>'banco_emisor'), nullif(trim(p_pago->>'codigo_area_emisor'), ''), nullif(trim(p_pago->>'telefono_emisor'), ''), nullif(trim(p_pago->>'tipo_documento_emisor'), ''), nullif(trim(p_pago->>'documento_emisor'), ''), trim(p_pago->>'referencia_bancaria'), v_order.total_pedido, v_bs, v_rate, coalesce(nullif(p_pago->>'fecha_pago', '')::timestamptz, now())) returning * into v_transaction;
    update public.pedidos set id_transaccion = v_transaction.id_transaccion, estado_pedido = 'completado', fecha_completado = now(),
        nombre_factura = coalesce(nullif(trim(p_pago->>'nombre_factura'), ''), nombre_factura), codigo_area_factura = nullif(trim(p_pago->>'codigo_area_factura'), ''), telefono_factura = nullif(trim(p_pago->>'telefono_factura'), ''), tipo_documento_fiscal = nullif(trim(p_pago->>'tipo_documento_fiscal'), ''), documento_fiscal = nullif(trim(p_pago->>'documento_fiscal'), ''), direccion_fiscal = nullif(trim(p_pago->>'direccion_fiscal'), '')
      where id_pedido = p_id_pedido;
    return jsonb_build_object('pedido', (select to_jsonb(p) from public.pedidos p where p.id_pedido = p_id_pedido), 'transaccion', to_jsonb(v_transaction));
end;
$$;

create or replace function public.fhec_auditar_recipe_20260722()
returns trigger language plpgsql security definer set search_path = public, auth
as $$
begin
    new.fecha_actualizacion := now();
    if new.estado_recipe is distinct from old.estado_recipe then
        insert into public.auditoria_recipes (id_recipe, id_auditor, estado_anterior, resultado_auditoria, razones_rechazo, comentario_rechazo)
        values (new.id_recipe, auth.uid(), old.estado_recipe, new.estado_recipe, new.razones_rechazo, new.comentario_auditoria);
    end if;
    return new;
end;
$$;
drop trigger if exists recipes_registrar_auditoria_20260722 on public.recipes;
create trigger recipes_registrar_auditoria_20260722 before update on public.recipes
for each row execute function public.fhec_auditar_recipe_20260722();

revoke all on function public.fhec_es_personal_20260722() from public;
revoke all on function public.fhec_crear_pedido_20260722(jsonb, jsonb, integer) from public;
revoke all on function public.fhec_expirar_pedidos_20260722() from public;
revoke all on function public.fhec_confirmar_transaccion_20260722(uuid, jsonb) from public;
grant execute on function public.fhec_es_personal_20260722() to authenticated, service_role;
grant execute on function public.fhec_crear_pedido_20260722(jsonb, jsonb, integer) to authenticated;
grant execute on function public.fhec_expirar_pedidos_20260722() to service_role;
grant execute on function public.fhec_confirmar_transaccion_20260722(uuid, jsonb) to authenticated;

grant usage on schema public to authenticated, service_role;
grant select on public.pedidos, public.detalles_pedidos, public.entregas_delivery, public.entregas_pickup, public.transacciones, public.recipes, public.auditoria_recipes to authenticated;
grant insert, update on public.recipes to authenticated;

notify pgrst, 'reload schema';

commit;
