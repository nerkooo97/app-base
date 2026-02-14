create table if not exists betonara_recepture (
  id uuid default gen_random_uuid() primary key,
  naziv text not null,
  opis text,
  
  -- Agregati (kg per 1 m3)
  agg1_kg numeric(18,4) default 0,
  agg2_kg numeric(18,4) default 0,
  agg3_kg numeric(18,4) default 0,
  agg4_kg numeric(18,4) default 0,
  agg5_kg numeric(18,4) default 0,
  agg6_kg numeric(18,4) default 0,

  -- Cementi (kg per 1 m3)
  cem1_kg numeric(18,4) default 0,
  cem2_kg numeric(18,4) default 0,
  cem3_kg numeric(18,4) default 0,
  cem4_kg numeric(18,4) default 0,

  -- Aditivi (kg per 1 m3 or L depending on unit, usuall kg in this context based on production table)
  add1_kg numeric(18,4) default 0,
  add2_kg numeric(18,4) default 0,
  add3_kg numeric(18,4) default 0,
  add4_kg numeric(18,4) default 0,
  add5_kg numeric(18,4) default 0,

  -- Voda (kg/L per 1 m3)
  wat1_kg numeric(18,4) default 0,
  wat2_kg numeric(18,4) default 0,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index for searching recipes
create index if not exists idx_betonara_recepture_naziv on betonara_recepture(naziv);

-- Seed MB 40 Recipe
-- Based on image:
-- Agg 0/4 (Riječni) -> agg2 = 500
-- Agg 0/4 (Drobljeni) -> agg3 = 500
-- Agg 4/8 -> agg4 = 270
-- Agg 8/16 -> agg1 = 610
-- Cement -> cem1 = 350
-- Voda -> wat1 = 160
-- Aditiv -> add1 = 2
insert into betonara_recepture (naziv, agg2_kg, agg3_kg, agg4_kg, agg1_kg, cem1_kg, wat1_kg, add1_kg)
values ('MB 40', 500, 500, 270, 610, 350, 160, 2)
on conflict do nothing;
