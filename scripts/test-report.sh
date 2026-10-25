#!/usr/bin/env bash
# Runs both test suites and writes docs/test-report.md (with backend coverage).
set -euo pipefail
cd "$(dirname "$0")/.."
strip() { sed 's/\x1b\[[0-9;]*m//g'; }
{
  echo "# Test report"; echo; echo "_Generated: $(date -u +'%Y-%m-%d %H:%M UTC')_"; echo
  echo "## Backend (Vitest + Supertest)"; echo '```'
  (cd backend && npx vitest run --coverage --reporter=verbose 2>&1 | strip)
  echo '```'; echo
  echo "## Frontend (Vitest + React Testing Library)"; echo '```'
  (cd frontend && npx vitest run --reporter=verbose 2>&1 | strip)
  echo '```'
} > docs/test-report.md
echo "Wrote docs/test-report.md"
