import { describe, it, expect } from "vitest";
import { gradeAnswers, percent } from "./grading";

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
  it("percent rounds", () => {
    expect(percent(2, 3)).toBe(67);
  });
});
