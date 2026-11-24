import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getQuestions, getTests, submitTest, type PublicQuestion } from "@/lib/quiz.functions";
import {
  gradeLabel,
  MAX_ANSWER_TEXT_LENGTH,
  percent,
  splitQuestionImage,
  type AnswerMap,
  type AnswerValue,
} from "@/lib/grading";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Testni boshlash — Test tizimi" },
      {
        name: "description",
        content: "Ism, familiya va guruhingizni kiriting va testni yeching.",
      },
      { property: "og:title", content: "Testni boshlash — Test tizimi" },
      {
        property: "og:description",
        content: "Ism, familiya va guruhingizni kiriting va testni yeching.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentPage,
});

type TestInfo = { id: string; title: string; description: string };
type StudentInfo = { firstName: string; lastName: string; group: string };
type Result = { score: number; total: number; manualPoints: number };

const INFO_FIELDS = [
  ["firstName", "Ism"],
  ["lastName", "Familiya"],
  ["group", "Guruh"],
] as const;

/** Javob berilgan savollar soni (kiritish savolida kamida bitta maydon to'ldirilgan bo'lsa). */
function countAnswered(questions: PublicQuestion[], answers: AnswerMap): number {
  return questions.filter((q) => {
    const a = answers[q.id];
    if (a === undefined) return false;
    return typeof a === "number" || Object.values(a).some((v) => v.trim() !== "");
  }).length;
}

function QuestionTitle({ index, text }: { index: number; text: string }) {
  const { text: body, image } = splitQuestionImage(text);
  return (
    <>
      <h2 className="text-lg font-semibold">
        <span className="text-accent">{index}.</span> {body}
      </h2>
      {image && (
        <img
          src={image}
          alt="Blok-sxema"
          loading="lazy"
          className="mx-auto mt-4 max-w-full rounded-xl border border-border bg-white"
        />
      )}
    </>
  );
}

function StudentPage() {
  const loadTests = useServerFn(getTests);
  const loadQuestions = useServerFn(getQuestions);
  const submit = useServerFn(submitTest);
  const [tests, setTests] = useState<TestInfo[]>([]);
  const [testId, setTestId] = useState("");
  const [step, setStep] = useState<"info" | "test" | "done">("info");
  const [info, setInfo] = useState<StudentInfo>({ firstName: "", lastName: "", group: "" });
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadTests()
      .then((list) => {
        setTests(list);
        setTestId((cur) => cur || list[0]?.id || "");
      })
      .catch((x) => setErr((x as Error).message));
  }, [loadTests]);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = {
      firstName: info.firstName.trim(),
      lastName: info.lastName.trim(),
      group: info.group.trim(),
    };
    if (!cleaned.firstName || !cleaned.lastName || !cleaned.group) {
      setErr("Barcha maydonlarni to'ldiring");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      setQuestions(await loadQuestions({ data: { testId } }));
      setInfo(cleaned);
      setStep("test");
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    const unanswered = countAnswered(questions, answers) < questions.length;
    if (unanswered && !confirm("Hamma savolga javob bermadingiz. Baribir yakunlaysizmi?")) return;
    setBusy(true);
    setErr("");
    try {
      setResult(await submit({ data: { ...info, testId, answers } }));
      setStep("done");
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-primary">Test tizimi</span>
          <Link
            to="/teacher"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Ustoz uchun
          </Link>
        </header>

        {step === "info" && (
          <InfoForm
            info={info}
            onChange={setInfo}
            tests={tests}
            testId={testId}
            onTestChange={setTestId}
            onSubmit={start}
            busy={busy}
            err={err}
          />
        )}
        {step === "test" && (
          <TestView
            info={info}
            questions={questions}
            answers={answers}
            onAnswer={(questionId, value) =>
              setAnswers((prev) => ({ ...prev, [questionId]: value }))
            }
            onFinish={finish}
            busy={busy}
            err={err}
          />
        )}
        {step === "done" && result && <ResultView firstName={info.firstName} result={result} />}
      </div>
    </main>
  );
}

