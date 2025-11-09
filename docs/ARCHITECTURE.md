# Architecture Guide

This project follows a **feature-first** layout so that all AWS exam logic (data, UI, state, validation, and utilities) lives together and can evolve independently from shared UI or infrastructure code.

```
src/
├─ app/                     # Shell & entrypoint React components (App, tests, styles)
├─ features/
│  └─ exams/
│     ├─ components/        # Feature-specific UI (configurator, list, review, history)
│     ├─ data/              # Exam registry + JSON question banks
│     ├─ hooks/             # Hooks that encapsulate exam workflows (imports, timers, history)
│     ├─ schemas/           # Zod runtime schemas for question validation
│     ├─ state/             # Reducers/state machines for exam flow
│     ├─ utils/             # Business rules (sampling, scoring, import sanitization)
│     └─ index.js           # Barrel exports so consumers import from `features/exams`
├─ shared/
│  └─ hooks/                # Generic hooks that are reused across features
├─ index.js                 # CRA bootstrap
└─ setupTests.js            # Jest/RTL setup
```

## Working With the Exam Feature

The `features/exams` folder is the single entry point for anything exam-related:

-   UI consumers import from `features/exams` instead of deep relative paths, keeping call sites stable when internals move.
-   All feature code uses plain JavaScript modules so it remains compatible with Create React App without extra tooling.

### Adding a New Exam

1. **Seed questions**: Drop a `<exam>_mock_exam.json` file into `features/exams/data/`.
2. **Register exam**: Append an entry in `features/exams/data/exams.js` with metadata, domains, presets, and question bank import.
3. **(Optional) Import template**: Populate the `importTemplate` array so the “Download prompt” button shows realistic scaffolding.

Because the reducer, hooks, and UI all operate on the shared exam shape, new exams typically only require data changes.

### Extending Exam Functionality

-   **State changes**: Update `features/exams/state/examReducer.js` (and `EXAM_ACTIONS`) in one place.
-   **New UI**: Add a component under `features/exams/components` and export it via the feature `index.js`.
-   **Domain logic**: Place helpers in `features/exams/utils` or extend the Zod schemas under `features/exams/schemas`.
-   **Shared utilities**: Promote truly generic hooks/helpers to `src/shared` so other future features can reuse them.

### Testing

-   Feature-level behavior tests live next to the shell in `app/App.test.jsx`.
-   Unit-level helpers can import from `features/exams` just like the app does, which keeps test imports resilient to refactors.

Keeping these boundaries in mind makes it easy to onboard new certification tracks or break the monolith into smaller feature packages later.
