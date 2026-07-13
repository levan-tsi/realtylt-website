#!/usr/bin/env bash
# One session of a SINGLE-agent loop. Args: NAME PROMPT_PATH WORK_DIR STOP_FILE
# Runs claude (Opus 4.8) headless with the given prompt, cwd = WORK_DIR. Journals under this loop/ dir.
# Used for the 3 property loops (crm/website/aipage) + the overseer. State persists in git.
set -uo pipefail
NAME="${1:?name}"; PROMPT="${2:?prompt path}"; WORKDIR="${3:?work dir}"; STOP="${4:?stop file}"
LOOPDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[ -f "$STOP" ]        && { echo "[$NAME] STOP present ($STOP) — not running"; exit 0; }
LOCK="$LOOPDIR/.lock-$NAME"
[ -f "$LOCK" ]        && { echo "[$NAME] previous session still running ($LOCK) — skipping"; exit 0; }
[ -f "$PROMPT" ]      || { echo "[$NAME] prompt not found: $PROMPT"; exit 1; }
[ -d "$WORKDIR" ]     || { echo "[$NAME] work dir not found: $WORKDIR"; exit 1; }
touch "$LOCK"; trap 'rm -f "$LOCK"' EXIT

mkdir -p "$LOOPDIR/journal"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
echo "[$NAME] === session $TS start (cwd=$WORKDIR) ===" | tee -a "$LOOPDIR/journal/$NAME.log"

MODEL="${LOOP_MODEL:-claude-opus-4-8}"
( cd "$WORKDIR" && claude --model "$MODEL" --dangerously-skip-permissions -p "$(cat "$PROMPT")" ) \
  >> "$LOOPDIR/journal/$NAME-$TS.log" 2>&1
CODE=$?
echo "[$NAME] === session $TS end (exit $CODE) ===" | tee -a "$LOOPDIR/journal/$NAME.log"
exit 0
