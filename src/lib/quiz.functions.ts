import { createServerFn } from "@tanstack/react-start";
import {
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

function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function checkTeacher(pw: string) {
  const expected = process.env["TEACHER_PASSWORD"];
  if (!expected || !safeEqual(pw, expected)) throw new Error("Parol noto'g'ri");
}

function cleanText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .slice(0, MAX_NAME_LENGTH);
}

export const getQuestions = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("questions")
    .select("id, text, options, position")
    .order("position")
    // Bir xil `position` bo'lsa ham tartib har safar bir xil bo'lishi uchun.
    .order("id");
  if (error) throw new Error(error.message);
  if (data.length === 0) throw new Error("Hozircha test savollari mavjud emas");
  return data.map((q) => ({ id: q.id, text: q.text, options: q.options as string[] }));
});

export const submitTest = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { firstName: string; lastName: string; group: string; answers: AnswerMap }) => {
      const firstName = cleanText(d.firstName);
      const lastName = cleanText(d.lastName);
      const group = cleanText(d.group);
      if (!firstName || !lastName || !group) throw new Error("Barcha maydonlarni to'ldiring");

      const answers = d.answers ?? {};
      if (typeof answers !== "object" || Object.keys(answers).length > MAX_ANSWERS_PER_SUBMISSION) {
        throw new Error("Javoblar noto'g'ri formatda");
      }
      return { firstName, lastName, group, answers };
    },
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: qs, error } = await supabaseAdmin
      .from("questions")
      .select("id, options, correct_index");
    if (error) throw new Error(error.message);
    if (qs.length === 0) throw new Error("Hozircha test savollari mavjud emas");

    // Faqat mavjud savollarga, yaroqli variant oralig'idagi javoblar bazaga yoziladi.
    const answers = sanitizeAnswers(
      qs.map((q) => ({ id: q.id, optionCount: Array.isArray(q.options) ? q.options.length : 0 })),
      data.answers,
    );
    const { score, total } = gradeAnswers(qs, answers);

    const { error: insertError } = await supabaseAdmin.from("submissions").insert({
      first_name: data.firstName,
      last_name: data.lastName,
      group_name: data.group,
      answers,
      score,
      total,
    });
    if (insertError) throw new Error(insertError.message);
    return { score, total };
  });

export const getResults = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => ({ password: String(d.password ?? "") }))
  .handler(async ({ data }) => {
    checkTeacher(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1000 qatordan keyin natijalar jimgina kesilib qolmasligi uchun sahifalab o'qiymiz.
    const rows = [];
    for (let page = 0; page < MAX_RESULT_PAGES; page++) {
      const from = page * RESULTS_PAGE_SIZE;
      const { data: chunk, error } = await supabaseAdmin
        .from("submissions")
        .select("id, first_name, last_name, group_name, score, total, created_at")
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, from + RESULTS_PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      rows.push(...chunk);
      if (chunk.length < RESULTS_PAGE_SIZE) break;
    }
    return rows;
  });
