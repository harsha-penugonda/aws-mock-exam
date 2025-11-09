import React from "react";
import { Clock, Download, BookOpenText } from "lucide-react";
import { answersEqual, isAnswerReadyForValidation } from "../utils/exam";

/**
 * Component for displaying and answering exam questions.
 * Handles single and multi-select question types.
 */
export function QuestionList({
    questions,
    answers,
    finished,
    onToggleAnswer,
    onToggleTimer,
    timerOn,
    timerLabel,
    score,
    onExportCSV,
}) {
    return (
        <div className="space-y-4">
            {questions.map((question, index) => {
                const selected = answers[question.id] || [];
                // Only validate if answer is ready (for multi-response, wait until required number selected)
                // or if exam is finished
                const shouldValidate =
                    finished ||
                    isAnswerReadyForValidation(selected, question.correctOptionIds, question.type);
                const isCorrect = shouldValidate
                    ? answersEqual(selected, question.correctOptionIds)
                    : null;
                return (
                    <div key={question.id} className="rounded-2xl shadow-sm p-5 space-y-3 bg-white">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-600">{question.domain}</div>
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
                                                        onToggleAnswer(
                                                            question.id,
                                                            option.id,
                                                            "single"
                                                        )
                                                    }
                                                    disabled={finished}
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
                                        // For multi-response questions, keep inputs enabled until required number is selected
                                        const isAnswerComplete =
                                            selected.length === question.correctOptionIds.length;
                                        const shouldDisable = finished && isAnswerComplete;
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
                                                        onToggleAnswer(
                                                            question.id,
                                                            option.id,
                                                            "multi"
                                                        )
                                                    }
                                                    disabled={shouldDisable}
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
                                {isCorrect !== null ? (
                                    <>
                                        <div
                                            className={`text-sm font-semibold ${
                                                isCorrect ? "text-green-700" : "text-red-700"
                                            }`}
                                        >
                                            {isCorrect ? "Correct" : "Incorrect"}
                                        </div>
                                        <div className="text-sm">
                                            Correct answer
                                            {question.correctOptionIds.length > 1 ? "s" : ""}:{" "}
                                            <span className="font-mono">
                                                {question.correctOptionIds.join(", ")}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-sm text-slate-600">
                                        Please select {question.correctOptionIds.length} option
                                        {question.correctOptionIds.length > 1 ? "s" : ""}
                                    </div>
                                )}
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
                            Answered <span className="font-semibold">{score.answered}</span> /{" "}
                            {questions.length}
                        </div>
                        {finished ? (
                            <>
                                <div className="text-sm">
                                    Correct <span className="font-semibold">{score.correct}</span>
                                </div>
                                <div className="text-sm">
                                    Score <span className="font-semibold">{score.pct}%</span>
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
                            onClick={onToggleTimer}
                            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-2 transition-colors"
                        >
                            <Clock className="w-4 h-4" />
                            {timerOn ? "Pause timer" : "Resume timer"}
                        </button>
                        <button
                            onClick={onExportCSV}
                            className="px-4 py-2 rounded-2xl border border-gray-300 hover:bg-gray-50 text-slate-700 flex items-center gap-2 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export results (CSV)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
