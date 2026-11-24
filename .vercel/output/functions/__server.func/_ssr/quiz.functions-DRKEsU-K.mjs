import { a as TSS_SERVER_FUNCTION, l as createServerFn } from "./createServerFn-yTfeHp1H.mjs";
import { a as parseFields, n as gradeAnswers, s as sanitizeAnswers } from "./grading-B5Ondqfo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quiz.functions-DRKEsU-K.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var MAX_NAME_LENGTH = 100;
/** Supabase (PostgREST) bir so'rovda standart bo'yicha ko'pi bilan shuncha qator qaytaradi. */
var RESULTS_PAGE_SIZE = 1e3;
/** Cheksiz sikldan himoya: ko'pi bilan RESULTS_PAGE_SIZE * MAX_RESULT_PAGES ta natija. */
var MAX_RESULT_PAGES = 20;
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function safeEqual(a, b) {
	let diff = a.length ^ b.length;
	for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
	return diff === 0;
}
function checkTeacher(pw) {
	const expected = process.env["TEACHER_PASSWORD"];
	if (!expected || !safeEqual(pw, expected)) throw new Error("Parol noto'g'ri");
}
function cleanText(value) {
	return String(value ?? "").trim().slice(0, MAX_NAME_LENGTH);
}
function cleanId(value) {
	const id = String(value ?? "");
	if (!UUID_RE.test(id)) throw new Error("Noto'g'ri identifikator");
	return id;
}
/** Server ishga tushganda eski ma'lumotlarni tozalab, seed savollarini sinxronlaydi (bir marta). */
async function getDb() {
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { ensureSeeded } = await import("./sync.server-Bz3dd0XD.mjs");
	await ensureSeeded(supabaseAdmin);
	return supabaseAdmin;
}
var getTests_createServerFn_handler = createServerRpc({
	id: "db9a86365bc45f627ef37c5c0be228f52ac254b40849346aaacfeaa6966091b3",
	name: "getTests",
	filename: "src/lib/quiz.functions.ts"
}, (opts) => getTests.__executeServer(opts));
var getTests = createServerFn({ method: "GET" }).handler(getTests_createServerFn_handler, async () => {
	const { data, error } = await (await getDb()).from("tests").select("id, title, description").order("position").order("id");
	if (error) throw new Error(error.message);
	if (data.length === 0) throw new Error("Hozircha testlar mavjud emas");
	return data;
});
var getQuestions_createServerFn_handler = createServerRpc({
	id: "1be67474582a51433c158e2f76f4a1a2ac4fdb8fcbb93eaa98cd157ac28e5358",
	name: "getQuestions",
	filename: "src/lib/quiz.functions.ts"
}, (opts) => getQuestions.__executeServer(opts));
var getQuestions = createServerFn({ method: "POST" }).inputValidator((d) => ({ testId: cleanId(d.testId) })).handler(getQuestions_createServerFn_handler, async ({ data }) => {
	const { data: rows, error } = await (await getDb()).from("test_questions").select("id, section, text, kind, options, fields, points").eq("test_id", data.testId).order("position").order("id");
	if (error) throw new Error(error.message);
	if (rows.length === 0) throw new Error("Bu testda savollar mavjud emas");
	return rows.map((q) => ({
		id: q.id,
		section: q.section,
		text: q.text,
		kind: q.kind,
		points: q.points,
		options: Array.isArray(q.options) ? q.options : [],
		fields: (Array.isArray(q.fields) ? q.fields : []).map((f) => ({
			key: f.key,
			label: f.label,
			points: f.points
		}))
	}));
});
var submitTest_createServerFn_handler = createServerRpc({
	id: "9b8030c4a028bd969f60b2d81363f05626202afa80584e7de1e4892711cb35b8",
	name: "submitTest",
	filename: "src/lib/quiz.functions.ts"
}, (opts) => submitTest.__executeServer(opts));
var submitTest = createServerFn({ method: "POST" }).inputValidator((d) => {
	const firstName = cleanText(d.firstName);
	const lastName = cleanText(d.lastName);
	const group = cleanText(d.group);
	if (!firstName || !lastName || !group) throw new Error("Barcha maydonlarni to'ldiring");
	const testId = cleanId(d.testId);
	const answers = d.answers ?? {};
	if (typeof answers !== "object" || Object.keys(answers).length > 500) throw new Error("Javoblar noto'g'ri formatda");
	return {
		firstName,
		lastName,
		group,
		testId,
		answers
	};
}).handler(submitTest_createServerFn_handler, async ({ data }) => {
	const db = await getDb();
	const { data: qs, error } = await db.from("test_questions").select("id, kind, options, correct_index, fields, points").eq("test_id", data.testId);
	if (error) throw new Error(error.message);
	if (qs.length === 0) throw new Error("Bu testda savollar mavjud emas");
	const answers = sanitizeAnswers(qs, data.answers);
	const { score, total, manualPoints } = gradeAnswers(qs, answers);
	const { error: insertError } = await db.from("submissions").insert({
		first_name: data.firstName,
		last_name: data.lastName,
		group_name: data.group,
		test_id: data.testId,
		answers,
		score,
		total
	});
	if (insertError) throw new Error(insertError.message);
	return {
		score,
		total,
		manualPoints
	};
});
var getResults_createServerFn_handler = createServerRpc({
	id: "d5d41ea3b725847fc00ef9296c36a3fea83bcd0937132d2407867dea0927cb1e",
	name: "getResults",
	filename: "src/lib/quiz.functions.ts"
}, (opts) => getResults.__executeServer(opts));
var getResults = createServerFn({ method: "POST" }).inputValidator((d) => ({ password: String(d.password ?? "") })).handler(getResults_createServerFn_handler, async ({ data }) => {
	checkTeacher(data.password);
	const db = await getDb();
	const rows = [];
	for (let page = 0; page < MAX_RESULT_PAGES; page++) {
		const from = page * RESULTS_PAGE_SIZE;
		const { data: chunk, error } = await db.from("submissions").select("id, first_name, last_name, group_name, score, total, created_at, tests(title)").order("created_at", { ascending: false }).order("id").range(from, from + RESULTS_PAGE_SIZE - 1);
		if (error) throw new Error(error.message);
		rows.push(...chunk);
		if (chunk.length < RESULTS_PAGE_SIZE) break;
	}
	return rows;
});
var getManualAnswers_createServerFn_handler = createServerRpc({
	id: "2fadb240e690bf6e78146bb45a0f793e083d9eb07a8c527b2c634a2865907e29",
	name: "getManualAnswers",
	filename: "src/lib/quiz.functions.ts"
}, (opts) => getManualAnswers.__executeServer(opts));
var getManualAnswers = createServerFn({ method: "POST" }).inputValidator((d) => ({
	password: String(d.password ?? ""),
	id: cleanId(d.id)
})).handler(getManualAnswers_createServerFn_handler, async ({ data }) => {
	checkTeacher(data.password);
	const db = await getDb();
	const { data: sub, error } = await db.from("submissions").select("answers, test_id").eq("id", data.id).maybeSingle();
	if (error) throw new Error(error.message);
	if (!sub?.test_id) return [];
	const { data: qs, error: qErr } = await db.from("test_questions").select("id, section, text, fields").eq("test_id", sub.test_id).eq("kind", "input").order("position");
	if (qErr) throw new Error(qErr.message);
	const answers = sub.answers ?? {};
	const out = [];
	for (const q of qs) {
		const given = answers[q.id];
		const labels = new Map((Array.isArray(q.fields) ? q.fields : []).map((f) => [f.key, f.label]));
		for (const f of parseFields(q.fields)) {
			if (f.answers !== null) continue;
			out.push({
				section: q.section,
				text: q.text,
				label: labels.get(f.key) ?? f.key,
				points: f.points,
				answer: given?.[f.key] ?? ""
			});
		}
	}
	return out;
});
var deleteResult_createServerFn_handler = createServerRpc({
	id: "d211dcf3d5576c77d0799da129f7fa35ce903a9aea851140087d3957dbf3bcfe",
	name: "deleteResult",
	filename: "src/lib/quiz.functions.ts"
}, (opts) => deleteResult.__executeServer(opts));
var deleteResult = createServerFn({ method: "POST" }).inputValidator((d) => ({
	password: String(d.password ?? ""),
	id: cleanId(d.id)
})).handler(deleteResult_createServerFn_handler, async ({ data }) => {
	checkTeacher(data.password);
	const { data: removed, error } = await (await getDb()).from("submissions").delete().eq("id", data.id).select("id");
	if (error) throw new Error(error.message);
	return { deleted: removed.length };
});
//#endregion
export { deleteResult_createServerFn_handler, getManualAnswers_createServerFn_handler, getQuestions_createServerFn_handler, getResults_createServerFn_handler, getTests_createServerFn_handler, submitTest_createServerFn_handler };
