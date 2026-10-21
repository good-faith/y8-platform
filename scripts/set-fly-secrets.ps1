<#
.SYNOPSIS
  Sets production Fly.io secrets for all 4 Y8 Platform apps.
  Run this script once, paste your credentials when prompted.

.APPS
  y8-server-jason-sprouse   (API server + WebSocket gateway)
  y8-web-jason-sprouse      (y8-app  — Next.js main app)
  y8-premier-jason-sprouse  (y8-premier — Vite financial app)
  y8-beach-jason-sprouse    (the-beach — XR/WebXR app)
#>

param(
  [string]$WalletConnectId,
  [string]$PlaidClientId,
  [string]$PlaidSecret,
  [string]$CdpApiKeyName,
  [string]$CdpApiKeyPrivateKey,
  [string]$OpenAiKey,
  [string]$AnthropicKey,
  [string]$GeminiKey
)

$ErrorActionPreference = "Stop"

# ─── Pre-flight: verify fly CLI ───────────────────────────────────────────────
if (-not (Get-Command fly -ErrorAction SilentlyContinue)) {
  Write-Error "fly CLI not found. Install from https://fly.io/docs/hands-on/install-flyctl/"
  exit 1
}

Write-Host "`n🚀 Y8 Platform — Production Fly.io Secret Setup`n" -ForegroundColor Cyan
Write-Host "You will be prompted for credentials that can't be auto-generated." -ForegroundColor Gray
Write-Host "All values are sent directly to fly secrets set — never stored locally.`n" -ForegroundColor Gray

# ─── Helper: prompt if not passed as param ────────────────────────────────────
function Prompt-Secret {
  param([string]$Name, [string]$Value, [string]$Description, [switch]$Required)
  if ($Value) { return $Value }
  Write-Host "  → $Description" -ForegroundColor Yellow
  $input = Read-Host "    $Name"
  if ($Required -and -not $input) {
    Write-Error "$Name is required and cannot be empty."
    exit 1
  }
  return $input
}

# ─── Collect credentials ──────────────────────────────────────────────────────
Write-Host "[ 1/5 ] WalletConnect" -ForegroundColor Cyan
$WcId = Prompt-Secret -Name "WALLETCONNECT_PROJECT_ID" -Value $WalletConnectId `
  -Description "Get from https://cloud.walletconnect.com  (enables MetaMask / Rainbow / QR wallet)" -Required

Write-Host "`n[ 2/5 ] Plaid (Development — real banks, limited items)" -ForegroundColor Cyan
$PcId  = Prompt-Secret -Name "PLAID_CLIENT_ID" -Value $PlaidClientId  -Description "Plaid dashboard → Team Settings → Keys" -Required
$PcSec = Prompt-Secret -Name "PLAID_SECRET"    -Value $PlaidSecret     -Description "Plaid Development secret key" -Required

Write-Host "`n[ 3/5 ] Coinbase Developer Platform (agent wallets)" -ForegroundColor Cyan
$CdpName = Prompt-Secret -Name "CDP_API_KEY_NAME"        -Value $CdpApiKeyName       -Description "From https://portal.cdp.coinbase.com" -Required
$CdpKey  = Prompt-Secret -Name "CDP_API_KEY_PRIVATE_KEY" -Value $CdpApiKeyPrivateKey -Description "CDP private key (PEM format)" -Required

Write-Host "`n[ 4/5 ] AI Services (optional — press Enter to skip)" -ForegroundColor Cyan
$OaiKey = Prompt-Secret -Name "OPENAI_API_KEY"    -Value $OpenAiKey    -Description "OpenAI key (sk-...)"
$AiKey  = Prompt-Secret -Name "ANTHROPIC_API_KEY" -Value $AnthropicKey -Description "Anthropic key (sk-ant-...)"
$GemKey = Prompt-Secret -Name "GEMINI_API_KEY"    -Value $GeminiKey    -Description "Google Gemini API key"

# ─── Auto-generated secrets ───────────────────────────────────────────────────
Write-Host "`n[ 5/5 ] Generating cryptographic secrets..." -ForegroundColor Cyan
Add-Type -AssemblyName System.Security
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()

function New-HexSecret([int]$bytes) {
  $buf = New-Object byte[] $bytes
  $rng.GetBytes($buf)
  return [BitConverter]::ToString($buf).Replace("-","").ToLower()
}

$NextAuthSecret = New-HexSecret 32
$JwtSecret      = New-HexSecret 64

Write-Host "  ✅ NEXTAUTH_SECRET (256-bit)" -ForegroundColor Green
Write-Host "  ✅ JWT_SECRET (512-bit)" -ForegroundColor Green

# ─── Production URLs ──────────────────────────────────────────────────────────
$Y8AppUrl     = "https://y8-web-jason-sprouse.fly.dev"
$Y8PremierUrl = "https://y8-premier-jason-sprouse.fly.dev"
$Y8BeachUrl   = "https://y8-beach-jason-sprouse.fly.dev"
$Y8ServerUrl  = "https://y8-server-jason-sprouse.fly.dev"

