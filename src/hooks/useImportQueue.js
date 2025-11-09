import { useState, useCallback, useMemo } from "react";
import { validateQuestions } from "../schemas/question";

/**
 * Custom hook to manage question import logic and validation.
 * Isolates file handling, validation, and import status management.
 *
 * @param {Array} existingQuestions - Questions already in the bank (for duplicate checking)
 * @returns {object} Import state and handlers
 */
export function useImportQueue(existingQuestions = []) {
    const [importStatus, setImportStatus] = useState(null);
    const [importedQuestions, setImportedQuestions] = useState([]);

    const existingIds = useMemo(
        () => new Set(existingQuestions.map((q) => q.id)),
        [existingQuestions]
    );

    const importQuestions = useCallback(
        async (file) => {
            try {
                const text = await file.text();
                const data = JSON.parse(text);

                if (!Array.isArray(data)) {
                    throw new Error("Expected a JSON array of question objects.");
                }

                // Validate questions using zod schema
                const validationResult = validateQuestions(data);

                const accepted = [];
                const rejected = [];
                const warnings = [];
                const seenIds = new Set(existingIds);

                // Process validated questions and handle ID conflicts
                if (validationResult.success && validationResult.data) {
                    validationResult.data.forEach((question, index) => {
                        let sanitizedId = question.id;
                        const rawIndex = data.findIndex((q) => q.id === question.id);

                        // Handle duplicate IDs
                        if (seenIds.has(sanitizedId)) {
                            let counter = 1;
                            let candidate = `${sanitizedId}-${counter}`;
                            while (seenIds.has(candidate)) {
                                counter += 1;
                                candidate = `${sanitizedId}-${counter}`;
                            }
                            warnings.push(
                                `Row #${rawIndex + 1}: Duplicate id "${sanitizedId}" renamed to "${candidate}".`
                            );
                            sanitizedId = candidate;
                        }

                        seenIds.add(sanitizedId);
                        accepted.push({
                            ...question,
                            id: sanitizedId,
                        });
                    });
                }

                // Process validation errors
                if (validationResult.errors) {
                    validationResult.errors.forEach(({ index, error }) => {
                        const issues = error.errors.map((e) => {
                            const path = e.path.length > 0 ? `${e.path.join(".")}: ` : "";
                            return `${path}${e.message}`;
                        });
                        rejected.push({
                            index,
                            id: data[index]?.id || `row-${index + 1}`,
                            issues,
                        });
                    });
                }

                // Update imported questions
                if (accepted.length > 0) {
                    setImportedQuestions((prev) => [...prev, ...accepted]);
                }

                // Build status message
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
                setImportStatus({
                    type: "error",
                    message: `Import failed: ${error.message}`,
                    details: [],
                });
            }
        },
        [existingIds]
    );

    const clearImportStatus = useCallback(() => {
        setImportStatus(null);
    }, []);

    const clearImported = useCallback(() => {
        setImportedQuestions([]);
    }, []);

    return {
        importedQuestions,
        importStatus,
        importQuestions,
        clearImportStatus,
        clearImported,
    };
}

