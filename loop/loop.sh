#!/usr/bin/env bash
# Repeat run-cycle.sh until loop/STOP appears. Launch in the background (see start-loop.ps1 / README).
# Env: LOOP_INTERVAL (seconds between cycles, default 180), LOOP_MODEL (default claude-opus-4-8).
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1
INTERVAL="${LOOP_INTERVAL:-180}"

echo "[loop] starting — interval ${INTERVAL}s. Stop with:  touch $ROOT/loop/STOP"
while [ ! -f "$ROOT/loop/STOP" ]; do
  bash "$ROOT/loop/run-cycle.sh"
  [ -f "$ROOT/loop/STOP" ] && break
  sleep "$INTERVAL"
done
echo "[loop] halted (loop/STOP present)"
