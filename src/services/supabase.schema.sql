-- =========================================================
-- Schema Supabase/PostgreSQL para a plataforma de gestão de eventos
-- Execute no SQL editor do Supabase (ou via migration)
-- =========================================================

create extension if not exists "uuid-ossp";

create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  date date not null,
  time text not null,
  location text not null,
  description text default '',
  welcome_message text default '',
  max_guests_total integer,
  cover_emoji text,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists guests (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  responsible_name text not null,
  phone text not null,
  expected_people integer not null default 1,
  confirmed_people integer not null default 0,
  status text not null default 'pendente' check (status in ('pendente', 'confirmado', 'recusado')),
  responded_at timestamptz,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_guests_event_id on guests(event_id);
create index if not exists idx_guests_slug on guests(slug);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table events enable row level security;
alter table guests enable row level security;

-- Administrador autenticado só vê/edita os próprios eventos
create policy "owners manage their events"
  on events for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Administrador autenticado gerencia convidados dos próprios eventos
create policy "owners manage their guests"
  on guests for all
  using (exists (select 1 from events e where e.id = guests.event_id and e.owner_id = auth.uid()))
  with check (exists (select 1 from events e where e.id = guests.event_id and e.owner_id = auth.uid()));

-- Acesso público (anon) somente leitura/escrita pontual via slug — feito
-- através de uma function RPC (abaixo) em vez de policy aberta, para evitar
-- que alguém liste todos os convidados.
create or replace function get_guest_by_slug(p_slug text)
returns table (
  id uuid, event_id uuid, responsible_name text, phone text,
  expected_people integer, confirmed_people integer, status text,
  responded_at timestamptz, slug text,
  event_name text, event_date date, event_time text, event_location text,
  event_description text, event_welcome_message text, event_max_guests_total integer
)
language sql security definer as $$
  select g.id, g.event_id, g.responsible_name, g.phone, g.expected_people,
         g.confirmed_people, g.status, g.responded_at, g.slug,
         e.name, e.date, e.time, e.location, e.description, e.welcome_message, e.max_guests_total
  from guests g join events e on e.id = g.event_id
  where g.slug = p_slug;
$$;

create or replace function submit_guest_response(p_slug text, p_responsible_name text, p_confirmed_people integer, p_status text)
returns guests
language plpgsql security definer as $$
declare
  v_guest guests;
  v_event events;
  v_others_confirmed integer;
begin
  select * into v_guest from guests where slug = p_slug;
  if not found then
    raise exception 'Convite não encontrado';
  end if;

  select * into v_event from events where id = v_guest.event_id;

  if p_status = 'confirmado' then
    if p_confirmed_people > v_guest.expected_people then
      raise exception 'Quantidade acima do previsto para este convite';
    end if;
    if v_event.max_guests_total is not null then
      select coalesce(sum(confirmed_people), 0) into v_others_confirmed
        from guests where event_id = v_guest.event_id and id <> v_guest.id and status = 'confirmado';
      if v_others_confirmed + p_confirmed_people > v_event.max_guests_total then
        raise exception 'Limite máximo de convidados atingido';
      end if;
    end if;
  end if;

  update guests set
    responsible_name = coalesce(nullif(p_responsible_name, ''), responsible_name),
    confirmed_people = case when p_status = 'confirmado' then p_confirmed_people else 0 end,
    status = p_status,
    responded_at = now()
  where slug = p_slug
  returning * into v_guest;

  return v_guest;
end;
$$;
