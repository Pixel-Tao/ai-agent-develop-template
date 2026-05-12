<#
.SYNOPSIS
Replaces {{VARIABLE}} placeholders in copied template files.

.DESCRIPTION
This script applies flat key/value variables to Markdown and YAML template
files without requiring external dependencies. It is intended to be run after
copying one template into a real project.

.EXAMPLE
powershell -ExecutionPolicy Bypass -File scripts/replace-template-variables.ps1 `
  -RootPath . `
  -VariablesFile scripts/template-variables.example.yaml `
  -DryRun

.EXAMPLE
powershell -ExecutionPolicy Bypass -File scripts/replace-template-variables.ps1 `
  -RootPath . `
  -VariablesFile .\my-project.variables.yaml `
  -Apply `
  -Set PROJECT_STATUS=active `
  -Backup
#>

[CmdletBinding()]
param(
    [string]$RootPath = ".",

    [string]$VariablesFile,

    [string[]]$Set = @(),

    [switch]$DryRun,

    [switch]$Apply,

    [switch]$Backup,

    [switch]$FailOnUnresolved,

    [string[]]$Include = @("*.md", "*.yaml", "*.yml", "*.template", "*.gitkeep", "gitignore.template"),

    [string[]]$ExcludeDirectory = @(".git", "node_modules", ".venv", "venv", "dist", "build", "coverage")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($DryRun -and $Apply) {
    throw "Use either -DryRun or -Apply, not both."
}

$IsDryRun = -not $Apply

$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$Variables = [System.Collections.Generic.Dictionary[string, string]]::new([System.StringComparer]::Ordinal)
$PlaceholderPattern = [regex]"\{\{([A-Za-z0-9_-]+)\}\}"

function Resolve-RootPath {
    param([string]$Path)

    $resolved = Resolve-Path -LiteralPath $Path -ErrorAction Stop
    return $resolved.ProviderPath
}

function Normalize-VariableName {
    param([string]$Name)

    $key = $Name.Trim()
    if ($key.StartsWith("{{") -and $key.EndsWith("}}")) {
        $key = $key.Substring(2, $key.Length - 4)
    }
    $key = $key.Trim()

    if ($key -notmatch "^[A-Za-z0-9_-]+$") {
        throw "Invalid variable name '$Name'. Use letters, numbers, underscore, or hyphen."
    }

    return $key
}

function Set-TemplateVariable {
    param(
        [string]$Name,
        [string]$Value
    )

    $key = Normalize-VariableName $Name
    $Variables[$key] = $Value
}

function Unquote-Scalar {
    param([string]$Value)

    $v = $Value.Trim()
    if ($v.Length -ge 2 -and $v.StartsWith('"') -and $v.EndsWith('"')) {
        $inner = $v.Substring(1, $v.Length - 2)
        return $inner.Replace('\"', '"')
    }
    if ($v.Length -ge 2 -and $v.StartsWith("'") -and $v.EndsWith("'")) {
        return $v.Substring(1, $v.Length - 2).Replace("''", "'")
    }
    return $v
}

function Import-VariablesFile {
    param([string]$Path)

    $resolved = Resolve-Path -LiteralPath $Path -ErrorAction Stop
    $lines = [System.IO.File]::ReadAllLines($resolved.ProviderPath, $Utf8NoBom)

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line.Trim().Length -eq 0 -or $line.TrimStart().StartsWith("#")) {
            continue
        }

        if ($line -notmatch "^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)\s*$") {
            throw "Unsupported variables file syntax at $($resolved.ProviderPath):$($i + 1). Use flat 'KEY: value' pairs."
        }

        $name = $Matches[1]
        $value = Unquote-Scalar $Matches[2]
        Set-TemplateVariable -Name $name -Value $value
    }
}

function Import-SetArguments {
    param([string[]]$Items)

    foreach ($item in $Items) {
        $index = $item.IndexOf("=")
        if ($index -le 0) {
            throw "Invalid -Set value '$item'. Use KEY=VALUE."
        }

        $name = $item.Substring(0, $index)
        $value = $item.Substring($index + 1)
        Set-TemplateVariable -Name $name -Value $value
    }
}

function Test-IncludedFile {
    param([System.IO.FileInfo]$File)

    foreach ($pattern in $Include) {
        if ($File.Name -like $pattern) {
            return $true
        }
    }
    return $false
}

