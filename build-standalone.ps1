# ============================================================================
#  build-standalone.ps1
#  Regenerates QuadVision.html — the single-file, double-click-to-open version
#  of the app — from the source files. It takes index.html and inlines
#  css/styles.css (into a <style> block) and every js/*.js file (into <script>
#  blocks), so the whole app travels as one portable HTML file with no separate
#  assets to load (except fonts + the photo-scanner library, which use a CDN).
#
#  Run it after ANY change to index.html, the CSS, or the JS:
#      powershell -ExecutionPolicy Bypass -File build-standalone.ps1
# ============================================================================

$ErrorActionPreference = 'Stop'

# Resolve paths relative to this script so it works from any working directory.
$root  = Split-Path -Parent $MyInvocation.MyCommand.Definition
$index = Join-Path $root 'index.html'
$out   = Join-Path $root 'QuadVision.html'

if (-not (Test-Path $index)) { throw "index.html not found at $index" }

# Read the page skeleton.
$html = Get-Content $index -Raw

# 1) Inline the stylesheet: swap the <link> for a <style> holding the CSS.
$cssPath = Join-Path $root 'css/styles.css'
$css = Get-Content $cssPath -Raw
$link = '<link rel="stylesheet" href="css/styles.css" />'
if (-not $html.Contains($link)) { throw 'Could not find the stylesheet link tag to inline.' }
$html = $html.Replace($link, "<style>`n$css`n</style>")
Write-Host "inlined css/styles.css"

# 2) Inline every external script: <script src="js/X.js"></script> -> <script>…</script>
#    We match the exact self-closing script tags and replace each with its file
#    contents, leaving any trailing HTML comments on the line untouched.
$pattern = '<script src="(js/[^"]+\.js)"></script>'
$found = [regex]::Matches($html, $pattern)
if ($found.Count -eq 0) { throw 'No external script tags (js/*.js) found to inline.' }

foreach ($m in $found) {
  $rel = $m.Groups[1].Value
  $jsPath = Join-Path $root $rel
  if (-not (Test-Path $jsPath)) { throw "Referenced script not found: $rel" }
  $js = Get-Content $jsPath -Raw
  $html = $html.Replace($m.Value, "<script>`n$js`n</script>")
  Write-Host "inlined $rel"
}

# 3) Write the bundle as UTF-8 WITHOUT a BOM (cleanest for browsers + diffs).
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($out, $html, $utf8NoBom)

$size = [math]::Round((Get-Item $out).Length / 1KB, 1)
Write-Host ""
Write-Host "Built QuadVision.html  ($size KB, $($found.Count) scripts inlined)" -ForegroundColor Green
