import { r as __toESM } from "../_runtime.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as splitQuestionImage, o as percent, r as gradeLabel, t as MAX_ANSWER_TEXT_LENGTH } from "./grading-B5Ondqfo.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as getTests, o as submitTest, r as getQuestions, s as useServerFn } from "./quiz.functions-lzfD067Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CFlQ6k1l.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var INFO_FIELDS = [
	["firstName", "Ism"],
	["lastName", "Familiya"],
	["group", "Guruh"]
];
/** Javob berilgan savollar soni (kiritish savolida kamida bitta maydon to'ldirilgan bo'lsa). */
function countAnswered(questions, answers) {
	return questions.filter((q) => {
		const a = answers[q.id];
		if (a === void 0) return false;
		return typeof a === "number" || Object.values(a).some((v) => v.trim() !== "");
	}).length;
}
function QuestionTitle({ index, text }) {
	const { text: body, image } = splitQuestionImage(text);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
		className: "text-lg font-semibold",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-accent",
				children: [index, "."]
			}),
			" ",
			body
		]
	}), image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: image,
		alt: "Blok-sxema",
		loading: "lazy",
		className: "mx-auto mt-4 max-w-full rounded-xl border border-border bg-white"
	})] });
}
function StudentPage() {
	const loadTests = useServerFn(getTests);
	const loadQuestions = useServerFn(getQuestions);
	const submit = useServerFn(submitTest);
	const [tests, setTests] = (0, import_react.useState)([]);
	const [testId, setTestId] = (0, import_react.useState)("");
	const [step, setStep] = (0, import_react.useState)("info");
	const [info, setInfo] = (0, import_react.useState)({
		firstName: "",
		lastName: "",
		group: ""
	});
	const [questions, setQuestions] = (0, import_react.useState)([]);
	const [answers, setAnswers] = (0, import_react.useState)({});
	const [result, setResult] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		loadTests().then((list) => {
			setTests(list);
			setTestId((cur) => cur || list[0]?.id || "");
		}).catch((x) => setErr(x.message));
	}, [loadTests]);
	async function start(e) {
		e.preventDefault();
		const cleaned = {
			firstName: info.firstName.trim(),
			lastName: info.lastName.trim(),
			group: info.group.trim()
		};
		if (!cleaned.firstName || !cleaned.lastName || !cleaned.group) {
			setErr("Barcha maydonlarni to'ldiring");
			return;
		}
		setBusy(true);
		setErr("");
		try {
			setQuestions(await loadQuestions({ data: { testId } }));
			setInfo(cleaned);
			setStep("test");
		} catch (x) {
			setErr(x.message);
		} finally {
			setBusy(false);
		}
	}
	async function finish() {
		if (countAnswered(questions, answers) < questions.length && !confirm("Hamma savolga javob bermadingiz. Baribir yakunlaysizmi?")) return;
		setBusy(true);
		setErr("");
		try {
			setResult(await submit({ data: {
				...info,
				testId,
				answers
			} }));
			setStep("done");
		} catch (x) {
			setErr(x.message);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mb-10 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-xl font-bold text-primary",
						children: "Test tizimi"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/teacher",
						className: "text-sm text-muted-foreground underline-offset-4 hover:underline",
						children: "Ustoz uchun"
					})]
				}),
				step === "info" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoForm, {
					info,
					onChange: setInfo,
					tests,
					testId,
					onTestChange: setTestId,
					onSubmit: start,
					busy,
					err
				}),
				step === "test" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TestView, {
					info,
					questions,
					answers,
					onAnswer: (questionId, value) => setAnswers((prev) => ({
						...prev,
						[questionId]: value
					})),
					onFinish: finish,
					busy,
					err
				}),
				step === "done" && result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultView, {
					firstName: info.firstName,
					result
				})
			]
		})
	});
}
function InfoForm(props) {
	const { info, onChange, tests, testId, onTestChange, onSubmit, busy, err } = props;
	const selected = tests.find((t) => t.id === testId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit,
		className: "rounded-2xl bg-card p-8 shadow-paper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl font-bold",
				children: "Testni boshlash"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted-foreground",
				children: "Ma'lumotlaringizni kiriting."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 space-y-4",
				children: [INFO_FIELDS.map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1 block text-sm font-medium",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						className: "field",
						value: info[key],
						onChange: (e) => onChange({
							...info,
							[key]: e.target.value
						})
					})]
				}, key)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-sm font-medium",
							children: "Test"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							required: true,
							className: "field",
							value: testId,
							onChange: (e) => onTestChange(e.target.value),
							children: tests.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: t.id,
								children: t.title
							}, t.id))
						}),
						selected?.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm text-muted-foreground",
							children: selected.description
						})
					]
				})]
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-destructive",
				children: err
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				disabled: busy || !testId,
				className: "btn-primary mt-8 w-full",
				children: busy ? "Yuklanmoqda..." : "Testni ochish"
			})
		]
	});
}
function TestView(props) {
	const { info, questions, answers, onAnswer, onFinish, busy, err } = props;
	const answered = countAnswered(questions, answers);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "sticky top-0 z-10 -mx-4 mb-6 bg-background/90 px-4 py-3 backdrop-blur",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-medium",
					children: [
						info.firstName,
						" ",
						info.lastName,
						" · ",
						info.group
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground",
					children: [
						answered,
						"/",
						questions.length
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 h-1.5 overflow-hidden rounded-full bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-accent transition-all",
					style: { width: `${percent(answered, questions.length)}%` }
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "space-y-5",
			children: questions.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-2xl bg-card p-6 shadow-paper",
				children: [
					(i === 0 || questions[i - 1].section !== q.section) && q.section && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm font-semibold uppercase tracking-wide text-primary",
						children: q.section
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionTitle, {
						index: i + 1,
						text: q.text
					}),
					q.kind === "choice" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-2",
						children: q.options.map((option, optionIndex) => {
							const selected = answers[q.id] === optionIndex;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onAnswer(q.id, optionIndex),
								className: `rounded-xl border px-4 py-3 text-left transition ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mr-2 font-semibold",
									children: [String.fromCharCode(65 + optionIndex), ")"]
								}), option]
							}, optionIndex);
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3",
						children: q.fields.map((f) => {
							const current = answers[q.id];
							const value = current !== void 0 && typeof current === "object" ? current[f.key] ?? "" : "";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mb-1 block text-sm font-medium",
									children: f.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									value,
									maxLength: MAX_ANSWER_TEXT_LENGTH,
									onChange: (e) => {
										const prev = current !== void 0 && typeof current === "object" ? current : {};
										onAnswer(q.id, {
											...prev,
											[f.key]: e.target.value
										});
									}
								})]
							}, f.key);
						})
					})
				]
			}, q.id))
		}),
		err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-destructive",
			children: err
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			disabled: busy,
			onClick: onFinish,
			className: "btn-primary mt-8 w-full",
			children: busy ? "Yuborilmoqda..." : "Testni yakunlash"
		})
	] });
}
function ResultView({ firstName, result }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-card p-10 text-center shadow-paper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Natijangiz"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-display text-7xl font-bold text-primary",
				children: [
					result.score,
					"/",
					result.total
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-2xl font-semibold text-accent",
				children: [
					percent(result.score, result.total),
					"% · ",
					gradeLabel(result.score, result.total)
				]
			}),
			result.manualPoints > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-sm text-muted-foreground",
				children: [
					"Yana ",
					result.manualPoints,
					" ball qiymatidagi javoblarni ustoz qo'lda tekshiradi."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-muted-foreground",
				children: [
					"Natija ustozingizga yuborildi. Rahmat, ",
					firstName,
					"!"
				]
			})
		]
	});
}
//#endregion
export { StudentPage as component };
