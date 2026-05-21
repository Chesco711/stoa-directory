-- ============================================================
-- Stoa Member Project Directory — Supabase Schema
-- Run this once in the Supabase SQL editor
-- ============================================================

-- Members table
create table members (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  avatar      text,
  bio         text default '',
  location    text,
  social      jsonb default '{}',
  tags        text[] default '{}',
  visibility  text default 'public' check (visibility in ('public', 'community')),
  user_id     uuid references auth.users(id),
  created_at  timestamp with time zone default now()
);

-- Projects table
create table projects (
  id               uuid primary key default gen_random_uuid(),
  member_id        uuid references members(id) on delete cascade,
  title            text not null,
  description      text default '',
  url              text,
  type             text default 'app',
  tags             text[] default '{}',
  visibility       text default 'community' check (visibility in ('public', 'community')),
  status           text default 'active' check (status in ('active', 'shipped', 'wip')),
  thumbnail        text,
  seeking_feedback boolean default false,
  created_at       timestamp with time zone default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table members enable row level security;
alter table projects enable row level security;

-- Anyone can read public members
create policy "Public members visible to all"
  on members for select
  using (visibility = 'public');

-- Logged-in users can read all members
create policy "Authenticated users read all members"
  on members for select
  to authenticated
  using (true);

-- Members can update their own row
create policy "Members update own profile"
  on members for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Anyone can read public projects
create policy "Public projects visible to all"
  on projects for select
  using (visibility = 'public');

-- Logged-in users can read all projects
create policy "Authenticated users read all projects"
  on projects for select
  to authenticated
  using (true);

-- Members can insert/update/delete their own projects
create policy "Members manage own projects"
  on projects for all
  to authenticated
  using (
    member_id in (select id from members where user_id = auth.uid())
  )
  with check (
    member_id in (select id from members where user_id = auth.uid())
  );

-- ============================================================
-- Seed data — existing members
-- ============================================================

with inserted_members as (
  insert into members (slug, name, bio, visibility) values
    ('rex-mcintosh',  'Rex McIntosh',   'Building tech for swimmers.',                          'public'),
    ('kyle-connel',   'Kyle Connel',    'Golf and software.',                                   'public'),
    ('arthur-fox',    'Arthur Fox',     'Building at the intersection of finance and web3.',    'public'),
    ('zeneca-roy',    'Zeneca Roy',     'Digital art, web3, and creative experiments.',         'public'),
    ('priyank-sharma','Priyank Sharma', 'Researching and building in longevity and healthspan.','public'),
    ('maddie-grant',  'Maddie Grant',   'Building tools at the intersection of astrology and everyday life.', 'public')
  returning id, slug
)
insert into projects (member_id, title, description, url, type, tags, visibility, status, seeking_feedback)
select m.id, p.title, p.description, p.url, p.type, p.tags, p.visibility, p.status, p.seeking_feedback
from inserted_members m
join (values
  ('rex-mcintosh',   'Swimtrack',      'Training tracker built for competitive swimmers.',                   'https://swimtrack.ai',                      'app', array['fitness','ai'],          'public', 'active', false),
  ('kyle-connel',    'Swingstakes',    'Competitive golf challenges with real stakes.',                      'https://swingstakes-six.vercel.app/',       'app', array['golf','gaming'],        'public', 'active', false),
  ('arthur-fox',     'Yieldseeker',    'Find and compare yield opportunities across DeFi.',                  'https://yieldseeker.xyz',                   'app', array['defi','finance'],       'public', 'active', false),
  ('zeneca-roy',     'Yoshi',          'A creative project exploring digital identity and expression.',      'https://yoshizen.co',                       'app', array['web3','creative'],      'public', 'active', false),
  ('priyank-sharma', 'Longevity Lab',  'Tools and resources for tracking and improving healthspan.',         'https://longevity-lab-view.lovable.app/',   'app', array['health','longevity'],   'public', 'active', false),
  ('maddie-grant',   'Moon Mansion',   'A calculator for exploring moon mansions and their influence.',      'http://moonmansioncalculator.com',          'app', array['astrology','wellness'], 'public', 'active', false)
) as p(slug, title, description, url, type, tags, visibility, status, seeking_feedback)
on m.slug = p.slug;
