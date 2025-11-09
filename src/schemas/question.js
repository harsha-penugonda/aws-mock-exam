import { z } from "zod";
import { DOMAINS } from "../data/exams";

/**
 * Runtime validation schema for question data.
 * Validates questions from seed data, imports, or future API responses.
 */

const validDomains = DOMAINS.map((d) => d.name);

export const QuestionOptionSchema = z.object({
    id: z.string().min(1, "Option ID is required"),
    text: z.string().min(1, "Option text is required"),
});

export const QuestionSchema = z
    .object({
        id: z.string().min(1, "Question ID is required"),
        domain: z.enum(validDomains, {
            errorMap: () => ({ message: `Domain must be one of: ${validDomains.join(", ")}` }),
        }),
        type: z.enum(["single", "multi"], {
            errorMap: () => ({ message: 'Type must be "single" or "multi"' }),
        }),
        question: z.string().min(1, "Question text is required"),
        options: z
            .array(QuestionOptionSchema)
            .min(2, "At least two options are required")
            .refine(
                (options) => {
                    const ids = options.map((opt) => opt.id);
                    return new Set(ids).size === ids.length;
                },
                { message: "Option IDs must be unique" }
            ),
        correctOptionIds: z.array(z.string()).min(1, "At least one correct option is required"),
        explanation: z.string().optional().default(""),
        difficulty: z.enum(["easy", "medium", "hard"]).optional().nullable(),
    })
    .refine(
        (data) => {
            const optionIds = new Set(data.options.map((opt) => opt.id));
            return data.correctOptionIds.every((id) => optionIds.has(id));
        },
        {
            message: "All correctOptionIds must exist in options",
            path: ["correctOptionIds"],
        }
    )
    .refine(
        (data) => {
            if (data.type === "single") {
                return data.correctOptionIds.length === 1;
            }
            return data.correctOptionIds.length >= 2;
        },
        {
            message:
                "Single-response questions must have exactly one correct option; multi-response questions must have at least two",
            path: ["correctOptionIds"],
        }
    );

/**
 * Validates a single question object against the schema.
 * @param {unknown} data - Raw question data to validate
 * @returns {{ success: boolean, data?: Question, error?: z.ZodError }}
 */
export function validateQuestion(data) {
    return QuestionSchema.safeParse(data);
}

/**
 * Validates an array of questions.
 * @param {unknown} data - Raw array of question data to validate
 * @returns {{ success: boolean, data?: Question[], errors?: Array<{ index: number, error: z.ZodError }> }}
 */
export function validateQuestions(data) {
    if (!Array.isArray(data)) {
        return {
            success: false,
            errors: [
                {
                    index: -1,
                    error: new z.ZodError([
                        { code: "custom", message: "Expected an array", path: [] },
                    ]),
                },
            ],
        };
    }

    const errors = [];
    const validQuestions = [];

    data.forEach((item, index) => {
        const result = validateQuestion(item);
        if (result.success) {
            validQuestions.push(result.data);
        } else {
            errors.push({ index, error: result.error });
        }
    });

    return {
        success: errors.length === 0,
        data: validQuestions,
        errors: errors.length > 0 ? errors : undefined,
    };
}

/**
 * Type inference for Question (for JSDoc/IDE support)
 * @typedef {z.infer<typeof QuestionSchema>} Question
 */
