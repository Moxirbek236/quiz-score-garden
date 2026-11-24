CREATE TABLE public.questions (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  text text not null,
  options jsonb not null,
  correct_index int not null,
  created_at timestamptz not null default now()
);
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.submissions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  group_name text not null,
  answers jsonb not null default '{}'::jsonb,
  score int not null default 0,
  total int not null default 0,
  created_at timestamptz not null default now()
);
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

INSERT INTO public.questions (position, text, options, correct_index) VALUES
(1, 'O''zbekiston poytaxti qaysi shahar?', '["Samarqand","Toshkent","Buxoro","Xiva"]', 1),
(2, '5 + 7 nechaga teng?', '["11","12","13","14"]', 1),
(3, 'HTML nimaning qisqartmasi?', '["HyperText Markup Language","High Tech Modern Language","Home Tool Markup Language","Hyper Transfer Mail Language"]', 0),
(4, 'Yer Quyosh atrofini necha kunda aylanadi?', '["30","180","365","500"]', 2),
(5, 'Qaysi biri dasturlash tili?', '["Photoshop","Python","Excel","Chrome"]', 1);