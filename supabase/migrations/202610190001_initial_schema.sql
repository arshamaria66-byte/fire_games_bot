-- FIRE GAMES initial schema. Prices throughout this project are integer Toman.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.admin_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 granted_at timestamptz not null default now(), granted_by uuid references auth.users(id) on delete set null
);
create or replace function public.is_store_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admin_roles where user_id=auth.uid()); $$;
revoke all on function public.is_store_admin() from public; grant execute on function public.is_store_admin() to anon, authenticated;
create table if not exists public.categories (
 id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique,
 description text, created_at timestamptz not null default now()
);
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
 short_description text, description text, platform text not null check(length(trim(platform))>0),
 category text references public.categories(name) on update cascade on delete restrict, genre text, price_toman bigint not null check(price_toman>=0),
 original_price_toman bigint check(original_price_toman is null or original_price_toman>=0),
 image_url text, gallery text[] not null default '{}', developer text, publisher text, release_date date, edition text,
 availability text not null default 'in_stock' check(availability in ('in_stock','out_of_stock','preorder')),
 featured boolean not null default false, published boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint valid_discount check(original_price_toman is null or original_price_toman>price_toman)
);
create index if not exists products_published_idx on public.products(published,created_at desc);
create index if not exists products_platform_idx on public.products(platform);
create index if not exists products_search_idx on public.products using gin(to_tsvector('simple',coalesce(name,'')||' '||coalesce(platform,'')||' '||coalesce(genre,'')));
create table if not exists public.discounts (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
 sale_price_toman bigint not null check(sale_price_toman>=0), starts_at timestamptz not null, ends_at timestamptz not null,
 active boolean not null default true, created_at timestamptz not null default now(), check(ends_at>starts_at), unique(product_id)
);
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
 customer_email text not null, status text not null default 'pending' check(status in ('pending','processing','completed','cancelled','refunded')),
 payment_status text not null default 'unpaid' check(payment_status in ('unpaid','pending','paid','failed','refunded')),
 payment_reference text unique, subtotal_toman bigint not null check(subtotal_toman>=0), discount_toman bigint not null default 0 check(discount_toman>=0),
 total_toman bigint not null check(total_toman>=0), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id,created_at desc);
create table if not exists public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete restrict,
 product_id uuid references public.products(id) on delete set null, product_name text not null, platform text not null,
 unit_price_toman bigint not null check(unit_price_toman>=0), quantity integer not null check(quantity between 1 and 99),
 line_total_toman bigint not null check(line_total_toman=unit_price_toman*quantity)
);
create table if not exists public.payment_records (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete restrict,
 provider text not null, provider_reference text unique, amount_toman bigint not null check(amount_toman>=0), status text not null default 'pending' check(status in ('pending','verified','failed','refunded')),
 verified_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.store_settings (
 key text primary key, value jsonb not null default '{}'::jsonb, public_visible boolean not null default false, updated_at timestamptz not null default now()
);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(user_id) values(new.id) on conflict do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.admin_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.discounts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_records enable row level security;
alter table public.store_settings enable row level security;
create policy "profiles own or admin read" on public.profiles for select to authenticated using(user_id=auth.uid() or public.is_store_admin());
create policy "profiles own update" on public.profiles for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "users read own admin role" on public.admin_roles for select to authenticated using(user_id=auth.uid() or public.is_store_admin());
create policy "public read categories" on public.categories for select to anon,authenticated using(true);
create policy "admins manage categories" on public.categories for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
create policy "public read published products" on public.products for select to anon,authenticated using(published or public.is_store_admin());
create policy "admins insert products" on public.products for insert to authenticated with check(public.is_store_admin());
create policy "admins update products" on public.products for update to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
create policy "admins delete products" on public.products for delete to authenticated using(public.is_store_admin());
create policy "public read applicable discounts" on public.discounts for select to anon,authenticated using(active and starts_at<=now() and ends_at>now());
create policy "admins manage discounts" on public.discounts for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
create policy "customers read own orders admins all" on public.orders for select to authenticated using(user_id=auth.uid() or public.is_store_admin());
create policy "customers read own order lines admins all" on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_store_admin())));
create policy "admins manage order status" on public.orders for update to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
create policy "admins read payments" on public.payment_records for select to authenticated using(public.is_store_admin());
create policy "public read visible settings" on public.store_settings for select to anon,authenticated using(public_visible or public.is_store_admin());
create policy "admins manage settings" on public.store_settings for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
-- No client-side policy permits order/payment insertion or payment confirmation. Those require a trusted server + provider webhook.
grant select on public.products,public.categories,public.discounts,public.store_settings to anon,authenticated;
grant select,update on public.profiles to authenticated;
grant select on public.admin_roles,public.orders,public.order_items,public.payment_records to authenticated;
grant insert,update,delete on public.products,public.categories,public.discounts,public.store_settings to authenticated;
grant update(status,updated_at) on public.orders to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('game-covers','game-covers',true,5242880,array['image/jpeg','image/png','image/webp','image/svg+xml']) on conflict(id) do nothing;
create policy "public view game covers" on storage.objects for select to anon,authenticated using(bucket_id='game-covers');
create policy "admins upload game covers" on storage.objects for insert to authenticated with check(bucket_id='game-covers' and public.is_store_admin());
create policy "admins update game covers" on storage.objects for update to authenticated using(bucket_id='game-covers' and public.is_store_admin()) with check(bucket_id='game-covers' and public.is_store_admin());
create policy "admins delete game covers" on storage.objects for delete to authenticated using(bucket_id='game-covers' and public.is_store_admin());
