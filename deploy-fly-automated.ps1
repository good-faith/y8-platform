# deploy-fly-automated.ps1
# Automates Fly.io app registration, secret configuration, and deployment

$org = "personal"
$serverApp = "y8-server-jason-sprouse"
$webApp = "y8-web-jason-sprouse"
$beachApp = "y8-beach-jason-sprouse"
$premierApp = "y8-premier-jason-sprouse"
$flyExe = "C:\Users\jason\.fly\bin\fly.exe"

Write-Host "🚀 Starting Automated Fly.io Deployment..." -ForegroundColor Cyan

# 1. Create Apps
$apps = @($serverApp, $webApp, $beachApp, $premierApp)
foreach ($app in $apps) {
    Write-Host "Creating app $app under org $org..." -ForegroundColor Gray
    & $flyExe apps create $app --org $org 2>&1 | Out-Null
    Write-Host "✅ App $app ready" -ForegroundColor Green
}

# 2. Generate and Set Secrets for Server
Write-Host "Setting secrets for server: $serverApp..." -ForegroundColor Gray
$jwtSecret = [Guid]::NewGuid().ToString("N")
& $flyExe secrets set JWT_SECRET="$jwtSecret" --app $serverApp

# 3. Generate and Set Secrets for Web App
Write-Host "Setting secrets for web client: $webApp..." -ForegroundColor Gray
$nextAuthSecret = [Guid]::NewGuid().ToString("N")
$serverUrl = "https://$serverApp.fly.dev/api/v1"
$webUrl = "https://$webApp.fly.dev"

# Fetch WalletConnect ID from env or default to placeholder
$wcId = $env:NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
if (-not $wcId) {
    $wcId = "your-walletconnect-project-id"
}

& $flyExe secrets set `
  NEXTAUTH_SECRET="$nextAuthSecret" `
  NEXTAUTH_URL="$webUrl" `
  NEXT_PUBLIC_Y8_SERVER_URL="$serverUrl" `
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="$wcId" `
  --app $webApp

# 4. Trigger Staging Fly Deployment Script
Write-Host "Launching stage-fly.ps1 deployment..." -ForegroundColor Cyan
powershell -File stage-fly.ps1
