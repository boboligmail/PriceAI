create extension if not exists pgcrypto;

create table if not exists canonical_products (
  id text primary key,
  slug text unique,
  display_name text not null,
  platform text not null default 'other',
  product_type text not null default 'other',
  spec text not null default '',
  summary text not null default '',
  aliases text[] not null default '{}'::text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sources (
  id text primary key,
  name text not null,
  base_url text,
  entry_url text not null,
  collection_method text not null default 'manual',
  enabled boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists raw_offers (
  id text primary key,
  source_id text references sources(id) on delete set null,
  source_name text not null default '',
  source_store_name text,
  source_title text not null default '',
  price numeric,
  currency text not null default 'CNY',
  status text not null default 'unknown',
  url text not null default '',
  tags text[] not null default '{}'::text[],
  stock_count integer,
  hidden boolean not null default false,
  canonical_product_id text references canonical_products(id) on delete set null,
  category_slug text,
  captured_at timestamptz not null default now(),
  source_updated_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists offer_matches (
  id text primary key,
  raw_offer_id text references raw_offers(id) on delete cascade,
  canonical_product_id text references canonical_products(id) on delete cascade,
  confidence numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists crawl_runs (
  id text primary key default gen_random_uuid()::text,
  source_id text references sources(id) on delete set null,
  source_name text,
  mode text not null default 'manual',
  status text not null default 'failed',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  success_count integer not null default 0,
  failure_count integer not null default 0,
  message text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists canonical_products_active_idx on canonical_products(is_active);
create index if not exists canonical_products_platform_idx on canonical_products(platform);
create index if not exists sources_enabled_idx on sources(enabled);
create index if not exists sources_collection_method_idx on sources(collection_method);
create index if not exists raw_offers_source_id_idx on raw_offers(source_id);
create index if not exists raw_offers_canonical_product_id_idx on raw_offers(canonical_product_id);
create index if not exists raw_offers_hidden_idx on raw_offers(hidden);
create index if not exists raw_offers_captured_at_idx on raw_offers(captured_at desc);
create index if not exists raw_offers_status_idx on raw_offers(status);
create index if not exists crawl_runs_started_at_idx on crawl_runs(started_at desc);
