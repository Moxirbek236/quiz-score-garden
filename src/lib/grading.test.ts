import { describe, it, expect } from "vitest";
import {
  buildReview,
  gradeAnswers,
  gradeLabel,
  isPassing,
  normalizeAnswer,
  percent,
  sanitizeAnswers,
  splitQuestionImage,
  type GradableQuestion,
} from "./grading";

const choice = (id: string, correct: number, points = 2): GradableQuestion => ({
  id,
  kind: "choice",
  options: ["a", "b", "c", "d"],
  correct_index: correct,
  fields: null,
  points,
});

const input: GradableQuestion = {
  id: "i",
  kind: "input",
  options: null,
  correct_index: null,
  points: 7,
  fields: [
    { key: "x", label: "x", answers: ["26"], points: 2.5 },
    { key: "y", label: "y", answers: ["24"], points: 2.5 },
    { key: "why", label: "why", answers: null, points: 2 },
  ],
};

const qs = [choice("a", 1), choice("b", 0), choice("c", 2)];

describe("gradeAnswers (choice)", () => {
  it("counts points of correct answers only", () => {
    expect(gradeAnswers(qs, { a: 1, b: 3, c: 2 })).toEqual({ score: 4, total: 6, manualPoints: 0 });
  });
  it("unanswered questions count as wrong", () => {
    expect(gradeAnswers(qs, {}).score).toBe(0);
  });
  it("ignores answers for unknown question ids", () => {
    expect(gradeAnswers(qs, { a: 1, zzz: 0 }).score).toBe(2);
  });
  it("handles an empty question list", () => {
    expect(gradeAnswers([], { a: 1 })).toEqual({ score: 0, total: 0, manualPoints: 0 });
  });
  it("does not treat a negative index as correct", () => {
    expect(gradeAnswers(qs, { a: -1, b: -1, c: -1 }).score).toBe(0);
  });
});

describe("gradeAnswers (input)", () => {
  it("grades each field separately and reports manual points", () => {
    expect(gradeAnswers([input], { i: { x: "26", y: "99", why: "anything" } })).toEqual({
      score: 3, // 2.5 yaxlitlangan
      total: 5,
      manualPoints: 2,
    });
  });
  it("manual fields never add to the score", () => {
    expect(gradeAnswers([input], { i: { why: "ok" } }).score).toBe(0);
  });
  it("is tolerant to case, spaces and decimal comma", () => {
    const q: GradableQuestion = {
      ...input,
      fields: [{ key: "n", label: "n", answers: ["30000", "4.5", "R"], points: 1 }],
    };
    expect(gradeAnswers([q], { i: { n: " 30 000 " } }).score).toBe(1);
    expect(gradeAnswers([q], { i: { n: "30 000" } }).score).toBe(1);
    expect(gradeAnswers([q], { i: { n: "4,5" } }).score).toBe(1);
    expect(gradeAnswers([q], { i: { n: "r" } }).score).toBe(1);
  });
  it("a number given for an input question gets nothing", () => {
    expect(gradeAnswers([input], { i: 3 }).score).toBe(0);
  });
});

describe("normalizeAnswer", () => {
  it("strips whitespace, lowercases and turns comma into dot", () => {
    expect(normalizeAnswer(" 1 7 000,5 ")).toBe("17000.5");
    expect(normalizeAnswer("ABC")).toBe("abc");
  });
});

describe("percent", () => {
  it("rounds", () => expect(percent(2, 3)).toBe(67));
  it("is 0 when total is 0", () => expect(percent(0, 0)).toBe(0));
});

describe("isPassing", () => {
  it("passes at 60% and fails below", () => {
    expect(isPassing(3, 5)).toBe(true);
    expect(isPassing(59, 100)).toBe(false);
  });
  it("uses the unrounded percentage", () => expect(isPassing(119, 200)).toBe(false));
  it("never passes with total 0", () => expect(isPassing(0, 0)).toBe(false));
});

describe("sanitizeAnswers", () => {
  it("keeps valid choice indexes and drops out-of-range / wrong-type values", () => {
    expect(sanitizeAnswers(qs, { a: 1, b: 9, c: "2", zzz: 0 })).toEqual({ a: 1 });
  });
  it("keeps only known input fields, trimmed, and drops empty ones", () => {
    expect(sanitizeAnswers([input], { i: { x: " 26 ", y: "", hack: "1", why: 5 } })).toEqual({
      i: { x: "26" },
    });
  });
  it("ignores non-object input", () => {
    expect(sanitizeAnswers(qs, null)).toEqual({});
    expect(sanitizeAnswers(qs, "x")).toEqual({});
  });
  it("does not read inherited properties", () => {
    expect(sanitizeAnswers([choice("toString", 0)], {})).toEqual({});
  });
});

describe("gradeLabel", () => {
  it("shkala chegaralari", () => {
    expect(gradeLabel(85, 100)).toBe("Kuchli");
    expect(gradeLabel(84, 100)).toBe("Yaxshi");
    expect(gradeLabel(70, 100)).toBe("Yaxshi");
    expect(gradeLabel(69, 100)).toBe("O'rta");
    expect(gradeLabel(49, 100)).toBe("Kuchsiz");
    expect(gradeLabel(0, 0)).toBe("Kuchsiz");
  });
});

describe("splitQuestionImage", () => {
  it("rasm belgisini ajratadi", () => {
    expect(splitQuestionImage("Savol?\n[[img:/flowgorithm/b1.svg]]")).toEqual({
      text: "Savol?",
      image: "/flowgorithm/b1.svg",
    });
  });
  it("belgi bo'lmasa matnni o'zgartirmaydi", () => {
    expect(splitQuestionImage("Oddiy savol")).toEqual({ text: "Oddiy savol", image: null });
  });
});

describe("buildReview", () => {
  const base = { section: "S", text: "Savol\n[[img:/flowgorithm/b1.svg]]" };
  it("tanlov javobini va to'g'ri variantni ko'rsatadi", () => {
    const [r] = buildReview([{ ...choice("a", 1), ...base }], { a: 3 });
    expect(r).toMatchObject({
      kind: "choice",
      chosen: 3,
      correct: 1,
      earned: 0,
      image: "/flowgorithm/b1.svg",
      text: "Savol",
    });
  });
  it("javob bermagan tanlov chosen=null", () => {
    const [r] = buildReview([{ ...choice("a", 1), ...base }], {});
    expect(r).toMatchObject({ chosen: null, earned: 0 });
  });
  it("kiritish maydonlari: to'g'ri, noto'g'ri va qo'lda", () => {
    const r = buildReview([{ ...input, ...base }], { i: { x: "26", y: "5", why: "nimadir" } })[0]!;
    expect(r.kind).toBe("input");
    if (r.kind === "input") {
      expect(r.fields.map((f) => f.earned)).toEqual([2.5, 0, null]);
      expect(r.fields[2]!.given).toBe("nimadir");
    }
  });
  it("bo'sh javob to'g'ri hisoblanmaydi", () => {
    const r = buildReview([{ ...input, ...base }], {})[0]!;
    if (r.kind === "input") expect(r.fields.every((f) => f.earned !== 2.5)).toBe(true);
  });
});
