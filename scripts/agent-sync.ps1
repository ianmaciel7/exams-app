<#
.SYNOPSIS
    Universal Agent Sync CLI for Windows (Native PowerShell)
    Synchronizes skills, plugins, and MCP servers across OpenAI Codex, Claude Code, and Antigravity.
    Zero external dependencies. No Python, Node, or compilers required.
    Safe for public GitHub Gist (zero hardcoded secrets).

.EXAMPLE
    .\agent-sync.ps1 scan
    .\agent-sync.ps1 sync -DryRun
    .\agent-sync.ps1 sync
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0, Mandatory = $true)]
    [ValidateSet("scan", "sync", "help")]
    [string]$Command,

    [Parameter()]
    [string]$PluginName = "codex-migrated",

    [Parameter()]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Get-UserHome {
    if ($env:USERPROFILE) { return $env:USERPROFILE }
    return [Environment]::GetFolderPath("UserProfile")
}

$HomeDir = Get-UserHome
$CodexDir = Join-Path $HomeDir ".codex"
$CodexConfig = Join-Path $CodexDir "config.toml"
$CodexSkillsDir = Join-Path $CodexDir "skills"
$CodexCacheDir = Join-Path $CodexDir "plugins\cache"

$ClaudeDir = Join-Path $HomeDir ".claude"
$ClaudeConfig = Join-Path $HomeDir ".claude.json"
$ClaudeSkillsDir = Join-Path $ClaudeDir "skills"

$AntigravityPluginsDir = Join-Path $HomeDir ".gemini\config\plugins"
$AgentsSkillsDir = Join-Path $HomeDir ".agents\skills"

# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------
function Parse-CodexMcp([string]$tomlPath) {
    $servers = @{}
    if (-not (Test-Path $tomlPath)) { return $servers }

    $lines = Get-Content $tomlPath -Encoding UTF8
    $currentServer = $null
    $inSubtable = $null

    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith("#")) { continue }

        if ($trimmed -match '^\[mcp_servers\.([^\]]+)\]$') {
            $parts = $matches[1].Split(".")
            $currentServer = $parts[0]
            $inSubtable = if ($parts.Length -gt 1) { $parts[1] } else { $null }

            if (-not $servers.ContainsKey($currentServer)) {
                $servers[$currentServer] = @{ env = @{} }
            }
            continue
        }

        if ($trimmed.StartsWith("[") -and -not $trimmed.StartsWith("[mcp_servers.")) {
            $currentServer = $null
            $inSubtable = $null
            continue
        }

        if ($currentServer -and ($trimmed -match '^([a-zA-Z0-9_\-]+)\s*=\s*(.*)$')) {
            $key = $matches[1]
            $val = $matches[2].Trim()

            if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
                $val = $val.Substring(1, $val.Length - 2)
            } elseif ($val.StartsWith("[") -and $val.EndsWith("]")) {
                $inner = $val.Substring(1, $val.Length - 2)
                $val = @($inner.Split(",") | ForEach-Object { $_.Trim().Trim('"').Trim("'") } | Where-Object { $_ })
            }

            if ($inSubtable -eq "env") {
                if ($key -match '(?i)(token|key|secret|auth|password)') {
                    $val = "`${$key}"
                }
                $servers[$currentServer]["env"][$key] = $val
            } else {
                $servers[$currentServer][$key] = $val
            }
        }
    }

    # Filter valid servers
    $filtered = @{}
    foreach ($k in $servers.Keys) {
        $entry = $servers[$k]
        if ($entry.ContainsKey("command") -or $entry.ContainsKey("url")) {
            $filtered[$k] = $entry
        }
    }
    return $filtered
}

function Discover-CodexSkills {
    $skills = @{}
    if (Test-Path $CodexSkillsDir) {
        Get-ChildItem -Path $CodexSkillsDir -Directory | ForEach-Object {
            if (Test-Path (Join-Path $_.FullName "SKILL.md")) {
                $skills[$_.Name] = $_.FullName
            }
        }
    }
    if (Test-Path $CodexCacheDir) {
        Get-ChildItem -Path $CodexCacheDir -Recurse -Filter "SKILL.md" -File | ForEach-Object {
            $parent = $_.Directory
            if (-not $skills.ContainsKey($parent.Name) -and -not $parent.Name.StartsWith(".")) {
                $skills[$parent.Name] = $parent.FullName
            }
        }
    }
    return $skills
}

