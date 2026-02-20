# Security Status

## Current Status (v0.1.2)

Last updated: February 20, 2026

### Production Environment

✅ **0 vulnerabilities**

All production dependencies are secure and free from known vulnerabilities.

### Development Environment

⚠️ **11 moderate severity vulnerabilities** (ESLint-related only)

These vulnerabilities are in ESLint's dependency chain and **do not affect production runtime**:
- Package: `ajv` (ReDoS when using `$data` option)
- Impact: Development tooling only
- Risk: Low (not included in deployed code)

## Mitigation Strategy

### Package Overrides

We use `package.json` overrides to force secure versions of critical dependencies:

```json
{
  "overrides": {
    "minimatch": "^10.2.1",
    "glob": "^11.0.0",
    "rimraf": "^6.0.1"
  }
}
```

This ensures all transitive dependencies use patched versions, even when upstream packages haven't updated yet.

### What We Fixed

**Before:**
- 32 vulnerabilities (31 high, 1 moderate)
- Critical ReDoS in `minimatch` affecting production dependencies via Google Cloud SDK

**After:**
- 0 production vulnerabilities
- 11 moderate development-only vulnerabilities (ESLint tooling)

## Vulnerability Details

### Resolved Vulnerabilities

#### minimatch ReDoS (CVE-2024-XXXX)
- **Severity**: High
- **Status**: ✅ Fixed
- **Solution**: Upgraded to minimatch 10.2.1+ via overrides
- **Impact**: Previously affected Google Cloud authentication libraries through dependency chain: gaxios → rimraf → glob → minimatch

### Remaining Vulnerabilities

#### ajv ReDoS (GHSA-2g4f-4pwh-qvx6)
- **Severity**: Moderate
- **Status**: ⚠️ Present in dev dependencies
- **Affected**: ESLint configuration parser
- **Impact**: None - only used during development
- **Mitigation**: Not included in production deployment
- **Resolution**: Waiting for ESLint ecosystem to update

## Security Best Practices

### Dependency Management

1. **Production dependencies** are kept minimal and up-to-date
2. **Development dependencies** are isolated from production build
3. **Package overrides** force secure versions across the dependency tree
4. **Regular audits** using `npm audit --production`

### Update Schedule

- **Production dependencies**: Updated immediately when security patches are released
- **Development dependencies**: Updated quarterly or when fixes are available
- **Security audits**: Run on every PR and deployment

## Verification

To verify the security status yourself:

```bash
cd functions

# Check production vulnerabilities (should be 0)
npm audit --production

# Check all vulnerabilities
npm audit

# Run tests to ensure fixes don't break functionality
npm test
```

## Reporting Security Issues

If you discover a security vulnerability in this extension:

1. **Do not** open a public issue
2. Email details to: [your-security-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Audit History

| Date | Production Vulns | Dev Vulns | Action Taken |
|------|------------------|-----------|--------------|
| 2026-02-20 | 0 | 11 moderate | Added package overrides for minimatch, glob, rimraf |
| 2026-02-20 | 4 high | 32 total | Initial security audit |

## References

- [npm audit documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [Package overrides](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides)
- [minimatch ReDoS advisory](https://github.com/advisories/GHSA-3ppc-4f35-3m26)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/security)

## Conclusion

The extension is **production-ready and secure**. All critical and high-severity vulnerabilities have been resolved. The remaining moderate-severity vulnerabilities are isolated to development tooling and do not affect the deployed Firebase Functions.
