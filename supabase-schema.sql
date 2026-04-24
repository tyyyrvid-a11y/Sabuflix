-- Run this in Supabase SQL Editor to set up the database schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  avatar text default 'default',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create playlists table
create table public.playlists (
  id uuid default uuid_generate_v4() primary key not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
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

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_items enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view their own playlists"
  on public.playlists for select
  using (auth.uid() = user_id);

create policy "Users can create their own playlists"
  on public.playlists for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own playlists"
  on public.playlists for delete
  using (auth.uid() = user_id);

create policy "Users can view their own playlist items"
  on public.playlist_items for select
  using (exists (
    select 1 from public.playlists
    where id = playlist_id and user_id = auth.uid()
  ));

create policy "Users can add items to their own playlists"
  on public.playlist_items for insert
  with check (exists (
    select 1 from public.playlists
    where id = playlist_id and user_id = auth.uid()
  ));

create policy "Users can remove items from their own playlists"
  on public.playlist_items for delete
  using (exists (
    select 1 from public.playlists
    where id = playlist_id and user_id = auth.uid()
  ));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create default playlist for new users
create or replace function public.create_default_playlist()
returns trigger as $$
begin
  insert into public.playlists (user_id, name)
  values (new.id, 'Minha Lista');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.create_default_playlist();