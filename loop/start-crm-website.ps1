# Launch CRM loop + website loop + overseer watchdog (NOT the AI-page loop — held for later).
# 3 concurrent Opus agents (the "~3 is fine" level). Run this YOURSELF (the loops use
# --dangerously-skip-permissions for unattended operation, like your crmloop).
#   Stop a loop:  New-Item C:\Users\Levan\realtylt-website\loop\STOP-crm     -ItemType File   (or STOP-website)
#   Stop watchdog: New-Item C:\Users\Levan\realtylt-website\loop\OVERSEER-STOP -ItemType File
#   Add AI-page later:  the line is commented at the bottom.

$bash = "C:\Program Files\Git\bin\bash.exe"
$L    = "/c/Users/Levan/realtylt-website/loop"
$Lw   = "/mnt/c/Users/Levan/realtylt-website/loop"

Get-ChildItem C:\Users\Levan\realtylt-website\loop\.lock-*,`
              C:\Users\Levan\realtylt-website\loop\STOP-crm,`
              C:\Users\Levan\realtylt-website\loop\STOP-website,`
              C:\Users\Levan\realtylt-website\loop\OVERSEER-STOP -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

# CRM loop (WSL isolated clone /root/realtylt-crm-fix)
Start-Process $bash -ArgumentList '-lc', "wsl.exe -e bash -lc 'bash $Lw/loop-agent.sh crm $Lw/CRM-LOOP.md /root/realtylt-crm-fix $Lw/STOP-crm 150'" -WindowStyle Minimized
"CRM loop started (WSL)"

# Website loop (Windows)
Start-Process $bash -ArgumentList '-lc', "bash $L/loop-agent.sh website $L/WEBSITE-LOOP.md /c/Users/Levan/realtylt-website $L/STOP-website 150" -WindowStyle Minimized
"Website loop started"

# Overseer / watchdog (Windows, ~20-min cadence; sleeps between passes, then checks their work)
Start-Process $bash -ArgumentList '-lc', "while [ ! -f $L/OVERSEER-STOP ]; do bash $L/run-agent.sh overseer $L/OVERSEER.md /c/Users/Levan/realtylt-website $L/OVERSEER-STOP; sleep 1200; done" -WindowStyle Minimized
"Overseer started (checks every ~20 min)"

# AI-page loop (held — uncomment to add later):
# Start-Process $bash -ArgumentList '-lc', "bash $L/loop-agent.sh aipage $L/AIPAGE-LOOP.md /c/Users/Levan/realtylt-ai-page $L/STOP-aipage 150" -WindowStyle Minimized

"`nAll 3 started. Monitor: loop\journal\<name>.log (session start/end) + loop\JOURNAL*.md."
