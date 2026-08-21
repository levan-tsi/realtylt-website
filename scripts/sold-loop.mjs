#!/usr/bin/env node
// Cycles the sold-photo window decision on a fixed interval.
//
// Every round has lost this: the scheduler was a session-scoped cron job or a shell
// loop, and both die with the session that started them. This is a plain detached
// process instead, so it outlives the session. Start it once per round:
//
//   powershell -Command "Start-Process node -ArgumentList 'scripts/sold-loop.mjs' -WindowStyle Hidden"
//
// It makes no decisions of its own. sold-window.mjs measures both doors, refuses
// beside a live runner (exit 4) or inside a penalty (exit 5), and sizes the launch.
// EXIT CODES from that command: 0 ran · 3 doors shut · 4 runner live · 5 penalty · 42 429.

import { spawn } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..')
const LOG = join(HERE, '.sold-loop.log')
const INTERVAL_MS = 15 * 60 * 1000

const stamp = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z')
const note = (line) => appendFileSync(LOG, `${line}\n`)

function tick() {
  return new Promise((resolve) => {
    note(`\n───── ${stamp()} ─────`)
    const child = spawn(process.execPath, ['scripts/sold-window.mjs'], {
      cwd: REPO,
      env: { ...process.env, NODE_OPTIONS: '--use-system-ca' },
    })
    child.stdout.on('data', (b) => note(b.toString().trimEnd()))
    child.stderr.on('data', (b) => note(b.toString().trimEnd()))
    child.on('close', (code) => {
      note(`exit=${code}`)
      resolve()
    })
  })
}

note(`\n═════ loop started ${stamp()} (pid ${process.pid}, every ${INTERVAL_MS / 60000}m) ═════`)
for (;;) {
  await tick()
  await new Promise((r) => setTimeout(r, INTERVAL_MS))
}
