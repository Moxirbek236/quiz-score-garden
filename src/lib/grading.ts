export type AnswerMap = Record<string, number>;

/** Minimal foiz (yaxlitlanmagan), shundan boshlab test "o'tgan" hisoblanadi. */
export const PASS_THRESHOLD_PERCENT = 60;

/** Bitta so'rovda qabul qilinadigan javoblarning maksimal soni (suiiste'moldan himoya). */
export const MAX_ANSWERS_PER_SUBMISSION = 500;

export function gradeAnswers(
  questions: { id: string; correct_index: number }[],
  answers: AnswerMap,
): { score: number; total: number } {
  let score = 0;
  for (const q of questions) if (answers[q.id] === q.correct_index) score++;
  return { score, total: questions.length };
}

export function percent(score: number, total: number): number {
  return total === 0 ? 0 : Math.round((score / total) * 100);
}

/**
 * O'tish-o'tmaslikni yaxlitlanmagan foiz bo'yicha hal qiladi.
 * (59.5% yaxlitlanganda 60% bo'lib, noto'g'ri "o'tdi" ko'rsatilmasligi uchun.)
 */
export function isPassing(score: number, total: number): boolean {
  return total > 0 && (score / total) * 100 >= PASS_THRESHOLD_PERCENT;
}

/**
 * Mijozdan kelgan javoblarni tozalaydi: faqat mavjud savol ID'lari va
 * variantlar oralig'idagi (0 .. optionCount-1) butun sonlar qoladi.
 */
export function sanitizeAnswers(
  questions: { id: string; optionCount: number }[],
  raw: unknown,
): AnswerMap {
  const source = raw !== null && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const clean: AnswerMap = {};
  for (const q of questions) {
    const v = Object.hasOwn(source, q.id) ? source[q.id] : undefined;
    if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < q.optionCount) {
      clean[q.id] = v;
    }
  }
  return clean;
}
