# ==============================================================================
# One-Line Installer for Windows (PowerShell)
# Installs agent-sync to %USERPROFILE%\.local\bin and adds it to User PATH.
# Usage:
#   powershell -ExecutionPolicy Bypass -c "irm https://<url>/install.ps1 | iex"
# ==============================================================================

$ErrorActionPreference = "Stop"

$InstallDir = Join-Path $env:USERPROFILE ".local\bin"
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

$ScriptPath = Join-Path $InstallDir "agent-sync.ps1"
$CmdPath = Join-Path $InstallDir "agent-sync.cmd"

Write-Host "Installing agent-sync to $InstallDir..." -ForegroundColor Cyan

# If running locally from repo, copy; if from web, download from GIST_RAW_URL
$LocalScript = Join-Path $PSScriptRoot "agent-sync.ps1"
if (Test-Path $LocalScript) {
    Copy-Item -Path $LocalScript -Destination $ScriptPath -Force
} else {
    # Fallback/default raw URL placeholder (user replaces with their Gist URL)
    $SourceUrl = "https://gist.githubusercontent.com/raw/agent-sync.ps1"
    Invoke-RestMethod -Uri $SourceUrl -OutFile $ScriptPath
}

# Create Windows CMD launcher so user can type just 'agent-sync' anywhere
$CmdLauncher = "@echo off`r`npowershell -NoProfile -ExecutionPolicy Bypass -File `"%~dp0agent-sync.ps1`" %*`r`n"
Set-Content -Path $CmdPath -Value $CmdLauncher -Encoding Ascii

# ------------------------------------------------------------------------------
# Add to User PATH permanently (Registry)
# ------------------------------------------------------------------------------
$UserPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::User)
if ($UserPath -notlike "*$InstallDir*") {
    $NewPath = if ($UserPath) { "$UserPath;$InstallDir" } else { $InstallDir }
    [Environment]::SetEnvironmentVariable("PATH", $NewPath, [EnvironmentVariableTarget]::User)
    Write-Host "Added $InstallDir to User PATH permanently." -ForegroundColor Green
} else {
    Write-Host "$InstallDir is already in your PATH." -ForegroundColor Yellow
}

# Update current session PATH
$env:PATH = "$env:PATH;$InstallDir"

Write-Host "`nInstallation complete! You can now run 'agent-sync scan' or 'agent-sync sync' in any terminal." -ForegroundColor Green
