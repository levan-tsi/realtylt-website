#!/usr/bin/env bash
# One cycle of the RealtyLT autonomous launch loop. Invokes Claude (Opus 4.8) headless with LOOP_PROMPT.md.
# The orchestrator cycle then summons the Opus property sub-agents. State persists in git + loop/ files.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"   # website repo root (the loop's home)
cd "$ROOT" || exit 1

# STOP switch: create loop/STOP to halt the loop.
[ -f loop/STOP ] && { echo "[loop] STOP present — not running"; exit 0; }

# Lock: skip if a previous cycle is still running.
if [ -f loop/.lock ]; then
  echo "[loop] previous cycle still running (loop/.lock) — skipping"; exit 0
fi
touch loop/.lock
trap 'rm -f loop/.lock' EXIT

mkdir -p loop/journal
TS="$(date -u +%Y%m%dT%H%M%SZ)"
echo "[loop] === cycle $TS start ===" | tee -a loop/journal/loop.log

# Model: Opus 4.8 for the loop (per owner). --dangerously-skip-permissions is REQUIRED for an unattended
# loop (same posture as the CRM/ai loops). The prompt itself pauses for owner-gated go-live steps.
MODEL="${LOOP_MODEL:-claude-opus-4-8}"
claude --model "$MODEL" --dangerously-skip-permissions -p "$(cat loop/LOOP_PROMPT.md)" \
  >> "loop/journal/cycle-$TS.log" 2>&1
CODE=$?

echo "[loop] === cycle $TS end (exit $CODE) ===" | tee -a loop/journal/loop.log
exit 0
