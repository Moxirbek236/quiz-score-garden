-- Quiz Score Garden: o'z Supabase loyihangiz uchun bir martalik sozlash.
-- Supabase → SQL Editor → New query → shu faylni qo'ying → Run.
-- Qayta ishga tushirsangiz ham zarari yo'q (IF NOT EXISTS).

create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  position int not null default 0,
  section text not null default '',
  text text not null,
  kind text not null check (kind in ('choice','input')),
  options jsonb,
  correct_index int,
  fields jsonb,
  points int not null default 1,
  partial boolean not null default false
);
create index if not exists test_questions_test_idx on public.test_questions(test_id, position);
-- Bir testda bir xil tartib raqamli ikkita savol bo'lmasligi uchun (seed parallel ishlasa ham).
create unique index if not exists test_questions_test_position_uniq
  on public.test_questions(test_id, position);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  group_name text not null,
  answers jsonb not null default '{}'::jsonb,
  score int not null default 0,
  total int not null default 0,
  created_at timestamptz not null default now(),
  test_id uuid references public.tests(id) on delete set null
);

-- Eski (ishlatilmaydigan) jadval: ilova uni har ishga tushganda tozalaydi, shuning uchun mavjud bo'lishi kerak.
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  text text not null,
  options jsonb not null,
  correct_index int not null,
  created_at timestamptz not null default now()
);

-- Ilova faqat serverdagi service_role kaliti bilan kiradi. RLS yoqilgan, siyosat yo'q =
-- brauzerdagi publishable kalit bu jadvallarga umuman kira olmaydi.
alter table public.tests enable row level security;
alter table public.test_questions enable row level security;
alter table public.submissions enable row level security;
alter table public.questions enable row level security;
grant all on public.tests, public.test_questions, public.submissions, public.questions to service_role;

-- Supabase API keshini yangilaydi, aks holda yangi jadvallar "schema cache" xatosini beradi.
notify pgrst, 'reload schema';
