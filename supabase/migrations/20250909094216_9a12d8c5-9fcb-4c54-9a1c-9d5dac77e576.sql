-- Add comment reactions table (using correct table name social_post_comments)
create table if not exists public.social_comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.social_post_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.post_reaction not null,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

-- Add comment replies table
create table if not exists public.social_comment_replies (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.social_post_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (length(btrim(body)) > 0),
  replied_to_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.social_comment_reactions enable row level security;
alter table public.social_comment_replies enable row level security;

-- RLS policies for comment reactions
create policy "read comment reactions" on public.social_comment_reactions
  for select using (true);

create policy "manage own comment reactions" on public.social_comment_reactions
  for all using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- RLS policies for comment replies
create policy "read comment replies" on public.social_comment_replies
  for select using (true);

create policy "insert comment replies for friends" on public.social_comment_replies
  for insert
  with check (
    exists (
      select 1
      from public.social_post_comments c
      join public.social_posts p on p.id = c.post_id
      join public.social_friendships f
        on (
          (f.user_id = p.author_id and f.friend_id = auth.uid())
          or
          (f.friend_id = p.author_id and f.user_id = auth.uid())
        )
      where f.status = 'accepted' and c.id = comment_id
    )
  );

create policy "manage own comment replies" on public.social_comment_replies
  for all using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- Add indexes
create index if not exists idx_comment_reactions_comment on public.social_comment_reactions(comment_id);
create index if not exists idx_comment_replies_comment on public.social_comment_replies(comment_id);