import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { deleteResult, getResults, getSubmissionReview } from "@/lib/quiz.functions";
import { gradeLabel, isPassing, percent, type ReviewItem } from "@/lib/grading";

export const Route = createFileRoute("/teacher")({
  head: () => ({
    meta: [
      { title: "Ustoz paneli — Test tizimi" },
      { name: "description", content: "O'quvchilarning test natijalarini ko'rish." },
      { property: "og:title", content: "Ustoz paneli — Test tizimi" },
      { property: "og:description", content: "O'quvchilarning test natijalarini ko'rish." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherPage,
});

type Row = Awaited<ReturnType<typeof getResults>>[number];

const PASSWORD_STORAGE_KEY = "tp";
const TABLE_HEADERS = ["Ism Familiya", "Guruh", "Test", "Ball", "Foiz", "Daraja", "Sana", ""];

function ReviewList({ items }: { items: ReviewItem[] | null }) {
  if (items === null) return <>Yuklanmoqda...</>;
  if (items.length === 0) return <>Bu natija uchun javoblar mavjud emas.</>;
  const ok = "text-success";
  const bad = "text-destructive";
  return (
    <ol className="space-y-4">
      {items.map((it, i) => (
        <li key={i} className="rounded-xl bg-card p-4">
          <p className="font-medium">
            <span className="text-muted-foreground">{i + 1}.</span> {it.text}{" "}
            <span className="text-muted-foreground">({it.points} ball)</span>
          </p>
          {it.image && (
            <img
              src={it.image}
              alt="Blok-sxema"
              className="mt-2 max-h-56 rounded-lg border border-border bg-white"
            />
          )}
          {it.kind === "choice" ? (
            <ul className="mt-2 space-y-1">
              {it.options.map((o, oi) => {
                const chosen = it.chosen === oi;
                const correct = it.correct === oi;
                return (
                  <li
                    key={oi}
                    className={
                      chosen ? (correct ? ok : bad) : correct ? ok : "text-muted-foreground"
                    }
                  >
                    {chosen ? "● " : "○ "}
                    {String.fromCharCode(65 + oi)}) {o}
                    {chosen && correct && " ✓"}
                    {chosen && !correct && " ✗ (o'quvchi shuni tanlagan)"}
                    {!chosen && correct && " — to'g'ri javob"}
                  </li>
                );
              })}
              {it.chosen === null && <li className={bad}>Javob bermagan</li>}
            </ul>
          ) : (
            <ul className="mt-2 space-y-1">
              {it.fields.map((f, fi) => (
                <li key={fi}>
                  <span className="text-muted-foreground">{f.label}:</span>{" "}
                  <span className={f.earned === null ? "font-medium" : f.earned > 0 ? ok : bad}>
                    {f.given || "(javob bermagan)"}
                  </span>
                  {f.earned === null ? (
                    <span className="text-muted-foreground">
                      {" "}
                      — qo'lda tekshiring ({f.points} ball)
                    </span>
                  ) : f.earned > 0 ? (
                    " ✓"
                  ) : (
                    <span className="text-muted-foreground">
                      {" "}
                      ✗ to'g'ri javob: {f.expected?.[0]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

function TeacherPage() {
  const fetchResults = useServerFn(getResults);
  const removeResult = useServerFn(deleteResult);
  const fetchReview = useServerFn(getSubmissionReview);
  const [openId, setOpenId] = useState<string | null>(null);
  const [review, setReview] = useState<ReviewItem[] | null>(null);
  const [pw, setPw] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [group, setGroup] = useState("");

  /** Parolni tekshirib, natijalarni yuklaydi. Muvaffaqiyatsiz bo'lsa kirish formasiga qaytaradi. */
  const login = useCallback(
    async (password: string) => {
      setErr("");
      try {
        setRows(await fetchResults({ data: { password } }));
        sessionStorage.setItem(PASSWORD_STORAGE_KEY, password);
      } catch (x) {
        setErr((x as Error).message);
        sessionStorage.removeItem(PASSWORD_STORAGE_KEY);
      }
    },
    [fetchResults],
  );

  /** Kirib bo'lgach ro'yxatni yangilaydi. Xato bo'lsa mavjud ro'yxat saqlanadi va xato ko'rsatiladi. */
  async function refresh() {
    setErr("");
    try {
      setRows(await fetchResults({ data: { password: pw } }));
    } catch (x) {
      setErr((x as Error).message);
    }
  }

  async function remove(r: Row) {
    if (
      !confirm(`${r.first_name} ${r.last_name} natijasini o'chirasizmi? Buni qaytarib bo'lmaydi.`)
    )
      return;
    setErr("");
    try {
      await removeResult({ data: { password: pw, id: r.id } });
      setRows((prev) => prev?.filter((x) => x.id !== r.id) ?? prev);
      if (openId === r.id) setOpenId(null);
    } catch (x) {
      setErr((x as Error).message);
    }
  }

  async function toggleReview(r: Row) {
    if (openId === r.id) {
      setOpenId(null);
      return;
    }
    setOpenId(r.id);
    setReview(null);
    try {
      setReview(await fetchReview({ data: { password: pw, id: r.id } }));
    } catch (x) {
      setErr((x as Error).message);
    }
  }

  useEffect(() => {
    const stored = sessionStorage.getItem(PASSWORD_STORAGE_KEY);
    if (!stored) return;
    setPw(stored);
    void login(stored);
  }, [login]);

  const groups = useMemo(() => [...new Set((rows ?? []).map((r) => r.group_name))].sort(), [rows]);
  const shown = (rows ?? []).filter((r) => !group || r.group_name === group);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-primary">Ustoz paneli</span>
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            O'quvchi sahifasi
          </Link>
        </header>

        {!rows ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void login(pw);
            }}
            className="mx-auto max-w-sm rounded-2xl bg-card p-8 shadow-paper"
          >
            <h1 className="text-3xl font-bold">Kirish</h1>
            <input
              type="password"
              required
              placeholder="Parol"
              className="field mt-6"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
            <button className="btn-primary mt-6 w-full">Kirish</button>
          </form>
        ) : (
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h1 className="text-4xl font-bold">
                Natijalar <span className="text-muted-foreground">({shown.length})</span>
              </h1>
              <div className="flex gap-2">
                <select
                  className="field w-auto"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                >
                  <option value="">Barcha guruhlar</option>
                  {groups.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
                <button onClick={refresh} className="btn-primary">
                  Yangilash
                </button>
              </div>
            </div>
            {err && (
              <p role="alert" className="mb-4 text-sm text-destructive">
                Xato: {err}
              </p>
            )}
            <div className="overflow-x-auto rounded-2xl bg-card shadow-paper">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    {TABLE_HEADERS.map((h) => (
                      <th key={h} className="px-5 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <Fragment key={r.id}>
                      <tr className="border-b border-border last:border-0">
                        <td className="px-5 py-3 font-medium">
                          {r.first_name} {r.last_name}
                        </td>
                        <td className="px-5 py-3">{r.group_name}</td>
                        <td className="px-5 py-3">{r.tests?.title ?? "—"}</td>
                        <td className="px-5 py-3">
                          {r.score}/{r.total}
                        </td>
                        <td
                          className={`px-5 py-3 font-semibold ${
                            isPassing(r.score, r.total) ? "text-success" : "text-destructive"
                          }`}
                        >
                          {percent(r.score, r.total)}%
                        </td>
                        <td className="px-5 py-3">{gradeLabel(r.score, r.total)}</td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {new Date(r.created_at).toLocaleString("uz-UZ")}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right">
                          <button
                            onClick={() => void toggleReview(r)}
                            className="mr-4 text-sm text-primary hover:underline"
                          >
                            Javoblar
                          </button>
                          <button
                            onClick={() => void remove(r)}
                            className="text-sm text-destructive hover:underline"
                          >
                            O'chirish
                          </button>
                        </td>
                      </tr>
                      {openId === r.id && (
                        <tr className="border-b border-border bg-muted/40">
                          <td colSpan={TABLE_HEADERS.length} className="px-5 py-4 text-sm">
                            <ReviewList items={review} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                  {shown.length === 0 && (
                    <tr>
                      <td
                        colSpan={TABLE_HEADERS.length}
                        className="px-5 py-10 text-center text-muted-foreground"
                      >
                        Hozircha natija yo'q
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
