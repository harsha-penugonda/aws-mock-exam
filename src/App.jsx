import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Download,
    Clock,
    PlayCircle,
    RotateCcw,
    ListChecks,
    BookOpenText,
    Filter,
    Upload,
    AlertCircle,
    XCircle,
    History,
} from "lucide-react";

import { SEED_QUESTIONS, DOMAINS, MODE_PRESETS } from "./data/questions";
import { useCountdown } from "./hooks/useCountdown";
import {
    sampleWeighted,
    shuffle,
    answersEqual,
    buildDomainStats,
    calculateScore,
    sanitizeImportedQuestions,
} from "./utils/exam";

const REVIEW_ALL = "all";
const HISTORY_STORAGE_KEY = "aws-mock-exam-history";
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

function formatTimestamp(value) {
    const date = new Date(value);
    return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function clampNumber(value, min, max) {
    if (Number.isNaN(value)) return min;
    const upperBound = Math.max(min, max);
    return Math.min(Math.max(value, min), upperBound);
}

export default function App() {
    const [mode, setMode] = useState(null); // 'full' | 'quick' | 'domain' | 'imported'
    const [domainPick, setDomainPick] = useState(DOMAINS[0].name);
    const [domainQty, setDomainQty] = useState(10);
    const [imported, setImported] = useState([]);
    const [importedQty, setImportedQty] = useState(10);
    const [started, setStarted] = useState(false);
    const [timerOn, setTimerOn] = useState(false);
    const [visibleQuestions, setVisibleQuestions] = useState([]);
    const [answers, setAnswers] = useState({}); // id -> string[]
    const [examMinutes, setExamMinutes] = useState(0);
    const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);
    const [reviewDomain, setReviewDomain] = useState(REVIEW_ALL);
    const [importStatus, setImportStatus] = useState(null);
    const [attemptHistory, setAttemptHistory] = useState(() => {
        if (typeof window === "undefined") return [];
        try {
            const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn("Failed to parse history from localStorage", error);
            return [];
        }
    });
    const recordedAttemptRef = useRef(false);

    const questionBank = useMemo(() => [...SEED_QUESTIONS, ...imported], [imported]);
    const domainPoolSize = useMemo(
        () => questionBank.filter((question) => question.domain === domainPick).length,
        [questionBank, domainPick]
    );

    const [secondsLeft, setSecondsLeft] = useCountdown(started && timerOn, examMinutes);

    const domainStats = useMemo(
        () => buildDomainStats(visibleQuestions, answers),
        [visibleQuestions, answers]
    );

    const score = useMemo(
        () => calculateScore(visibleQuestions, answers),
        [visibleQuestions, answers]
    );

    const finished =
        secondsLeft === 0 ||
        (visibleQuestions.length > 0 && score.answered === visibleQuestions.length);

    const incorrectQuestions = useMemo(() => {
        if (!finished) return [];
        return visibleQuestions.filter(
            (question) => !answersEqual(answers[question.id] || [], question.correctOptionIds)
        );
    }, [answers, finished, visibleQuestions]);

    const reviewQuestions = useMemo(() => {
        if (!finished) return [];
        const base = showIncorrectOnly ? incorrectQuestions : visibleQuestions;
        if (reviewDomain === REVIEW_ALL) return base;
        return base.filter((question) => question.domain === reviewDomain);
    }, [finished, incorrectQuestions, reviewDomain, showIncorrectOnly, visibleQuestions]);

    const elapsedSeconds = examMinutes > 0 ? examMinutes * 60 - secondsLeft : 0;

    useEffect(() => {
        if (!started) return;
        if (secondsLeft === 0) setTimerOn(false);
    }, [secondsLeft, started]);

    useEffect(() => {
        if (finished && started) {
            setTimerOn(false);
        }
    }, [finished, started]);

    useEffect(() => {
        if (!finished || recordedAttemptRef.current || visibleQuestions.length === 0) return;
        const entry = {
            id: Date.now(),
            mode,
            total: visibleQuestions.length,
            answered: score.answered,
            correct: score.correct,
            pct: score.pct,
            durationSeconds: Math.max(0, elapsedSeconds),
            minutesAllocated: examMinutes,
            domainStats,
        };
        setAttemptHistory((prev) => [entry, ...prev].slice(0, 10));
        recordedAttemptRef.current = true;
    }, [domainStats, elapsedSeconds, examMinutes, finished, mode, score, visibleQuestions.length]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(attemptHistory));
        } catch (error) {
            console.warn("Failed to persist history", error);
        }
    }, [attemptHistory]);

    const timerLabel = started ? formatTime(secondsLeft) : "--:--";

    function startExam(modeSelection) {
        const bank = questionBank;
        let picks = [];
        let minutesBudget = 0;

        if (modeSelection === "domain") {
            const pool = bank.filter((question) => question.domain === domainPick);
            if (pool.length === 0) {
                setImportStatus({
                    type: "error",
                    message: `No questions available for ${domainPick}.`,
                });
                return;
            }
            const quantity = clampNumber(domainQty, 1, pool.length);
            picks = shuffle(pool).slice(0, quantity);
            minutesBudget = Math.max(10, Math.ceil(quantity * 1.25));
        } else if (modeSelection === "imported") {
            if (imported.length === 0) {
                setImportStatus({
                    type: "error",
                    message: "Import questions before starting imported-only practice.",
                });
                return;
            }
            const quantity = clampNumber(importedQty, 1, imported.length);
            picks = shuffle(imported).slice(0, quantity);
            minutesBudget = Math.max(10, Math.ceil(quantity * 1.25));
        } else {
            const preset = MODE_PRESETS[modeSelection];
            if (!preset) return;
            const total = Math.min(preset.total, bank.length);
            if (total === 0) {
                setImportStatus({
                    type: "error",
                    message: "Question bank is empty.",
                });
                return;
            }
            picks = sampleWeighted(bank, total);
            minutesBudget = preset.minutes;
        }

        setMode(modeSelection);
        setVisibleQuestions(picks);
        setAnswers({});
        setExamMinutes(minutesBudget);
        setStarted(true);
        setTimerOn(true);
        setShowIncorrectOnly(false);
        setReviewDomain(REVIEW_ALL);
        setImportStatus(null);
        recordedAttemptRef.current = false;
        setSecondsLeft(minutesBudget * 60);
    }

    function resetExam() {
        setMode(null);
        setStarted(false);
        setTimerOn(false);
        setVisibleQuestions([]);
        setAnswers({});
        setExamMinutes(0);
        setShowIncorrectOnly(false);
        setReviewDomain(REVIEW_ALL);
        recordedAttemptRef.current = false;
        setSecondsLeft(0);
    }

    function toggleAnswer(questionId, optionId, type) {
        setAnswers((prev) => {
            const current = prev[questionId] || [];
            if (type === "single") {
                return { ...prev, [questionId]: [optionId] };
            }
            const exists = current.includes(optionId);
            const next = exists ? current.filter((id) => id !== optionId) : [...current, optionId];
            next.sort();
            return { ...prev, [questionId]: next };
        });
    }

    async function importJSON(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!Array.isArray(data)) {
                throw new Error("Expected a JSON array of question objects.");
            }
            const existingIds = new Set(questionBank.map((question) => question.id));
            const { accepted, rejected, warnings } = sanitizeImportedQuestions(data, {
                existingIds,
            });
            if (accepted.length > 0) {
                const newTotal = imported.length + accepted.length;
                setImported((prev) => [...prev, ...accepted]);
                setImportedQty((prev) => clampNumber(prev, 1, Math.max(1, newTotal)));
            }
            const messageParts = [];
            if (accepted.length > 0) messageParts.push(`Imported ${accepted.length} question(s).`);
            if (rejected.length > 0)
                messageParts.push(`Skipped ${rejected.length} due to validation issues.`);
            if (warnings.length > 0)
                messageParts.push(`Adjusted ${warnings.length} item(s) to ensure unique IDs.`);
            if (messageParts.length === 0) messageParts.push("No questions imported.");
            const details = [
                ...warnings.slice(0, 3),
                ...rejected.slice(0, 3).map((entry) => {
                    const issueText = entry.issues.join("; ");
                    return `#${entry.index + 1}${entry.id ? ` (${entry.id})` : ""}: ${issueText}`;
                }),
            ];
            const statusType =
                rejected.length > 0 ? "warning" : warnings.length > 0 ? "warning" : "success";
            setImportStatus({
                type: statusType,
                message: messageParts.join(" "),
                details,
            });
        } catch (error) {
            setImportStatus({ type: "error", message: `Import failed: ${error.message}` });
        }
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

    const reviewPrompt = !finished
        ? "Complete all questions to unlock the detailed review."
        : reviewQuestions.length === 0
        ? "No questions to review for the current filters."
        : null;

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
                                    secondsLeft < 300 && started ? "text-red-600" : ""
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

                {!started && (
                    <div className="rounded-2xl shadow-md p-6 space-y-6 bg-white">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-5 rounded-2xl border bg-white flex flex-col gap-3">
                                <h3 className="font-semibold text-lg">Full Exam</h3>
                                <p className="text-sm text-slate-600">
                                    65 questions • 90 minutes • weighted to the official domain
                                    percentages.
                                </p>
                                <button
                                    onClick={() => startExam("full")}
                                    className="px-4 py-2 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
                                >
                                    <PlayCircle className="w-4 h-4" />
                                    Start
                                </button>
                            </div>
                            <div className="p-5 rounded-2xl border bg-white flex flex-col gap-3">
                                <h3 className="font-semibold text-lg">Quick Practice</h3>
                                <p className="text-sm text-slate-600">
                                    20 questions • 30 minutes • mixed domains.
                                </p>
                                <button
                                    onClick={() => startExam("quick")}
                                    className="px-4 py-2 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
                                >
                                    <ListChecks className="w-4 h-4" />
                                    Start
                                </button>
                            </div>
                            <div className="p-5 rounded-2xl border bg-white flex flex-col gap-3">
                                <h3 className="font-semibold text-lg">Domain Practice</h3>
                                <div className="space-y-2">
                                    <label className="text-sm block">Domain</label>
                                    <select
                                        className="w-full border rounded-xl p-2 bg-white"
                                        value={domainPick}
                                        onChange={(event) => setDomainPick(event.target.value)}
                                    >
                                        {DOMAINS.map((domain) => (
                                            <option key={domain.name} value={domain.name}>
                                                {domain.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm block flex items-center justify-between">
                                        <span>Questions</span>
                                        <span className="text-xs text-slate-500">
                                            {domainPoolSize} available
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={Math.max(1, domainPoolSize)}
                                        value={domainQty}
                                        onChange={(event) =>
                                            setDomainQty(
                                                clampNumber(
                                                    parseInt(event.target.value || "1", 10),
                                                    1,
                                                    Math.max(1, domainPoolSize)
                                                )
                                            )
                                        }
                                        className="w-full border rounded-xl p-2 bg-white"
                                    />
                                </div>
                                <button
                                    onClick={() => startExam("domain")}
                                    className="px-4 py-2 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
                                >
                                    <Filter className="w-4 h-4" />
                                    Start
                                </button>
                            </div>
                        </div>

                        {imported.length > 0 && (
                            <div className="p-5 rounded-2xl border-2 border-blue-200 bg-blue-50 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Imported Questions</h3>
                                    <span className="text-sm text-blue-700 font-medium">
                                        {imported.length} available
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Practice with your imported JSON questions only.
                                </p>
                                <div className="space-y-2">
                                    <label className="text-sm block">Number of Questions</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={imported.length}
                                        value={importedQty}
                                        onChange={(event) =>
                                            setImportedQty(
                                                clampNumber(
                                                    parseInt(event.target.value || "1", 10),
                                                    1,
                                                    imported.length
                                                )
                                            )
                                        }
                                        className="w-full border rounded-xl p-2 bg-white"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Max: {imported.length} questions
                                    </p>
                                </div>
                                <button
                                    onClick={() => startExam("imported")}
                                    className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors font-medium"
                                >
                                    <Upload className="w-4 h-4" />
                                    Start with Imported Questions
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="application/json"
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (file) importJSON(file);
                                            event.target.value = "";
                                        }}
                                        className="border rounded-xl p-2 bg-white"
                                    />
                                </div>
                                <div className="text-sm text-slate-600 flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Import questions (JSON)
                                    {imported.length > 0 && (
                                        <span className="ml-2 text-blue-600 font-medium">
                                            • {imported.length} imported
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={downloadTemplate}
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
                                type="button"
                            >
                                <Download className="w-4 h-4" />
                                Download template
                            </button>
                        </div>

                        {importStatus && (
                            <div
                                className={`rounded-xl border p-3 text-sm flex flex-col gap-1 ${
                                    importStatus.type === "success"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                        : importStatus.type === "warning"
                                        ? "border-amber-200 bg-amber-50 text-amber-800"
                                        : "border-red-200 bg-red-50 text-red-700"
                                }`}
                            >
                                <div className="font-medium flex items-center gap-2">
                                    {importStatus.type === "success" ? (
                                        <Download className="w-4 h-4" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4" />
                                    )}
                                    {importStatus.message}
                                </div>
                                {importStatus.details && importStatus.details.length > 0 && (
                                    <ul className="text-xs list-disc pl-5 space-y-1">
                                        {importStatus.details.map((detail) => (
                                            <li key={detail}>{detail}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        <div className="rounded-2xl border p-4 bg-slate-50">
                            <h4 className="font-semibold mb-2">Domain weights</h4>
                            <div className="grid md:grid-cols-4 gap-3">
                                {DOMAINS.map((domain) => (
                                    <div
                                        key={domain.name}
                                        className="p-3 rounded-xl bg-white border"
                                    >
                                        <div className="text-sm font-medium">{domain.name}</div>
                                        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all"
                                                style={{ width: `${domain.weight * 100}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-slate-600 mt-1">
                                            {Math.round(domain.weight * 100)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className="text-xs text-slate-500">
                            Tip: You can pause the timer by toggling it and resume at any time. The
                            review section unlocks once you finish or time expires.
                        </p>
                    </div>
                )}

                {started && (
                    <div className="space-y-4">
                        {visibleQuestions.map((question, index) => {
                            const selected = answers[question.id] || [];
                            const isCorrect = answersEqual(selected, question.correctOptionIds);
                            return (
                                <div
                                    key={question.id}
                                    className="rounded-2xl shadow-sm p-5 space-y-3 bg-white"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-slate-600">
                                            {question.domain}
                                        </div>
                                        <div className="text-xs font-mono px-2 py-1 rounded-full border">
                                            {question.type === "multi"
                                                ? "Multiple response"
                                                : "Multiple choice"}
                                        </div>
                                    </div>
                                    <div className="text-base font-medium">
                                        {index + 1}. {question.question}
                                    </div>
                                    <div className="space-y-2">
                                        {question.type === "single" ? (
                                            <div className="space-y-2">
                                                {question.options.map((option) => {
                                                    const checked = selected[0] === option.id;
                                                    return (
                                                        <div
                                                            key={option.id}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <input
                                                                type="radio"
                                                                id={`${question.id}-${option.id}`}
                                                                name={question.id}
                                                                value={option.id}
                                                                checked={checked}
                                                                onChange={() =>
                                                                    toggleAnswer(
                                                                        question.id,
                                                                        option.id,
                                                                        "single"
                                                                    )
                                                                }
                                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                            />
                                                            <label
                                                                htmlFor={`${question.id}-${option.id}`}
                                                                className="cursor-pointer"
                                                            >
                                                                {option.text}
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {question.options.map((option) => {
                                                    const checked = selected.includes(option.id);
                                                    return (
                                                        <div
                                                            key={option.id}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                id={`${question.id}-${option.id}`}
                                                                checked={checked}
                                                                onChange={() =>
                                                                    toggleAnswer(
                                                                        question.id,
                                                                        option.id,
                                                                        "multi"
                                                                    )
                                                                }
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <label
                                                                htmlFor={`${question.id}-${option.id}`}
                                                                className="cursor-pointer"
                                                            >
                                                                {option.text}
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                                <div className="text-xs text-slate-500">
                                                    Select all that apply.
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {finished && (
                                        <div className="mt-2 p-3 rounded-xl bg-slate-50 border">
                                            <div
                                                className={`text-sm font-semibold ${
                                                    isCorrect ? "text-green-700" : "text-red-700"
                                                }`}
                                            >
                                                {isCorrect ? "Correct" : "Incorrect"}
                                            </div>
                                            <div className="text-sm">
                                                Correct answer
                                                {question.correctOptionIds.length > 1
                                                    ? "s"
                                                    : ""}:{" "}
                                                <span className="font-mono">
                                                    {question.correctOptionIds.join(", ")}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-700 leading-relaxed mt-1 flex items-start gap-2">
                                                <BookOpenText className="w-4 h-4 mt-0.5" />
                                                <span>{question.explanation}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="sticky bottom-4">
                            <div className="rounded-2xl shadow-lg border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="text-sm">
                                        Answered{" "}
                                        <span className="font-semibold">{score.answered}</span> /{" "}
                                        {visibleQuestions.length}
                                    </div>
                                    {finished ? (
                                        <>
                                            <div className="text-sm">
                                                Correct{" "}
                                                <span className="font-semibold">
                                                    {score.correct}
                                                </span>
                                            </div>
                                            <div className="text-sm">
                                                Score{" "}
                                                <span className="font-semibold">{score.pct}%</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-sm text-slate-500 italic">
                                            Complete all questions to see your score
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setTimerOn((prev) => !prev)}
                                        className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-2 transition-colors"
                                    >
                                        <Clock className="w-4 h-4" />
                                        {timerOn ? "Pause timer" : "Resume timer"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const rows = [
                                                [
                                                    "id",
                                                    "domain",
                                                    "type",
                                                    "isCorrect",
                                                    "chosen",
                                                    "correct",
                                                    "question",
                                                ],
                                                ...visibleQuestions.map((question) => {
                                                    const selected = answers[question.id] || [];
                                                    const isCorrect = answersEqual(
                                                        selected,
                                                        question.correctOptionIds
                                                    );
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
                                                .map((row) =>
                                                    row
                                                        .map(
                                                            (cell) =>
                                                                `"${String(cell).replaceAll(
                                                                    '"',
                                                                    '""'
                                                                )}"`
                                                        )
                                                        .join(",")
                                                )
                                                .join("\n");
                                            const blob = new Blob([csv], { type: "text/csv" });
                                            const url = URL.createObjectURL(blob);
                                            const anchor = document.createElement("a");
                                            anchor.href = url;
                                            anchor.download = `aws-clf-c02-mock-results-${Date.now()}.csv`;
                                            anchor.click();
                                            URL.revokeObjectURL(url);
                                        }}
                                        className="px-4 py-2 rounded-2xl border border-gray-300 hover:bg-gray-50 text-slate-700 flex items-center gap-2 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export results (CSV)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {finished && (
                            <div className="rounded-2xl border shadow-md p-6 space-y-4 bg-white">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <h3 className="text-xl font-semibold">
                                        Review & Domain Breakdown
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        {incorrectQuestions.length > 0 && (
                                            <button
                                                onClick={() =>
                                                    setShowIncorrectOnly((prev) => !prev)
                                                }
                                                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center gap-2 transition-colors"
                                            >
                                                {showIncorrectOnly ? (
                                                    <>
                                                        <XCircle className="w-4 h-4" />
                                                        Show All Questions
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="w-4 h-4" />
                                                        Review Incorrect (
                                                        {incorrectQuestions.length})
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        <select
                                            value={reviewDomain}
                                            onChange={(event) =>
                                                setReviewDomain(event.target.value)
                                            }
                                            className="border rounded-xl p-2 bg-white text-sm"
                                        >
                                            <option value={REVIEW_ALL}>All domains</option>
                                            {DOMAINS.map((domain) => (
                                                <option key={domain.name} value={domain.name}>
                                                    {domain.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {Object.entries(domainStats).map(([name, stats]) => (
                                        <div key={name} className="rounded-xl border p-4 bg-white">
                                            <div className="font-medium">{name}</div>
                                            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${
                                                            stats.total
                                                                ? (stats.correct / stats.total) *
                                                                  100
                                                                : 0
                                                        }%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="text-sm text-slate-600 mt-1">
                                                {stats.correct} / {stats.total} correct
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600">
                                    Passing on the real exam requires a scaled score of 700/1000.
                                    This mock uses percentage scoring to give you directional
                                    feedback.
                                </p>

                                {reviewPrompt && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                        {reviewPrompt}
                                    </div>
                                )}

                                {reviewQuestions.length > 0 && (
                                    <div className="space-y-4">
                                        {reviewQuestions.map((question) => {
                                            const selected = answers[question.id] || [];
                                            const isCorrect = answersEqual(
                                                selected,
                                                question.correctOptionIds
                                            );
                                            const isIncorrect = !isCorrect;
                                            return (
                                                <div
                                                    key={`review-${question.id}`}
                                                    className="border rounded-xl p-4 bg-white space-y-3"
                                                >
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <span>{question.domain}</span>
                                                        {isIncorrect && (
                                                            <span className="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded">
                                                                Needs review
                                                            </span>
                                                        )}
                                                        {isCorrect && (
                                                            <span className="ml-auto text-xs bg-green-500 text-white px-2 py-1 rounded">
                                                                Correct
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-base font-medium">
                                                        {question.question}
                                                    </div>
                                                    <div className="space-y-2">
                                                        {question.options.map((option) => {
                                                            const isSelected = selected.includes(
                                                                option.id
                                                            );
                                                            const isAnswer =
                                                                question.correctOptionIds.includes(
                                                                    option.id
                                                                );
                                                            return (
                                                                <div
                                                                    key={option.id}
                                                                    className={`rounded-lg border p-3 text-sm flex items-center gap-3 ${
                                                                        isAnswer
                                                                            ? "border-green-300 bg-green-50"
                                                                            : isSelected
                                                                            ? "border-red-300 bg-red-50"
                                                                            : "border-slate-200"
                                                                    }`}
                                                                >
                                                                    <span className="font-mono text-xs px-2 py-1 rounded bg-slate-100">
                                                                        {option.id}
                                                                    </span>
                                                                    <span>{option.text}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                                        <div className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-1">
                                                            <BookOpenText className="w-4 h-4" />
                                                            Explanation
                                                        </div>
                                                        <div className="text-sm text-blue-800 leading-relaxed">
                                                            {question.explanation}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {attemptHistory.length > 0 && (
                                    <div className="border rounded-xl p-4 bg-slate-50 space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <History className="w-4 h-4" />
                                            Recent attempts
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {attemptHistory.map((attempt) => (
                                                <div
                                                    key={attempt.id}
                                                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg border bg-white p-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium">
                                                            {attempt.mode
                                                                ? attempt.mode.toUpperCase()
                                                                : "--"}
                                                        </span>
                                                        <span className="text-slate-500">
                                                            {formatTimestamp(attempt.id)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 text-slate-600">
                                                        <span>
                                                            Score{" "}
                                                            <span className="font-semibold">
                                                                {attempt.pct}%
                                                            </span>
                                                        </span>
                                                        <span>
                                                            Correct {attempt.correct}/
                                                            {attempt.total}
                                                        </span>
                                                        <span>
                                                            Time used{" "}
                                                            {formatTime(attempt.durationSeconds)} of{" "}
                                                            {formatTime(
                                                                attempt.minutesAllocated * 60
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
