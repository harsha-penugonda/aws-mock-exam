export { EXAMS, DEFAULT_EXAM_ID, getExamById } from "./data/exams";

export { ExamConfigurator } from "./components/ExamConfigurator";
export { QuestionList } from "./components/QuestionList";
export { ReviewPanel } from "./components/ReviewPanel";
export { AttemptHistory } from "./components/AttemptHistory";

export { useExamTimer } from "./hooks/useExamTimer";
export { useImportQueue } from "./hooks/useImportQueue";
export { useAttemptHistory } from "./hooks/useAttemptHistory";

export { examReducer, EXAM_ACTIONS } from "./state/examReducer";

export {
    sampleWeighted,
    shuffle,
    answersEqual,
    buildDomainStats,
    calculateScore,
    isAnswerReadyForValidation,
    sanitizeImportedQuestions,
} from "./utils/exam";

export {
    QuestionOptionSchema,
    buildQuestionSchema,
    validateQuestion,
    validateQuestions,
} from "./schemas/question";
