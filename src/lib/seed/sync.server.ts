import { SEED_TESTS } from "./tests";
import { planQuestions, testMeta, toRow, type QuestionRow } from "./plan";
import type { Json } from "@/integrations/supabase/types";
import type { supabaseAdmin as AdminClient } from "@/integrations/supabase/client.server";

type Admin = typeof AdminClient;

function check(error: { message: string } | null, what: string) {
  if (error) throw new Error(`${what}: ${error.message}`);
}

/**
 * Eski (bitta savollar jadvalli) test ma'lumotlarini tozalaydi:
 * `questions` jadvali va test_id'siz (eski testga tegishli) natijalar.
 * Takror chaqirilsa zarari yo'q: yangi natijalarning test_id'si doim to'ldirilgan.
 */
export async function cleanupLegacy(db: Admin) {
  const { error: subErr } = await db.from("submissions").delete().is("test_id", null);
  check(subErr, "Eski natijalarni o'chirish");
  const { error: qErr } = await db
    .from("questions")
    .delete()
    .gte("created_at", "1970-01-01T00:00:00Z");
  check(qErr, "Eski savollarni o'chirish");
}

/** Seed'dagi testlar va ularning savollarini bazaga bittalab tekshirib, yetishmayotganini qo'shadi. */
export async function syncTests(db: Admin) {
  const stats = { tests: 0, inserted: 0, updated: 0, removed: 0 };

  for (const [i, seed] of SEED_TESTS.entries()) {
    const meta = testMeta(seed, i);
    const { data: found, error: findErr } = await db
      .from("tests")
      .select("id, title, description, position")
      .eq("slug", meta.slug)
      .maybeSingle();
    check(findErr, `Test "${meta.slug}" ni qidirish`);

    let testId: string;
    if (!found) {
      const { data, error } = await db.from("tests").insert(meta).select("id").single();
      check(error, `Test "${meta.slug}" ni qo'shish`);
      testId = data!.id;
    } else {
      testId = found.id;
      if (
        found.title !== meta.title ||
        found.description !== meta.description ||
        found.position !== meta.position
      ) {
        const { error } = await db.from("tests").update(meta).eq("id", testId);
        check(error, `Test "${meta.slug}" ni yangilash`);
      }
    }
    stats.tests++;

    const { data: existing, error: exErr } = await db
      .from("test_questions")
      .select("*")
      .eq("test_id", testId);
    check(exErr, `"${meta.slug}" savollarini o'qish`);

    const plan = planQuestions(
      seed.questions.map(toRow),
      (existing ?? []).map((e) => ({
        ...e,
        kind: e.kind as "choice" | "input",
        options: e.options as string[] | null,
        fields: e.fields as QuestionRow["fields"],
      })),
    );

    for (const row of plan.insert) {
      const { error } = await db.from("test_questions").insert({
        ...row,
        test_id: testId,
        options: row.options as Json,
        fields: row.fields as Json,
      });
      check(error, `Savol #${row.position} ("${meta.slug}") ni qo'shish`);
      stats.inserted++;
    }
    for (const { id, row } of plan.update) {
      const { error } = await db
        .from("test_questions")
        .update({ ...row, options: row.options as Json, fields: row.fields as Json })
        .eq("id", id);
      check(error, `Savol #${row.position} ("${meta.slug}") ni yangilash`);
      stats.updated++;
    }
    if (plan.remove.length > 0) {
      const { error } = await db.from("test_questions").delete().in("id", plan.remove);
      check(error, `"${meta.slug}" ortiqcha savollarini o'chirish`);
      stats.removed += plan.remove.length;
    }
  }
  return stats;
}

export async function runSync(db: Admin) {
  await cleanupLegacy(db);
  return syncTests(db);
}

let started: Promise<void> | undefined;

/**
 * Server ishga tushgach (yangi deploy / yangi izolyat) birinchi so'rovda bir marta ishlaydi.
 * Xato bo'lsa so'rovni to'xtatmaydi, keyingi so'rovda qayta uriniladi.
 */
export function ensureSeeded(db: Admin): Promise<void> {
  started ??= runSync(db)
    .then((s) => console.info("[seed] sinxronlandi", s))
    .catch((e) => {
      console.error("[seed] xato:", e);
      started = undefined;
    });
  return started;
}
