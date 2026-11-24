import { r as __toESM } from "../_runtime.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as isPassing, o as percent, r as gradeLabel } from "./grading-B5Ondqfo.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { i as getResults, n as getManualAnswers, s as useServerFn, t as deleteResult } from "./quiz.functions-lzfD067Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/teacher-CL78Qc0j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PASSWORD_STORAGE_KEY = "tp";
var TABLE_HEADERS = [
	"Ism Familiya",
	"Guruh",
	"Test",
	"Ball",
	"Foiz",
	"Daraja",
	"Sana",
	""
];
function TeacherPage() {
	const fetchResults = useServerFn(getResults);
	const removeResult = useServerFn(deleteResult);
	const fetchManual = useServerFn(getManualAnswers);
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [manual, setManual] = (0, import_react.useState)(null);
	const [pw, setPw] = (0, import_react.useState)("");
	const [rows, setRows] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)("");
	const [group, setGroup] = (0, import_react.useState)("");
	/** Parolni tekshirib, natijalarni yuklaydi. Muvaffaqiyatsiz bo'lsa kirish formasiga qaytaradi. */
	const login = (0, import_react.useCallback)(async (password) => {
		setErr("");
		try {
			setRows(await fetchResults({ data: { password } }));
			sessionStorage.setItem(PASSWORD_STORAGE_KEY, password);
		} catch (x) {
			setErr(x.message);
			sessionStorage.removeItem(PASSWORD_STORAGE_KEY);
		}
	}, [fetchResults]);
	/** Kirib bo'lgach ro'yxatni yangilaydi. Xato bo'lsa mavjud ro'yxat saqlanadi va xato ko'rsatiladi. */
	async function refresh() {
		setErr("");
		try {
			setRows(await fetchResults({ data: { password: pw } }));
		} catch (x) {
			setErr(x.message);
		}
	}
	async function remove(r) {
		if (!confirm(`${r.first_name} ${r.last_name} natijasini o'chirasizmi? Buni qaytarib bo'lmaydi.`)) return;
		setErr("");
		try {
			await removeResult({ data: {
				password: pw,
				id: r.id
			} });
			setRows((prev) => prev?.filter((x) => x.id !== r.id) ?? prev);
			if (openId === r.id) setOpenId(null);
		} catch (x) {
			setErr(x.message);
		}
	}
	async function toggleManual(r) {
		if (openId === r.id) {
			setOpenId(null);
			return;
		}
		setOpenId(r.id);
		setManual(null);
		try {
			setManual(await fetchManual({ data: {
				password: pw,
				id: r.id
			} }));
		} catch (x) {
			setErr(x.message);
		}
	}
	(0, import_react.useEffect)(() => {
		const stored = sessionStorage.getItem(PASSWORD_STORAGE_KEY);
		if (!stored) return;
		setPw(stored);
		login(stored);
	}, [login]);
	const groups = (0, import_react.useMemo)(() => [...new Set((rows ?? []).map((r) => r.group_name))].sort(), [rows]);
	const shown = (rows ?? []).filter((r) => !group || r.group_name === group);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-10 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-xl font-bold text-primary",
					children: "Ustoz paneli"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "text-sm text-muted-foreground hover:underline",
					children: "O'quvchi sahifasi"
				})]
			}), !rows ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					login(pw);
				},
				className: "mx-auto max-w-sm rounded-2xl bg-card p-8 shadow-paper",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-bold",
						children: "Kirish"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "password",
						required: true,
						placeholder: "Parol",
						className: "field mt-6",
						value: pw,
						onChange: (e) => setPw(e.target.value)
					}),
					err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-destructive",
						children: err
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-primary mt-6 w-full",
						children: "Kirish"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-4xl font-bold",
						children: ["Natijalar ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								"(",
								shown.length,
								")"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "field w-auto",
							value: group,
							onChange: (e) => setGroup(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Barcha guruhlar"
							}), groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: g }, g))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: refresh,
							className: "btn-primary",
							children: "Yangilash"
						})]
					})]
				}),
				err && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					role: "alert",
					className: "mb-4 text-sm text-destructive",
					children: ["Xato: ", err]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-2xl bg-card shadow-paper",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "border-b border-border text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: TABLE_HEADERS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-5 py-3 font-medium",
								children: h
							}, h)) })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [shown.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-5 py-3 font-medium",
									children: [
										r.first_name,
										" ",
										r.last_name
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3",
									children: r.group_name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3",
									children: r.tests?.title ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-5 py-3",
									children: [
										r.score,
										"/",
										r.total
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: `px-5 py-3 font-semibold ${isPassing(r.score, r.total) ? "text-success" : "text-destructive"}`,
									children: [percent(r.score, r.total), "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3",
									children: gradeLabel(r.score, r.total)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 text-muted-foreground",
									children: new Date(r.created_at).toLocaleString("uz-UZ")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "whitespace-nowrap px-5 py-3 text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => void toggleManual(r),
										className: "mr-4 text-sm text-primary hover:underline",
										children: "Javoblar"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => void remove(r),
										className: "text-sm text-destructive hover:underline",
										children: "O'chirish"
									})]
								})
							]
						}), openId === r.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-b border-border bg-muted/40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: TABLE_HEADERS.length,
								className: "px-5 py-4 text-sm",
								children: manual === null ? "Yuklanmoqda..." : manual.length === 0 ? "Qo'lda tekshiriladigan javob yo'q." : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-2",
									children: manual.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground",
											children: [
												m.text.slice(0, 80),
												"… · ",
												m.label,
												" (",
												m.points,
												" ball):"
											]
										}),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: m.answer || "(bo'sh)"
										})
									] }, i))
								})
							})
						})] }, r.id)), shown.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: TABLE_HEADERS.length,
							className: "px-5 py-10 text-center text-muted-foreground",
							children: "Hozircha natija yo'q"
						}) })] })]
					})
				})
			] })]
		})
	});
}
//#endregion
export { TeacherPage as component };
