#!/bin/bash
# AUDIT-002 Reproduction Test: Insecure JWT secret fallback
# Expected result: grep should find NO matches (0 exit = FAIL, 1 exit = PASS)

echo "=== AUDIT-002: Checking for hardcoded JWT fallback secret ==="

cd "C:/Projects/knowbest" || exit 2

if grep -q "fallback-secret" src/lib/admin-auth.ts; then
  echo "FAIL: Hardcoded fallback secret found in admin-auth.ts"
  exit 1
else
  echo "PASS: No hardcoded fallback secret found in admin-auth.ts"
  exit 0
fi
