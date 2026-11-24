# Quiz Score Garden

O'quvchilar uchun onlayn test tizimi: o'quvchi ism, familiya va guruhini kiritib testni
yechadi, tizim javoblarni avtomatik baholaydi, ustoz esa natijalarni parol bilan himoyalangan
panelda ko'radi.

**Live app**: https://quiz-score-garden.lovable.app

## Imkoniyatlar

- **O'quvchi sahifasi (`/`)** — ma'lumot kiritish → test → natija.
- **Ustoz paneli (`/teacher`)** — parol bilan kirish, guruh bo'yicha filtr, ball va foiz
  (60% va undan yuqori — "o'tdi").
- Baholash **serverda** bajariladi; to'g'ri javoblar brauzerga hech qachon yuborilmaydi.

## Texnologiyalar

TanStack Start (React 19, Vite), Tailwind CSS v4, shadcn/ui, Supabase (Lovable Cloud),
Drizzle migratsiyalari, Vitest. Deploy: Cloudflare Workers (Nitro).

## Muhit o'zgaruvchilari

Qiymatlarni **repoga yozmang**. Lovable'da _Secrets_ orqali, lokal ishlashda `.env.local` ga
kiriting. Namuna: [`.env.example`](./.env.example).

| O'zgaruvchi                     | Qayerda | Vazifasi                                                            |
| ------------------------------- | ------- | ------------------------------------------------------------------- |
| `SUPABASE_URL`                  | server  | Supabase loyiha manzili                                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | server  | Faqat serverda! RLS'ni chetlab o'tadi, brauzerga bermang            |
| `TEACHER_PASSWORD`              | server  | Ustoz paneli paroli. **O'rnatilmasa panelga hech kim kira olmaydi** |
| `VITE_SUPABASE_URL`             | brauzer | Supabase manzili (ochiq)                                            |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | brauzer | Publishable kalit (ochiq bo'lishi mo'ljallangan)                    |

## Lokal ishga tushirish

Loyiha `bun` bilan qurilgan (`bun.lock`). `npm install` loyihadagi `overrides` sababli xato
berishi mumkin.

```sh
bun install
bun run dev          # http://localhost:3000 (yoki Vite ko'rsatgan port)
```

## Tekshiruvlar

```sh
bunx tsc --noEmit    # tip tekshiruvi
bun run test         # Vitest
bun run build        # production build
```

GitHub Actions (`.github/workflows/ci.yml`) shu uchtasini har push va pull request'da ishga
tushiradi.

## Ma'lumotlar bazasi

Sxema `drizzle/migrations/` da. **Sxemani va ma'lumotlarni Lovable orqali o'zgartiring**
(qo'lda migratsiya qo'shmang, `AGENTS.md` ga qarang).

> ⚠️ Haqiqiy test savollarini va to'g'ri javoblarni migratsiya fayllariga yozmang: repo ochiq
> bo'lsa, ular hammaga ko'rinadi. Savollarni admin orqali yoki repoga kirmaydigan skript bilan
> kiriting.

## Production'dan oldin tekshiruv ro'yxati

- [ ] `TEACHER_PASSWORD` kuchli parol bilan Secrets'ga qo'yilgan
- [ ] Bazada namunaviy savollar/test natijalari qolmagan
- [ ] Haqiqiy savollar kiritilgan va bitta sinov topshirig'i brauzerda tekshirilgan
- [ ] Takroriy topshirishdan himoya (bazada unique cheklov) hal qilingan
- [ ] GitHub'dagi eski tokenlar bekor qilingan

## Lovable bilan ishlash

Loyiha [Lovable](https://lovable.dev) bilan bog'langan: `main` ga tushgan commit'lar editorda
ko'rinadi. Commit tarixini qayta yozmang (force push, rebase, amend).
Editor: https://lovable.dev/projects/54ebdc04-2850-5a1c-b8b8-d38c4a96fad1
