import { describe, it, expect } from "vitest";
import { gradeAnswers, isPassing, percent, sanitizeAnswers } from "./grading";

const qs = [
  { id: "a", correct_index: 1 },
  { id: "b", correct_index: 0 },
  { id: "c", correct_index: 2 },
];

describe("gradeAnswers", () => {
  it("counts only correct answers", () => {
    expect(gradeAnswers(qs, { a: 1, b: 3, c: 2 })).toEqual({ score: 2, total: 3 });
  });
  it("unanswered questions count as wrong", () => {
    expect(gradeAnswers(qs, {})).toEqual({ score: 0, total: 3 });
  });
  it("ignores answers for unknown question ids", () => {
    expect(gradeAnswers(qs, { a: 1, zzz: 0 })).toEqual({ score: 1, total: 3 });
  });
  it("handles an empty question list", () => {
    expect(gradeAnswers([], { a: 1 })).toEqual({ score: 0, total: 0 });
  });
  it("does not treat a negative index as correct", () => {
    expect(gradeAnswers(qs, { a: -1, b: -1, c: -1 })).toEqual({ score: 0, total: 3 });
  });
});

describe("percent", () => {
  it("rounds", () => {
    expect(percent(2, 3)).toBe(67);
  });
  it("returns 0 when total is 0", () => {
    expect(percent(0, 0)).toBe(0);
  });
  it("returns 100 for a perfect score", () => {
    expect(percent(5, 5)).toBe(100);
  });
});

describe("isPassing", () => {
  it("passes at exactly 60%", () => {
    expect(isPassing(3, 5)).toBe(true);
  });
  it("fails just below 60%, even if the rounded percent would be 60", () => {
    // 119/200 = 59.5% -> percent() gives 60, but this is not a pass
    expect(percent(119, 200)).toBe(60);
    expect(isPassing(119, 200)).toBe(false);
  });
  it("never passes an empty test", () => {
    expect(isPassing(0, 0)).toBe(false);
  });
});

describe("sanitizeAnswers", () => {
  const info = [
    { id: "a", optionCount: 4 },
    { id: "b", optionCount: 2 },
  ];
  it("keeps valid answers", () => {
    expect(sanitizeAnswers(info, { a: 3, b: 0 })).toEqual({ a: 3, b: 0 });
  });
  it("drops unknown keys", () => {
    expect(sanitizeAnswers(info, { a: 1, evil: 1 })).toEqual({ a: 1 });
  });
  it("drops negative, fractional and out-of-range values", () => {
    expect(sanitizeAnswers(info, { a: -1, b: 2 })).toEqual({});
    expect(sanitizeAnswers(info, { a: 1.5 })).toEqual({});
    expect(sanitizeAnswers(info, { a: 4 })).toEqual({});
    expect(sanitizeAnswers(info, { a: 1e15 })).toEqual({});
  });
  it("drops non-number values", () => {
    expect(sanitizeAnswers(info, { a: "1", b: null })).toEqual({});
  });
  it("tolerates garbage input", () => {
    expect(sanitizeAnswers(info, null)).toEqual({});
    expect(sanitizeAnswers(info, "abc")).toEqual({});
    expect(sanitizeAnswers(info, undefined)).toEqual({});
  });
  it("ignores inherited properties such as __proto__", () => {
    expect(sanitizeAnswers([{ id: "constructor", optionCount: 4 }], {})).toEqual({});
  });
});
