# Autonomous build loop — DORMANT (fallback only)

The **primary** build path is an interactive session: paste `BUILD-ORCHESTRATOR-PROMPT.md` into a
fresh **Fable** session. It plans + architects, then dispatches a Builder sub-agent, then a QA
sub-agent, with a ~700k-token discipline and a handoff prompt when it runs out.

This `agent/` loop is a **fallback** — turn it on ONLY if the interactive session can't finish the
build under budget. It is OFF by default (`CHECKPOINT.md` → `Status: NOT_STARTED`).

## To activate
1. Fill the owner keys into the secrets store (never hardcode) — see `CHECKPOINT.md`.
2. Set `agent/CHECKPOINT.md` → `Status: GO`.
3. Run the loop (from WSL, where the repo is `/mnt/c/Users/Levan/realtylt-website`):
   ```
   cd /mnt/c/Users/Levan/realtylt-website
   while true; do bash agent/run-cycle.sh; sleep 300; done
   ```
   (or a Windows Scheduled Task that invokes `wsl bash agent/run-cycle.sh`.)
4. Halt anytime: `touch STOP` in the repo root, or set `Status: DONE` / `BLOCKER`.

The loop reads `BUILD-ORCHESTRATOR-PROMPT.md` each cycle and commits its progress. It never runs while
`STOP` exists or `Status` is `NOT_STARTED`/`DONE`/`BLOCKER`.
