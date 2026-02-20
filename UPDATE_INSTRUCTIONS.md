# Update Instructions

## Quick Update Guide

Follow these steps to update the Firebase Extension to the latest version with upgraded dependencies.

## Prerequisites

- Node.js 22 or higher
- npm 10 or higher
- Git (for version control)

## Step 1: Backup Current State

```bash
# Create a backup branch
git checkout -b backup-before-upgrade

# Commit current state
git add .
git commit -m "Backup before dependency upgrade"

# Return to main branch
git checkout main
```

## Step 2: Pull Latest Changes

```bash
# If pulling from remote repository
git pull origin main

# Verify package.json has been updated
cat functions/package.json | grep -A 3 "dependencies"
```

## Step 3: Clean Install Dependencies

```bash
cd /Users/akirawada/Projects/work/firebase-ext-bigquery-firestore-sync/functions

# Remove old dependencies and lock file
rm -rf node_modules package-lock.json

# Install new versions
npm install

# This may take a few minutes...
```

Expected output:
```
added XXX packages, and audited XXX packages in XXs

XXX packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

## Step 4: Rebuild TypeScript

```bash
# Clean previous build
rm -rf lib/

# Build with new TypeScript version
npm run build
```

Expected output:
```
✔ Successfully compiled TypeScript
```

## Step 5: Run Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix any issues
npm run lint:fix
```

If you see new linting errors, review `UPGRADE_NOTES.md` for migration guidance.

## Step 6: Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

All tests should pass:
```
Test Suites: 4 passed, 4 total
Tests:       36 passed, 36 total
```

## Step 7: Verify Code Formatting

```bash
# Check formatting
npm run format

# Auto-fix formatting
npm run format:fix
```

## Step 8: Type Check

```bash
# Verify TypeScript types
npm run build

# Check for type errors
tsc --noEmit
```

## Step 9: Manual Testing (Optional)

For thorough verification:

### 1. Test BigQuery Connection

```bash
# Set environment variables
export BIGQUERY_PROJECT_ID=your-project
export BIGQUERY_DATASET=your-dataset
export BIGQUERY_TABLE=your-table
export FIRESTORE_COLLECTION_PATH=test-collection
export PRIMARY_KEY_COLUMN=id
export TIMESTAMP_COLUMN=updated_at
export BATCH_SIZE=500

# Run a test query (if you have test scripts)
# npm run test:integration
```

### 2. Test Firestore Operations

Verify Firestore writes work correctly with the new SDK version.

### 3. Test Scheduled Functions

Deploy to a test environment and verify the scheduled function runs correctly.

## Step 10: Commit Changes

```bash
cd ..  # Back to project root

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "chore: upgrade dependencies to latest versions

- firebase-admin: 12.0.0 → 13.6.1
- firebase-functions: 5.0.0 → 7.0.5
- @google-cloud/bigquery: 7.3.0 → 8.1.1
- ESLint: 8.56.0 → 9.18.0
- TypeScript: 5.3.0 → 5.7.2
- Various dev dependencies updated

See UPGRADE_NOTES.md for details"
```

## Troubleshooting

### Issue: npm install fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript compilation errors

**Solution**:
```bash
# Check TypeScript version
npm list typescript

# Review UPGRADE_NOTES.md for breaking changes
cat ../UPGRADE_NOTES.md

# Fix type errors based on new stricter rules
# Example: Add explicit return types to functions
```

### Issue: ESLint errors

**Solution**:
```bash
# Auto-fix what can be fixed
npm run lint:fix

# For remaining errors, review ESLint v9 migration guide
# Some rules may have been updated or deprecated
```

### Issue: Test failures

**Solution**:
```bash
# Check which tests are failing
npm test -- --verbose

# Review test mocks for API changes
# Update mocks if BigQuery/Firebase APIs changed
```

### Issue: Runtime errors in deployed function

**Solution**:
```bash
# Check Cloud Functions logs
firebase functions:log --only ext-bigquery-firestore-sync-syncBigQueryToFirestore

# Verify environment variables are set correctly
# Test with emulator first
npm run serve
```

## Rollback Instructions

If you encounter critical issues:

```bash
# Switch to backup branch
git checkout backup-before-upgrade

# Create a new branch from backup
git checkout -b fix-upgrade-issues

# Restore old dependencies
cd functions
rm -rf node_modules package-lock.json
npm install
```

## Verification Checklist

Before deploying to production:

- [ ] All dependencies installed successfully
- [ ] TypeScript builds without errors
- [ ] All linting checks pass
- [ ] All tests pass
- [ ] Code formatting is correct
- [ ] Manual testing completed (if applicable)
- [ ] Changes committed to git
- [ ] Deployment to test environment successful
- [ ] Test environment verification complete

## Deployment

After verification, deploy to staging and production:

```bash
# Deploy to staging
firebase deploy --only functions --project your-staging-project

# Verify in staging
# Monitor logs for any errors

# Deploy to production
firebase deploy --only functions --project your-production-project
```

## Post-Deployment Monitoring

Monitor the extension for 24-48 hours after deployment:

1. **Check Cloud Functions Logs**:
   ```bash
   firebase functions:log
   ```

2. **Monitor Error Rates**:
   - Firebase Console → Functions → Metrics
   - Look for increased error rates

3. **Verify Data Sync**:
   - Check Firestore for recent syncs
   - Verify sync state collection is being updated

4. **Check Performance**:
   - Monitor function execution time
   - Verify BigQuery query performance

## Support

If you encounter issues not covered here:

1. Review `UPGRADE_NOTES.md` for detailed migration guide
2. Check package-specific release notes
3. Search for similar issues on GitHub
4. Contact the development team

## Success Criteria

The upgrade is successful when:

✅ All tests pass
✅ Build completes without errors
✅ Linting and formatting pass
✅ Function deploys successfully
✅ Sync operations work correctly
✅ No increase in error rates
✅ Performance is maintained or improved

---

**Last Updated**: February 20, 2026
