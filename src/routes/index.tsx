import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getQuestions, submitTest } from "@/lib/quiz.functions";
import { percent } from "@/lib/grading";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Testni boshlash — Test tizimi" },
      { name: "description", content: "Ism, familiya va guruhingizni kiriting va testni yeching." },
      { property: "og:title", content: "Testni boshlash — Test tizimi" },
      { property: "og:description", content: "Ism, familiya va guruhingizni kiriting va testni yeching." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentPage,
});

type Q = { id: string; text: string; options: string[] };

function StudentPage() {
  const loadQ = useServerFn(getQuestions);
  const submit = useServerFn(submitTest);
  const [step, setStep] = useState<"info" | "test" | "done">("info");
  const [info, setInfo] = useState({ firstName: "", lastName: "", group: "" });
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try { setQuestions(await loadQ()); setStep("test"); }
    catch (x) { setErr((x as Error).message); }
    finally { setBusy(false); }
  }
  async function finish() {
    if (Object.keys(answers).length < questions.length &&
      !confirm("Hamma savolga javob bermadingiz. Baribir yakunlaysizmi?")) return;
    setBusy(true); setErr("");
    try { setResult(await submit({ data: { ...info, answers } })); setStep("done"); }
    catch (x) { setErr((x as Error).message); }
    finally { setBusy(false); }
  }

  const answered = Object.keys(answers).length;

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-primary">Test tizimi</span>
          <Link to="/teacher" className="text-sm text-muted-foreground underline-offset-4 hover:underline">Ustoz uchun</Link>
        </header>

        {step === "info" && (
          <form onSubmit={start} className="rounded-2xl bg-card p-8 shadow-paper">
            <h1 className="text-4xl font-bold">Testni boshlash</h1>
            <p className="mt-2 text-muted-foreground">Ma'lumotlaringizni kiriting.</p>
            <div className="mt-8 space-y-4">
              {([["firstName","Ism"],["lastName","Familiya"],["group","Guruh"]] as const).map(([k,l]) => (
                <label key={k} className="block">
                  <span className="mb-1 block text-sm font-medium">{l}</span>
                  <input required className="field" value={info[k]}
                    onChange={(e) => setInfo({ ...info, [k]: e.target.value })} />
                </label>
              ))}
            </div>
            {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
            <button disabled={busy} className="btn-primary mt-8 w-full">{busy ? "Yuklanmoqda..." : "Testni ochish"}</button>
          </form>
        )}

        {step === "test" && (
          <div>
            <div className="sticky top-0 z-10 -mx-4 mb-6 bg-background/90 px-4 py-3 backdrop-blur">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{info.firstName} {info.lastName} · {info.group}</span>
                <span className="text-muted-foreground">{answered}/{questions.length}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-accent transition-all" style={{ width: `${percent(answered, questions.length)}%` }} />
              </div>
            </div>
            <ol className="space-y-5">
              {questions.map((q, i) => (
                <li key={q.id} className="rounded-2xl bg-card p-6 shadow-paper">
                  <h2 className="text-lg font-semibold"><span className="text-accent">{i + 1}.</span> {q.text}</h2>
                  <div className="mt-4 grid gap-2">
                    {q.options.map((o, oi) => {
                      const sel = answers[q.id] === oi;
                      return (
                        <button key={oi} type="button" onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                          className={`rounded-xl border px-4 py-3 text-left transition ${sel ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>
                          <span className="mr-2 font-semibold">{String.fromCharCode(65 + oi)})</span>{o}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>
            {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
            <button disabled={busy} onClick={finish} className="btn-primary mt-8 w-full">{busy ? "Yuborilmoqda..." : "Testni yakunlash"}</button>
          </div>
        )}

        {step === "done" && result && (
          <div className="rounded-2xl bg-card p-10 text-center shadow-paper">
            <p className="text-muted-foreground">Natijangiz</p>
            <p className="mt-2 font-display text-7xl font-bold text-primary">{result.score}/{result.total}</p>
            <p className="mt-2 text-2xl font-semibold text-accent">{percent(result.score, result.total)}%</p>
            <p className="mt-6 text-muted-foreground">Natija ustozingizga yuborildi. Rahmat, {info.firstName}!</p>
          </div>
        )}
      </div>
    </main>
  );
}
