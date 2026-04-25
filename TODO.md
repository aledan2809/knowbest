# knowbest — TODO

## User actions required (post 2026-04-16 dev session)

- [ ] **Rotate Neon DB password** — the old password was leaked in `Reports/AUDIT_E2E_2026-03-21.md` (now redacted to `[REDACTED_PASSWORD]`, but the history of the file in git still contains it). Change in Neon console and update `DATABASE_URL` in `.env.local` + production env.
- [ ] **Run Prisma migration** to create new tables (`user_api_keys`, `usage_records`):
  ```bash
  cd knowbest
  npx prisma migrate dev --name add_user_api_keys_and_usage
  ```
  After migration completes, the `/account/api-keys` and `/account/usage` pages will be fully functional in runtime.
- [ ] **Set `ALLOWED_ORIGINS` env var in production** — CSRF origin check (AUDIT-008) falls back to dev domains if not set. In prod, export:
  ```
  ALLOWED_ORIGINS=https://knowbest.ro,https://app.knowbest.ro
  ```
- [ ] **Verify git history does not expose the old Neon credentials.** If yes, consider a filter-branch rewrite or the cleaner option of rotating the DB password (done via step 1).

## Resolved in this session

All 13 audit issues from `Reports/AUDIT_E2E_2026-03-21.md` are now fixed. See `Reports/AUDIT_E2E_2026-03-21_FIXED.md` for P0/P1 and this TODO + `knowledge/` for documentation of the remaining P2s closed on 2026-04-16.

## Future enhancements (not in audit)

- [ ] Consolidate overlap between `Project` and `projects` Prisma models
- [ ] Add rate limiting middleware (currently only auth routes have implicit limits via NextAuth)
- [ ] Add UI for `/account/subscription` to manage Stripe subscriptions
- [ ] Add email notifications for API key creation / revocation (security best practice)
- [ ] Move plan quotas out of `src/lib/usage.ts` constants into DB / env for runtime tuning

---

*Last updated: 2026-04-16*
