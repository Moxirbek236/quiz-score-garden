/** Javob: tanlov savoli uchun variant indeksi, kiritish savoli uchun {maydon kaliti: matn}. */
export type AnswerValue = number | Record<string, string>;
export type AnswerMap = Record<string, AnswerValue>;

/** Minimal foiz (yaxlitlanmagan), shundan boshlab test "o'tgan" hisoblanadi. */
export const PASS_THRESHOLD_PERCENT = 60;

/** Bitta so'rovda qabul qilinadigan javoblarning maksimal soni (suiiste'moldan himoya). */
export const MAX_ANSWERS_PER_SUBMISSION = 500;

/** Bitta matnli javobning maksimal uzunligi. */
export const MAX_ANSWER_TEXT_LENGTH = 1000;

export type GradableField = { key: string; answers: string[] | null; points: number };

export type GradableQuestion = {
  id: string;
  kind: string;
  options: unknown;
  correct_index: number | null;
  fields: unknown;
  points: number;
};

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

/** Taqqoslash uchun: bo'shliqlarsiz, kichik harfda, vergul = nuqta. "30 000" == "30000". */
export function normalizeAnswer(value: string): string {
  return value.replace(/\s+/g, "").replace(/,/g, ".").toLowerCase();
}

export function parseFields(raw: unknown): GradableField[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((f) => {
    if (f === null || typeof f !== "object") return [];
    const o = f as Record<string, unknown>;
    if (typeof o["key"] !== "string") return [];
    return [
      {
        key: o["key"],
        answers: Array.isArray(o["answers"]) ? o["answers"].map(String) : null,
        points: typeof o["points"] === "number" ? o["points"] : 0,
      },
    ];
  });
}

/**
 * Mijozdan kelgan javoblarni tozalaydi: faqat mavjud savollar uchun, yaroqli shakldagi
 * javoblar qoladi (variant oralig'idagi butun son yoki ma'lum maydonlarning qisqa matni).
 */
export function sanitizeAnswers(questions: GradableQuestion[], raw: unknown): AnswerMap {
  const source = raw !== null && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const clean: AnswerMap = {};
  for (const q of questions) {
    const v = Object.hasOwn(source, q.id) ? source[q.id] : undefined;
    if (q.kind === "choice") {
      const count = Array.isArray(q.options) ? q.options.length : 0;
      if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < count) clean[q.id] = v;
    } else if (q.kind === "input" && v !== null && typeof v === "object") {
      const obj = v as Record<string, unknown>;
      const out: Record<string, string> = {};
      for (const f of parseFields(q.fields)) {
        const t = Object.hasOwn(obj, f.key) ? obj[f.key] : undefined;
        if (typeof t === "string" && t.trim())
          out[f.key] = t.trim().slice(0, MAX_ANSWER_TEXT_LENGTH);
      }
      if (Object.keys(out).length > 0) clean[q.id] = out;
    }
  }
  return clean;
}

export type GradeResult = {
  /** Avtomatik tekshirilgan savollar bo'yicha olingan ball (butun songa yaxlitlangan). */
  score: number;
  /** Avtomatik tekshiriladigan savollarning maksimal balli. */
  total: number;
  /** Ustoz qo'lda tekshiradigan qismning maksimal balli (score/total ga kirmaydi). */
  manualPoints: number;
};

export function gradeAnswers(questions: GradableQuestion[], answers: AnswerMap): GradeResult {
  let score = 0;
  let total = 0;
  let manualPoints = 0;
  for (const q of questions) {
    const given = answers[q.id];
    if (q.kind === "choice") {
      total += q.points;
      if (typeof given === "number" && given === q.correct_index) score += q.points;
      continue;
    }
    for (const f of parseFields(q.fields)) {
      if (f.answers === null) {
        manualPoints += f.points;
        continue;
      }
      total += f.points;
      const text = given !== null && typeof given === "object" ? given[f.key] : undefined;
      if (typeof text === "string") {
        const n = normalizeAnswer(text);
        if (f.answers.some((a) => normalizeAnswer(a) === n)) score += f.points;
      }
    }
  }
  return {
    score: Math.round(score),
    total: Math.round(total),
    manualPoints: Math.round(manualPoints),
  };
}

/** Foiz bo'yicha daraja (o'qituvchi kalitidagi shkala). */
export function gradeLabel(score: number, total: number): string {
  const p = total === 0 ? 0 : (score / total) * 100;
  if (p >= 85) return "Kuchli";
  if (p >= 70) return "Yaxshi";
  if (p >= 50) return "O'rta";
  return "Kuchsiz";
}

/** Savol matnidagi `[[img:/yo'l]]` belgisini matn va rasm manziliga ajratadi. */
export function splitQuestionImage(text: string): { text: string; image: string | null } {
  const m = /\n?\[\[img:(\/[^\]\s]+)\]\]\s*$/.exec(text);
  return m ? { text: text.slice(0, m.index), image: m[1]! } : { text, image: null };
}