function InfoForm(props: {
  info: StudentInfo;
  onChange: (info: StudentInfo) => void;
  tests: TestInfo[];
  testId: string;
  onTestChange: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  busy: boolean;
  err: string;
}) {
  const { info, onChange, tests, testId, onTestChange, onSubmit, busy, err } = props;
  const selected = tests.find((t) => t.id === testId);
  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-card p-8 shadow-paper">
      <h1 className="text-4xl font-bold">Testni boshlash</h1>
      <p className="mt-2 text-muted-foreground">Ma'lumotlaringizni kiriting.</p>
      <div className="mt-8 space-y-4">
        {INFO_FIELDS.map(([key, label]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-sm font-medium">{label}</span>
            <input
              required
              className="field"
              value={info[key]}
              onChange={(e) => onChange({ ...info, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Test</span>
          <select
            required
            className="field"
            value={testId}
            onChange={(e) => onTestChange(e.target.value)}
          >
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          {selected?.description && (
            <span className="mt-1 block text-sm text-muted-foreground">{selected.description}</span>
          )}
        </label>
      </div>
      {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
      <button disabled={busy || !testId} className="btn-primary mt-8 w-full">
        {busy ? "Yuklanmoqda..." : "Testni ochish"}
      </button>
    </form>
  );
}

function TestView(props: {
  info: StudentInfo;
  questions: PublicQuestion[];
  answers: AnswerMap;
  onAnswer: (questionId: string, value: AnswerValue) => void;
  onFinish: () => void;
  busy: boolean;
  err: string;
}) {
  const { info, questions, answers, onAnswer, onFinish, busy, err } = props;
  const answered = countAnswered(questions, answers);
  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-6 bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            {info.firstName} {info.lastName} · {info.group}
          </span>
          <span className="text-muted-foreground">
            {answered}/{questions.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${percent(answered, questions.length)}%` }}
          />
        </div>
      </div>
      <ol className="space-y-5">
        {questions.map((q, i) => (
          <li key={q.id} className="rounded-2xl bg-card p-6 shadow-paper">
            {(i === 0 || questions[i - 1]!.section !== q.section) && q.section && (
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
                {q.section}
              </p>
            )}
            <QuestionTitle index={i + 1} text={q.text} />
            {q.kind === "choice" ? (
              <div className="mt-4 grid gap-2">
                {q.options.map((option, optionIndex) => {
                  const selected = answers[q.id] === optionIndex;
                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      onClick={() => onAnswer(q.id, optionIndex)}
                      className={`rounded-xl border px-4 py-3 text-left transition ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <span className="mr-2 font-semibold">
                        {String.fromCharCode(65 + optionIndex)})
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {q.fields.map((f) => {
                  const current = answers[q.id];
                  const value =
                    current !== undefined && typeof current === "object"
                      ? (current[f.key] ?? "")
                      : "";
                  return (
                    <label key={f.key} className="block">
                      <span className="mb-1 block text-sm font-medium">{f.label}</span>
                      <input
                        className="field"
                        value={value}
                        maxLength={MAX_ANSWER_TEXT_LENGTH}
                        onChange={(e) => {
                          const prev =
                            current !== undefined && typeof current === "object" ? current : {};
                          onAnswer(q.id, { ...prev, [f.key]: e.target.value });
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </li>
        ))}
      </ol>
      {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
      <button disabled={busy} onClick={onFinish} className="btn-primary mt-8 w-full">
        {busy ? "Yuborilmoqda..." : "Testni yakunlash"}
      </button>
    </div>
  );
}

function ResultView({ firstName, result }: { firstName: string; result: Result }) {
  return (
    <div className="rounded-2xl bg-card p-10 text-center shadow-paper">
      <p className="text-muted-foreground">Natijangiz</p>
      <p className="mt-2 font-display text-7xl font-bold text-primary">
        {result.score}/{result.total}
      </p>
      <p className="mt-2 text-2xl font-semibold text-accent">
        {percent(result.score, result.total)}% · {gradeLabel(result.score, result.total)}
      </p>
      {result.manualPoints > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Yana {result.manualPoints} ball qiymatidagi javoblarni ustoz qo'lda tekshiradi.
        </p>
      )}
      <p className="mt-6 text-muted-foreground">
        Natija ustozingizga yuborildi. Rahmat, {firstName}!
      </p>
    </div>
  );
}
