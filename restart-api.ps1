# Restart only the API dev-server (keeps Vite running)
$apiPort = 3001
$process = Get-NetTCPConnection -LocalPort $apiPort -ErrorAction SilentlyContinue | Where-Object State -eq Listen | Select-Object -First 1
if ($process) {
  $pid = $process.OwningProcess
  Write-Host "Stopping API server (PID $pid)..."
  Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 2
}
Set-Location -LiteralPath $PSScriptRoot
Write-Host "Starting API dev-server..."
$env:NODE_ENV = $env:NODE_ENV
Start-Process -FilePath "node.exe" -WorkingDirectory $PSScriptRoot -ArgumentList "dev-server.js" -WindowStyle Hidden
Start-Sleep -Seconds 3
$check = Get-NetTCPConnection -LocalPort $apiPort -ErrorAction SilentlyContinue | Where-Object State -eq Listen
if ($check) {
  Write-Host "API server running on port $apiPort"
} else {
  Write-Host "FAILED to start API server"
}
