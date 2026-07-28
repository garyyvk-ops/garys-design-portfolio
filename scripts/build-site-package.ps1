param()

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$templatePath = Join-Path $root 'server\worker.template.js'
$distServerDir = Join-Path $root 'dist\server'
$stageRoot = Join-Path $root '.site-package-stage'
$stageDist = Join-Path $stageRoot 'dist'
$stageServerDir = Join-Path $stageDist 'server'
$hostingSource = Join-Path $root '.openai\hosting.json'
$hostingTarget = Join-Path $stageDist '.openai\hosting.json'

function Get-Base64([string]$path) {
  $bytes = [System.IO.File]::ReadAllBytes($path)
  [Convert]::ToBase64String($bytes)
}

function Get-ContentType([string]$path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    '.html' { 'text/html; charset=utf-8' }
    '.js' { 'application/javascript; charset=utf-8' }
    '.css' { 'text/css; charset=utf-8' }
    '.json' { 'application/json; charset=utf-8' }
    '.jpg' { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.png' { 'image/png' }
    '.webp' { 'image/webp' }
    default { 'text/plain; charset=utf-8' }
  }
}

function Get-SanitizedHtml([string]$path) {
  $raw = [System.IO.File]::ReadAllText($path)
  $clean = [System.Text.RegularExpressions.Regex]::Replace(
    $raw,
    '<!--\s*\(function \(\) \{[\s\S]*?\}\)\(\);\s*-->',
    '',
    [System.Text.RegularExpressions.RegexOptions]::Singleline
  )
  $assetBytes = [System.IO.File]::ReadAllBytes((Join-Path $root 'assets\portfolio-app.js'))
  $hasher = [System.Security.Cryptography.SHA256]::Create()
  try {
    $hashBytes = $hasher.ComputeHash($assetBytes)
  } finally {
    $hasher.Dispose()
  }
  $hash = ([System.BitConverter]::ToString($hashBytes)).Replace('-', '').ToLowerInvariant().Substring(0, 12)
  $clean -replace 'assets/portfolio-app\.js(?:\?[^"]*)?', "assets/portfolio-app.js?v=$hash"
}

$routes = [ordered]@{}

$htmlFiles = @(
  @{ Route = '/'; Path = (Join-Path $root 'index.html') },
  @{ Route = '/index.html'; Path = (Join-Path $root 'index.html') },
  @{ Route = '/studio.html'; Path = (Join-Path $root 'studio.html') },
  @{ Route = '/instructional-design-portfolio.html'; Path = (Join-Path $root 'instructional-design-portfolio.html') }
)

foreach ($entry in $htmlFiles) {
  $temp = [System.IO.Path]::GetTempFileName()
  try {
    [System.IO.File]::WriteAllText($temp, (Get-SanitizedHtml $entry.Path), [System.Text.Encoding]::UTF8)
    $routes[$entry.Route] = @{
      contentType = 'text/html; charset=utf-8'
      body = Get-Base64 $temp
    }
  } finally {
    Remove-Item $temp -ErrorAction SilentlyContinue
  }
}

$assetFiles = @(
  @{ Route = '/assets/portfolio-app.js'; Path = (Join-Path $root 'assets\portfolio-app.js') },
  @{ Route = '/assets/portfolio/site-classroom-bg.jpg'; Path = (Join-Path $root 'assets\portfolio\site-classroom-bg.jpg') }
)

foreach ($entry in $assetFiles) {
  $routes[$entry.Route] = @{
    contentType = Get-ContentType $entry.Path
    body = Get-Base64 $entry.Path
  }
}

$routesJson = $routes | ConvertTo-Json -Depth 6 -Compress
$template = Get-Content -Raw $templatePath
$worker = $template.Replace('__STATIC_ROUTES__', $routesJson)

New-Item -ItemType Directory -Force -Path $distServerDir, $stageServerDir, (Split-Path -Parent $hostingTarget) | Out-Null
[System.IO.File]::WriteAllText((Join-Path $distServerDir 'index.js'), $worker, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText((Join-Path $stageServerDir 'index.js'), $worker, [System.Text.Encoding]::UTF8)
Copy-Item $hostingSource $hostingTarget -Force
