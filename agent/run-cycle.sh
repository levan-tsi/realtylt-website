#!/usr/bin/env bash
# RealtyLT website — autonomous build loop, ONE cycle. DORMANT by default.
# Activate only if the interactive Fable session can't finish the build (see agent/README.md).
set -uo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

# 1) halt switches
[ -f STOP ] && { echo "HALT: STOP file present"; exit 0; }
STATUS="$(grep -m1 -E '^Status:' agent/CHECKPOINT.md 2>/dev/null | awk '{print $2}')"
case "$STATUS" in
  NOT_STARTED|DONE|BLOCKER|"") echo "HALT: Status=${STATUS:-unset} (loop off — set 'Status: GO' to run)"; exit 0 ;;
esac

# 2) single-flight lock
mkdir agent/.lock 2>/dev/null || { echo "SKIP: a cycle is already running"; exit 0; }
trap 'rm -rf agent/.lock' EXIT INT TERM

# 3) one autonomous build cycle against the orchestrator prompt
echo "$(date '+%F %T') cycle start (status=$STATUS)" >> agent/run.log
claude --dangerously-skip-permissions -p "$(cat BUILD-ORCHESTRATOR-PROMPT.md)" >> agent/run.log 2>&1 || \
  echo "$(date '+%F %T') claude exited nonzero" >> agent/run.log

# 4) persist anything the cycle left (never secrets — .env* is git-ignored)
if [ -n "$(git status --porcelain)" ]; then
  git add -A && git commit -q -m "loop: build cycle $(date '+%F %T')" || true
fi
echo "$(date '+%F %T') cycle end" >> agent/run.log
exit 0
