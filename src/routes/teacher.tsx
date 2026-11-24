import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { getResults } from "@/lib/quiz.functions";
import { percent } from "@/lib/grading";

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

function TeacherPage() {
  const fetchResults = useServerFn(getResults);
  const [pw, setPw] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [group, setGroup] = useState("");

  async function load(p: string) {
    setErr("");
    try { setRows(await fetchResults({ data: { password: p } })); sessionStorage.setItem("tp", p); }
    catch (x) { setErr((x as Error).message); sessionStorage.removeItem("tp"); }
  }
  useEffect(() => { const p = sessionStorage.getItem("tp"); if (p) { setPw(p); void load(p); } }, []);

  const groups = useMemo(() => [...new Set((rows ?? []).map((r) => r.group_name))].sort(), [rows]);
  const shown = (rows ?? []).filter((r) => !group || r.group_name === group);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-primary">Ustoz paneli</span>
          <Link to="/" className="text-sm text-muted-foreground hover:underline">O'quvchi sahifasi</Link>
        </header>

        {!rows ? (
          <form onSubmit={(e) => { e.preventDefault(); void load(pw); }} className="mx-auto max-w-sm rounded-2xl bg-card p-8 shadow-paper">
            <h1 className="text-3xl font-bold">Kirish</h1>
            <input type="password" required placeholder="Parol" className="field mt-6" value={pw} onChange={(e) => setPw(e.target.value)} />
            {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
            <button className="btn-primary mt-6 w-full">Kirish</button>
          </form>
        ) : (
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h1 className="text-4xl font-bold">Natijalar <span className="text-muted-foreground">({shown.length})</span></h1>
              <div className="flex gap-2">
                <select className="field w-auto" value={group} onChange={(e) => setGroup(e.target.value)}>
                  <option value="">Barcha guruhlar</option>
                  {groups.map((g) => <option key={g}>{g}</option>)}
                </select>
                <button onClick={() => load(pw)} className="btn-primary">Yangilash</button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-2xl bg-card shadow-paper">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>{["Ism Familiya","Guruh","Ball","Foiz","Sana"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {shown.map((r) => {
                    const p = percent(r.score, r.total);
                    return (
                      <tr key={r.id} className="border-b border-border last:border-0">
                        <td className="px-5 py-3 font-medium">{r.first_name} {r.last_name}</td>
                        <td className="px-5 py-3">{r.group_name}</td>
                        <td className="px-5 py-3">{r.score}/{r.total}</td>
                        <td className={`px-5 py-3 font-semibold ${p >= 60 ? "text-success" : "text-destructive"}`}>{p}%</td>
                        <td className="px-5 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleString("uz-UZ")}</td>
                      </tr>
                    );
                  })}
                  {shown.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Hozircha natija yo'q</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
