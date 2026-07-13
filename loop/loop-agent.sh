#!/usr/bin/env bash
# Repeat run-agent.sh until STOP_FILE appears. Args: NAME PROMPT_PATH WORK_DIR STOP_FILE [INTERVAL_SECONDS]
# Each session is ONE deep single-agent run (~700-800k tokens, self-committing). Between sessions, wait INTERVAL,
# then re-spawn a fresh session that continues from CHECKPOINT + git.
set -uo pipefail
NAME="${1:?name}"; PROMPT="${2:?prompt}"; WORKDIR="${3:?work dir}"; STOP="${4:?stop file}"; INTERVAL="${5:-150}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "[$NAME] loop starting — interval ${INTERVAL}s. Stop with:  touch $STOP"
while [ ! -f "$STOP" ]; do
  bash "$DIR/run-agent.sh" "$NAME" "$PROMPT" "$WORKDIR" "$STOP"
  [ -f "$STOP" ] && break
  sleep "$INTERVAL"
done
echo "[$NAME] halted (STOP present)"
