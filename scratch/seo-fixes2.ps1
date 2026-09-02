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

$stats = @{ fontPreload = 0; files = 0 }

Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
  $path = $_.FullName
  if ($path -like '*\scratch\*') { return }
  $pair = Read-TextUtf8 $path
  $text = $pair[0]; $enc = $pair[1]
  $orig = $text

  # noscript regions to protect (fallback links must remain real stylesheets)
  $nsMatches = [regex]::Matches($text, '(?s)<noscript>.*?</noscript>')
  $nsRanges = @($nsMatches | ForEach-Object { @($_.Index, $_.Index + $_.Length) })

  $text = [regex]::Replace($text, '<link rel="stylesheet" href="(https://fonts\.googleapis\.com/css2\?[^"]*)">', {
    param($m)
    foreach ($r in $nsRanges) {
      if ($m.Index -ge $r[0] -and $m.Index -lt $r[1]) { return $m.Value }
    }
    $stats.fontPreload++
    $u = $m.Groups[1].Value
    "  <link rel=`"preload`" as=`"style`" href=`"$u`" onload=`"this.onload=null;this.rel='stylesheet'`">`r`n  <noscript><link rel=`"stylesheet`" href=`"$u`"></noscript>"
  })

  if ($text -cne $orig) {
    [System.IO.File]::WriteAllText($path, $text, $enc)
    $stats.files++
  }
}

Write-Output ("FILES CHANGED: " + $stats.files)
Write-Output ("font preloads added: " + $stats.fontPreload)

# ---- Re-add root homepage URL lost by the pass-1 loc regex ----
$smPath = Join-Path $root 'sitemap.xml'
$sm = [System.IO.File]::ReadAllText($smPath)
if ($sm -notmatch '<loc>https://instacalc\.in/</loc>') {
  $today = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd')
  $block = "<url>`r`n<loc>https://instacalc.in/</loc>`r`n<lastmod>$today</lastmod>`r`n</url>`r`n"
  $sm = $sm -replace '(<urlset[^>]*>\r?\n)', ('$1' + $block)
  [System.IO.File]::WriteAllText($smPath, $sm, (New-Object System.Text.UTF8Encoding($false)))
  Write-Output 'root URL re-added to sitemap'
} else {
  Write-Output 'root URL already present'
}
