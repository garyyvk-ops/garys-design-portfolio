create extension if not exists pgcrypto;

create table if not exists public.site_content (
  slug text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  title text not null,
  kind text not null,
  audience text not null default '',
  date_label text not null default 'New post',
  summary text not null,
  media_note text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  position bigint not null default extract(epoch from now())::bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_position_idx on public.posts (position desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
before update on public.posts
for each row execute procedure public.touch_updated_at();

drop trigger if exists site_content_touch_updated_at on public.site_content;
create trigger site_content_touch_updated_at
before update on public.site_content
for each row execute procedure public.touch_updated_at();

insert into public.site_content (slug, payload)
values (
  'main',
  jsonb_build_object(
    'siteTitle', 'Gary''s Design',
    'introHeading', 'Instructional design work, written and shown.',
    'introCopy', 'A simple publishing home for learning articles, process images, demo videos, and complete case-study posts.',
    'profileName', 'Gary',
    'profileRole', 'Instructional Designer',
    'profileBio', 'Use this space for your specialty, your point of view, and the kinds of learning problems you solve.',
    'featuredEyebrow', 'Featured case study',
    'featuredTitle', 'From course notes to learner pathway.',
    'featuredCopy', 'Lead with a strong piece that combines article writing, screenshots, and a short walkthrough video.',
    'featuredMedia', 'Featured article + gallery + video',
    'contactHeading', 'Invite the work into a conversation.',
    'contactCopy', 'Use this footer for your email, resume, LinkedIn, and a short note about the kinds of learning design projects you want to take on next.',
    'contactEmail', 'hello@example.com',
    'linkedinLabel', 'LinkedIn profile URL',
    'linkedinUrl', '',
    'resumeLabel', 'Resume PDF link',
    'resumeUrl', ''
  )
)
on conflict (slug) do nothing;
