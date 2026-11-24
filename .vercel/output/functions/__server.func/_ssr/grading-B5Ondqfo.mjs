//#region node_modules/.nitro/vite/services/ssr/assets/grading-B5Ondqfo.js
/** Bitta matnli javobning maksimal uzunligi. */
var MAX_ANSWER_TEXT_LENGTH = 1e3;
function percent(score, total) {
	return total === 0 ? 0 : Math.round(score / total * 100);
}
/**
* O'tish-o'tmaslikni yaxlitlanmagan foiz bo'yicha hal qiladi.
* (59.5% yaxlitlanganda 60% bo'lib, noto'g'ri "o'tdi" ko'rsatilmasligi uchun.)
*/
function isPassing(score, total) {
	return total > 0 && score / total * 100 >= 60;
}
/** Taqqoslash uchun: bo'shliqlarsiz, kichik harfda, vergul = nuqta. "30 000" == "30000". */
function normalizeAnswer(value) {
	return value.replace(/\s+/g, "").replace(/,/g, ".").toLowerCase();
}
function parseFields(raw) {
	if (!Array.isArray(raw)) return [];
	return raw.flatMap((f) => {
		if (f === null || typeof f !== "object") return [];
		const o = f;
		if (typeof o["key"] !== "string") return [];
		return [{
			key: o["key"],
			answers: Array.isArray(o["answers"]) ? o["answers"].map(String) : null,
			points: typeof o["points"] === "number" ? o["points"] : 0
		}];
	});
}
/**
* Mijozdan kelgan javoblarni tozalaydi: faqat mavjud savollar uchun, yaroqli shakldagi
* javoblar qoladi (variant oralig'idagi butun son yoki ma'lum maydonlarning qisqa matni).
*/
function sanitizeAnswers(questions, raw) {
	const source = raw !== null && typeof raw === "object" ? raw : {};
	const clean = {};
	for (const q of questions) {
		const v = Object.hasOwn(source, q.id) ? source[q.id] : void 0;
		if (q.kind === "choice") {
			const count = Array.isArray(q.options) ? q.options.length : 0;
			if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < count) clean[q.id] = v;
		} else if (q.kind === "input" && v !== null && typeof v === "object") {
			const obj = v;
			const out = {};
			for (const f of parseFields(q.fields)) {
				const t = Object.hasOwn(obj, f.key) ? obj[f.key] : void 0;
				if (typeof t === "string" && t.trim()) out[f.key] = t.trim().slice(0, MAX_ANSWER_TEXT_LENGTH);
			}
			if (Object.keys(out).length > 0) clean[q.id] = out;
		}
	}
	return clean;
}
function gradeAnswers(questions, answers) {
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
			const text = given !== null && typeof given === "object" ? given[f.key] : void 0;
			if (typeof text === "string") {
				const n = normalizeAnswer(text);
				if (f.answers.some((a) => normalizeAnswer(a) === n)) score += f.points;
			}
		}
	}
	return {
		score: Math.round(score),
		total: Math.round(total),
		manualPoints: Math.round(manualPoints)
	};
}
/** Foiz bo'yicha daraja (o'qituvchi kalitidagi shkala). */
function gradeLabel(score, total) {
	const p = total === 0 ? 0 : score / total * 100;
	if (p >= 85) return "Kuchli";
	if (p >= 70) return "Yaxshi";
	if (p >= 50) return "O'rta";
	return "Kuchsiz";
}
/** Savol matnidagi `[[img:/yo'l]]` belgisini matn va rasm manziliga ajratadi. */
function splitQuestionImage(text) {
	const m = /\n?\[\[img:(\/[^\]\s]+)\]\]\s*$/.exec(text);
	return m ? {
		text: text.slice(0, m.index),
		image: m[1]
	} : {
		text,
		image: null
	};
}
//#endregion
export { parseFields as a, splitQuestionImage as c, isPassing as i, gradeAnswers as n, percent as o, gradeLabel as r, sanitizeAnswers as s, MAX_ANSWER_TEXT_LENGTH as t };
