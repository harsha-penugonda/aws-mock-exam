import React, { useEffect, useMemo, useReducer, useState } from "react";
import { Clock, RotateCcw } from "lucide-react";

import { SEED_QUESTIONS, DOMAINS, MODE_PRESETS } from "./data/exams";
import { useCountdown } from "./hooks/useCountdown";
import { useExamTimer } from "./hooks/useExamTimer";
import { useImportQueue } from "./hooks/useImportQueue";
import { useAttemptHistory } from "./hooks/useAttemptHistory";
import { examReducer, EXAM_ACTIONS } from "./store/examReducer";
import {
    sampleWeighted,
    shuffle,
    answersEqual,
    buildDomainStats,
    calculateScore,
} from "./utils/exam";
import { ExamConfigurator } from "./components/ExamConfigurator";
import { QuestionList } from "./components/QuestionList";
import { ReviewPanel } from "./components/ReviewPanel";
import { AttemptHistory } from "./components/AttemptHistory";

const REVIEW_ALL = "all";
const IMPORT_TEMPLATE = [
    {
        id: "custom-1",
        domain: "Cloud Concepts",
        type: "single",
        question: "Which AWS pricing model is best for a workload with steady, predictable usage?",
        options: [
            { id: "a", text: "On-Demand Instances" },
            { id: "b", text: "Savings Plans" },
            { id: "c", text: "Dedicated Hosts" },
            { id: "d", text: "Spot Instances" },
        ],
        correctOptionIds: ["b"],
        explanation:
            "Savings Plans provide cost savings for steady-state usage when you commit to consistent compute consumption.",
        difficulty: "medium",
    },
];

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
    // Local UI state (not part of exam flow)
    const [domainPick, setDomainPick] = useState(DOMAINS[0].name);
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

    // Question bank (seed + imported)
    const { importedQuestions, importStatus, importQuestions, clearImportStatus } =
        useImportQueue(SEED_QUESTIONS);
    const questionBank = useMemo(
        () => [...SEED_QUESTIONS, ...importedQuestions],
        [importedQuestions]
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
    const { attemptHistory, recordAttempt, resetRecordedFlag } = useAttemptHistory();

    // Derived state
    const domainPoolSize = useMemo(
        () => questionBank.filter((question) => question.domain === domainPick).length,
        [questionBank, domainPick]
    );

    const domainStats = useMemo(
        () => buildDomainStats(examState.visibleQuestions, examState.answers),
        [examState.visibleQuestions, examState.answers]
    );

    const score = useMemo(
        () => calculateScore(examState.visibleQuestions, examState.answers),
        [examState.visibleQuestions, examState.answers]
    );

    // Use secondsLeft from countdown hook for finished check
    const finished =
        secondsLeft === 0 ||
        (examState.visibleQuestions.length > 0 &&
            score.answered === examState.visibleQuestions.length);

    // Update finished state when conditions change
    useEffect(() => {
        if (finished && examState.started && !examState.finished) {
            dispatch({ type: EXAM_ACTIONS.FINISH_EXAM });
        }
    }, [finished, examState.started, examState.finished]);

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
            const preset = MODE_PRESETS[modeSelection];
            if (!preset) return;
            const total = Math.min(preset.total, bank.length);
            if (total === 0) {
                return;
            }
            picks = sampleWeighted(bank, total);
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

    function handleReviewFilter(updates) {
        dispatch({
            type: EXAM_ACTIONS.SET_REVIEW_FILTER,
            payload: updates,
        });
    }

    function downloadTemplate() {
        const blob = new Blob([JSON.stringify(IMPORT_TEMPLATE, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "aws-mock-exam-template.json";
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
        anchor.download = `aws-clf-c02-mock-results-${Date.now()}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    const timerLabel = examState.started ? formatTime(secondsLeft) : "--:--";

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800 p-6">
            <div className="max-w-5xl mx-auto">
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            AWS Cloud Practitioner Mock Exam
                        </h1>
                        <p className="text-sm text-slate-600">
                            CLF-C02 • Covers all four domains • Multiple-choice & multiple-response
                        </p>
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
                        />

                        {finished && (
                            <>
                                <ReviewPanel
                                    visibleQuestions={examState.visibleQuestions}
                                    answers={examState.answers}
                                    incorrectQuestions={incorrectQuestions}
                                    reviewQuestions={reviewQuestions}
                                    domainStats={domainStats}
                                    showIncorrectOnly={examState.showIncorrectOnly}
                                    reviewDomain={examState.reviewDomain}
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
