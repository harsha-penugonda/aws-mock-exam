import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import App from "./App";
import { sampleWeighted, sanitizeImportedQuestions } from "../features/exams";

describe("App integration", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    test("starting quick practice initializes timer and question count", async () => {
        jest.useFakeTimers();
        render(<App />);

        const startButton = screen.getByRole("button", { name: /start quick practice/i });
        fireEvent.click(startButton);

        const timer = screen.getByText("30:00");
        expect(timer).toBeInTheDocument();

        const summary = screen.getByText(/Answered/i);
        expect(summary).toHaveTextContent(/Answered\s*0\s*\/\s*20/);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        await waitFor(() => expect(timer).not.toHaveTextContent("30:00"));
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

        const picks = sampleWeighted(bank, 4, [], () => 0);
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
            domains: [{ name: "Cloud Concepts" }],
        });

        expect(accepted).toHaveLength(2);
        expect(warnings.length).toBeGreaterThan(0);
        expect(rejected.length).toBeGreaterThan(0);
        expect(rejected.some((item) => Array.isArray(item.issues) && item.issues.length > 0)).toBe(
            true
        );
    });
});
