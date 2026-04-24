-- Run this in Supabase SQL Editor to set up the database schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- DROP EXISTING TABLES AND TRIGGERS (DESTRUCTIVE MIGRATION)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop trigger if exists on_profile_created on public.profiles;
drop function if exists public.create_default_playlist();

drop table if exists public.continue_watching cascade;
drop table if exists public.playlist_items cascade;
drop table if exists public.playlists cascade;
drop table if exists public.profiles cascade;

-- Create profiles table (Now supports multiple per user)
create table public.profiles (
  id uuid default uuid_generate_v4() primary key not null,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  avatar text default 'default',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create playlists table (Links to profile_id)
create table public.playlists (
  id uuid default uuid_generate_v4() primary key not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default 'Minha Lista',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create playlist_items table
create table public.playlist_items (
  id uuid default uuid_generate_v4() primary key not null,
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  tmdb_id integer not null,
  media_type text not null,
  title text not null,
  poster_path text,
  backdrop_path text,
  vote_average numeric(3,1),
  overview text,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(playlist_id, tmdb_id)
);

-- Create continue_watching table
create table public.continue_watching (
  id uuid default uuid_generate_v4() primary key not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  media_type text not null,
  title text not null,
  poster_path text,
  backdrop_path text,
  progress integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(profile_id, tmdb_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_items enable row level security;
alter table public.continue_watching enable row level security;

-- Create policies

-- Profiles: user can manage their own profiles
create policy "Users can manage their own profiles"
  on public.profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Playlists: user can manage playlists of their profiles
create policy "Users can manage their own profiles playlists"
  on public.playlists for all
  using (exists (select 1 from public.profiles where id = profile_id and user_id = auth.uid()))
  with check (exists (select 1 from public.profiles where id = profile_id and user_id = auth.uid()));

-- Playlist Items: user can manage items of playlists of their profiles
create policy "Users can manage their own playlist items"
  on public.playlist_items for all
  using (exists (
    select 1 from public.playlists pl
    join public.profiles pr on pr.id = pl.profile_id
    where pl.id = playlist_id and pr.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.playlists pl
    join public.profiles pr on pr.id = pl.profile_id
    where pl.id = playlist_id and pr.user_id = auth.uid()
  ));

-- Continue Watching: user can manage continue watching of their profiles
create policy "Users can manage their own continue watching"
  on public.continue_watching for all
  using (exists (select 1 from public.profiles where id = profile_id and user_id = auth.uid()))
  with check (exists (select 1 from public.profiles where id = profile_id and user_id = auth.uid()));

-- Auto-create default profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-create default playlist for new profiles
create or replace function public.create_default_playlist()
returns trigger as $$
begin
  insert into public.playlists (profile_id, name)
  values (new.id, 'Minha Lista');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.create_default_playlist();