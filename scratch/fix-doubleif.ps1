$ErrorActionPreference = 'Stop'
$root = 'c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline'
Set-Location $root

$targets = @(
  'ru/duration/agecalculator.html',
  'ru/moretools/concretecalculator.html',
  'ru/moretools/trignometrycalculator.html'
)

foreach ($rel in $targets) {
  $path = Join-Path $root ($rel -replace '/', '\')
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
  $enc = New-Object System.Text.UTF8Encoding($hasBom)
  $text = [System.IO.File]::ReadAllText($path, $enc)
  $orig = $text
  $text = $text -replace 'if if \(pref', 'if (pref'
  if ($text -cne $orig) {
    [System.IO.File]::WriteAllText($path, $text, $enc)
    Write-Output ("FIXED: " + $rel)
  } else {
    Write-Output ("NO CHANGE: " + $rel)
  }
}
