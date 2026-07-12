# Start the RealtyLT autonomous launch loop (+ watchdog) in the background on Windows.
# DO NOT run until you're ready to hand the wheel to the loop. Requires: `claude` CLI on PATH, Git Bash.
# Stop anytime with:  New-Item C:\Users\Levan\realtylt-website\loop\STOP -ItemType File  (and \loop\WATCHDOG_STOP)

$bash = "C:\Program Files\Git\bin\bash.exe"
$root = "C:\Users\Levan\realtylt-website"
if (-not (Test-Path $bash)) { Write-Error "Git Bash not found at $bash"; exit 1 }

# Clear any stale STOP files so the loop can start
Remove-Item "$root\loop\STOP","$root\loop\WATCHDOG_STOP","$root\loop\.lock" -ErrorAction SilentlyContinue

# Build loop: a cycle every LOOP_INTERVAL seconds
Start-Process -FilePath $bash -ArgumentList '-lc', 'cd /c/Users/Levan/realtylt-website && LOOP_INTERVAL=180 bash loop/loop.sh' -WindowStyle Minimized
"loop started (build cycles every 180s)"

# Watchdog: a coach pass on a slower cadence (~ every 5 build cycles = 900s)
Start-Process -FilePath $bash -ArgumentList '-lc', 'cd /c/Users/Levan/realtylt-website && while [ ! -f loop/STOP ]; do bash loop/watchdog-cycle.sh; sleep 900; done' -WindowStyle Minimized
"watchdog started (every 900s)"

"To stop:  New-Item $root\loop\STOP -ItemType File   (loop finishes its current cycle, then halts)"