function Test-ExcludedPath {
    param(
        [System.IO.FileInfo]$File,
        [string]$Root
    )

    $relative = Get-RelativePath -Root $Root -Path $File.FullName
    $parts = $relative -split "[\\/]+"
    foreach ($part in $parts) {
        if ($ExcludeDirectory -contains $part) {
            return $true
        }
    }
    return $false
}

function Get-RelativePath {
    param(
        [string]$Root,
        [string]$Path
    )

    $rootPath = [System.IO.Path]::GetFullPath($Root)
    if (-not $rootPath.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
        $rootPath += [System.IO.Path]::DirectorySeparatorChar
    }

    $rootUri = [System.Uri]::new($rootPath)
    $pathUri = [System.Uri]::new([System.IO.Path]::GetFullPath($Path))
    $relativeUri = $rootUri.MakeRelativeUri($pathUri)
    return [System.Uri]::UnescapeDataString($relativeUri.ToString()).Replace("/", [System.IO.Path]::DirectorySeparatorChar)
}

function Format-ReplacementList {
    param([string[]]$Keys)

    if ($Keys.Count -eq 0) {
        return "-"
    }
    return (($Keys | Sort-Object -Unique) -join ", ")
}

$ResolvedRoot = Resolve-RootPath $RootPath

if ($VariablesFile) {
    Import-VariablesFile $VariablesFile
}

Import-SetArguments $Set

if ($Variables.Count -eq 0) {
    throw "No variables provided. Use -VariablesFile or -Set KEY=VALUE."
}

$files = Get-ChildItem -LiteralPath $ResolvedRoot -Recurse -File |
    Where-Object { Test-IncludedFile $_ } |
    Where-Object { -not (Test-ExcludedPath -File $_ -Root $ResolvedRoot) }

$changedFiles = 0
$changedPlaceholders = 0
$unresolved = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.HashSet[string]]]::new([System.StringComparer]::Ordinal)
$rows = @()

foreach ($file in $files) {
    $original = [System.IO.File]::ReadAllText($file.FullName, $Utf8NoBom)
    $usedKeys = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
    $missingKeys = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)

    $updated = $PlaceholderPattern.Replace($original, {
        param($match)

        $key = $match.Groups[1].Value
        if ($Variables.ContainsKey($key)) {
            [void]$usedKeys.Add($key)
            return $Variables[$key]
        }

        [void]$missingKeys.Add($key)
        return $match.Value
    })

    if ($missingKeys.Count -gt 0) {
        $relative = Get-RelativePath -Root $ResolvedRoot -Path $file.FullName
        $unresolved[$relative] = $missingKeys
    }

    if ($updated -ne $original) {
        $relative = Get-RelativePath -Root $ResolvedRoot -Path $file.FullName
        $changedFiles++
        $changedPlaceholders += $usedKeys.Count
        $rows += [pscustomobject]@{
            File = $relative
            Variables = Format-ReplacementList ([string[]]$usedKeys)
        }

        if (-not $IsDryRun) {
            if ($Backup) {
                [System.IO.File]::WriteAllText("$($file.FullName).bak", $original, $Utf8NoBom)
            }
            [System.IO.File]::WriteAllText($file.FullName, $updated, $Utf8NoBom)
        }
    }
}

if ($rows.Count -gt 0) {
    $rows | Sort-Object File | Format-Table -AutoSize
}

if ($unresolved.Count -gt 0) {
    Write-Host ""
    Write-Host "Unresolved placeholders:"
    foreach ($entry in ($unresolved.GetEnumerator() | Sort-Object Key)) {
        Write-Host ("- {0}: {1}" -f $entry.Key, (Format-ReplacementList ([string[]]$entry.Value)))
    }
}

Write-Host ""
Write-Host ("Mode: {0}" -f ($(if ($IsDryRun) { "DryRun" } else { "Write" })))
Write-Host ("Root: {0}" -f $ResolvedRoot)
Write-Host ("Files scanned: {0}" -f $files.Count)
Write-Host ("Files changed: {0}" -f $changedFiles)
Write-Host ("Variable keys loaded: {0}" -f $Variables.Count)

if ($FailOnUnresolved -and $unresolved.Count -gt 0) {
    throw "Unresolved placeholders remain. Provide more variables or remove -FailOnUnresolved."
}
