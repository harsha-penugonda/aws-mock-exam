# AWS Practice Exam Studio

An interactive web application for practicing AWS certification exams (Cloud Practitioner, Solutions Architect Associate, and beyond) with timed sessions, domain-based filtering, and performance tracking.

## Features

- **Multi-Exam Switcher**: Swap between Cloud Practitioner, Solutions Architect Associate, or any future AWS exam packages without leaving the page.
- **Timed Exam Sessions**: Exam-specific presets (full length, quick practice, domain drills) that mirror the official timing guidance for each AWS certification.
- **Dynamic Domain Weighting**: The simulator automatically applies the correct domain mix for the selected exam (e.g., Cloud Practitioner, Solutions Architect Associate).
- **Performance Tracking**: View detailed statistics by domain, review exam history, and track progress
- **Question Import**: Import custom questions via JSON template
- **Review Mode**: Review all questions or filter by domain after completing an exam

## Environment Requirements

- **Node.js**: v16.x or higher (v18.x recommended)
- **npm**: v8.x or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd aws-mock-exam
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize Husky (for pre-commit hooks):
   ```bash
   npm run prepare
   ```

## Development

Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint on source files
- `npm run lint:fix` - Run ESLint and fix auto-fixable issues
- `npm run verify:build` - Verify production build succeeds

## Project Structure

The codebase is organized by feature to keep exam-specific logic self-contained. The React shell lives in `src/app`, shared hooks/utilities live under `src/shared`, and everything related to AWS exam workflows (components, hooks, reducers, data, schemas, and utilities) is grouped inside `src/features/exams`. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a visual map and guidelines on how to add new exams or extend the feature.

## Importing Custom Questions

You can import custom questions by uploading a JSON file that follows this template (domains must match the exam you select in the UI):

```json
[
  {
    "id": "custom-1",
    "domain": "Cloud Concepts",
    "type": "single",
    "question": "Which AWS pricing model is best for a workload with steady, predictable usage?",
    "options": [
      { "id": "a", "text": "On-Demand Instances" },
      { "id": "b", "text": "Savings Plans" },
      { "id": "c", "text": "Dedicated Hosts" },
      { "id": "d", "text": "Spot Instances" }
    ],
    "correctOptionIds": ["b"],
    "explanation": "Savings Plans provide cost savings for steady-state usage when you commit to consistent compute consumption.",
    "difficulty": "medium"
  }
]
```

### Question Schema

- **id** (string, required): Unique identifier for the question
- **domain** (string, required): One of the domains defined by the active exam (listed on the configurator screen)
- **type** (string, required): "single" for single-select or "multiple" for multi-select questions
- **question** (string, required): The question text
- **options** (array, required): Array of option objects, each with:
  - **id** (string): Option identifier (e.g., "a", "b", "c", "d")
  - **text** (string): Option text
- **correctOptionIds** (array, required): Array of correct option IDs
- **explanation** (string, optional): Explanation text shown during review
- **difficulty** (string, optional): "easy", "medium", or "hard"

## Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Deploying to Static Hosting

The app can be deployed to any static hosting service:

- **Vercel**: Connect your repository and deploy automatically
- **Netlify**: Drag and drop the `build/` folder or connect via Git
- **AWS S3 + CloudFront**: Upload `build/` contents to an S3 bucket and configure CloudFront distribution
- **GitHub Pages**: Use `gh-pages` package or GitHub Actions

### Environment Variables

No environment variables are required for basic functionality. The app stores exam history in browser local storage.

### Build Verification

Before deploying, verify the production build:
```bash
npm run verify:build
```

This ensures the build completes successfully and catches any issues early.

## Code Quality

Pre-commit hooks (via Husky) automatically run:
- ESLint checks (`npm run lint`)
- Build verification (`npm run verify:build`)

To bypass hooks (not recommended):
```bash
git commit --no-verify
```

## License

The source is available under the **AWS Practice Exam Studio Source-Available License 1.0**, which permits cloning and experimentation for personal study or preparing contributions, but forbids production or commercial use without written consent. See [`LICENSE`](LICENSE) for full terms or email `opensource@aws-practice-exam.studio` to discuss additional rights.
