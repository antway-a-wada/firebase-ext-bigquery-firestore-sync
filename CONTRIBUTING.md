# Contributing to BigQuery to Firestore Sync

Thank you for your interest in contributing to this Firebase Extension!

## Development Setup

### Prerequisites

- Node.js 22 or higher
- Firebase CLI (`npm install -g firebase-tools`)
- Access to a Google Cloud project with BigQuery and Firestore

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/antway-a-wada/firebase-ext-bigquery-firestore-sync.git
cd firebase-ext-bigquery-firestore-sync
```

2. Install dependencies:

```bash
cd functions
npm install
```

3. Build the TypeScript code:

```bash
npm run build
```

4. Run tests:

```bash
npm test
```

### Testing

We use Jest for unit testing. All new features should include tests.

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Style

- Follow TypeScript best practices
- Use ESLint for linting: `npm run lint`
- Format code before committing
- Include JSDoc comments for public functions

### Making Changes

1. Create a new branch for your feature:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and add tests

3. Ensure all tests pass:

```bash
npm test
npm run lint
npm run build
```

4. Commit your changes:

```bash
git add .
git commit -m "Add your descriptive commit message"
```

5. Push to your fork and create a pull request

## Extension Structure

```
├── extension.yaml          # Extension configuration
├── functions/
│   ├── src/
│   │   ├── index.ts       # Main entry point
│   │   ├── config.ts      # Configuration loading
│   │   ├── bigquery.ts    # BigQuery operations
│   │   ├── firestore.ts   # Firestore operations
│   │   ├── sync.ts        # Sync logic
│   │   ├── transform.ts   # Data transformation
│   │   └── types.ts       # Type definitions
│   └── __tests__/         # Test files
├── README.md              # Main documentation
├── PREINSTALL.md          # Pre-installation guide
└── POSTINSTALL.md         # Post-installation guide
```

## Testing Your Changes Locally

### Using Firebase Emulators

1. Set up a test Firebase project

2. Configure environment variables:

```bash
export BIGQUERY_PROJECT_ID=your-project
export BIGQUERY_DATASET=test_dataset
export BIGQUERY_TABLE=test_table
export FIRESTORE_COLLECTION_PATH=test_collection
export PRIMARY_KEY_COLUMN=id
export TIMESTAMP_COLUMN=updated_at
export BATCH_SIZE=500
```

3. Start the emulator:

```bash
cd functions
npm run serve
```

### Integration Testing

1. Create a test BigQuery table with sample data
2. Install the extension in a test Firebase project
3. Monitor the sync execution in Cloud Functions logs
4. Verify data appears correctly in Firestore

## Publishing

Extension maintainers can publish new versions using:

```bash
firebase ext:dev:publish tsukurioki/bigquery-firestore-sync
```

## Reporting Issues

If you find a bug or have a feature request:

1. Check if an issue already exists
2. Create a new issue with:
   - Clear description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Relevant logs or screenshots

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the technical aspects of the discussion

## Questions?

Feel free to open an issue for questions or discussions about the extension.

---

Thank you for contributing! 🎉
