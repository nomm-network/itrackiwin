-- Create social_posts table
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (length(body) <= 2000),
  media jsonb default null,
  visibility text not null default 'friends' check (visibility in ('public','friends','private')),
  like_count int not null default 0,
  comment_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Create social_reactions table
create table if not exists public.social_reactions (
  post_id uuid not null references public.social_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null check (emoji in ('💪','👏','👌','🔥','❤️','🥂','👍')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Create social_friendships table
create table if not exists public.social_friendships (
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','blocked')),
  requested_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  constraint no_self_friend check (user_id <> friend_id)
);

-- Create like counter trigger function
create or replace function public.bump_like_counter()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.social_posts set like_count = like_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.social_posts set like_count = like_count - 1 where id = old.post_id and like_count > 0;
  end if;
  return null;
end $$;

-- Create trigger for like counter
drop trigger if exists trg_reaction_like_counter on public.social_reactions;
create trigger trg_reaction_like_counter
after insert or delete on public.social_reactions
for each row execute function public.bump_like_counter();

-- Enable RLS
alter table public.social_posts enable row level security;
alter table public.social_reactions enable row level security;
alter table public.social_friendships enable row level security;

-- Helper function for friendship check
create or replace function public.are_friends(a uuid, b uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.social_friendships f
    where ((f.user_id = a and f.friend_id = b) or (f.user_id = b and f.friend_id = a))
      and f.status = 'accepted'
  );
$$;

-- RLS Policies for social_posts
create policy p_posts_insert
  on public.social_posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy p_posts_select
  on public.social_posts for select
  to authenticated
  using (
    visibility = 'public'
    or author_id = auth.uid()
    or (visibility = 'friends' and public.are_friends(author_id, auth.uid()))
  );

create policy p_posts_mutate
  on public.social_posts for update using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy p_posts_delete
  on public.social_posts for delete using (author_id = auth.uid());

-- RLS Policies for social_reactions
create policy p_react_insert
  on public.social_reactions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists(select 1 from public.social_posts p where p.id = post_id)
  );

create policy p_react_select
  on public.social_reactions for select
  to authenticated
  using (
    exists(select 1 from public.social_posts p
           where p.id = post_id
             and (p.visibility = 'public'
                  or p.author_id = auth.uid()
                  or (p.visibility='friends' and public.are_friends(p.author_id, auth.uid()))))
  );

create policy p_react_mutate
  on public.social_reactions for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy p_react_delete
  on public.social_reactions for delete using (user_id = auth.uid());

-- RLS Policies for social_friendships
create policy p_friend_request
  on public.social_friendships for insert
  to authenticated
  with check (requested_by = auth.uid());

create policy p_friend_view
  on public.social_friendships for select
  to authenticated
  using (user_id = auth.uid() or friend_id = auth.uid());

create policy p_friend_update
  on public.social_friendships for update
  using (user_id = auth.uid() or friend_id = auth.uid())
  with check (user_id = auth.uid() or friend_id = auth.uid());

create policy p_friend_delete
  on public.social_friendships for delete
  using (user_id = auth.uid() or friend_id = auth.uid());