# ─── Set secrets per app ──────────────────────────────────────────────────────
Write-Host "`n━━━ Setting secrets for y8-server-jason-sprouse ━━━" -ForegroundColor Magenta
$serverSecrets = @(
  "JWT_SECRET=$JwtSecret",
  "JWT_EXPIRES_IN=7d",
  "ALLOWED_ORIGINS=$Y8AppUrl,$Y8PremierUrl,$Y8BeachUrl,http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003",
  "NODE_ENV=production"
)
if ($CdpName) { $serverSecrets += "CDP_API_KEY_NAME=$CdpName" }
if ($CdpKey)  { $serverSecrets += "CDP_API_KEY_PRIVATE_KEY=$CdpKey" }
if ($OaiKey)  { $serverSecrets += "OPENAI_API_KEY=$OaiKey" }
if ($AiKey)   { $serverSecrets += "ANTHROPIC_API_KEY=$AiKey" }

fly secrets set @serverSecrets --app y8-server-jason-sprouse --stage
Write-Host "  ✅ y8-server secrets staged" -ForegroundColor Green

Write-Host "`n━━━ Setting secrets for y8-web-jason-sprouse (y8-app) ━━━" -ForegroundColor Magenta
$webSecrets = @(
  "NEXTAUTH_SECRET=$NextAuthSecret",
  "AUTH_SECRET=$NextAuthSecret",
  "NEXTAUTH_URL=$Y8AppUrl",
  "NEXT_PUBLIC_Y8_SERVER_URL=$Y8ServerUrl/api/v1",
  "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$WcId",
  "NEXT_PUBLIC_Y8_PREMIER_URL=$Y8PremierUrl",
  "NEXT_PUBLIC_THE_BEACH_URL=$Y8BeachUrl",
  "NODE_ENV=production"
)
fly secrets set @webSecrets --app y8-web-jason-sprouse --stage
Write-Host "  ✅ y8-app secrets staged" -ForegroundColor Green

Write-Host "`n━━━ Setting secrets for y8-premier-jason-sprouse ━━━" -ForegroundColor Magenta
$premierSecrets = @(
  "VITE_Y8_APP_URL=$Y8AppUrl",
  "VITE_Y8_SERVER_URL=$Y8ServerUrl/api/v1",
  "PLAID_CLIENT_ID=$PcId",
  "PLAID_SECRET=$PcSec",
  "PLAID_ENV=development",
  "NODE_ENV=production"
)
if ($GemKey) { $premierSecrets += "GEMINI_API_KEY=$GemKey" }
if ($OaiKey) { $premierSecrets += "OPENAI_API_KEY=$OaiKey" }

fly secrets set @premierSecrets --app y8-premier-jason-sprouse --stage
Write-Host "  ✅ y8-premier secrets staged" -ForegroundColor Green

Write-Host "`n━━━ Setting secrets for y8-beach-jason-sprouse (the-beach) ━━━" -ForegroundColor Magenta
$beachSecrets = @(
  "Y8_APP_URL=$Y8AppUrl",
  "Y8_SERVER_URL=$Y8ServerUrl",
  "CORS_ORIGINS=$Y8AppUrl,$Y8PremierUrl,http://localhost:3000,http://localhost:3002",
  "NODE_ENV=production"
)
if ($OaiKey) { $beachSecrets += "OPENAI_API_KEY=$OaiKey" }
if ($AiKey)  { $beachSecrets += "ANTHROPIC_API_KEY=$AiKey" }

fly secrets set @beachSecrets --app y8-beach-jason-sprouse --stage
Write-Host "  ✅ the-beach secrets staged" -ForegroundColor Green

# ─── Deploy all apps ──────────────────────────────────────────────────────────
Write-Host "`n━━━ Deploying all apps with new secrets ━━━" -ForegroundColor Magenta
Write-Host "  ↗ Deploying y8-server..." -ForegroundColor Gray
fly deploy --app y8-server-jason-sprouse --strategy immediate 2>&1 | Tail-n 5

Write-Host "  ↗ Deploying y8-app..." -ForegroundColor Gray
fly deploy --app y8-web-jason-sprouse    --strategy immediate 2>&1 | Tail-n 5

Write-Host "  ↗ Deploying y8-premier..." -ForegroundColor Gray
fly deploy --app y8-premier-jason-sprouse --strategy immediate 2>&1 | Tail-n 5

Write-Host "  ↗ Deploying the-beach..." -ForegroundColor Gray
fly deploy --app y8-beach-jason-sprouse  --strategy immediate 2>&1 | Tail-n 5

Write-Host "`n✅ ALL SECRETS SET AND DEPLOYMENTS TRIGGERED" -ForegroundColor Green
Write-Host "`nProduction URLs:" -ForegroundColor Cyan
Write-Host "  🌐 y8-app:    $Y8AppUrl"
Write-Host "  💎 y8-premier: $Y8PremierUrl"
Write-Host "  🏖  the-beach: $Y8BeachUrl"
Write-Host "  ⚙️  y8-server: $Y8ServerUrl"
