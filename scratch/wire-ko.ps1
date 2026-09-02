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

# 1. Repoint all Korean links to local Korean pages
$pairs = @(
  @('ko/index.html',        'href="../aboutus.html"',     'href="aboutus.html"'),
  @('ko/index.html',        'href="../contactus.html"',   'href="contactus.html"'),
  @('ko/index.html',        'href="../privacypolicy.html"','href="privacypolicy.html"'),
  @('ko/index.html',        'href="../terms.html"',       'href="terms.html"'),
  @('ko/moretools/concretecalculator.html',       'href="../../aboutus.html"',      'href="../aboutus.html"'),
  @('ko/moretools/concretecalculator.html',       'href="../../contactus.html"',    'href="../contactus.html"'),
  @('ko/moretools/concretecalculator.html',       'href="../../privacypolicy.html"','href="../privacypolicy.html"'),
  @('ko/moretools/diagonalcalculator.html',       'href="../../aboutus.html"',      'href="../aboutus.html"'),
  @('ko/moretools/diagonalcalculator.html',       'href="../../contactus.html"',    'href="../contactus.html"'),
  @('ko/moretools/diagonalcalculator.html',       'href="../../privacypolicy.html"','href="../privacypolicy.html"'),
  @('ko/moretools/trignometrycalculator.html',    'href="../../aboutus.html"',      'href="../aboutus.html"'),
  @('ko/moretools/trignometrycalculator.html',    'href="../../contactus.html"',    'href="../contactus.html"'),
  @('ko/moretools/trignometrycalculator.html',    'href="../../privacypolicy.html"','href="../privacypolicy.html"')
)

foreach ($p in $pairs) {
  $path = Join-Path $root ($p[0] -replace '/', '\')
  $pair = Read-TextUtf8 $path
  $text = $pair[0]; $enc = $pair[1]
  if ($text -match [regex]::Escape($p[1])) {
    $text = $text -replace [regex]::Escape($p[1]), $p[2]
    [System.IO.File]::WriteAllText($path, $text, $enc)
    Write-Output ("LINK FIXED: " + $p[0] + ' :: ' + $p[1] + ' -> ' + $p[2])
  }
}

# 2. Add reciprocal ko hreflang to English pages
$enHreflang = @(
  @('terms.html', '<link rel="alternate" hreflang="en" href="https://instacalc.in/terms.html">',
                  '<link rel="alternate" hreflang="ko" href="https://instacalc.in/ko/terms.html">'),
  @('aboutus.html', '<link rel="alternate" hreflang="en" href="https://instacalc.in/aboutus.html">',
                  '<link rel="alternate" hreflang="ko" href="https://instacalc.in/ko/aboutus.html">'),
  @('contactus.html', '<link rel="alternate" hreflang="en" href="https://instacalc.in/contactus.html">',
                  '<link rel="alternate" hreflang="ko" href="https://instacalc.in/ko/contactus.html">'),
  @('privacypolicy.html', '<link rel="alternate" hreflang="en" href="https://instacalc.in/privacypolicy.html">',
                  '<link rel="alternate" hreflang="ko" href="https://instacalc.in/ko/privacypolicy.html">')
)

foreach ($p in $enHreflang) {
  $path = Join-Path $root ($p[0] -replace '/', '\')
  $pair = Read-TextUtf8 $path
  $text = $pair[0]; $enc = $pair[1]
  if ($text -match [regex]::Escape($p[1]) -and $text -notmatch [regex]::Escape('<link rel="alternate" hreflang="ko"')) {
    $text = $text -replace [regex]::Escape($p[1]), ($p[1] + "`r`n  " + $p[2])
    [System.IO.File]::WriteAllText($path, $text, $enc)
    Write-Output ("HREFLANG ADDED: " + $p[0])
  }
}

# 3. Add 4 new Korean pages to sitemap
$smPath = Join-Path $root 'sitemap.xml'
$sm = [System.IO.File]::ReadAllText($smPath)
$newUrls = @(
  'https://instacalc.in/ko/aboutus.html',
  'https://instacalc.in/ko/contactus.html',
  'https://instacalc.in/ko/privacypolicy.html',
  'https://instacalc.in/ko/terms.html'
)
$now = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd')
foreach ($u in $newUrls) {
  if ($sm -notmatch [regex]::Escape($u)) {
    $block = "<url>`r`n<loc>$u</loc>`r`n<lastmod>$now</lastmod>`r`n</url>`r`n"
    $sm = $sm -replace '(</urlset>)', ($block + '$1')
    Write-Output ("SITEMAP ADDED: " + $u)
  } else {
    Write-Output ("SITEMAP already present: " + $u)
  }
}
[System.IO.File]::WriteAllText($smPath, $sm, (New-Object System.Text.UTF8Encoding($false)))
Write-Output "sitemap updated"