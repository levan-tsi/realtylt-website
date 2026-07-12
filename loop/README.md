# RealtyLT Autonomous Launch Loop

A self-restarting loop that drives the whole product suite (website + AI page + CRM) toward
ship-ready, hands-off, across sessions — the same pattern as your CRM (`crmloop`) and /ai loops.

## How it works
- **`loop.sh`** repeatedly runs **`run-cycle.sh`** (every `LOOP_INTERVAL`s) until `loop/STOP` exists.
- Each **cycle** invokes `claude` **headless on Opus 4.8** with **`LOOP_PROMPT.md`** — the orchestrator
  reads the state (`NEXT-SESSION-PROMPT.md`, `AGENT_LEARNINGS.md`, `CHECKPOINT.md`, `JOURNAL.md`), picks
  the highest-value work, **summons the Opus property sub-agents in parallel** (website / AI page / CRM),
  verifies their work, commits + pushes, updates `CHECKPOINT.md` + `JOURNAL.md`, and exits. Next cycle continues.
- **`watchdog-cycle.sh`** (slower cadence) runs the **coach** (`WATCHDOG_PROMPT.md`): reviews the loop,
  improves the playbook (`AGENT_LEARNINGS.md`), and can pull the **safety brake** (`touch loop/STOP`).
- State lives in **git** (all three repos) + these `loop/` files, so it resumes anywhere.

## Start it (only when you're ready to hand over the wheel)
```powershell
powershell -File C:\Users\Levan\realtylt-website\loop\start-loop.ps1
```
Or from Git Bash / WSL: `cd /c/Users/Levan/realtylt-website && LOOP_INTERVAL=180 bash loop/loop.sh &`

## Stop it
```powershell
New-Item C:\Users\Levan\realtylt-website\loop\STOP -ItemType File
New-Item C:\Users\Levan\realtylt-website\loop\WATCHDOG_STOP -ItemType File
```
The loop finishes its current cycle, then halts. Delete the STOP files to resume.

## Monitor
- `loop/journal/loop.log` — cycle start/stop timestamps · `loop/journal/cycle-*.log` — full transcript per cycle
- `loop/JOURNAL.md` — the orchestrator's own running log of what each cycle did + verified
- `CHECKPOINT.md` — current status of all three properties + the OWNER-ACTION-NEEDED list

## Important
- **Unattended + costs tokens continuously** (like your other loops). It uses
  `--dangerously-skip-permissions` — required for hands-off operation.
- It **pauses for owner-gated go-live steps** (production domain/DNS, promote, deleting data) — it records
  them under "OWNER ACTION NEEDED" and keeps building everything else; it won't take them itself.
- It **self-terminates** when all three properties are launch-ready + verified (writes "ALL SHIP-READY"
  to CHECKPOINT and touches `loop/STOP`).
- Prereqs: `claude` CLI on PATH, Vercel CLI authed (`levan-3774`), Git Bash, WSL for the CRM clone.
- **Do NOT run two loops on the same repo** — this loop and the CRM's own `crmloop` both touch git; the
  loop's CRM work is confined to the ISOLATED clone `/root/realtylt-crm-fix`, never the live loop's tree.
