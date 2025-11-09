import React, { useEffect, useMemo, useReducer, useState } from "react";
import { Clock, RotateCcw } from "lucide-react";

import { useCountdown } from "../shared/hooks/useCountdown";
import {
    EXAMS,
    DEFAULT_EXAM_ID,
    getExamById,
    useExamTimer,
    useImportQueue,
    useAttemptHistory,
    examReducer,
    EXAM_ACTIONS,
    sampleWeighted,
    shuffle,
    answersEqual,
    buildDomainStats,
    calculateScore,
    ExamConfigurator,
    QuestionList,
    ReviewPanel,
    AttemptHistory,
} from "../features/exams";

const REVIEW_ALL = "all";
const DEFAULT_DOMAIN_NAME = getExamById(DEFAULT_EXAM_ID).domains[0]?.name || "";

function buildImportGuide(exam) {
    const domainList = exam.domains.map((domain) => `- ${domain.name}`).join("\n");
    const schema = `{
  "id": "unique-question-id",
  "domain": "One of the approved domains",
  "type": "single | multi",
  "question": "Question text",
  "options": [
    { "id": "a", "text": "First option" },
    { "id": "b", "text": "Second option" }
  ],
  "correctOptionIds": ["a"],
  "explanation": "Why the answer is correct",
  "difficulty": "easy | medium | hard"
}`;
    const examplePayload =
        exam.importTemplate && exam.importTemplate.length > 0
            ? JSON.stringify(exam.importTemplate[0], null, 2)
            : "";
    return `# ${exam.title} – Question Generation Prompt

You are a question author helping to create practice items for the ${exam.code} exam.
Generate a JSON array of objects that follow the schema below. Only return JSON (no prose).

## Domains
${domainList}

## JSON Schema
\`\`\`json
${schema}
\`\`\`

- Every question must include 4–5 options.
- For multi-response questions, include at least 2 correct options.
- Use realistic AWS scenarios.
- Always include a short explanation that justifies the correct answer(s).

## Example Entry
\`\`\`json
${examplePayload}
\`\`\`

Before generating, ask me how many questions to create and wait for my reply. Once I answer, return JSON only with that many questions covering the listed domains.`;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function clampNumber(value, min, max) {
    if (Number.isNaN(value)) return min;
    const upperBound = Math.max(min, max);
    return Math.min(Math.max(value, min), upperBound);
}

export default function App() {
    const [activeExamId, setActiveExamId] = useState(DEFAULT_EXAM_ID);
    const activeExam = useMemo(() => getExamById(activeExamId), [activeExamId]);

    // Local UI state (not part of exam flow)
    const [domainPick, setDomainPick] = useState(DEFAULT_DOMAIN_NAME);
    const [domainQty, setDomainQty] = useState(10);
    const [importedQty, setImportedQty] = useState(10);

    // Exam state managed by reducer
    const [examState, dispatch] = useReducer(examReducer, {
        mode: null,
        started: false,
        timerOn: false,
        visibleQuestions: [],
        answers: {},
        examMinutes: 0,
        secondsLeft: 0,
        showIncorrectOnly: false,
        reviewDomain: REVIEW_ALL,
        finished: false,
    });

    const domainNames = useMemo(
        () => activeExam.domains.map((domain) => domain.name),
        [activeExam]
    );

    useEffect(() => {
        setDomainPick(activeExam.domains[0]?.name || "");
    }, [activeExam]);

    useEffect(() => {
        if (typeof document === "undefined") return;
        if (activeExam.meta?.title) {
            document.title = activeExam.meta.title;
        }
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && activeExam.meta?.description) {
            metaDescription.setAttribute("content", activeExam.meta.description);
        }
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && activeExam.meta?.ogTitle) {
            ogTitle.setAttribute("content", activeExam.meta.ogTitle);
        }
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription && activeExam.meta?.ogDescription) {
            ogDescription.setAttribute("content", activeExam.meta.ogDescription);
        }
    }, [activeExam]);

    // Question bank (seed + imported)
    const seedQuestions = useMemo(() => activeExam.questionBank || [], [activeExam]);
    const { importedQuestions, importStatus, importQuestions, clearImportStatus } = useImportQueue(
        seedQuestions,
        domainNames
    );
    const questionBank = useMemo(
        () => [...seedQuestions, ...importedQuestions],
        [seedQuestions, importedQuestions]
    );

    // Timer management
    const [secondsLeft, setSecondsLeft] = useCountdown(
        examState.started && examState.timerOn,
        examState.examMinutes
    );

    // Sync reducer secondsLeft with countdown hook
    useEffect(() => {
        if (examState.started) {
            dispatch({ type: EXAM_ACTIONS.SET_TIMER_SECONDS, payload: secondsLeft });
        }
    }, [secondsLeft, examState.started]);

    // Exam timer side effects - use secondsLeft from countdown hook directly
    useExamTimer(
        examState.started,
        examState.timerOn,
        examState.examMinutes,
        secondsLeft,
        setSecondsLeft,
        () => {
            dispatch({ type: EXAM_ACTIONS.FINISH_EXAM });
        }
    );

    // Attempt history management
    const { attemptHistory, recordAttempt, resetRecordedFlag } = useAttemptHistory(
        activeExam.storageKey
    );

    // Derived state
    const domainPoolSize = useMemo(
        () => questionBank.filter((question) => question.domain === domainPick).length,
        [questionBank, domainPick]
    );

    const domainStats = useMemo(
        () => buildDomainStats(examState.visibleQuestions, examState.answers, activeExam.domains),
        [examState.visibleQuestions, examState.answers, activeExam]
    );

    const score = useMemo(
        () => calculateScore(examState.visibleQuestions, examState.answers),
        [examState.visibleQuestions, examState.answers]
    );

    // Use secondsLeft from countdown hook for finished check
    const finished = examState.finished;
    const canManuallyFinish =
        examState.started &&
        !examState.finished &&
        examState.visibleQuestions.length > 0 &&
        score.answered === examState.visibleQuestions.length;

    const incorrectQuestions = useMemo(() => {
        if (!finished) return [];
        return examState.visibleQuestions.filter(
            (question) =>
                !answersEqual(examState.answers[question.id] || [], question.correctOptionIds)
        );
    }, [examState.answers, finished, examState.visibleQuestions]);

    const reviewQuestions = useMemo(() => {
        if (!finished) return [];
        const base = examState.showIncorrectOnly ? incorrectQuestions : examState.visibleQuestions;
        if (examState.reviewDomain === REVIEW_ALL) return base;
        return base.filter((question) => question.domain === examState.reviewDomain);
    }, [
        finished,
        incorrectQuestions,
        examState.reviewDomain,
        examState.showIncorrectOnly,
        examState.visibleQuestions,
    ]);

    const elapsedSeconds = examState.examMinutes > 0 ? examState.examMinutes * 60 - secondsLeft : 0;

    // Record attempt when exam finishes
    useEffect(() => {
        if (finished && examState.started && examState.visibleQuestions.length > 0) {
        recordAttempt({
            mode: examState.mode,
            total: examState.visibleQuestions.length,
            answered: score.answered,
            correct: score.correct,
            pct: score.pct,
            durationSeconds: Math.max(0, elapsedSeconds),
            minutesAllocated: examState.examMinutes,
            domainStats,
        });
    }
}, [
    finished,
    examState.started,
    examState.mode,
    examState.visibleQuestions.length,
    examState.examMinutes,
    score,
    elapsedSeconds,
    domainStats,
    recordAttempt,
]);

    // Handlers
    function startExam(modeSelection) {
        const bank = questionBank;
        let picks = [];
        let minutesBudget = 0;

        if (modeSelection === "domain") {
            const pool = bank.filter((question) => question.domain === domainPick);
            if (pool.length === 0) {
                // Error handling would go here - could dispatch to a status reducer
                return;
            }
            const quantity = clampNumber(domainQty, 1, pool.length);
            picks = shuffle(pool).slice(0, quantity);
            minutesBudget = Math.max(10, Math.ceil(quantity * 1.25));
        } else if (modeSelection === "imported") {
            if (importedQuestions.length === 0) {
                return;
            }
            const quantity = clampNumber(importedQty, 1, importedQuestions.length);
            picks = shuffle(importedQuestions).slice(0, quantity);
            minutesBudget = Math.max(10, Math.ceil(quantity * 1.25));
        } else {
            const preset = activeExam.presets.find((entry) => entry.id === modeSelection);
            if (!preset) return;
            const total = Math.min(preset.total, bank.length);
            if (total === 0) {
                return;
            }
            picks = sampleWeighted(bank, total, activeExam.domains);
            minutesBudget = preset.minutes;
        }

        resetRecordedFlag();
        dispatch({
            type: EXAM_ACTIONS.START_EXAM,
            payload: {
                mode: modeSelection,
                questions: picks,
                minutes: minutesBudget,
            },
        });
        setSecondsLeft(minutesBudget * 60);
        clearImportStatus();
    }

    function resetExam() {
        dispatch({ type: EXAM_ACTIONS.RESET_EXAM });
        setSecondsLeft(0);
    }

    function toggleAnswer(questionId, optionId, questionType) {
        dispatch({
            type: EXAM_ACTIONS.UPDATE_ANSWER,
            payload: { questionId, optionId, questionType },
        });
    }

    function toggleTimer() {
        dispatch({ type: EXAM_ACTIONS.TOGGLE_TIMER });
    }

    function submitExam() {
        if (!canManuallyFinish) return;
        dispatch({ type: EXAM_ACTIONS.FINISH_EXAM });
    }

    function handleReviewFilter(updates) {
        dispatch({
            type: EXAM_ACTIONS.SET_REVIEW_FILTER,
            payload: updates,
        });
    }

    function handleExamChange(nextExamId) {
        if (nextExamId === activeExamId) return;
        resetExam();
        clearImportStatus();
        setActiveExamId(nextExamId);
    }

    function downloadTemplate() {
        const guide = buildImportGuide(activeExam);
        const blob = new Blob([guide], {
            type: "text/markdown",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${activeExam.slug || "aws-practice-exam"}-question-guide.md`;
        link.click();
        URL.revokeObjectURL(url);
    }

    function exportCSV() {
        const rows = [
            ["id", "domain", "type", "isCorrect", "chosen", "correct", "question"],
            ...examState.visibleQuestions.map((question) => {
                const selected = examState.answers[question.id] || [];
                const isCorrect = answersEqual(selected, question.correctOptionIds);
                return [
                    question.id,
                    question.domain,
                    question.type,
                    isCorrect ? "1" : "0",
                    selected.join("|"),
                    question.correctOptionIds.join("|"),
                    question.question.replaceAll("\n", " "),
                ];
            }),
        ];
        const csv = rows
            .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${activeExam.csvPrefix || "aws-exam"}-results-${Date.now()}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    const timerLabel = examState.started ? formatTime(secondsLeft) : "--:--";

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800 p-6">
            <div className="max-w-5xl mx-auto">
                <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">{activeExam.title}</h1>
                        <p className="text-sm text-slate-600">{activeExam.heroTagline}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-slate-500">Exam:</span>
                            <select
                                value={activeExamId}
                                onChange={(event) => handleExamChange(event.target.value)}
                                disabled={examState.started}
                                className="border rounded-xl px-3 py-1 bg-white"
                            >
                                {EXAMS.map((exam) => (
                                    <option key={exam.id} value={exam.id}>
                                        {exam.shortTitle} ({exam.code})
                                    </option>
                                ))}
                            </select>
                            {examState.started && (
                                <span className="text-xs text-amber-600">
                                    Finish or reset to switch exams
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-2xl border px-3 py-2 bg-white shadow-sm">
                            <Clock className="w-4 h-4" />
                            <span
                                className={`font-mono ${
                                    secondsLeft < 300 && examState.started ? "text-red-600" : ""
                                }`}
                            >
                                {timerLabel}
                            </span>
                        </div>
                        <button
                            onClick={resetExam}
                            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-2 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                    </div>
                </header>

                {!examState.started && (
                    <ExamConfigurator
                        domainPick={domainPick}
                        setDomainPick={setDomainPick}
                        domainQty={domainQty}
                        setDomainQty={setDomainQty}
                        importedQty={importedQty}
                        setImportedQty={setImportedQty}
                        domainPoolSize={domainPoolSize}
                        importedCount={importedQuestions.length}
                        onStartExam={startExam}
                        onImportFile={importQuestions}
                        importStatus={importStatus}
                        onDownloadTemplate={downloadTemplate}
                        presets={activeExam.presets}
                        domains={activeExam.domains}
                    />
                )}

                {examState.started && (
                    <>
                        <QuestionList
                            questions={examState.visibleQuestions}
                            answers={examState.answers}
                            finished={finished}
                            onToggleAnswer={toggleAnswer}
                            onToggleTimer={toggleTimer}
                            timerOn={examState.timerOn}
                            timerLabel={timerLabel}
                            score={score}
                            onExportCSV={exportCSV}
                            onSubmitExam={submitExam}
                        />

                        {examState.finished && (
                            <>
                                <ReviewPanel
                                    visibleQuestions={examState.visibleQuestions}
                                    answers={examState.answers}
                                    incorrectQuestions={incorrectQuestions}
                                    reviewQuestions={reviewQuestions}
                                    domainStats={domainStats}
                                    showIncorrectOnly={examState.showIncorrectOnly}
                                    reviewDomain={examState.reviewDomain}
                                    domains={activeExam.domains}
                                    passScoreNote={activeExam.passScoreNote}
                                    onToggleIncorrectFilter={() =>
                                        handleReviewFilter({
                                            showIncorrectOnly: !examState.showIncorrectOnly,
                                        })
                                    }
                                    onDomainFilterChange={(domain) =>
                                        handleReviewFilter({ reviewDomain: domain })
                                    }
                                />

                                <AttemptHistory attempts={attemptHistory} />
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
