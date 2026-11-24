import { r as __toESM } from "../_runtime.mjs";
import { U as isRedirect, b as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as TSS_SERVER_FUNCTION, l as createServerFn } from "./createServerFn-yTfeHp1H.mjs";
import { r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-eCEbgaTE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quiz.functions-lzfD067Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var MAX_NAME_LENGTH = 100;
/** Supabase (PostgREST) bir so'rovda standart bo'yicha ko'pi bilan shuncha qator qaytaradi. */
/** Cheksiz sikldan himoya: ko'pi bilan RESULTS_PAGE_SIZE * MAX_RESULT_PAGES ta natija. */
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function cleanText(value) {
	return String(value ?? "").trim().slice(0, MAX_NAME_LENGTH);
}
function cleanId(value) {
	const id = String(value ?? "");
	if (!UUID_RE.test(id)) throw new Error("Noto'g'ri identifikator");
	return id;
}
/** Server ishga tushganda eski ma'lumotlarni tozalab, seed savollarini sinxronlaydi (bir marta). */
var getTests = createServerFn({ method: "GET" }).handler(createSsrRpc("db9a86365bc45f627ef37c5c0be228f52ac254b40849346aaacfeaa6966091b3"));
var getQuestions = createServerFn({ method: "POST" }).inputValidator((d) => ({ testId: cleanId(d.testId) })).handler(createSsrRpc("1be67474582a51433c158e2f76f4a1a2ac4fdb8fcbb93eaa98cd157ac28e5358"));
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
}).handler(createSsrRpc("9b8030c4a028bd969f60b2d81363f05626202afa80584e7de1e4892711cb35b8"));
var getResults = createServerFn({ method: "POST" }).inputValidator((d) => ({ password: String(d.password ?? "") })).handler(createSsrRpc("d5d41ea3b725847fc00ef9296c36a3fea83bcd0937132d2407867dea0927cb1e"));
/** Ustoz qo'lda tekshiradigan javoblar (savol matni + o'quvchi yozgani). */
var getManualAnswers = createServerFn({ method: "POST" }).inputValidator((d) => ({
	password: String(d.password ?? ""),
	id: cleanId(d.id)
})).handler(createSsrRpc("2fadb240e690bf6e78146bb45a0f793e083d9eb07a8c527b2c634a2865907e29"));
/** Ustoz bitta o'quvchi natijasini o'chiradi. */
var deleteResult = createServerFn({ method: "POST" }).inputValidator((d) => ({
	password: String(d.password ?? ""),
	id: cleanId(d.id)
})).handler(createSsrRpc("d211dcf3d5576c77d0799da129f7fa35ce903a9aea851140087d3957dbf3bcfe"));
//#endregion
export { getTests as a, getResults as i, getManualAnswers as n, submitTest as o, getQuestions as r, useServerFn as s, deleteResult as t };
