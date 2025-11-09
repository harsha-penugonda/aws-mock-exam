/**
 * Exam state reducer to consolidate exam-flow state management.
 * Replaces multiple useState hooks with a single, predictable state machine.
 */

export const EXAM_ACTIONS = {
    START_EXAM: "START_EXAM",
    RESET_EXAM: "RESET_EXAM",
    UPDATE_ANSWER: "UPDATE_ANSWER",
    TOGGLE_TIMER: "TOGGLE_TIMER",
    SET_TIMER_SECONDS: "SET_TIMER_SECONDS",
    SET_REVIEW_FILTER: "SET_REVIEW_FILTER",
    FINISH_EXAM: "FINISH_EXAM",
};

const INITIAL_STATE = {
    mode: null, // 'full' | 'quick' | 'domain' | 'imported' | null
    started: false,
    timerOn: false,
    visibleQuestions: [],
    answers: {}, // questionId -> string[]
    examMinutes: 0,
    secondsLeft: 0,
    showIncorrectOnly: false,
    reviewDomain: "all",
    finished: false,
};

export function examReducer(state, action) {
    switch (action.type) {
        case EXAM_ACTIONS.START_EXAM: {
            const { mode, questions, minutes, secondsLeft } = action.payload;
            return {
                ...state,
                mode,
                started: true,
                timerOn: true,
                visibleQuestions: questions,
                answers: {},
                examMinutes: minutes,
                secondsLeft: secondsLeft ?? minutes * 60,
                showIncorrectOnly: false,
                reviewDomain: "all",
                finished: false,
            };
        }

        case EXAM_ACTIONS.RESET_EXAM: {
            return {
                ...INITIAL_STATE,
            };
        }

        case EXAM_ACTIONS.UPDATE_ANSWER: {
            const { questionId, optionId, questionType } = action.payload;
            const current = state.answers[questionId] || [];

            let next;
            if (questionType === "single") {
                next = [optionId];
            } else {
                const exists = current.includes(optionId);
                next = exists ? current.filter((id) => id !== optionId) : [...current, optionId];
                next.sort();
            }

            return {
                ...state,
                answers: {
                    ...state.answers,
                    [questionId]: next,
                },
            };
        }

        case EXAM_ACTIONS.TOGGLE_TIMER: {
            return {
                ...state,
                timerOn: !state.timerOn,
            };
        }

        case EXAM_ACTIONS.SET_TIMER_SECONDS: {
            return {
                ...state,
                secondsLeft: action.payload,
            };
        }

        case EXAM_ACTIONS.SET_REVIEW_FILTER: {
            return {
                ...state,
                showIncorrectOnly: action.payload.showIncorrectOnly ?? state.showIncorrectOnly,
                reviewDomain: action.payload.reviewDomain ?? state.reviewDomain,
            };
        }

        case EXAM_ACTIONS.FINISH_EXAM: {
            return {
                ...state,
                finished: true,
                timerOn: false,
            };
        }

        default:
            return state;
    }
}

