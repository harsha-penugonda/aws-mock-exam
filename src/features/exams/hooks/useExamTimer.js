import { useEffect, useRef } from "react";

/**
 * Custom hook to manage exam timer logic and side effects.
 * Isolates timer behavior for better testability and SSR handling.
 *
 * @param {boolean} started - Whether the exam has started
 * @param {boolean} timerOn - Whether the timer is currently running
 * @param {number} examMinutes - Total minutes allocated for the exam
 * @param {number} secondsLeft - Current seconds remaining
 * @param {function} setSecondsLeft - Callback to update seconds remaining
 * @param {function} onFinish - Callback when timer reaches zero
 * @returns {object} Timer state and controls
 */
export function useExamTimer(started, timerOn, examMinutes, secondsLeft, setSecondsLeft, onFinish) {
    const intervalRef = useRef(null);
    const hasFinishedRef = useRef(false);

    // Reset finished flag when exam restarts
    useEffect(() => {
        if (!started) {
            hasFinishedRef.current = false;
        }
    }, [started]);

    // Handle timer countdown
    useEffect(() => {
        if (!started || !timerOn) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                const next = Math.max(0, prev - 1);
                return next;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [started, timerOn, setSecondsLeft]);

    // Handle timer reaching zero
    useEffect(() => {
        if (started && secondsLeft === 0 && !hasFinishedRef.current) {
            hasFinishedRef.current = true;
            if (onFinish) {
                onFinish();
            }
        }
    }, [started, secondsLeft, onFinish]);

    // Auto-pause timer when it reaches zero
    useEffect(() => {
        if (!started || secondsLeft > 0) return;
        // Timer pause logic is handled by onFinish callback
    }, [started, secondsLeft]);

    return {
        isRunning: started && timerOn,
        timeRemaining: secondsLeft,
    };
}

