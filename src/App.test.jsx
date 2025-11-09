import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "./App";
import { sampleWeighted, sanitizeImportedQuestions } from "./utils/exam";

describe("App integration", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    test("starting quick practice initializes timer and question count", () => {
        jest.useFakeTimers();
        render(<App />);

        // Use Testing Library queries only (no .closest)
        const startButton = screen.getByRole("button", { name: /start/i });
        fireEvent.click(startButton);

        expect(screen.getByText("30:00")).toBeInTheDocument();

        const summary = screen.getByText(/Answered/i);
        expect(summary).toHaveTextContent(/Answered\s*0\s*\/\s*20/);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(screen.getByText("29:59")).toBeInTheDocument();
    });
});

describe("exam utilities", () => {
    const baseQuestion = {
        type: "single",
        question: "Sample?",
        options: [
            { id: "a", text: "A" },
            { id: "b", text: "B" },
        ],
        correctOptionIds: ["a"],
        explanation: "Because.",
    };

    test("sampleWeighted returns the requested number of unique questions", () => {
        const bank = [
            { ...baseQuestion, id: "q1", domain: "Cloud Concepts" },
            { ...baseQuestion, id: "q2", domain: "Security and Compliance" },
            { ...baseQuestion, id: "q3", domain: "Cloud Technology and Services" },
            { ...baseQuestion, id: "q4", domain: "Billing, Pricing, and Support" },
        ];

        const picks = sampleWeighted(bank, 4, () => 0);
        expect(picks).toHaveLength(4);
        expect(new Set(picks.map((q) => q.id)).size).toBe(4);
    });

    test("sanitizeImportedQuestions validates schema and rejects bad rows", () => {
        const data = [
            {
                ...baseQuestion,
                id: "custom-1",
                domain: "Cloud Concepts",
            },
            {
                ...baseQuestion,
                id: "custom-duplicate",
                domain: "Cloud Concepts",
            },
            {
                ...baseQuestion,
                id: "custom-duplicate",
                domain: "Unknown Domain",
            },
        ];

        const { accepted, rejected, warnings } = sanitizeImportedQuestions(data, {
            existingIds: new Set(["custom-1"]),
        });

        expect(accepted).toHaveLength(2);
        expect(warnings.length).toBeGreaterThan(0);
        expect(rejected.length).toBeGreaterThan(0);
        expect(rejected.some((item) => Array.isArray(item.issues) && item.issues.length > 0)).toBe(
            true
        );
    });
});
