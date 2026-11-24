export type AnswerMap = Record<string, number>;

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
