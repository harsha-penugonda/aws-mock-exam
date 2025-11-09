import React from "react";
import { PlayCircle, ListChecks, Filter, Upload, Download, AlertCircle } from "lucide-react";

/**
 * Exam configuration component for selecting exam mode and importing questions.
 * Handles all pre-exam configuration UI.
 */
export function ExamConfigurator({
    domainPick,
    setDomainPick,
    domainQty,
    setDomainQty,
    importedQty,
    setImportedQty,
    domainPoolSize,
    importedCount,
    onStartExam,
    onImportFile,
    importStatus,
    onDownloadTemplate,
    presets = [],
    domains = [],
}) {
    return (
        <div className="rounded-2xl shadow-md p-6 space-y-6 bg-white">
            <div className="grid md:grid-cols-3 gap-4">
                {presets.map((preset) => {
                    const Icon = preset.id === "quick" ? ListChecks : PlayCircle;
                    return (
                        <div key={preset.id} className="p-5 rounded-2xl border bg-white flex flex-col gap-3">
                            <h3 className="font-semibold text-lg">{preset.label}</h3>
                            <p className="text-sm text-slate-600">{preset.description}</p>
                            <button
                                onClick={() => onStartExam(preset.id)}
                                className="px-4 py-2 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
                                aria-label={`Start ${preset.label}`}
                            >
                                <Icon className="w-4 h-4" />
                                Start
                            </button>
                        </div>
                    );
                })}

                <div className="p-5 rounded-2xl border bg-white flex flex-col gap-3">
                    <h3 className="font-semibold text-lg">Domain Practice</h3>
                    <div className="space-y-2">
                        <label className="text-sm block">Domain</label>
                        <select
                            className="w-full border rounded-xl p-2 bg-white"
                            value={domainPick}
                            onChange={(event) => setDomainPick(event.target.value)}
                        >
                            {domains.map((domain) => (
                                <option key={domain.name} value={domain.name}>
                                    {domain.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm block flex items-center justify-between">
                            <span>Questions</span>
                            <span className="text-xs text-slate-500">{domainPoolSize} available</span>
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={Math.max(1, domainPoolSize)}
                            value={domainQty}
                            onChange={(event) =>
                                setDomainQty(
                                    clampNumber(parseInt(event.target.value || "1", 10), 1, Math.max(1, domainPoolSize))
                                )
                            }
                            className="w-full border rounded-xl p-2 bg-white"
                        />
                    </div>
                    <button
                        onClick={() => onStartExam("domain")}
                        className="px-4 py-2 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
                        aria-label="Start Domain Practice"
                    >
                        <Filter className="w-4 h-4" />
                        Start
                    </button>
                </div>
            </div>

            {importedCount > 0 && (
                <div className="p-5 rounded-2xl border-2 border-blue-200 bg-blue-50 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Imported Questions</h3>
                        <span className="text-sm text-blue-700 font-medium">{importedCount} available</span>
                    </div>
                    <p className="text-sm text-slate-600">Practice with your imported JSON questions only.</p>
                    <div className="space-y-2">
                        <label className="text-sm block">Number of Questions</label>
                        <input
                            type="number"
                            min={1}
                            max={importedCount}
                            value={importedQty}
                            onChange={(event) =>
                                setImportedQty(clampNumber(parseInt(event.target.value || "1", 10), 1, importedCount))
                            }
                            className="w-full border rounded-xl p-2 bg-white"
                        />
                        <p className="text-xs text-slate-500">Max: {importedCount} questions</p>
                    </div>
                    <button
                        onClick={() => onStartExam("imported")}
                        className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors font-medium"
                        aria-label="Start Imported Questions"
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
                                if (file) onImportFile(file);
                                event.target.value = "";
                            }}
                            className="border rounded-xl p-2 bg-white"
                        />
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Import questions (JSON)
                        {importedCount > 0 && (
                            <span className="ml-2 text-blue-600 font-medium">• {importedCount} imported</span>
                        )}
                    </div>
                </div>
                <button
                    onClick={onDownloadTemplate}
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
                            {importStatus.details.map((detail, idx) => (
                                <li key={idx}>{detail}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <div className="rounded-2xl border p-4 bg-slate-50">
                <h4 className="font-semibold mb-2">Domain weights</h4>
                <div className="grid md:grid-cols-4 gap-3">
                    {domains.map((domain) => (
                        <div key={domain.name} className="p-3 rounded-xl bg-white border">
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
                Tip: You can pause the timer by toggling it and resume at any time. The review section
                unlocks once you finish or time expires.
            </p>
        </div>
    );
}

function clampNumber(value, min, max) {
    if (Number.isNaN(value)) return min;
    const upperBound = Math.max(min, max);
    return Math.min(Math.max(value, min), upperBound);
}
