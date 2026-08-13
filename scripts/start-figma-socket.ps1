$env:Path = "C:\Users\simo\.bun\bin;" + $env:Path
Set-Location "$PSScriptRoot\..\tools\cursor-talk-to-figma-mcp"
Write-Host "Starting Talk to Figma WebSocket relay on port 3055..."
bun run socket
