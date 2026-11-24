CREATE TABLE public.tests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);
GRANT ALL ON public.tests TO service_role;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.test_questions (
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
CREATE INDEX test_questions_test_idx ON public.test_questions(test_id, position);
GRANT ALL ON public.test_questions TO service_role;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.submissions ADD COLUMN test_id uuid references public.tests(id) on delete set null;
COMMENT ON TABLE public.questions IS 'DEPRECATED: replaced by test_questions';

CREATE OR REPLACE FUNCTION public.notify_new_submission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM realtime.send('{}'::jsonb, 'new_submission', 'teacher-results', false);
  RETURN NULL;
END; $$;
REVOKE EXECUTE ON FUNCTION public.notify_new_submission() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER submissions_doorbell AFTER INSERT ON public.submissions
FOR EACH STATEMENT EXECUTE FUNCTION public.notify_new_submission();