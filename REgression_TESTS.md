# Regression Tests — Audit Fixes

Automated regression suite to prevent fixed audit issues from recurring.

## Test Location

```
tests/regression/audit/
├── admin-auth-security.test.ts   — AUDIT-001/002: no hardcoded passwords/secrets
├── contact-validation.test.ts    — Contact form input validation & XSS prevention
├── admin-routes-auth.test.ts     — All admin routes require authentication
├── zod-validation.test.ts        — Zod schema validation on admin API inputs
└── env-requirements.test.ts      — No credentials in source, env var safety
```

## Running Locally

```bash
# Run all audit regression tests
npm run test:audit-regression

# Run a specific test file
npx vitest run --config vitest.regression.config.ts tests/regression/audit/admin-auth-security.test.ts

# Run in watch mode
npx vitest --config vitest.regression.config.ts
```

## CI/CD

GitHub Actions runs this suite automatically on:
- Push to any `fix/audit-*` branch
- Pull requests targeting `fix/audit-*`, `main`, or `master`

Workflow file: `.github/workflows/audit-regression.yml`

## Adding New Tests

When fixing an audit issue:

1. Create a test in `tests/regression/audit/` that verifies the fix
2. Name it descriptively (e.g., `csrf-protection.test.ts`)
3. The test should fail if the fix is reverted
4. Run `npm run test:audit-regression` to confirm it passes

## What's Covered

| Issue | Test File | What It Checks |
|-------|-----------|----------------|
| AUDIT-001 | admin-auth-security | No hardcoded admin password fallback |
| AUDIT-002 | admin-auth-security | No insecure JWT secret fallback |
| Contact XSS | contact-validation | HTML escaping on user input |
| Contact validation | contact-validation | Required fields + email format check |
| Admin auth guards | admin-routes-auth | All admin routes verify JWT token |
| Input validation | zod-validation | Zod schemas on admin API routes |
| Credential safety | env-requirements | No secrets hardcoded in source |
