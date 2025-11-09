import React from "react";
import { AlertCircle, XCircle, BookOpenText } from "lucide-react";
import { answersEqual } from "../utils/exam";

const REVIEW_ALL = "all";

/**
 * Component for reviewing exam results after completion.
 * Shows domain breakdown, filter options, and detailed question reviews.
 */
export function ReviewPanel({
    visibleQuestions,
    answers,
    incorrectQuestions,
    reviewQuestions,
    domainStats,
    showIncorrectOnly,
    reviewDomain,
    domains = [],
    passScoreNote = "",
    onToggleIncorrectFilter,
    onDomainFilterChange,
}) {
    const reviewPrompt = !reviewQuestions || reviewQuestions.length === 0
        ? "No questions to review for the current filters."
        : null;

    return (
        <div className="rounded-2xl border shadow-md p-6 space-y-4 bg-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-xl font-semibold">Review & Domain Breakdown</h3>
                <div className="flex flex-wrap items-center gap-3">
                    {incorrectQuestions && incorrectQuestions.length > 0 && (
                        <button
                            onClick={onToggleIncorrectFilter}
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
                                    Review Incorrect ({incorrectQuestions.length})
                                </>
                            )}
                        </button>
                    )}
                    <select
                        value={reviewDomain}
                        onChange={(event) => onDomainFilterChange(event.target.value)}
                        className="border rounded-xl p-2 bg-white text-sm"
                    >
                        <option value={REVIEW_ALL}>All domains</option>
                        {domains.map((domain) => (
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
                                    width: `${stats.total ? (stats.correct / stats.total) * 100 : 0}%`,
                                }}
                            />
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                            {stats.correct} / {stats.total} correct
                        </div>
                    </div>
                ))}
            </div>

            {passScoreNote && (
                <p className="text-sm text-slate-600">{passScoreNote}</p>
            )}

            {reviewPrompt && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    {reviewPrompt}
                </div>
            )}

            {reviewQuestions && reviewQuestions.length > 0 && (
                <div className="space-y-4">
                    {reviewQuestions.map((question) => {
                        const selected = answers[question.id] || [];
                        const isCorrect = answersEqual(selected, question.correctOptionIds);
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
                                <div className="text-base font-medium">{question.question}</div>
                                <div className="space-y-2">
                                    {question.options.map((option) => {
                                        const isSelected = selected.includes(option.id);
                                        const isAnswer = question.correctOptionIds.includes(option.id);
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
        </div>
    );
}
