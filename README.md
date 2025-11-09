# AWS Mock Exam

An interactive web application for practicing AWS Cloud Practitioner Certification exam questions with timed sessions, domain-based filtering, and performance tracking.

## Features

- **Timed Exam Sessions**: Full-length (65 questions, 90 minutes) and quick practice (20 questions, 30 minutes) modes
- **Domain-Based Questions**: Weighted sampling across AWS Cloud Practitioner domains:
  - Cloud Concepts (24%)
  - Security and Compliance (30%)
  - Cloud Technology and Services (34%)
  - Billing, Pricing, and Support (12%)
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

## Importing Custom Questions

You can import custom questions by uploading a JSON file that follows this template:

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
- **domain** (string, required): One of: "Cloud Concepts", "Security and Compliance", "Cloud Technology and Services", "Billing, Pricing, and Support"
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

[Add your license information here]
