-- Optional contact number for authenticated customer profile management.
alter table public.profiles add column if not exists phone text;
