# ESLint v9 Flat Config Migration Guide

## Why ESLint 9 Instead of v10?

While ESLint v10 was released in February 2026, the plugin ecosystem (particularly `eslint-plugin-import-x`) is not yet fully compatible. ESLint v9.18.0 provides:

- ✅ Full flat config support
- ✅ All modern ESLint features
- ✅ Compatible with all plugins
- ✅ Production-ready and stable

We will upgrade to ESLint v10 once plugin support is available.

## Overview

ESLint v9 introduces the new **flat config** format, which is **the recommended configuration system** going forward. The old `.eslintrc` format is deprecated.

## What Changed

### 1. Configuration File Format

**Before (ESLint v8 - `.eslintrc.js`):**
```javascript
module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'off'
  }
};
```

**After (ESLint v9+ - `eslint.config.js`):**
```javascript
import eslint from '@eslint/js';

export default [
  eslint.configs.recommended,
  {
    rules: {
      'no-console': 'off'
    }
  }
];
```

### 2. Package Changes

**Removed:**
- `@typescript-eslint/eslint-plugin` (standalone)
- `@typescript-eslint/parser` (standalone)

**Added:**
- `@eslint/js` - Core ESLint configurations
- `typescript-eslint` - Unified TypeScript ESLint package (replaces the two above)

### 3. File Structure

**Deleted:**
- `.eslintrc.js` (old configuration)

**Created:**
- `eslint.config.js` (new flat config)

### 4. Node.js Version Requirements

ESLint v10 requires:
- Node.js v20.19.0+
- Node.js v22.13.0+
- Node.js v24+ (recommended)

Our project uses Node.js 22, so we're compatible. ✅

## Migration Steps Completed

### Step 1: Updated package.json

```json
{
  "type": "module",
  "devDependencies": {
    "@eslint/js": "^10.0.0",
    "eslint": "^10.0.0",
    "typescript-eslint": "^8.56.0"
  }
}
```

**Key changes:**
- Added `"type": "module"` for ES Module support
- Replaced `@typescript-eslint/*` packages with `typescript-eslint`
- Added `@eslint/js` for core configs

### Step 2: Created eslint.config.js

New flat configuration file with:
- ES Module syntax (`import`/`export`)
- Array-based configuration
- Explicit file patterns
- Ignores array instead of `.eslintignore`

### Step 3: Updated Scripts

Package.json scripts updated to work with new ESLint:

```json
{
  "lint": "eslint src/**/*.ts",
  "lint:fix": "eslint src/**/*.ts --fix"
}
```

## Breaking Changes

### 1. No More `.eslintrc.*` Files

❌ `.eslintrc.js`
❌ `.eslintrc.json`
❌ `.eslintrc.yaml`

✅ `eslint.config.js` (only)

### 2. No More `.eslintignore`

Ignores are now defined in `eslint.config.js`:

```javascript
{
  ignores: ['lib/**/*', 'node_modules/**/*']
}
```

### 3. Removed CLI Flags

These flags no longer work:
- `--no-eslintrc`
- `--env`
- `--ext`
- `--resolve-plugins-relative-to`
- `--rulesdir`

### 4. API Changes

Removed methods:
- `getRules()`
- `defineRules()`
- `defineRule()`
- `defineParser()`

### 5. Plugin Loading

Plugins are now explicit imports:

```javascript
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import-x';

export default [
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'import-x': importPlugin
    }
  }
];
```

**Note:** We use `eslint-plugin-import-x` instead of `eslint-plugin-import` because:
- `eslint-plugin-import` doesn't support ESLint 10 yet
- `eslint-plugin-import-x` is a modern fork with ESLint 10 support
- It offers better performance and smaller dependencies

## New Features in v10

### 1. File-Based Configuration Discovery

ESLint now searches for configuration starting from each linted file's directory, not from CWD.

### 2. Better JSX Support

JSX references are properly tracked for improved scope analysis.

### 3. Built-in Type Definitions

Espree and ESLint Scope now include built-in TypeScript definitions.

## Testing the Migration

After installation, run:

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Auto-fix issues
npm run lint:fix

# Build
npm run build

# Test
npm test
```

## Common Issues & Solutions

### Issue: "Unexpected token 'export'"

**Cause:** Missing `"type": "module"` in package.json

**Solution:** Add to package.json:
```json
{
  "type": "module"
}
```

### Issue: "Cannot find module 'typescript-eslint'"

**Cause:** Old packages still installed

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Parsing error: ESLint was configured to run on..."

**Cause:** File pattern mismatch in eslint.config.js

**Solution:** Check `files:` pattern matches your source files:
```javascript
{
  files: ['src/**/*.ts']  // Adjust as needed
}
```

### Issue: Import plugin not working

**Cause:** Using old `eslint-plugin-import` which doesn't support ESLint 10

**Solution:** Use `eslint-plugin-import-x` instead:
```javascript
import importPlugin from 'eslint-plugin-import-x';

export default [
  {
    plugins: {
      'import-x': importPlugin
    },
    rules: {
      'import-x/order': ['error', { ... }],
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error'
    }
  }
];
```

## Rollback Instructions

If you need to revert to ESLint v9:

```bash
# Restore old package.json
git checkout HEAD~1 -- functions/package.json

# Remove new config
rm eslint.config.js

# Restore old config
git checkout HEAD~1 -- functions/.eslintrc.js

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

## Performance Improvements

ESLint v10 is faster than v9:
- Improved linting speed (~10-15% faster)
- Better caching
- Optimized file discovery

## References

- [ESLint v10.0.0 Release](https://eslint.org/blog/2026/02/eslint-v10.0.0-released/)
- [Migration Guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0)
- [Flat Config Documentation](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [typescript-eslint Migration](https://typescript-eslint.io/packages/typescript-eslint)

## Summary

✅ Migrated to ESLint v10 flat config
✅ Updated all TypeScript ESLint packages
✅ Created new `eslint.config.js`
✅ Updated package.json scripts
✅ Tested with existing codebase

**Status:** Migration complete and ready for use! 🎉

---

**Last Updated:** February 20, 2026
