//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-eCEbgaTE.js
var manifest = {
	"1be67474582a51433c158e2f76f4a1a2ac4fdb8fcbb93eaa98cd157ac28e5358": {
		functionName: "getQuestions_createServerFn_handler",
		importer: () => import("./_ssr/quiz.functions-DRKEsU-K.mjs")
	},
	"2fadb240e690bf6e78146bb45a0f793e083d9eb07a8c527b2c634a2865907e29": {
		functionName: "getManualAnswers_createServerFn_handler",
		importer: () => import("./_ssr/quiz.functions-DRKEsU-K.mjs")
	},
	"9b8030c4a028bd969f60b2d81363f05626202afa80584e7de1e4892711cb35b8": {
		functionName: "submitTest_createServerFn_handler",
		importer: () => import("./_ssr/quiz.functions-DRKEsU-K.mjs")
	},
	"d211dcf3d5576c77d0799da129f7fa35ce903a9aea851140087d3957dbf3bcfe": {
		functionName: "deleteResult_createServerFn_handler",
		importer: () => import("./_ssr/quiz.functions-DRKEsU-K.mjs")
	},
	"d5d41ea3b725847fc00ef9296c36a3fea83bcd0937132d2407867dea0927cb1e": {
		functionName: "getResults_createServerFn_handler",
		importer: () => import("./_ssr/quiz.functions-DRKEsU-K.mjs")
	},
	"db9a86365bc45f627ef37c5c0be228f52ac254b40849346aaacfeaa6966091b3": {
		functionName: "getTests_createServerFn_handler",
		importer: () => import("./_ssr/quiz.functions-DRKEsU-K.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ??= await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
