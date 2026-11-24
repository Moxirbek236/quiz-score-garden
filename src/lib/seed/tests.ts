import type { SeedField, SeedQuestion, SeedTest } from "./types";

const choice = (
  section: string,
  text: string,
  options: string[],
  correctIndex: number,
  points = 2,
): SeedQuestion => ({ kind: "choice", section, text, options, correctIndex, points });

const input = (section: string, text: string, fields: SeedField[]): SeedQuestion => ({
  kind: "input",
  section,
  text,
  fields,
});

/** Bitta avto-tekshiriladigan maydon. */
const auto = (key: string, label: string, answers: string[], points: number): SeedField => ({
  key,
  label,
  answers,
  points,
});

/** Ustoz qo'lda tekshiradigan maydon (avto-ball hisobiga kirmaydi). */
const manual = (key: string, label: string, points: number): SeedField => ({
  key,
  label,
  answers: null,
  points,
});

/** Savol matniga blok-sxema rasmini biriktiradi (rasm public/flowgorithm/ da). */
const img = (name: string, text: string) => `${text}\n[[img:/flowgorithm/${name}.svg]]`;

const A = "A qism. Nazariya";
const B = "B qism. Blok-sxemani o'qish";
const C = "C qism. Xatoni topish";

export const SEED_TESTS: SeedTest[] = [
  {
    slug: "chiziqli-algoritm",
    title: "Chiziqli algoritm: bilim baholash testi",
    description:
      "Nazariya, blok-sxemani o'qish va xatoni topish (rasmli sxemalar). Flowgorithm'dagi amaliy ish va daftar yuritish qismlari kompyuterda / daftarda bajariladi.",
    questions: [
      // A qism: 10 ta test, har biri 2 ball
      choice(
        A,
        "Chiziqli algoritm qaysi javobda to'g'ri ta'riflangan?",
        [
          "Buyruqlar shartga qarab tanlanib bajariladi",
          "Buyruqlar yuqoridan pastga ketma-ket, har biri bir martadan bajariladi",
          "Bir guruh buyruqlar bir necha marta takrorlanadi",
          "Algoritm faqat bitta buyruqdan iborat bo'ladi",
        ],
        1,
      ),
      choice(
        A,
        "Flowgorithm'da dastur boshlanishi (Main) va tugashi (End) qaysi shakl bilan ko'rsatiladi?",
        ["To'rtburchak", "Romb", "Oval", "Parallelogram"],
        2,
      ),
      choice(
        A,
        "Declare buyrug'i nima uchun ishlatiladi?",
        [
          "Qiymatni klaviaturadan kiritish uchun",
          "O'zgaruvchining nomi va turini e'lon qilish uchun",
          "Natijani ekranga chiqarish uchun",
          "Dasturni to'xtatish uchun",
        ],
        1,
      ),
      choice(
        A,
        "Qaysi tur faqat butun sonlarni saqlaydi?",
        ["Real", "String", "Boolean", "Integer"],
        3,
      ),
      choice(
        A,
        "Input buyrug'ining vazifasi qaysi?",
        [
          "Natijani ekranga chiqarish",
          "Formula bo'yicha hisoblash",
          "Klaviaturadan o'zgaruvchiga qiymat kiritish",
          "O'zgaruvchi turini o'zgartirish",
        ],
        2,
      ),
      choice(
        A,
        "Output buyrug'i nima qiladi?",
        [
          "Qiymatni klaviaturadan oladi",
          "O'zgaruvchini e'lon qiladi",
          "Formulani hisoblaydi",
          "Matn yoki natijani ekranga chiqaradi",
        ],
        3,
      ),
      choice(
        A,
        "S = a * a buyrug'i (Assign) nima qiladi?",
        [
          "a * a ni hisoblab, natijani S o'zgaruvchisiga beradi",
          "S ni ekranga chiqaradi",
          "a ning qiymatini so'raydi",
          "S va a ni solishtiradi",
        ],
        0,
      ),
      choice(
        A,
        "3.14 qiymati uchun qaysi tur mos keladi?",
        ["Integer", "Real", "String", "Boolean"],
        1,
      ),
      choice(
        A,
        '"Salom" qiymati qaysi turga tegishli?',
        ["Integer", "Real", "String", "Boolean"],
        2,
      ),
      choice(A, "17 mod 5 ifodasining natijasi nechaga teng?", ["3", "2", "3.4", "85"], 1),

      // B qism: blok-sxemani o'qish (rasm bilan)
      input(B, img("b1", "1-sxema (5 ball). Kirish: a = 3, b = 4. Ekranga nima chiqadi?"), [
        auto("c", "Ekranga chiqadigan son", ["11"], 5),
      ]),
      input(B, img("b2", "2-sxema (5 ball). Kirish: x = 5. Ekranga ketma-ket nima chiqadi?"), [
        auto("x", "x =", ["26"], 2.5),
        auto("y", "y =", ["24"], 2.5),
      ]),
      input(B, img("b3", "3-sxema (3 ball). Kirish n = 47 bo'lsa, ekranga nima chiqadi?"), [
        auto("n", "Ekranga chiqadigan son", ["74"], 3),
      ]),
      choice(
        B,
        img("b3", "3-sxema (2 ball). Bu dastur ikki xonali son ustida qanday amal bajaradi?"),
        [
          "Raqamlari yig'indisini topadi",
          "Raqamlarining o'rnini almashtiradi",
          "Sonni 10 ga ko'paytiradi",
          "Sonni 10 ga bo'lib, qoldig'ini chiqaradi",
        ],
        1,
        2,
      ),

      // C qism: xatoni topish (xato 3 ball, to'g'risi 2 ball)
      choice(
        C,
        img("c1", "1-sxema: doira yuzini topish (r berilgan). Xato nimada? (3 ball)"),
        [
          "S ning turi Real bo'lmasligi kerak",
          "Input r yo'q, r qiymati kiritilmagan",
          "Output S ortiqcha",
          "Formula noto'g'ri yozilgan",
        ],
        1,
        3,
      ),
      choice(
        C,
        img("c1", "1-sxema. To'g'risi qanday bo'ladi? (2 ball)"),
        [
          "S = r * r deb yozish",
          "Declare r, S As Integer qilish",
          "Declare'dan keyin Input r qo'shish",
          "Output S ni olib tashlash",
        ],
        2,
        2,
      ),
      choice(
        C,
        img("c2", "2-sxema: ikki butun son yig'indisi. Xato nimada? (3 ball)"),
        [
          "Input b ortiqcha",
          "Output c noto'g'ri",
          "Integer o'rniga Real kerak",
          "c o'zgaruvchisi e'lon qilinmagan",
        ],
        3,
        3,
      ),
      choice(
        C,
        img("c2", "2-sxema. To'g'risi qanday bo'ladi? (2 ball)"),
        [
          "Declare a, b, c As Integer",
          "Input c qo'shish",
          "c = a * b deb yozish",
          "Declare a, b As Real",
        ],
        0,
        2,
      ),
      choice(
        C,
        img("c3", "3-sxema: kvadratning yuzi (tomoni a). Xato nimada? (3 ball)"),
        [
          "Formula noto'g'ri: a + a yuzni emas, ikkilangan tomonni beradi",
          "Input a yo'q",
          "S Real bo'lishi kerak",
          "Output S yo'q",
        ],
        0,
        3,
      ),
      choice(
        C,
        img("c3", "3-sxema. To'g'risi qanday bo'ladi? (2 ball)"),
        ["S = a / a", "S = a * a", "S = a - a", "S = 2 * a"],
        1,
        2,
      ),
    ],
  },
  {
    slug: "dasturlashga-qobiliyat",
    title: "Dasturlashga qobiliyat testi",
    description:
      "Dasturlashni bilishni emas, mantiqiy va algoritmik fikrlashni tekshiradi. Kalkulyator va telefon ishlatilmaydi.",
    questions: (() => {
      const MA = "A qism. Mantiqiy fikrlash";
      const MB = "B qism. Ko'rsatmalarni ketma-ket bajarish";
      const MC = "C qism. Qonuniyatni topish";
      const MD = "D qism. Algoritm tuzish";
      const ME = "E qism. Matematik asos va diqqat";
      return [
        choice(MA, "Qatorni davom ettiring: 2, 4, 8, 16, ?", ["18", "24", "32", "20"], 2),
        choice(MA, "Qatorni davom ettiring: 3, 6, 9, 12, ?", ["14", "15", "16", "18"], 1),
        choice(
          MA,
          "Barcha mushuklar hayvon. Murka mushuk. Qaysi xulosa to'g'ri?",
          ["Murka hayvon", "Murka it", "Barcha hayvonlar mushuk", "Murka o'simlik"],
          0,
        ),
        choice(MA, "Kitob : o'qish = qalam : ?", ["yozish", "qog'oz", "rangli", "uzun"], 0),
        choice(
          MA,
          "Ali Vali'dan baland, Vali Sardor'dan baland. Eng past bo'yli kim?",
          ["Ali", "Vali", "Sardor", "Aniqlab bo'lmaydi"],
          2,
        ),
        choice(MA, "Qatorni davom ettiring: 1, 4, 9, 16, ?", ["20", "24", "25", "36"], 2),
        choice(
          MA,
          "Bugun chorshanba. 10 kundan keyin hafta kuni qaysi bo'ladi?",
          ["Payshanba", "Juma", "Shanba", "Yakshanba"],
          2,
        ),
        choice(MA, "Qaysi son boshqalardan farq qiladi: 2, 4, 6, 9, 10?", ["2", "6", "9", "10"], 2),
        choice(
          MA,
          "5 ta mushuk 5 ta sichqonni 5 daqiqada tutadi. 100 ta mushuk 100 ta sichqonni necha daqiqada tutadi?",
          ["1", "5", "50", "100"],
          1,
        ),
        choice(MA, "Harflar qatorini davom ettiring: A, C, E, G, ?", ["H", "I", "J", "K"], 1),

        input(
          MB,
          "1-topshiriq (5 ball): Boshlang'ich son 6. Sonni 3 ga ko'paytiring, natijadan 4 ni ayiring, natijani 2 ga bo'ling. Oxirgi natija nechaga teng?",
          [auto("result", "Javob", ["7"], 5)],
        ),
        input(
          MB,
          "2-topshiriq (5 ball): Robot 3 × 3 maydonning chap pastki katagida (1-qator, 1-ustun). Qatorlar pastdan yuqoriga, ustunlar chapdan o'ngga raqamlangan. Buyruqlar: O'NG, O'NG, YUQORI, CHAP, YUQORI. Robot qaysi katakda to'xtaydi?",
          [auto("row", "Qator", ["3"], 2.5), auto("col", "Ustun", ["2"], 2.5)],
        ),
        input(
          MB,
          "3-topshiriq (5 ball): A = 2, B = 5. 1) A = A + B; 2) B = A - B; 3) A = A - B. Oxirida A va B nechaga teng?",
          [auto("A", "A =", ["5"], 2.5), auto("B", "B =", ["2"], 2.5)],
        ),
        input(
          MB,
          "4-topshiriq (5 ball): 0 dan boshlaysiz. Q = 2 qo'shish, A = 1 ayirish, K = natijani 2 ga ko'paytirish. Ketma-ketlik: Q, K, A, K, Q. Oxirgi natija nechaga teng?",
          [auto("result", "Javob", ["8"], 5)],
        ),

        input(MC, "1, 1, 2, 3, 5, 8, ? (keyingi had 3 ball, qoida 2 ball)", [
          auto("next", "Keyingi had", ["13"], 3),
          manual("rule", "Qoida", 2),
        ]),
        input(MC, "2, 5, 10, 17, 26, ? (keyingi had 3 ball, qoida 2 ball)", [
          auto("next", "Keyingi had", ["37"], 3),
          manual("rule", "Qoida", 2),
        ]),
        input(MC, "Z, X, V, T, ? (keyingi had 3 ball, qoida 2 ball)", [
          auto("next", "Keyingi had", ["R"], 3),
          manual("rule", "Qoida", 2),
        ]),

        input(
          MD,
          "1-topshiriq (8 ball). Choy damlash harakatlarini to'g'ri tartibda 1, 2, 3, 4 deb raqamlang: a) Choyni piyolalarga quyish; b) Suvni qaynatish; c) Choynakka choy solib, qaynoq suv quyish va 5 daqiqa kutish; d) Qaynatgichga suv quyish.",
          [
            auto("a", "a) tartib raqami", ["4"], 2),
            auto("b", "b) tartib raqami", ["2"], 2),
            auto("c", "c) tartib raqami", ["3"], 2),
            auto("d", "d) tartib raqami", ["1"], 2),
          ],
        ),
        input(
          MD,
          "2-topshiriq (8 ball). Birinchi stakanda sut, ikkinchisida sharbat, uchinchisi bo'sh. Sut ikkinchi stakanda, sharbat birinchi stakanda bo'lsin. Bir vaqtda faqat bitta suyuqlik quyiladi. Eng kam qadamli algoritmni raqamlab yozing.",
          [manual("steps", "Algoritm qadamlari", 8)],
        ),
        input(
          MD,
          "3-topshiriq (9 ball). Do'konda 12 000 so'mlik non va 8 000 so'mlik sut sotib oldingiz, sotuvchiga 50 000 so'm berdingiz. Qaytimni topish algoritmini qadamlar bilan yozing (5 ball), natijani hisoblang (2 ball). Algoritm boshqa narxlar uchun ham ishlashi kerak (2 ball).",
          [
            manual("steps", "Qadamlar (5 + 2 ball)", 7),
            auto("change", "Qaytim (so'm)", ["30000", "30 000"], 2),
          ],
        ),

        input(ME, "Hisoblang (har biri 3 ball): 48 + 27; 13 × 4; 144 : 12; x + 15 = 40 bo'lsa x.", [
          auto("e1", "48 + 27 =", ["75"], 3),
          auto("e2", "13 × 4 =", ["52"], 3),
          auto("e3", "144 : 12 =", ["12"], 3),
          auto("e4", "x =", ["25"], 3),
        ]),
        input(
          ME,
          "Aziz 3 ta daftar va 2 ta ruchka sotib oldi. Daftar 4 000 so'm, ruchka 2 500 so'm. Aziz hammasi bo'lib necha so'm to'ladi? (yechim 2 ball, javob 2 ball)",
          [manual("solution", "Yechim", 2), auto("answer", "Javob (so'm)", ["17000", "17 000"], 2)],
        ),
        input(ME, "Quyidagi qatorda 7 raqami necha marta uchraydi? 3 7 1 7 7 9 4 7 2 7", [
          auto("count", "Javob", ["5"], 4),
        ]),
      ];
    })(),
  },
];
