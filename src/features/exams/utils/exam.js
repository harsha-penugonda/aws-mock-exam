export function randomSample(source, count, random = Math.random) {
    const copy = [...source];
    const out = [];
    for (let i = 0; i < count && copy.length; i += 1) {
        const idx = Math.floor(random() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
    }
    return out;
}

export function shuffle(source, random = Math.random) {
    const copy = [...source];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function sampleWeighted(bank, total, domains = [], random = Math.random) {
    const byDomain = bank.reduce((acc, question) => {
        if (!acc[question.domain]) acc[question.domain] = [];
        acc[question.domain].push(question);
        return acc;
    }, {});

    const picks = [];
    domains.forEach((domain) => {
        const pool = byDomain[domain.name] || [];
        if (pool.length === 0) return;
        const target = Math.round(total * domain.weight);
        if (target === 0) return;
        picks.push(...randomSample(pool, Math.min(pool.length, target), random));
    });

    const usedIds = new Set(picks.map((q) => q.id));
    const remainingPool = bank.filter((q) => !usedIds.has(q.id));
    while (picks.length < total && remainingPool.length > 0) {
        const next = randomSample(remainingPool, 1, random)[0];
        picks.push(next);
        remainingPool.splice(remainingPool.indexOf(next), 1);
    }

    return shuffle(picks).slice(0, total);
}

export function answersEqual(a = [], b = []) {
    if (a.length !== b.length) return false;
    const aSet = new Set(a);
    if (aSet.size !== b.length) return false;
    return b.every((value) => aSet.has(value));
}

/**
 * Determines if an answer is ready to be validated.
 * For single-response questions: validates when an answer is selected.
 * For multi-response questions: only validates when the user has selected
 * the same number of options as required (to avoid premature incorrect marking).
 *
 * @param {Array} selected - Currently selected option IDs
 * @param {Array} correctOptionIds - Required correct option IDs
 * @param {string} questionType - 'single' or 'multi'
 * @returns {boolean} True if the answer should be validated
 */
export function isAnswerReadyForValidation(selected = [], correctOptionIds = [], questionType) {
    if (questionType === "single") {
        // Single-response: validate immediately when an answer is selected
        return selected.length > 0;
    }
    // Multi-response: only validate when user has selected the same number of options as required
    return selected.length === correctOptionIds.length;
}

export function buildDomainStats(questions, answers, domains = []) {
    const stats = domains.reduce((acc, domain) => {
        acc[domain.name] = { total: 0, correct: 0 };
        return acc;
    }, {});

    questions.forEach((question) => {
        if (!stats[question.domain]) {
            stats[question.domain] = { total: 0, correct: 0 };
        }
        const selections = answers[question.id] || [];
        const isCorrect = answersEqual(selections, question.correctOptionIds);
        stats[question.domain].total += 1;
        if (isCorrect) stats[question.domain].correct += 1;
    });

    return stats;
}

export function calculateScore(questions, answers) {
    const answered = questions.filter((question) => (answers[question.id] || []).length > 0);
    const correct = questions.filter((question) =>
        answersEqual(answers[question.id] || [], question.correctOptionIds)
    );
    const pct = questions.length ? Math.round((correct.length / questions.length) * 100) : 0;
    return { answered: answered.length, correct: correct.length, pct };
}

/**
 * @deprecated Use validateQuestions from schemas/question.js instead.
 * This function is kept for backward compatibility but should be migrated.
 */
export function sanitizeImportedQuestions(raw, { existingIds, domains = [] }) {
    // Note: New code should use validateQuestions from schemas/question.js
    // This legacy function is maintained for compatibility
    const validDomains = new Set(domains.map((d) => d.name));
    const accepted = [];
    const rejected = [];
    const warnings = [];
    const seenIds = new Set(existingIds);

    raw.forEach((entry, index) => {
        const issues = [];
        if (!entry || typeof entry !== "object") {
            rejected.push({ index, issues: ["Entry must be an object."] });
            return;
        }

        const rawId = typeof entry.id === "string" ? entry.id.trim() : "";
        let sanitizedId = rawId;
        if (!sanitizedId) {
            sanitizedId = `imported-${index + 1}`;
            warnings.push(`Row #${index + 1}: Missing question id. Generated id "${sanitizedId}".`);
        }
        if (seenIds.has(sanitizedId)) {
            const base = sanitizedId || `imported-${index + 1}`;
            let counter = 1;
            let candidate = `${base}-${counter}`;
            while (seenIds.has(candidate)) {
                counter += 1;
                candidate = `${base}-${counter}`;
            }
            warnings.push(
                `Row #${index + 1}: Duplicate id "${sanitizedId}" renamed to "${candidate}".`
            );
            sanitizedId = candidate;
        }

        if (!entry.domain || !validDomains.has(entry.domain))
            issues.push(`Domain "${entry.domain}" is not supported.`);

        if (!["single", "multi"].includes(entry.type))
            issues.push(`Invalid type "${entry.type}". Expected "single" or "multi".`);

        if (!entry.question || typeof entry.question !== "string")
            issues.push("Question text is required.");

        if (!Array.isArray(entry.options) || entry.options.length < 2)
            issues.push("Options must include at least two choices.");
        const optionIds = new Set();
        const options = Array.isArray(entry.options)
            ? entry.options.map((opt) => {
                  const optionIssue = [];
                  if (!opt || typeof opt !== "object") {
                      optionIssue.push("Option must be an object with id/text.");
                      return null;
                  }
                  const optId = typeof opt.id === "string" ? opt.id.trim() : "";
                  if (!optId) optionIssue.push("Option id is required.");
                  if (optId && optionIds.has(optId))
                      optionIssue.push(`Duplicate option id "${optId}".`);
                  if (!opt.text) optionIssue.push(`Option "${optId || "unknown"}" missing text.`);
                  if (optId) optionIds.add(optId);
                  if (optionIssue.length > 0) issues.push(...optionIssue);
                  return { id: optId, text: opt.text };
              })
            : [];

        const correctOptionIds = Array.isArray(entry.correctOptionIds)
            ? entry.correctOptionIds.map((value) => String(value).trim())
            : [];

        if (correctOptionIds.length === 0)
            issues.push("correctOptionIds must include at least one entry.");

        const missingCorrect = correctOptionIds.filter((value) => !optionIds.has(value));
        if (missingCorrect.length > 0)
            issues.push(`Correct option ids not found in options: ${missingCorrect.join(", ")}.`);

        if (entry.type === "single" && correctOptionIds.length !== 1)
            issues.push("Single-response questions must have exactly one correct option.");
        if (entry.type === "multi" && correctOptionIds.length < 2)
            issues.push("Multi-response questions must have at least two correct options.");

        if (issues.length > 0) {
            rejected.push({ index, id: sanitizedId, issues });
            return;
        }

        const sanitizedOptions = options.filter(Boolean);
        seenIds.add(sanitizedId);
        accepted.push({
            id: sanitizedId,
            domain: entry.domain,
            type: entry.type,
            question: entry.question,
            options: sanitizedOptions,
            correctOptionIds,
            explanation: entry.explanation || "",
            difficulty: entry.difficulty || null,
        });
    });

    return { accepted, rejected, warnings };
}
