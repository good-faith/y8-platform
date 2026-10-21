#
# set-private-secrets.ps1
# Run this in PowerShell -- paste each credential when prompted.
# Values go directly to Fly.io and are NEVER written to disk.
#

Write-Host ""
Write-Host "=== Y8 Platform - Private Credential Setup ===" -ForegroundColor Cyan
Write-Host "Paste each value and press Enter. Leave blank + Enter to skip optional items."
Write-Host ""

# ── REQUIRED ──────────────────────────────────────────────────────────────────
Write-Host "[ 1 ] WalletConnect" -ForegroundColor Yellow
$WcId = Read-Host "  WALLETCONNECT_PROJECT_ID  (cloud.walletconnect.com)"

Write-Host ""
Write-Host "[ 2 ] Plaid (Development - real banks)" -ForegroundColor Yellow
$PcId  = Read-Host "  PLAID_CLIENT_ID  (plaid.com -> Team Settings -> Keys -> Development)"
$PcSec = Read-Host "  PLAID_SECRET     (Development secret key)"

Write-Host ""
Write-Host "[ 3 ] Coinbase AgentKit v2 - headless server wallet provisioning" -ForegroundColor Yellow
Write-Host "  NOTE: awal CLI = interactive ops (balance/send/trade/x402)" -ForegroundColor Gray
Write-Host "        AgentKit = headless server wallet creation via API keys" -ForegroundColor Gray
$CdpKeyId  = Read-Host "  CDP_API_KEY_ID      (portal.cdp.coinbase.com -> API Keys)"
$CdpKeySec = Read-Host "  CDP_API_KEY_SECRET"
$CdpWalSec = Read-Host "  CDP_WALLET_SECRET   (optional - for deterministic address derivation)"

Write-Host ""
Write-Host "[ 4 ] AI Services (optional - press Enter to skip each)" -ForegroundColor Yellow
$OaiKey = Read-Host "  OPENAI_API_KEY     (sk-...)"
$AiKey  = Read-Host "  ANTHROPIC_API_KEY  (sk-ant-...)"
$GemKey = Read-Host "  GEMINI_API_KEY"

Write-Host ""
Write-Host "Setting secrets on Fly.io..." -ForegroundColor Cyan

# ── y8-app: WalletConnect ─────────────────────────────────────────────────────
if ($WcId) {
    fly secrets set "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$WcId" --app y8-web-jason-sprouse --stage
    Write-Host "  OK y8-app: WalletConnect set" -ForegroundColor Green
}

# ── y8-premier: Plaid + AI ────────────────────────────────────────────────────
$premierArgs = @()
if ($PcId)   { $premierArgs += "PLAID_CLIENT_ID=$PcId" }
if ($PcSec)  { $premierArgs += "PLAID_SECRET=$PcSec" }
if ($GemKey) { $premierArgs += "GEMINI_API_KEY=$GemKey" }
if ($OaiKey) { $premierArgs += "OPENAI_API_KEY=$OaiKey" }
if ($AiKey)  { $premierArgs += "ANTHROPIC_API_KEY=$AiKey" }
if ($premierArgs.Count -gt 0) {
    fly secrets set @premierArgs --app y8-premier-jason-sprouse --stage
    Write-Host "  OK y8-premier: Plaid + AI keys set" -ForegroundColor Green
}

# ── y8-server: AgentKit v2 CDP + AI ──────────────────────────────────────────
$serverArgs = @()
if ($CdpKeyId)  { $serverArgs += "CDP_API_KEY_ID=$CdpKeyId" }
if ($CdpKeySec) { $serverArgs += "CDP_API_KEY_SECRET=$CdpKeySec" }
if ($CdpWalSec) { $serverArgs += "CDP_WALLET_SECRET=$CdpWalSec" }
$serverArgs += "CDP_NETWORK_ID=base-sepolia"
if ($OaiKey) { $serverArgs += "OPENAI_API_KEY=$OaiKey" }
if ($AiKey)  { $serverArgs += "ANTHROPIC_API_KEY=$AiKey" }
fly secrets set @serverArgs --app y8-server-jason-sprouse --stage
Write-Host "  OK y8-server: AgentKit v2 CDP + AI keys set" -ForegroundColor Green

# ── the-beach: AI ─────────────────────────────────────────────────────────────
$beachArgs = @()
if ($OaiKey) { $beachArgs += "OPENAI_API_KEY=$OaiKey" }
if ($AiKey)  { $beachArgs += "ANTHROPIC_API_KEY=$AiKey" }
if ($beachArgs.Count -gt 0) {
    fly secrets set @beachArgs --app y8-beach-jason-sprouse --stage
    Write-Host "  OK the-beach: AI keys set" -ForegroundColor Green
}

# ── Deploy all ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Deploying all apps with updated secrets..." -ForegroundColor Cyan

$apps = @(
    "y8-server-jason-sprouse",
    "y8-web-jason-sprouse",
    "y8-premier-jason-sprouse",
    "y8-beach-jason-sprouse"
)

foreach ($app in $apps) {
    Write-Host "  Deploying $app ..." -ForegroundColor Gray
    fly deploy --app $app --strategy immediate --detach
}

Write-Host ""
Write-Host "DONE - All secrets staged and deployments triggered." -ForegroundColor Green
Write-Host ""
Write-Host "Production URLs:" -ForegroundColor Cyan
Write-Host "   y8-app:    https://y8-web-jason-sprouse.fly.dev"
Write-Host "   y8-premier: https://y8-premier-jason-sprouse.fly.dev"
Write-Host "   the-beach:  https://y8-beach-jason-sprouse.fly.dev"
Write-Host "   y8-server:  https://y8-server-jason-sprouse.fly.dev"
Write-Host ""
Write-Host "After deploy, verify wallet init with:"
Write-Host "  fly logs -a y8-server-jason-sprouse"
Write-Host "Then fund agent wallets with: npx awal auth login YOUR_EMAIL"
Write-Host ""
