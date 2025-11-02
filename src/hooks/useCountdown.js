import { useEffect, useState } from "react";

/**
 * Countdown helper hook that exposes the seconds remaining alongside a setter.
 * Resets automatically whenever the minute budget changes.
 */
export function useCountdown(enabled, minutes) {
    const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

    useEffect(() => {
        setSecondsLeft(minutes * 60);
    }, [minutes]);

    useEffect(() => {
        if (!enabled) return undefined;
        const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(id);
    }, [enabled]);

    return [secondsLeft, setSecondsLeft];
}
