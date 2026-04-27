-- ============================================
-- REKITEE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  is_membership boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- PUBLICATIONS TABLE (like Medium publications)
-- ============================================
create table if not exists public.publications (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  logo_url text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- POSTS TABLE
-- ============================================
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  publication_id uuid references public.publications(id) on delete set null,
  title text not null,
  subtitle text,
  cover_image text,
  content jsonb, -- Structured content with sections
  is_member_only boolean default false,
  is_published boolean default true,
  claps_count integer default 0,
  comments_count integer default 0,
  read_time text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- TAGS TABLE
-- ============================================
create table if not exists public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null
);

-- ============================================
-- POST TAGS (many-to-many)
-- ============================================
create table if not exists public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ============================================
-- LIKES TABLE (for claps)
-- ============================================
create table if not exists public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- ============================================
-- COMMENTS TABLE
-- ============================================
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- ============================================
-- FOLLOWS TABLE
-- ============================================
create table if not exists public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);

-- ============================================
-- BOOKMARKS TABLE (saved posts)
-- ============================================
create table if not exists public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.publications enable row level security;
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.bookmarks enable row level security;

-- PROFILES policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- POSTS policies
create policy "Published posts are viewable by everyone"
  on public.posts for select using (is_published = true);

create policy "Users can insert their own posts"
  on public.posts for insert with check (auth.uid() = author_id);

create policy "Authors can update their own posts"
  on public.posts for update using (auth.uid() = author_id);

create policy "Authors can delete their own posts"
  on public.posts for delete using (auth.uid() = author_id);

-- LIKES policies
create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

create policy "Users can like posts"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike (delete their likes)"
  on public.likes for delete using (auth.uid() = user_id);

-- COMMENTS policies
create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Authenticated users can comment"
  on public.comments for insert with check (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.comments for delete using (auth.uid() = author_id);

-- FOLLOWS policies
create policy "Follows are viewable by everyone"
  on public.follows for select using (true);

create policy "Users can follow"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete using (auth.uid() = follower_id);

-- BOOKMARKS policies
create policy "Users can view their own bookmarks"
  on public.bookmarks for select using (auth.uid() = user_id);

create policy "Users can add bookmarks"
  on public.bookmarks for insert with check (auth.uid() = user_id);

create policy "Users can remove bookmarks"
  on public.bookmarks for delete using (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to increment post clap count
create or replace function increment_claps(post_uuid uuid)
returns void as $$
begin
  update public.posts set claps_count = claps_count + 1 where id = post_uuid;
end;
$$ language plpgsql security definer;

-- Function to decrement post clap count
create or replace function decrement_claps(post_uuid uuid)
returns void as $$
begin
  update public.posts set claps_count = claps_count - 1 where id = post_uuid and claps_count > 0;
end;
$$ language plpgsql security definer;

-- Function to increment post comment count
create or replace function increment_comments(post_uuid uuid)
returns void as $$
begin
  update public.posts set comments_count = comments_count + 1 where id = post_uuid;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- STORAGE (for avatars and images)
-- ============================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- SAMPLE DATA (optional - uncomment to add)
-- ============================================

-- Insert sample tags
-- insert into public.tags (name) values 
--   ('AI'), ('Design'), ('Technology'), ('Cognitive Science'), ('Startups'), ('Product');

-- ============================================
-- COMPLETED!
-- Now go to Supabase Dashboard > Table Editor to see your tables
-- Also check Storage to see the avatars bucket
-- ============================================