# Y8 Fly.io Deploy Script
# Deploys all four apps to Fly.io staging
# Requires: flyctl installed and authenticated

param(
  [string]$App = 'all',
  [switch]$NoCache
)

$root = $PSScriptRoot
$cacheFlag = if ($NoCache) { '--no-cache' } else { '' }

function Deploy($name, $config, $dockerfile) {
  Write-Host ""
  Write-Host "  Deploying $name..." -ForegroundColor Cyan
  $cmd = "C:\Users\jason\.fly\bin\fly.exe deploy `"$root`" --config `"$config`" --dockerfile `"$dockerfile`" $cacheFlag"
  Invoke-Expression $cmd
  if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ $name deployed" -ForegroundColor Green
  } else {
    Write-Host "  ❌ $name failed" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "  Y8 Fly.io Deploy" -ForegroundColor Cyan
Write-Host ""

switch ($App) {
  'server'  { Deploy 'y8-server'  "$root\y8-server\fly.toml"  "$root\docker\server.Dockerfile" }
  'beach'   { Deploy 'the-beach'  "$root\the-beach\fly.toml"  "$root\docker\beach.Dockerfile" }
  'web'     { Deploy 'y8-app'     "$root\y8-app\fly.toml"     "$root\docker\web.Dockerfile" }
  'premier' { Deploy 'y8-premier' "$root\y8-premier\fly.toml" "$root\docker\premier.Dockerfile" }
  default {
    Deploy 'y8-server'  "$root\y8-server\fly.toml"  "$root\docker\server.Dockerfile"
    Deploy 'the-beach'  "$root\the-beach\fly.toml"  "$root\docker\beach.Dockerfile"
    Deploy 'y8-app'     "$root\y8-app\fly.toml"     "$root\docker\web.Dockerfile"
    Deploy 'y8-premier' "$root\y8-premier\fly.toml" "$root\docker\premier.Dockerfile"
  }
}

Write-Host ""
Write-Host "  Done. Check status: fly status --app <app-name>" -ForegroundColor Gray
Write-Host ""
