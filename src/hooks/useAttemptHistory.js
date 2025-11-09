import { useState, useEffect, useRef } from "react";

const HISTORY_STORAGE_KEY = "aws-mock-exam-history";
const MAX_HISTORY_ENTRIES = 10;

/**
 * Custom hook to manage attempt history persistence in localStorage.
 * Isolates browser API usage for better SSR/suspense handling.
 *
 * @returns {object} History state and methods
 */
export function useAttemptHistory() {
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

    // Persist history to localStorage whenever it changes
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(attemptHistory));
        } catch (error) {
            console.warn("Failed to persist history", error);
        }
    }, [attemptHistory]);

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
                window.localStorage.removeItem(HISTORY_STORAGE_KEY);
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

