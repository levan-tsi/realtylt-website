# Launch the RealtyLT agent system: 3 independent single-agent loops (CRM / website / AI page) + 1 overseer.
# Each loop is ONE Opus agent that works step-by-step to ~700-800k tokens, self-commits, then re-spawns.
# The overseer verifies their work (regressions / real / not-lying) on a slow cadence and curates the playbook.
# Stop any one:  New-Item C:\Users\Levan\realtylt-website\loop\STOP-<name> -ItemType File   (name = crm|website|aipage)
# Stop overseer: New-Item C:\Users\Levan\realtylt-website\loop\OVERSEER-STOP -ItemType File
#
# FREEZE NOTE: this starts 4 concurrent Opus sessions. To roll out gently, comment out lines below and start one
# at a time (CRM first — it's the focus), watch it, then add the others.

$bash = "C:\Program Files\Git\bin\bash.exe"
$L    = "/c/Users/Levan/realtylt-website/loop"          # loop dir (Windows Git Bash view)
$Lw   = "/mnt/c/Users/Levan/realtylt-website/loop"      # loop dir (WSL view)
if (-not (Test-Path $bash)) { Write-Error "Git Bash not found at $bash"; exit 1 }

# clear stale STOP / lock files
Remove-Item C:\Users\Levan\realtylt-website\loop\STOP-*,`
            C:\Users\Levan\realtylt-website\loop\OVERSEER-STOP,`
            C:\Users\Levan\realtylt-website\loop\.lock-* -ErrorAction SilentlyContinue

# --- CRM loop (WSL: isolated clone /root/realtylt-crm-fix) ---
Start-Process $bash -ArgumentList '-lc', "wsl.exe -e bash -lc 'bash $Lw/loop-agent.sh crm $Lw/CRM-LOOP.md /root/realtylt-crm-fix $Lw/STOP-crm 150'" -WindowStyle Minimized
"CRM loop started (WSL /root/realtylt-crm-fix)"

# --- Website loop (Windows) ---
Start-Process $bash -ArgumentList '-lc', "bash $L/loop-agent.sh website $L/WEBSITE-LOOP.md /c/Users/Levan/realtylt-website $L/STOP-website 150" -WindowStyle Minimized
"Website loop started"

# --- AI-page loop (Windows) ---
Start-Process $bash -ArgumentList '-lc', "bash $L/loop-agent.sh aipage $L/AIPAGE-LOOP.md /c/Users/Levan/realtylt-ai-page $L/STOP-aipage 150" -WindowStyle Minimized
"AI-page loop started"

# --- Overseer / watchdog (Windows, slow cadence ~20 min) ---
Start-Process $bash -ArgumentList '-lc', "while [ ! -f $L/OVERSEER-STOP ]; do bash $L/run-agent.sh overseer $L/OVERSEER.md /c/Users/Levan/realtylt-website $L/OVERSEER-STOP; sleep 1200; done" -WindowStyle Minimized
"Overseer started (every ~20 min)"

"All started. Monitor: loop/journal/<name>.log (session marks) + loop/JOURNAL*.md. Stop: touch loop/STOP-<name>."
