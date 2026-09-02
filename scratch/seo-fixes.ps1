$ErrorActionPreference = 'Stop'
$root = 'c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline'
Set-Location $root

function Read-TextUtf8($path) {
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
  $enc = New-Object System.Text.UTF8Encoding($hasBom)
  $text = [System.IO.File]::ReadAllText($path, $enc)
  return @($text, $enc)
}

$stats = @{ fontPreload = 0; faPreload = 0; deferScripts = 0; imgDims = 0; imgLazy = 0; files = 0 }

Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
  $path = $_.FullName
  if ($path -like '*\scratch\*') { return }
  $pair = Read-TextUtf8 $path
  $text = $pair[0]; $enc = $pair[1]
  $orig = $text

  # 1. Google Fonts render-blocking link -> preload + noscript pattern
  $text = [regex]::Replace($text, '(?s)<link\s+href="(https://fonts\.googleapis\.com/css2\?[^"]*display=swap)"\s+rel="stylesheet">', {
    param($m)
    $stats.fontPreload++
    $u = $m.Groups[1].Value
    "  <link rel=`"preload`" as=`"style`" href=`"$u`" onload=`"this.onload=null;this.rel='stylesheet'`">`r`n  <noscript><link rel=`"stylesheet`" href=`"$u`"></noscript>"
  })

  # 2. Font Awesome render-blocking link -> preload + noscript pattern
  $fa = 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css'
  $text = [regex]::Replace($text, ('<link rel="stylesheet" href="' + [regex]::Escape($fa) + '">'), {
    param($m)
    $stats.faPreload++
    "  <link rel=`"preload`" as=`"style`" href=`"$fa`" onload=`"this.onload=null;this.rel='stylesheet'`">`r`n  <noscript><link rel=`"stylesheet`" href=`"$fa`"></noscript>"
  })

  # 3. Defer chart.js / currency-manager.js when loaded synchronously
  $text = [regex]::Replace($text, '<script src="([^"]*(?:currency-manager|chart)\.js)"></script>', {
    param($m)
    $stats.deferScripts++
    "<script src=`"$($m.Groups[1].Value)`" defer></script>"
  })

  # 4. Brand logos missing dimensions -> intrinsic 42x42 (CSS controls display size)
  $text = [regex]::Replace($text, '(<img\s+src="(?:\.\./)*logo\.png"\s+alt="[^"]*")(?![^>]*width=)', {
    param($m)
    $stats.imgDims++
    $m.Groups[1].Value + ' width="42" height="42"'
  })

  # 5. Founder/author avatars missing dimensions -> 100x100 + lazy
  $text = [regex]::Replace($text, '(<img\s+(?:class="founder-avatar"\s+)?src="(?:\.\./)*author\.png"\s+alt="[^"]*")(?![^>]*width=)', {
    param($m)
    $stats.imgDims++
    $m.Groups[1].Value + ' width="100" height="100" loading="lazy" decoding="async"'
  })

  # 6. Generic lazy-loading on imgs lacking it (brand logos stay eager)
  $text = [regex]::Replace($text, '(?s)<img[^>]*>', {
    param($m)
    $tag = $m.Value
    if ($tag -match 'loading=') { return $tag }
    if ($tag -match 'src="[^"]*logo\.png') { return $tag }
    if ($tag -match 'src="[^"]*favicon') { return $tag }
    $stats.imgLazy++
    if ($tag -match '/>\s*$') {
      return ($tag -replace '/>\s*$', ' loading="lazy" decoding="async"/>')
    }
    return ($tag -replace '>\s*$', ' loading="lazy" decoding="async">')
  })

  if ($text -cne $orig) {
    [System.IO.File]::WriteAllText($path, $text, $enc)
    $stats.files++
  }
}

Write-Output ("FILES CHANGED: " + $stats.files)
Write-Output ("font preloads added: " + $stats.fontPreload)
Write-Output ("fontawesome preloads added: " + $stats.faPreload)
Write-Output ("scripts deferred: " + $stats.deferScripts)
Write-Output ("img dimensions added: " + $stats.imgDims)
Write-Output ("img lazy added: " + $stats.imgLazy)

# ---- Sitemap: real per-file lastmod, drop priority ----
$smPath = Join-Path $root 'sitemap.xml'
$sm = [System.IO.File]::ReadAllText($smPath)
$locs = [regex]::Matches($sm, '<loc>(https://instacalc\.in/[^<]+)</loc>') | ForEach-Object { $_.Groups[1].Value }
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
$written = 0
foreach ($u in $locs) {
  $rel = $u.Substring(21)
  if ($rel -eq '') {
    $file = Join-Path $root 'index.html'
  } else {
    $file = Join-Path $root ($rel -replace '/$', '\index.html')
  }
  if (-not (Test-Path $file)) { Write-Output ("SKIP (no file): " + $u); continue }
  $lm = (Get-Item $file).LastWriteTimeUtc.ToString('yyyy-MM-dd')
  [void]$sb.AppendLine('<url>')
  [void]$sb.AppendLine("<loc>$u</loc>")
  [void]$sb.AppendLine("<lastmod>$lm</lastmod>")
  [void]$sb.AppendLine('</url>')
  $written++
}
[void]$sb.AppendLine('</urlset>')
[System.IO.File]::WriteAllText($smPath, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
Write-Output ("sitemap URLs written: " + $written)
