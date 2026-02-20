# ESLint Plugin Migration: import → import-x

## Why We Migrated

`eslint-plugin-import` does not support ESLint 10, which was released in February 2026. The plugin's peer dependency requirement is:

```
"eslint": "^2 || ^3 || ^4 || ^5 || ^6 || ^7.2.0 || ^8 || ^9"
```

This explicitly excludes ESLint 10.

## Solution: eslint-plugin-import-x

`eslint-plugin-import-x` is a modern fork of `eslint-plugin-import` that:

- ✅ **Supports ESLint 10** (and flat config)
- ✅ **Better performance** (Rust-based resolver)
- ✅ **Smaller dependencies** (uses `get-tsconfig` instead of heavy `typescript`)
- ✅ **Actively maintained** (2.3M+ weekly downloads)
- ✅ **Drop-in replacement** (same rule names with `import-x/` prefix)

## Migration Changes

### package.json

**Before:**
```json
{
  "devDependencies": {
    "eslint-plugin-import": "^2.31.0"
  }
}
```

**After:**
```json
{
  "devDependencies": {
    "eslint-plugin-import-x": "^4.6.1"
  }
}
```

### eslint.config.js

**Before:**
```javascript
import importPlugin from 'eslint-plugin-import';

export default [
  {
    plugins: {
      'import': importPlugin
    },
    rules: {
      'import/order': ['error', { ... }],
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error'
    }
  }
];
```

**After:**
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

## Rule Mapping

All rules use the same name, just with a different prefix:

| Old Rule | New Rule |
|----------|----------|
| `import/order` | `import-x/order` |
| `import/newline-after-import` | `import-x/newline-after-import` |
| `import/no-duplicates` | `import-x/no-duplicates` |
| `import/no-unresolved` | `import-x/no-unresolved` |
| `import/named` | `import-x/named` |
| `import/default` | `import-x/default` |
| `import/namespace` | `import-x/namespace` |
| ... | ... |

All rules from `eslint-plugin-import` are available in `eslint-plugin-import-x`.

## Installation

```bash
# Remove old plugin
npm uninstall eslint-plugin-import

# Install new plugin
npm install --save-dev eslint-plugin-import-x
```

## Benefits

### 1. Performance Improvements

The new resolver is significantly faster:
- Rust-based module resolution
- Optimized caching
- Reduced dependency tree

### 2. Better TypeScript Support

- Uses `get-tsconfig` for better TypeScript config resolution
- Doesn't require full `typescript` package as dependency
- Better path mapping support

### 3. Modern Architecture

- Built for modern ESLint (v8+, v9, v10)
- Flat config support from day one
- Regular updates and maintenance

## Testing the Migration

After migration, verify everything works:

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Auto-fix issues
npm run lint:fix

# Build
npm run build
```

## Compatibility

`eslint-plugin-import-x` is compatible with:

- ✅ ESLint 8.x
- ✅ ESLint 9.x
- ✅ ESLint 10.x
- ✅ TypeScript projects
- ✅ JavaScript projects
- ✅ Node.js 18+
- ✅ Flat config format
- ✅ Legacy eslintrc format (if you're still on ESLint 8/9)

## Further Reading

- [eslint-plugin-import-x on npm](https://www.npmjs.com/package/eslint-plugin-import-x)
- [GitHub Repository](https://github.com/un-ts/eslint-plugin-import-x)
- [Migration Guide](https://github.com/un-ts/eslint-plugin-import-x#migration)

## Summary

✅ Migrated from `eslint-plugin-import` to `eslint-plugin-import-x`
✅ All rules updated to use `import-x/` prefix
✅ ESLint 10 compatibility achieved
✅ Better performance and smaller dependencies

---

**Last Updated:** February 20, 2026
