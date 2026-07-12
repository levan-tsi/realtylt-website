#!/usr/bin/env bash
# One WATCHDOG/COACH pass — reviews the loop, improves the playbook, can pull the safety brake.
# Run this on a slower cadence than the build loop (e.g. every ~5 build cycles). Text-only; never edits
# product code. Launch in the background alongside loop.sh (see README).
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1
[ -f loop/WATCHDOG_STOP ] && { echo "[watchdog] WATCHDOG_STOP present — not running"; exit 0; }

mkdir -p loop/journal
TS="$(date -u +%Y%m%dT%H%M%SZ)"
MODEL="${LOOP_MODEL:-claude-opus-4-8}"
echo "[watchdog] === pass $TS ===" | tee -a loop/journal/watchdog.log
claude --model "$MODEL" --dangerously-skip-permissions -p "$(cat loop/WATCHDOG_PROMPT.md)" \
  >> "loop/journal/watchdog-$TS.log" 2>&1
echo "[watchdog] === pass $TS done (exit $?) ===" | tee -a loop/journal/watchdog.log
exit 0
