import type { SeedQuestion, SeedTest } from "./types";

/** `test_questions` jadvaliga yoziladigan qator (test_id'siz). */
export type QuestionRow = {
  position: number;
  section: string;
  text: string;
  kind: "choice" | "input";
  options: string[] | null;
  correct_index: number | null;
  fields: { key: string; label: string; answers: string[] | null; points: number }[] | null;
  points: number;
  partial: boolean;
};

export type ExistingQuestion = Partial<QuestionRow> & { id: string; position: number };

export function toRow(q: SeedQuestion, index: number): QuestionRow {
  const position = index + 1;
  if (q.kind === "choice") {
    return {
      position,
      section: q.section,
      text: q.text,
      kind: "choice",
      options: q.options,
      correct_index: q.correctIndex,
      fields: null,
      points: q.points,
      partial: false,
    };
  }
  return {
    position,
    section: q.section,
    text: q.text,
    kind: "input",
    options: null,
    correct_index: null,
    fields: q.fields,
    points: q.fields.reduce((sum, f) => sum + f.points, 0),
    partial: true,
  };
}

/** Kalit tartibidan mustaqil (Postgres jsonb kalitlar tartibini o'zgartiradi) yagona matn. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const o = value as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

const COMPARED: (keyof QuestionRow)[] = [
  "section",
  "text",
  "kind",
  "options",
  "correct_index",
  "fields",
  "points",
  "partial",
];

export type QuestionPlan = {
  insert: QuestionRow[];
  update: { id: string; row: QuestionRow }[];
  /** Bir xil position'dagi takroriy yoki seed'da endi yo'q savollar. */
  remove: string[];
};

/**
 * Savollarni bittalab tekshiradi: yo'q bo'lsa qo'shadi, farq qilsa yangilaydi,
 * takroriy va seed'da yo'q savollarni o'chiradi. Hech narsa bazaga tegmaydi.
 */
export function planQuestions(desired: QuestionRow[], existing: ExistingQuestion[]): QuestionPlan {
  const plan: QuestionPlan = { insert: [], update: [], remove: [] };
  const byPosition = new Map<number, ExistingQuestion[]>();
  for (const e of existing) byPosition.set(e.position, [...(byPosition.get(e.position) ?? []), e]);

  for (const row of desired) {
    const [keep, ...duplicates] = byPosition.get(row.position) ?? [];
    byPosition.delete(row.position);
    plan.remove.push(...duplicates.map((d) => d.id));
    if (!keep) {
      plan.insert.push(row);
    } else if (COMPARED.some((k) => canonical(keep[k]) !== canonical(row[k]))) {
      plan.update.push({ id: keep.id, row });
    }
  }
  for (const leftovers of byPosition.values()) plan.remove.push(...leftovers.map((l) => l.id));
  return plan;
}

export function testMeta(t: SeedTest, index: number) {
  return { slug: t.slug, title: t.title, description: t.description, position: index + 1 };
}
