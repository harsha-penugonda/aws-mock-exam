import { useState, useEffect, useRef, useCallback } from "react";

const HISTORY_STORAGE_KEY_DEFAULT = "aws-mock-exam-history";
const MAX_HISTORY_ENTRIES = 10;

/**
 * Custom hook to manage attempt history persistence in localStorage.
 * Isolates browser API usage for better SSR/suspense handling.
 *
 * @param {string} storageKey - localStorage key namespace per exam
 * @returns {object} History state and methods
 */
export function useAttemptHistory(storageKey = HISTORY_STORAGE_KEY_DEFAULT) {
    const readHistory = useCallback(() => {
        if (typeof window === "undefined") return [];
        try {
            const stored = window.localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn("Failed to parse history from localStorage", error);
            return [];
        }
    }, [storageKey]);

    const [attemptHistory, setAttemptHistory] = useState(readHistory);

    const recordedAttemptRef = useRef(false);

    // Persist history to localStorage whenever it changes
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(attemptHistory));
        } catch (error) {
            console.warn("Failed to persist history", error);
        }
    }, [attemptHistory, storageKey]);

    // Reload history whenever the storage key changes (e.g., switching exams)
    useEffect(() => {
        setAttemptHistory(readHistory());
        recordedAttemptRef.current = false;
    }, [storageKey, readHistory]);

    /**
     * Record a new exam attempt
     * @param {object} attemptData - Attempt data to record
     */
    const recordAttempt = (attemptData) => {
        if (recordedAttemptRef.current) return; // Prevent duplicate recording

        const entry = {
            id: Date.now(),
            ...attemptData,
        };

        setAttemptHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY_ENTRIES));
        recordedAttemptRef.current = true;
    };

    /**
     * Reset the recorded attempt flag (call when starting a new exam)
     */
    const resetRecordedFlag = () => {
        recordedAttemptRef.current = false;
    };

    /**
     * Clear all attempt history
     */
    const clearHistory = () => {
        setAttemptHistory([]);
        if (typeof window !== "undefined") {
            try {
                window.localStorage.removeItem(storageKey);
            } catch (error) {
                console.warn("Failed to clear history from localStorage", error);
            }
        }
    };

    return {
        attemptHistory,
        recordAttempt,
        resetRecordedFlag,
        clearHistory,
    };
}