function Discover-ClaudeSkills {
    $skills = @{}
    if (Test-Path $ClaudeSkillsDir) {
        Get-ChildItem -Path $ClaudeSkillsDir -Directory | ForEach-Object {
            if (Test-Path (Join-Path $_.FullName "SKILL.md")) {
                $skills[$_.Name] = $_.FullName
            }
        }
    }
    return $skills
}

# ------------------------------------------------------------------------------
# Actions
# ------------------------------------------------------------------------------
function Do-Scan {
    Write-Host "`n=== AGENT ECOSYSTEM SCAN (Windows Native) ===" -ForegroundColor Cyan

    $codexSkills = Discover-CodexSkills
    $codexMcp = Parse-CodexMcp $CodexConfig
    Write-Host "`nOpenAI Codex: $($codexSkills.Count) skills | $($codexMcp.Count) MCP servers" -ForegroundColor White
    $codexSkills.Keys | Sort-Object | ForEach-Object { Write-Host "  - Skill: $_" -ForegroundColor Green }
    $codexMcp.Keys | Sort-Object | ForEach-Object { Write-Host "  - MCP:   $_" -ForegroundColor Yellow }

    $claudeSkills = Discover-ClaudeSkills
    $claudeMcp = @{}
    if (Test-Path $ClaudeConfig) {
        try {
            $claudeJson = Get-Content $ClaudeConfig -Raw -Encoding UTF8 | ConvertFrom-Json
            if ($claudeJson.mcpServers) {
                $claudeMcp = $claudeJson.mcpServers
            }
        } catch {}
    }
    Write-Host "`nAnthropic Claude Code: $($claudeSkills.Count) skills" -ForegroundColor White
    $claudeSkills.Keys | Sort-Object | ForEach-Object { Write-Host "  - Skill: $_" -ForegroundColor Green }

    Write-Host "`nScan complete.`n" -ForegroundColor Cyan
}

function Do-Sync {
    $prefix = if ($DryRun) { "[DRY-RUN] " } else { "" }
    Write-Host "`n=== ${prefix}SYNCING CODEX TO ANTIGRAVITY & CLAUDE ===" -ForegroundColor Cyan

    $codexSkills = Discover-CodexSkills
    $codexMcp = Parse-CodexMcp $CodexConfig
    Write-Host "Found $($codexSkills.Count) skills and $($codexMcp.Count) MCP servers in Codex."

    # 1. Target Antigravity
    $targetPlugin = Join-Path $AntigravityPluginsDir $PluginName
    $targetSkills = Join-Path $targetPlugin "skills"
    Write-Host "`nTarget Antigravity: $targetPlugin" -ForegroundColor White

    if (-not $DryRun) {
        New-Item -ItemType Directory -Path $targetSkills -Force | Out-Null
        $pluginManifest = @{
            name = $PluginName
            displayName = "Migrated Agent Settings"
            version = "1.0.0"
            description = "Unified skills and MCP servers synchronized across coding agents."
        }
        $pluginManifest | ConvertTo-Json -Depth 3 | Set-Content (Join-Path $targetPlugin "plugin.json") -Encoding UTF8

        $mcpManifest = @{ mcpServers = $codexMcp }
        $mcpManifest | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $targetPlugin "mcp_config.json") -Encoding UTF8
    }

    foreach ($name in $codexSkills.Keys) {
        $dest = Join-Path $targetSkills $name
        if (-not $DryRun) {
            Copy-Item -Path $codexSkills[$name] -Destination $dest -Recurse -Force
        }
        Write-Host "  + Synced to Antigravity: $name" -ForegroundColor Green
    }

    # 2. Target Claude Code
    Write-Host "`nTarget Claude Code: $ClaudeSkillsDir" -ForegroundColor White
    if (-not $DryRun) {
        New-Item -ItemType Directory -Path $ClaudeSkillsDir -Force | Out-Null
    }

    foreach ($name in $codexSkills.Keys) {
        $dest = Join-Path $ClaudeSkillsDir $name
        if (-not $DryRun) {
            Copy-Item -Path $codexSkills[$name] -Destination $dest -Recurse -Force
        }
        Write-Host "  + Synced to Claude Code: $name" -ForegroundColor Green
    }

    Write-Host "`n=== ${prefix}SYNC COMPLETED SUCCESSFULLY ===`n" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# Entrypoint
# ------------------------------------------------------------------------------
switch ($Command) {
    "scan" { Do-Scan }
    "sync" { Do-Sync }
    default {
        Write-Host "Usage: .\agent-sync.ps1 [scan|sync] [-DryRun] [-PluginName <name>]"
    }
}
