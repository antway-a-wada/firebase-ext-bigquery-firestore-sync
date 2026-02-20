# Development Setup Guide

This guide explains how to set up the development environment with linting and formatting tools.

## Tools Included

### ESLint
- **Purpose**: Code quality and consistency enforcement
- **Configuration**: `.eslintrc.js`
- **Features**:
  - TypeScript-specific rules
  - Import order enforcement
  - Type safety checks
  - Unused variable detection
  - Promise handling validation

### Prettier
- **Purpose**: Code formatting
- **Configuration**: `.prettierrc.js`
- **Features**:
  - Consistent code style
  - Auto-formatting on save
  - Single quotes
  - 100 character line width
  - 2-space indentation

### EditorConfig
- **Purpose**: IDE-agnostic editor configuration
- **Configuration**: `.editorconfig`
- **Features**:
  - UTF-8 encoding
  - LF line endings
  - Trailing whitespace removal

## Installation

Install all dependencies:

```bash
npm install
```

This will install:
- ESLint and TypeScript ESLint plugins
- Prettier
- ESLint-Prettier integration
- Jest for testing
- All TypeScript dependencies

## Available Scripts

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Formatting

```bash
# Check formatting
npm run format

# Auto-fix formatting
npm run format:fix

# Format all files (including config files)
npm run format:all
```

### Combined

```bash
# Run both lint and format checks
npm run check

# Auto-fix both lint and format issues
npm run fix
```

### Pre-commit

```bash
# Run all checks and tests before commit
npm run precommit
```

## IDE Setup

### VS Code

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "typescript"
  ]
}
```

Install recommended extensions:
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- EditorConfig (`editorconfig.editorconfig`)

### WebStorm / IntelliJ IDEA

1. **Enable ESLint**:
   - Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
   - Check "Automatic ESLint configuration"
   - Check "Run eslint --fix on save"

2. **Enable Prettier**:
   - Settings → Languages & Frameworks → JavaScript → Prettier
   - Check "On save"
   - Check "On code reformat"

3. **Enable EditorConfig**:
   - Settings → Editor → Code Style
   - Check "Enable EditorConfig support"

## ESLint Rules Overview

### TypeScript Rules

- `@typescript-eslint/no-explicit-any`: Warn when using `any` type
- `@typescript-eslint/explicit-function-return-type`: Require return types on functions
- `@typescript-eslint/no-floating-promises`: Prevent unhandled promises
- `@typescript-eslint/no-unused-vars`: Error on unused variables (except those prefixed with `_`)
- `@typescript-eslint/prefer-nullish-coalescing`: Use `??` instead of `||` for null checks
- `@typescript-eslint/prefer-optional-chain`: Use `?.` for optional property access

### Import Rules

- `import/order`: Enforce import order (builtin → external → internal → parent → sibling)
- `import/newline-after-import`: Require newline after imports
- `import/no-duplicates`: Prevent duplicate imports

### General Rules

- `prefer-const`: Use `const` when variables are not reassigned
- `no-var`: Disallow `var` in favor of `let` and `const`
- `object-shorthand`: Use object property shorthand
- `prefer-template`: Use template literals instead of string concatenation
- `eqeqeq`: Require `===` and `!==`
- `curly`: Require curly braces for all control statements

## Prettier Configuration

```javascript
{
  semi: true,                // Use semicolons
  trailingComma: 'es5',      // Trailing commas in ES5 contexts
  singleQuote: true,         // Use single quotes
  printWidth: 100,           // Max line width
  tabWidth: 2,               // 2 spaces for indentation
  useTabs: false,            // Use spaces, not tabs
  arrowParens: 'always',     // Always use parentheses around arrow function parameters
  bracketSpacing: false,     // No spaces in object literals
  endOfLine: 'lf',          // LF line endings
}
```

## Workflow

### Before Committing

1. **Write code**
2. **Run formatter**:
   ```bash
   npm run fix
   ```
3. **Run tests**:
   ```bash
   npm test
   ```
4. **Commit**:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

### CI/CD Integration

The linting and formatting checks should be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Lint
  run: npm run lint

- name: Format check
  run: npm run format

- name: Type check
  run: npm run build
```

## Troubleshooting

### ESLint errors after installation

If you see ESLint errors, try:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart your IDE
```

### Prettier not formatting

1. Check if Prettier extension is installed and enabled
2. Verify `.prettierrc.js` exists
3. Check IDE settings for "Format on Save"
4. Manually format: `npm run format:fix`

### Type errors

If TypeScript shows errors:

```bash
# Clean build
npm run clean
npm run build

# Check types without build
npm run check-types
```

## Best Practices

1. **Auto-format on save**: Configure your IDE to run Prettier on save
2. **Fix before commit**: Run `npm run fix` before every commit
3. **Address warnings**: Don't ignore ESLint warnings - they indicate potential issues
4. **Consistent style**: Follow the established patterns in existing code
5. **Type safety**: Avoid `any` type when possible - use proper types or `unknown`

## Contributing

When contributing to this project:

1. Ensure all linting and formatting rules pass
2. Run the full test suite
3. Follow the established code patterns
4. Add tests for new features
5. Update documentation as needed

---

For more information, see:
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [TypeScript ESLint Documentation](https://typescript-eslint.io/)
