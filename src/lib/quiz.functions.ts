import { createServerFn } from "@tanstack/react-start";
import { gradeAnswers, type AnswerMap } from "./grading";

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

export const getQuestions = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("questions")
    .select("id, text, options, position")
    .order("position");
  if (error) throw new Error(error.message);
  return data.map((q) => ({ id: q.id, text: q.text, options: q.options as string[] }));
});

export const submitTest = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { firstName: string; lastName: string; group: string; answers: AnswerMap }) => {
      const t = (s: unknown) => String(s ?? "").trim().slice(0, 100);
      const firstName = t(d.firstName), lastName = t(d.lastName), group = t(d.group);
      if (!firstName || !lastName || !group) throw new Error("Barcha maydonlarni to'ldiring");
      const answers: AnswerMap = {};
      for (const [k, v] of Object.entries(d.answers ?? {}))
        if (Number.isInteger(v)) answers[String(k)] = v;
      return { firstName, lastName, group, answers };
    },
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: qs, error } = await supabaseAdmin.from("questions").select("id, correct_index");
    if (error) throw new Error(error.message);
    const { score, total } = gradeAnswers(qs, data.answers);
    const { error: e2 } = await supabaseAdmin.from("submissions").insert({
      first_name: data.firstName,
      last_name: data.lastName,
      group_name: data.group,
      answers: data.answers,
      score,
      total,
    });
    if (e2) throw new Error(e2.message);
    return { score, total };
  });

export const getResults = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => ({ password: String(d.password ?? "") }))
  .handler(async ({ data }) => {
    checkTeacher(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("submissions")
      .select("id, first_name, last_name, group_name, score, total, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows;
  });
