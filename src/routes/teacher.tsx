import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { deleteResult, getManualAnswers, getResults } from "@/lib/quiz.functions";
import { gradeLabel, isPassing, percent } from "@/lib/grading";

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

function TeacherPage() {
  const fetchResults = useServerFn(getResults);
  const removeResult = useServerFn(deleteResult);
  const fetchManual = useServerFn(getManualAnswers);
  const [openId, setOpenId] = useState<string | null>(null);
  const [manual, setManual] = useState<Awaited<ReturnType<typeof getManualAnswers>> | null>(null);
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

  async function toggleManual(r: Row) {
    if (openId === r.id) {
      setOpenId(null);
      return;
    }
    setOpenId(r.id);
    setManual(null);
    try {
      setManual(await fetchManual({ data: { password: pw, id: r.id } }));
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
                            onClick={() => void toggleManual(r)}
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
                            {manual === null ? (
                              "Yuklanmoqda..."
                            ) : manual.length === 0 ? (
                              "Qo'lda tekshiriladigan javob yo'q."
                            ) : (
                              <ul className="space-y-2">
                                {manual.map((m, i) => (
                                  <li key={i}>
                                    <span className="text-muted-foreground">
                                      {m.text.slice(0, 80)}… · {m.label} ({m.points} ball):
                                    </span>{" "}
                                    <span className="font-medium">{m.answer || "(bo'sh)"}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
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
