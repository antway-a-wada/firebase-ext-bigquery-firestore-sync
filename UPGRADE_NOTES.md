# Library Version Upgrade Notes

## Updated: February 20, 2026

This document outlines the library version upgrades and any breaking changes to be aware of.

## Summary of Changes

### Production Dependencies

| Package | Old Version | New Version | Change |
|---------|-------------|-------------|--------|
| `@google-cloud/bigquery` | 7.3.0 | **8.1.1** | Major update |
| `firebase-admin` | 12.0.0 | **13.6.1** | Major update |
| `firebase-functions` | 5.0.0 | **7.0.5** | Major update |

### Development Dependencies

| Package | Old Version | New Version | Change |
|---------|-------------|-------------|--------|
| `@types/jest` | 29.5.0 | **29.5.13** | Patch update |
| `@types/node` | 20.11.0 | **22.10.2** | Major update |
| `@typescript-eslint/eslint-plugin` | 6.0.0 | **8.18.2** | Major update |
| `@typescript-eslint/parser` | 6.0.0 | **8.18.2** | Major update |
| `eslint` | 8.56.0 | **9.18.0** | Major update |
| `eslint-config-prettier` | 9.1.0 | **9.1.0** | No change |
| `eslint-plugin-import` | 2.29.0 | **2.31.0** | Minor update |
| `jest` | 29.7.0 | **29.7.0** | No change |
| `prettier` | 3.2.0 | **3.4.2** | Minor update |
| `ts-jest` | 29.1.0 | **29.2.5** | Minor update |
| `typescript` | 5.3.0 | **5.7.2** | Minor update |

## Breaking Changes & Migration Guide

### 1. Firebase Functions v7 (v5 → v7)

#### Key Changes:
- **ESM Support**: Now supports ECMAScript Modules
- **New Triggers**: Added `onMutationExecuted()` for Firebase Data Connect
- **Parameter Handling**: Improved parameter handling for scheduled functions

#### Migration:
```typescript
// Before (v5)
export const myFunction = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => { ... });

// After (v7) - No changes required for basic usage
export const myFunction = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => { ... });
```

✅ **No breaking changes for our current implementation**

**Reference**: [Firebase Functions v7 Release Notes](https://github.com/firebase/firebase-functions/releases)

---

### 2. Firebase Admin v13 (v12 → v13)

#### Key Changes:
- **Bug Fixes**: Improved data serialization and URL validation
- **Security**: Enhanced security features
- **Performance**: Better performance for Firestore operations

#### Migration:
```typescript
// No code changes required
// Our current implementation is fully compatible
```

✅ **No breaking changes for our current implementation**

**Reference**: [Firebase Admin v13 Release Notes](https://github.com/firebase/firebase-admin-node/releases)

---

### 3. BigQuery v8 (v7 → v8)

#### Key Changes:
- **API Updates**: Some method signatures may have changed
- **Type Safety**: Improved TypeScript type definitions
- **Performance**: Enhanced query performance

#### Migration:
```typescript
// Before (v7)
const [rows] = await job.getQueryResults();

// After (v8) - No changes needed
const [rows] = await job.getQueryResults();
```

✅ **No breaking changes detected for our usage patterns**

**Recommendation**: Test BigQuery operations thoroughly after upgrade

**Reference**: [BigQuery Node.js Client](https://www.npmjs.com/package/@google-cloud/bigquery)

---

### 4. ESLint v9 (v8 → v9)

#### Key Changes:
- **Flat Config**: New flat config system (optional)
- **Rule Updates**: Some rules have been updated or deprecated
- **Performance**: Faster linting

#### Current Configuration:
Our `.eslintrc.js` uses the legacy format, which is still supported in v9.

#### Migration (Optional):
You can migrate to flat config later if needed:

```javascript
// eslint.config.js (new flat config format)
export default [
  {
    files: ['src/**/*.ts'],
    // ... configuration
  }
];
```

✅ **Legacy config still supported - no immediate action required**

**Reference**: [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)

---

### 5. TypeScript ESLint v8 (v6 → v8)

#### Key Changes:
- **Stricter Type Checking**: More accurate type-aware rules
- **New Rules**: Additional rules for better code quality
- **Performance**: Improved type checking performance

#### Migration:
```typescript
// Some rules may require explicit type annotations
// Before (v6) - may have passed
function processData(data: any) {
  return data.map(item => item.value);
}

// After (v8) - may require stricter typing
function processData(data: Array<{value: string}>) {
  return data.map((item) => item.value);
}
```

⚠️ **May require minor code adjustments based on new rules**

**Reference**: [TypeScript ESLint v8 Release](https://typescript-eslint.io/blog/announcing-typescript-eslint-v8)

---

### 6. Node.js Type Definitions v22 (v20 → v22)

#### Key Changes:
- Updated to match Node.js 22 LTS
- New built-in types
- Better type inference

✅ **Aligns with our Node.js 22 engine requirement**

---

## Testing Checklist

After upgrading, verify the following:

- [ ] **Build**: `npm run build` completes successfully
- [ ] **Lint**: `npm run lint` passes without errors
- [ ] **Format**: `npm run format` passes
- [ ] **Tests**: `npm test` all tests pass
- [ ] **Type Check**: TypeScript compilation succeeds
- [ ] **BigQuery Operations**: Test BigQuery queries work correctly
- [ ] **Firestore Operations**: Test Firestore writes work correctly
- [ ] **Scheduled Functions**: Test function scheduling works

## Installation Steps

```bash
cd functions

# Remove old dependencies
rm -rf node_modules package-lock.json

# Install new versions
npm install

# Rebuild
npm run build

# Run tests
npm test

# Run linting and formatting
npm run fix
```

## Rollback Instructions

If you encounter issues, you can rollback:

```bash
cd functions

# Restore old package.json from git
git checkout HEAD -- package.json

# Reinstall old versions
rm -rf node_modules package-lock.json
npm install
```

## Expected Benefits

### Performance Improvements
- **Faster BigQuery queries** (v8 optimizations)
- **Improved linting speed** (ESLint v9)
- **Better build performance** (TypeScript 5.7)

### Security Enhancements
- **Updated security patches** in all major dependencies
- **Better validation** in Firebase Admin SDK

### Developer Experience
- **Better type inference** with TypeScript 5.7
- **Improved error messages** in ESLint
- **More accurate type checking** with TypeScript ESLint v8

## Known Issues

No known issues at this time. If you encounter problems:

1. Check the testing checklist above
2. Review specific package release notes
3. File an issue with detailed error messages

## References

- [Firebase Admin SDK Release Notes](https://github.com/firebase/firebase-admin-node/releases)
- [Firebase Functions Release Notes](https://github.com/firebase/firebase-functions/releases)
- [BigQuery Node.js Client](https://www.npmjs.com/package/@google-cloud/bigquery)
- [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [TypeScript ESLint v8](https://typescript-eslint.io/blog/announcing-typescript-eslint-v8)

---

**Last Updated**: February 20, 2026
**Upgrade Author**: Development Team
