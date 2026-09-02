$ErrorActionPreference = 'Stop'
$root = 'c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline'
Set-Location $root

$targets = @(
  'ko/moretools/concretecalculator.html',
  'ko/moretools/trignometrycalculator.html',
  'ru/duration/agecalculator.html',
  'ru/moretools/concretecalculator.html',
  'ru/moretools/trignometrycalculator.html'
)

function Read-TextUtf8($path) {
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
  $enc = New-Object System.Text.UTF8Encoding($hasBom)
  $text = [System.IO.File]::ReadAllText($path, $enc)
  return @($text, $enc)
}

foreach ($rel in $targets) {
  $path = Join-Path $root ($rel -replace '/', '\')
  $pair = Read-TextUtf8 $path
  $text = $pair[0]; $enc = $pair[1]
  $lang = $rel.Split('/')[0]
  $orig = $text

  # Case 1: self-language branch is the FIRST if  ->  promote the next branch
  $pattern1 = "if \(pref === '$lang' \|\| \(!pref && browserLang\.startsWith\('$lang'\)\)\) \{\s*window\.location\.replace\('\.\./$lang/[^']+'\);\s*\}\s*else\s*(if)"
  $text = [regex]::Replace($text, $pattern1, 'if $1')

  # Case 2: self-language branch is a LATER else-if  ->  drop the whole block
  $pattern2 = "\}\s*else if \(pref === '$lang' \|\| \(!pref && browserLang\.startsWith\('$lang'\)\)\) \{\s*window\.location\.replace\('\.\./$lang/[^']+'\);\s*\}"
  $text = [regex]::Replace($text, $pattern2, '}')

  if ($text -cne $orig) {
    [System.IO.File]::WriteAllText($path, $text, $enc)
    Write-Output ("FIXED: " + $rel)
  } else {
    Write-Output ("NO CHANGE (pattern not found!): " + $rel)
  }
}
