-- supabase/migrations/001_blog_system.sql
-- MyTripMoney Editor Agent + Blog system
-- Run once in the Supabase SQL editor.

-- ──────────────────────────────────────────────────────────────────────────
-- editor_decisions — one row per day with the day's editorial decision.
-- /api/editor-agent writes this; /api/blog-generate reads it.
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists editor_decisions (
  id                 uuid primary key default gen_random_uuid(),
  decision_date      date not null,
  decision_type      text not null check (decision_type in ('new_post','refresh_post','kill_keyword','fallback')),
  target_keyword     text,
  target_post_slug   text,
  reasoning          text not null,
  urgency_score      int  not null check (urgency_score between 1 and 10),
  gsc_data_snapshot  jsonb,
  consumed_at        timestamptz,
  created_at         timestamptz not null default now()
);

create unique index if not exists editor_decisions_one_per_day
  on editor_decisions (decision_date);

create index if not exists editor_decisions_unconsumed
  on editor_decisions (decision_date) where consumed_at is null;

alter table editor_decisions disable row level security;

-- ──────────────────────────────────────────────────────────────────────────
-- blog_posts — published articles
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists blog_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  excerpt         text,
  body_html       text not null,
  category        text,
  author          text default 'MyTripMoney',
  author_slug     text default 'marcus-chen',
  meta_title      text,
  meta_desc       text,
  tags            text[],
  target_keyword  text,
  status          text default 'published',
  published_at    timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists blog_posts_published
  on blog_posts (published_at desc) where status = 'published';

alter table blog_posts disable row level security;

-- ──────────────────────────────────────────────────────────────────────────
-- newsletter_subscribers — email list
-- A subscriber is "active" when unsubscribed_at IS NULL.
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists newsletter_subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             text unique not null,
  subscribed_at     timestamptz default now(),
  unsubscribed_at   timestamptz,
  source            text
);

alter table newsletter_subscribers disable row level security;

-- ──────────────────────────────────────────────────────────────────────────
-- activity_feed — optional, used by blog-generate for admin dashboard later
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists activity_feed (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,
  message     text not null,
  created_at  timestamptz default now()
);

alter table activity_feed disable row level security;

-- Sanity check
select
  (select count(*) from editor_decisions)    as decisions_count,
  (select count(*) from blog_posts)          as posts_count,
  (select count(*) from newsletter_subscribers) as subscribers_count;
