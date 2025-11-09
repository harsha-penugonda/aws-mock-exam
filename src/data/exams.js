import cloudPractitionerBank from "./cloud_practitioner_mock_exam.json";
import solutionsArchitectBank from "./solutions_architect_mock_exam.json";

/**
 * Central registry for every AWS exam configuration exposed in the UI.
 * Each exam contains its own metadata, domain weights, presets, and seed question bank.
 */
export const EXAMS = [
    {
        id: "cloud-practitioner",
        code: "CLF-C02",
        title: "AWS Cloud Practitioner Mock Exam",
        shortTitle: "Cloud Practitioner",
        slug: "aws-cloud-practitioner",
        csvPrefix: "aws-clf-c02",
        storageKey: "aws-cloud-practitioner-history",
        heroTagline: "CLF-C02 • Covers all four domains • Multiple-choice & multiple-response",
        passScoreNote: "Passing the real CLF-C02 exam requires a scaled score of 700/1000.",
        meta: {
            title: "AWS Cloud Practitioner Mock Exam",
            description:
                "AWS Cloud Practitioner (CLF-C02) mock exam simulator with domain-weighted question sets, timer, and review analytics.",
            ogTitle: "AWS Cloud Practitioner Mock Exam",
            ogDescription:
                "Practice the AWS Certified Cloud Practitioner (CLF-C02) exam with domain-specific drills, importable question banks, and detailed reviews.",
        },
        domains: [
            { name: "Cloud Concepts", weight: 0.24 },
            { name: "Security and Compliance", weight: 0.3 },
            { name: "Cloud Technology and Services", weight: 0.34 },
            { name: "Billing, Pricing, and Support", weight: 0.12 },
        ],
        presets: [
            {
                id: "full",
                label: "Full Exam",
                description: "65 questions • 90 minutes • weighted to the official domain percentages.",
                total: 65,
                minutes: 90,
            },
            {
                id: "quick",
                label: "Quick Practice",
                description: "20 questions • 30 minutes • mixed domains.",
                total: 20,
                minutes: 30,
            },
        ],
        importTemplate: [
            {
                id: "custom-1",
                domain: "Cloud Concepts",
                type: "single",
                question:
                    "Which AWS pricing model is best for a workload with steady, predictable usage?",
                options: [
                    { id: "a", text: "On-Demand Instances" },
                    { id: "b", text: "Savings Plans" },
                    { id: "c", text: "Dedicated Hosts" },
                    { id: "d", text: "Spot Instances" },
                ],
                correctOptionIds: ["b"],
                explanation:
                    "Savings Plans provide cost savings for steady-state usage when you commit to consistent compute consumption.",
                difficulty: "medium",
            },
        ],
        questionBank: cloudPractitionerBank,
    },
    {
        id: "solutions-architect-associate",
        code: "SAA-C03",
        title: "AWS Solutions Architect Associate Mock Exam",
        shortTitle: "Solutions Architect Associate",
        slug: "aws-solutions-architect-associate",
        csvPrefix: "aws-saa-c03",
        storageKey: "aws-solutions-architect-history",
        heroTagline: "SAA-C03 • Scenario-focused practice • Multiple-choice & multiple-response",
        passScoreNote: "AWS recommends targeting 720+ on the scaled 100-1000 score for SAA-C03.",
        meta: {
            title: "AWS Solutions Architect Associate Mock Exam",
            description:
                "Scenario-heavy AWS Solutions Architect Associate (SAA-C03) practice exam with domain drills, timers, and review analytics.",
            ogTitle: "AWS Solutions Architect Associate Practice Exam",
            ogDescription:
                "Sharpen your Solutions Architect Associate skills with weighted domains, custom question imports, and detailed explanations.",
        },
        domains: [
            { name: "Architecture and Design", weight: 0.26 },
            { name: "High Availability and Scalability", weight: 0.24 },
            { name: "Security and Compliance", weight: 0.2 },
            { name: "Networking", weight: 0.15 },
            { name: "Cloud Concepts", weight: 0.15 },
        ],
        presets: [
            {
                id: "full",
                label: "Full Exam",
                description: "65 questions • 130 minutes • weighted to SAA-C03 domain guidance.",
                total: 65,
                minutes: 130,
            },
            {
                id: "quick",
                label: "Scenario Sprint",
                description: "25 questions • 45 minutes • randomized scenarios.",
                total: 25,
                minutes: 45,
            },
        ],
        importTemplate: [
            {
                id: "arch-1",
                domain: "Design Resilient Architectures",
                type: "multi",
                question:
                    "A workload must remain available during AZ failures and recover user sessions quickly. Which TWO design choices help meet this need?",
                options: [
                    { id: "a", text: "Deploy across multiple Availability Zones" },
                    { id: "b", text: "Scale vertically on a single instance" },
                    { id: "c", text: "Use Auto Scaling groups with health checks" },
                    { id: "d", text: "Rely on a single AZ placement group" },
                ],
                correctOptionIds: ["a", "c"],
                explanation:
                    "Multi-AZ deployments combined with Auto Scaling health checks provide fault tolerance and rapid recovery.",
                difficulty: "medium",
            },
        ],
        questionBank: solutionsArchitectBank,
    },
];

export const DEFAULT_EXAM_ID = EXAMS[0].id;

export function getExamById(id) {
    return EXAMS.find((exam) => exam.id === id) ?? EXAMS[0];
}
