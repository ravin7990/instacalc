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

foreach ($rel in @('ko/aboutus.html', 'ko/contactus.html')) {
  $path = Join-Path $root ($rel -replace '/', '\')
  $pair = Read-TextUtf8 $path
  $text = $pair[0]; $enc = $pair[1]

  $text = [regex]::Replace($text, '(?s)(<div class="hero-copy">).*?(?=<div class="hero-actions">)', '$1<!--HEROCOPY-->')
  $text = [regex]::Replace($text, '(?s)(<aside class="hero-panel">\s*<h2>).*?(</h2>)', '$1<!--HEROPANELH2-->$2')
  $text = [regex]::Replace($text, '(?s)(<aside class="hero-panel">[\s\S]*?<ul>).*?(</ul>)', '$1<!--HEROPANELLIST-->$2')
  $text = [regex]::Replace($text, '(?s)(<article class="policy-card policy-stack">).*?(</article>)', '$1<!--ARTICLE-->$2')
  $text = [regex]::Replace($text, '(?s)(<aside class="policy-stack">).*?(</aside>)', '$1<!--ASIDE-->$2')

  [System.IO.File]::WriteAllText($path, $text, $enc)
  $count = ([regex]::Matches($text, 'HEROCOPY|HEROPANELH2|HEROPANELLIST|ARTICLE--|ASIDE--')).Count
  Write-Output ($rel + ' placeholders: ' + $count)
}
