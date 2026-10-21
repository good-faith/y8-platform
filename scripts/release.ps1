<#
.SYNOPSIS
  Semantic Versioning & Release Manager for the Y8 Platform Monorepo.
  Synchronizes versions across root, all 4 apps, and shared packages,
  commits the bump, creates an annotated git tag, and optionally pushes.

.EXAMPLE
  powershell -File scripts/release.ps1 -Bump dev -Push
  powershell -File scripts/release.ps1 -Bump rc -Push
  powershell -File scripts/release.ps1 -Bump patch -Push
  powershell -File scripts/release.ps1 -Version 0.1.0-dev.1 -NoGit
#>

param(
  [ValidateSet('dev', 'rc', 'patch', 'minor', 'major', '')]
  [string]$Bump = '',
  [string]$Version = '',
  [switch]$NoGit,
  [switch]$Push
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

$rootPkgPath = Join-Path $root 'package.json'
$rootPkg = Get-Content $rootPkgPath -Raw | ConvertFrom-Json
$current = $rootPkg.version

function Get-NextVersion([string]$cur, [string]$type) {
  if ($cur -match '^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z]+)\.(\d+))?$') {
    $maj = [int]$Matches[1]
    $min = [int]$Matches[2]
    $pat = [int]$Matches[3]
    $preTag = $Matches[4]
    $preNum = if ($Matches[5]) { [int]$Matches[5] } else { 0 }

    switch ($type) {
      'dev' {
        if ($preTag -eq 'dev') { return "$maj.$min.$pat-dev.$($preNum + 1)" }
        elseif ($preTag)       { return "$maj.$min.$pat-dev.1" }
        else                   { return "$maj.$min.$($pat + 1)-dev.1" }
      }
      'rc' {
        if ($preTag -eq 'rc')  { return "$maj.$min.$pat-rc.$($preNum + 1)" }
        elseif ($preTag)       { return "$maj.$min.$pat-rc.1" }
        else                   { return "$maj.$min.$($pat + 1)-rc.1" }
      }
      'patch' {
        if ($preTag) { return "$maj.$min.$pat" }
        return "$maj.$min.$($pat + 1)"
      }
      'minor' { return "$maj.$($min + 1).0" }
      'major' { return "$($maj + 1).0.0" }
    }
  }
  throw "Invalid current version format: $cur"
}

$targetVersion = if ($Version) { $Version } elseif ($Bump) { Get-NextVersion $current $Bump } else { throw "Provide -Bump (dev|rc|patch|minor|major) or -Version <semver>" }

Write-Host "Synchronizing Y8 Platform version: $current -> $targetVersion" -ForegroundColor Cyan

$pkgFiles = @(
  'package.json',
  'y8-app/package.json',
  'y8-premier/package.json',
  'y8-server/package.json',
  'the-beach/package.json',
  'packages/api-client/package.json',
  'packages/auth/package.json',
  'packages/contracts/package.json',
  'packages/types/package.json'
)

foreach ($rel in $pkgFiles) {
  $full = Join-Path $root $rel
  if (Test-Path $full) {
    $content = Get-Content $full -Raw
    $updated = [regex]::Replace($content, '("version"\s*:\s*)"[^"]+"', "`${1}`"$targetVersion`"", 1)
    [System.IO.File]::WriteAllText($full, $updated, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "  Updated $rel -> $targetVersion" -ForegroundColor Green
  }
}

if (-not $NoGit) {
  git -C $root add $pkgFiles
  git -C $root commit -m "chore(release): v$targetVersion"
  git -C $root tag -a "v$targetVersion" -m "Release v$targetVersion"
  Write-Host "Created commit and tag v$targetVersion" -ForegroundColor Cyan

  if ($Push) {
    $branch = (git -C $root rev-parse --abbrev-ref HEAD).Trim()
    git -C $root push origin $branch
    git -C $root push origin "v$targetVersion"
    Write-Host "Pushed $branch and tag v$targetVersion to origin" -ForegroundColor Green
  }
}
