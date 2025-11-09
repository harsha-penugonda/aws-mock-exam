import React from "react";
import { History } from "lucide-react";

/**
 * Component for displaying exam attempt history.
 * Shows recent attempts with scores, timing, and domain statistics.
 */
export function AttemptHistory({ attempts }) {
    if (!attempts || attempts.length === 0) {
        return null;
    }

    return (
        <div className="border rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <History className="w-4 h-4" />
                Recent attempts
            </div>
            <div className="space-y-2 text-sm">
                {attempts.map((attempt) => (
                    <div
                        key={attempt.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg border bg-white p-3"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-medium">
                                {attempt.mode ? attempt.mode.toUpperCase() : "--"}
                            </span>
                            <span className="text-slate-500">{formatTimestamp(attempt.id)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-slate-600">
                            <span>
                                Score <span className="font-semibold">{attempt.pct}%</span>
                            </span>
                            <span>
                                Correct {attempt.correct}/{attempt.total}
                            </span>
                            <span>
                                Time used {formatTime(attempt.durationSeconds)} of{" "}
                                {formatTime(attempt.minutesAllocated * 60)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

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

