import { describe, it, expect } from "vitest";
import { SEED_TESTS } from "./tests";
import { canonical, planQuestions, toRow, type ExistingQuestion } from "./plan";

const rows = (slug: string) => SEED_TESTS.find((t) => t.slug === slug)!.questions.map(toRow);

describe("seed ma'lumotlari", () => {
  it("javoblar kaliti bilan mos (A qism)", () => {
    const letters = (slug: string) =>
      rows(slug)
        .filter((r) => r.kind === "choice" && r.section.startsWith("A qism"))
        .map((r) => "ABCD"[r.correct_index!])
        .join("");
    expect(letters("chiziqli-algoritm")).toBe("BCBDCDABCB");
    expect(letters("dasturlashga-qobiliyat")).toBe("CBAACCCCBB");
  });
  it("har bir tanlov savolida to'g'ri indeks variantlar ichida", () => {
    for (const t of SEED_TESTS)
      for (const q of t.questions)
        if (q.kind === "choice") expect(q.correctIndex).toBeLessThan(q.options.length);
  });
  it("qobiliyat testining jami bali 100", () => {
    expect(rows("dasturlashga-qobiliyat").reduce((s, r) => s + r.points, 0)).toBe(100);
  });
  it("chiziqli algoritm testining web qismi 50 ball (A 20 + B 15 + C 15) va to'liq avto-baholanadi", () => {
    const r = rows("chiziqli-algoritm");
    expect(r.reduce((s, q) => s + q.points, 0)).toBe(50);
    expect(r.flatMap((q) => q.fields ?? []).filter((f) => f.answers === null)).toHaveLength(0);
  });
  it("B va C savollari rasm bilan, rasm fayllari mavjud", async () => {
    const { existsSync } = await import("node:fs");
    const { splitQuestionImage } = await import("../grading");
    const withImg = rows("chiziqli-algoritm")
      .map((q) => splitQuestionImage(q.text).image)
      .filter(Boolean) as string[];
    expect(withImg).toHaveLength(10);
    for (const path of withImg) expect(existsSync(`public${path}`)).toBe(true);
  });
  it("slug'lar va maydon kalitlari takrorlanmaydi", () => {
    expect(new Set(SEED_TESTS.map((t) => t.slug)).size).toBe(SEED_TESTS.length);
    for (const t of SEED_TESTS)
      for (const q of t.questions)
        if (q.kind === "input")
          expect(new Set(q.fields.map((f) => f.key)).size).toBe(q.fields.length);
  });
});

describe("planQuestions", () => {
  const desired = rows("dasturlashga-qobiliyat");
  const asExisting = (r: (typeof desired)[number], id: string): ExistingQuestion => ({ ...r, id });

  it("bo'sh bazada hammasini qo'shadi", () => {
    const plan = planQuestions(desired, []);
    expect(plan.insert).toHaveLength(desired.length);
    expect(plan.update).toHaveLength(0);
    expect(plan.remove).toHaveLength(0);
  });
  it("hammasi mavjud bo'lsa hech narsa qilmaydi (idempotent)", () => {
    const existing = desired.map((r, i) => asExisting(r, `id${i}`));
    expect(planQuestions(desired, existing)).toEqual({ insert: [], update: [], remove: [] });
  });
  it("faqat yetishmayotgan savolni qo'shadi", () => {
    const existing = desired.filter((r) => r.position !== 5).map((r, i) => asExisting(r, `id${i}`));
    const plan = planQuestions(desired, existing);
    expect(plan.insert.map((r) => r.position)).toEqual([5]);
  });
  it("o'zgargan savolni yangilaydi", () => {
    const existing = desired.map((r, i) => asExisting(r, `id${i}`));
    existing[0] = { ...existing[0]!, text: "eski matn" };
    const plan = planQuestions(desired, existing);
    expect(plan.update).toHaveLength(1);
    expect(plan.update[0]!.id).toBe("id0");
  });
  it("jsonb kalit tartibi farqi yangilanishni keltirib chiqarmaydi", () => {
    const r = desired.find((x) => x.kind === "input")!;
    const reordered = {
      ...r,
      fields: r.fields!.map((f) => ({
        points: f.points,
        answers: f.answers,
        label: f.label,
        key: f.key,
      })),
    };
    expect(planQuestions([r], [{ ...reordered, id: "x" }]).update).toHaveLength(0);
  });
  it("takroriy va ortiqcha savollarni o'chiradi", () => {
    const existing = desired.map((r, i) => asExisting(r, `id${i}`));
    existing.push({ ...desired[0]!, id: "dup" }, { ...desired[0]!, id: "extra", position: 999 });
    expect(planQuestions(desired, existing).remove.sort()).toEqual(["dup", "extra"]);
  });
});

describe("canonical", () => {
  it("kalit tartibiga bog'liq emas", () => {
    expect(canonical({ a: 1, b: [1, { y: 1, x: 2 }] })).toBe(
      canonical({ b: [1, { x: 2, y: 1 }], a: 1 }),
    );
  });
});
