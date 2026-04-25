#!/bin/bash
# AUDIT-001 Reproduction Test: Hardcoded admin password fallback
# Expected result: grep should find NO matches (0 exit = FAIL, 1 exit = PASS)

echo "=== AUDIT-001: Checking for hardcoded admin password ==="

cd "C:/Projects/knowbest" || exit 2

if grep -q "KnowBest2026" src/lib/admin-auth.ts; then
  echo "FAIL: Hardcoded password 'KnowBest2026!' found in admin-auth.ts"
  exit 1
else
  echo "PASS: No hardcoded password found in admin-auth.ts"
  exit 0
fi
