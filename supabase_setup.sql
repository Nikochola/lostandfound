-- ============================================================
-- Run this in: supabase.com → your project → SQL Editor → New query
-- ============================================================

-- Items table
create table if not exists items (
  id text primary key,
  name text not null,
  category text not null,
  description text not null default '',
  location text not null default '',
  date text not null,
  status text not null default 'available',
  color text not null default '',
  image_url text not null default '',
  created_at timestamptz not null default now()
);

-- Reports table (lost item submissions from users)
create table if not exists reports (
  id text primary key,
  name text not null,
  description text not null,
  date text not null,
  seen boolean not null default false,
  created_at timestamptz not null default now()
);

-- Allow public read on items (anyone can browse found items)
alter table items enable row level security;
create policy "Public read items" on items for select using (true);
create policy "Service role full access items" on items using (auth.role() = 'service_role');

-- Allow public insert on reports (anyone can submit a lost report)
alter table reports enable row level security;
create policy "Public insert reports" on reports for insert with check (true);
create policy "Service role full access reports" on reports using (auth.role() = 'service_role');

-- ============================================================
-- After running the SQL above, go to:
-- Storage → New bucket → Name: "lost-and-found" → check "Public bucket" → Save
-- ============================================================
