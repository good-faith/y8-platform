# Y8 Staging Launcher
# Builds and starts all services via docker-compose

param(
  [switch]$Build,
  [switch]$Down,
  [switch]$Logs
)

if ($Down) {
  docker compose down
  exit 0
}

if ($Logs) {
  docker compose logs -f
  exit 0
}

# Copy .env.staging to .env if .env doesn't exist
if (!(Test-Path ".env")) {
  Copy-Item ".env.staging" ".env"
  Write-Host "Created .env from .env.staging - edit secrets before production!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Y8 Staging Stack" -ForegroundColor Cyan
Write-Host "  http://localhost       -> y8-app (wallet UI)" -ForegroundColor Cyan
Write-Host "  http://localhost/api   -> y8-server (API)" -ForegroundColor Yellow
Write-Host "  http://localhost/financial -> y8-premier" -ForegroundColor Magenta
Write-Host "  http://localhost/xr    -> the-beach (XR)" -ForegroundColor Blue
Write-Host ""

if ($Build) {
  Write-Host "Building all images..." -ForegroundColor Gray
  docker compose build --parallel
}

docker compose up -d
Write-Host ""
Write-Host "  All services starting. Run: powershell -File stage.ps1 -Logs" -ForegroundColor Green
Write-Host ""
