/** Seed ma'lumotlari va baholash uchun umumiy turlar. */

export type SeedField = {
  /** Maydon kaliti (javob xaritasida ishlatiladi), masalan "a" yoki "next". */
  key: string;
  label: string;
  /** To'g'ri javoblar (har biri maqbul variant). `null` bo'lsa, ustoz qo'lda tekshiradi. */
  answers: string[] | null;
  points: number;
};

export type SeedQuestion =
  | {
      kind: "choice";
      section: string;
      text: string;
      options: string[];
      correctIndex: number;
      points: number;
    }
  | {
      kind: "input";
      section: string;
      text: string;
      fields: SeedField[];
    };

export type SeedTest = {
  slug: string;
  title: string;
  description: string;
  questions: SeedQuestion[];
};
