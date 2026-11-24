import { createServerFn } from "@tanstack/react-start";
import {
  buildReview,
  gradeAnswers,
  MAX_ANSWERS_PER_SUBMISSION,
  sanitizeAnswers,
  type AnswerMap,
} from "./grading";

const MAX_NAME_LENGTH = 100;
/** Supabase (PostgREST) bir so'rovda standart bo'yicha ko'pi bilan shuncha qator qaytaradi. */
const RESULTS_PAGE_SIZE = 1000;
/** Cheksiz sikldan himoya: ko'pi bilan RESULTS_PAGE_SIZE * MAX_RESULT_PAGES ta natija. */
const MAX_RESULT_PAGES = 20;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/** TEACHER_PASSWORD o'rnatilmagan bo'lsa ishlatiladigan standart parol. */
const DEFAULT_TEACHER_PASSWORD = "Oybek_Linux";

function checkTeacher(pw: string) {
  // Har chaqiruvda env'dan o'qiladi: o'zgartirib qayta deploy qilsangiz darhol kuchga kiradi.
  const expected = process.env["TEACHER_PASSWORD"] || DEFAULT_TEACHER_PASSWORD;
  if (!expected || !safeEqual(pw, expected)) throw new Error("Parol noto'g'ri");
}

function cleanText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .slice(0, MAX_NAME_LENGTH);
}

function cleanId(value: unknown): string {
  const id = String(value ?? "");
  if (!UUID_RE.test(id)) throw new Error("Noto'g'ri identifikator");
  return id;
}

/** Server ishga tushganda eski ma'lumotlarni tozalab, seed savollarini sinxronlaydi (bir marta). */
async function getDb() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { ensureSeeded } = await import("./seed/sync.server");
  await ensureSeeded(supabaseAdmin);
  return supabaseAdmin;
}

export const getTests = createServerFn({ method: "GET" }).handler(async () => {
  const db = await getDb();
  const { data, error } = await db
    .from("tests")
    .select("id, title, description")
    .order("position")
    .order("id");
  if (error) throw new Error(error.message);
  if (data.length === 0) throw new Error("Hozircha testlar mavjud emas");
  return data;
});

export type PublicQuestion = {
  id: string;
  section: string;
  text: string;
  kind: "choice" | "input";
  points: number;
  options: string[];
  /** Kiritish savollari uchun maydonlar. To'g'ri javoblar bu yerda YO'Q. */
  fields: { key: string; label: string; points: number }[];
};

export const getQuestions = createServerFn({ method: "POST" })
  .inputValidator((d: { testId: string }) => ({ testId: cleanId(d.testId) }))
  .handler(async ({ data }): Promise<PublicQuestion[]> => {
    const db = await getDb();
    const { data: rows, error } = await db
      .from("test_questions")
      .select("id, section, text, kind, options, fields, points")
      .eq("test_id", data.testId)
      .order("position")
      .order("id");
    if (error) throw new Error(error.message);
    if (rows.length === 0) throw new Error("Bu testda savollar mavjud emas");
    return rows.map((q) => ({
      id: q.id,
      section: q.section,
      text: q.text,
      kind: q.kind as "choice" | "input",
      points: q.points,
      options: Array.isArray(q.options) ? (q.options as string[]) : [],
      fields: (Array.isArray(q.fields)
        ? (q.fields as { key: string; label: string; points: number }[])
        : []
      ).map((f) => ({ key: f.key, label: f.label, points: f.points })),
    }));
  });

export const submitTest = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      firstName: string;
      lastName: string;
      group: string;
      testId: string;
      answers: AnswerMap;
    }) => {
      const firstName = cleanText(d.firstName);
      const lastName = cleanText(d.lastName);
      const group = cleanText(d.group);
      if (!firstName || !lastName || !group) throw new Error("Barcha maydonlarni to'ldiring");
      const testId = cleanId(d.testId);

      const answers = d.answers ?? {};
      if (typeof answers !== "object" || Object.keys(answers).length > MAX_ANSWERS_PER_SUBMISSION) {
        throw new Error("Javoblar noto'g'ri formatda");
      }
      return { firstName, lastName, group, testId, answers };
    },
  )
  .handler(async ({ data }) => {
    const db = await getDb();
    const { data: qs, error } = await db
      .from("test_questions")
      .select("id, kind, options, correct_index, fields, points")
      .eq("test_id", data.testId);
    if (error) throw new Error(error.message);
    if (qs.length === 0) throw new Error("Bu testda savollar mavjud emas");

    // Faqat mavjud savollarga, yaroqli shakldagi javoblar bazaga yoziladi.
    const answers = sanitizeAnswers(qs, data.answers);
    const { score, total, manualPoints } = gradeAnswers(qs, answers);

    const { error: insertError } = await db.from("submissions").insert({
      first_name: data.firstName,
      last_name: data.lastName,
      group_name: data.group,
      test_id: data.testId,
      answers,
      score,
      total,
    });
    if (insertError) throw new Error(insertError.message);
    return { score, total, manualPoints };
  });

export const getResults = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => ({ password: String(d.password ?? "") }))
  .handler(async ({ data }) => {
    checkTeacher(data.password);
    const db = await getDb();

    // 1000 qatordan keyin natijalar jimgina kesilib qolmasligi uchun sahifalab o'qiymiz.
    const rows = [];
    for (let page = 0; page < MAX_RESULT_PAGES; page++) {
      const from = page * RESULTS_PAGE_SIZE;
      const { data: chunk, error } = await db
        .from("submissions")
        .select("id, first_name, last_name, group_name, score, total, created_at, tests(title)")
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, from + RESULTS_PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      rows.push(...chunk);
      if (chunk.length < RESULTS_PAGE_SIZE) break;
    }
    return rows;
  });

/** Ustoz uchun: o'quvchi har bir savolga nima javob bergani, to'g'ri javob va olingan ball. */
export const getSubmissionReview = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => ({
    password: String(d.password ?? ""),
    id: cleanId(d.id),
  }))
  .handler(async ({ data }) => {
    checkTeacher(data.password);
    const db = await getDb();
    const { data: sub, error } = await db
      .from("submissions")
      .select("answers, test_id")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!sub) throw new Error("Natija topilmadi");
    if (!sub.test_id) return [];
    const { data: qs, error: qErr } = await db
      .from("test_questions")
      .select("id, section, text, kind, options, correct_index, fields, points")
      .eq("test_id", sub.test_id)
      .order("position")
      .order("id");
    if (qErr) throw new Error(qErr.message);
    return buildReview(qs, (sub.answers ?? {}) as AnswerMap);
  });

/** Ustoz bitta o'quvchi natijasini o'chiradi. */
export const deleteResult = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => ({
    password: String(d.password ?? ""),
    id: cleanId(d.id),
  }))
  .handler(async ({ data }) => {
    checkTeacher(data.password);
    const db = await getDb();
    const { data: removed, error } = await db
      .from("submissions")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    return { deleted: removed.length };
  });
