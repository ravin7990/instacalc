$ErrorActionPreference = 'Stop'
$root = 'c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline'
Set-Location $root

$bugs = @()
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch '\\scratch' } | ForEach-Object {
  $rel = $_.FullName.Substring($root.Length + 1).Replace('\','/')
  $dir = if ($rel.Contains('/')) { $rel.Substring(0, $rel.LastIndexOf('/')) } else { '' }
  $c = [System.IO.File]::ReadAllText($_.FullName)
  $ms = [regex]::Matches($c, "location\.replace\(['`"]([^'`"]+)['`"]\)")
  foreach ($m in $ms) {
    $t = $m.Groups[1].Value
    if ($t -match '^\.\./([a-z]{2})/') {
      $targetLang = $Matches[1]
      $pageLang = if ($dir -match '^(ja|ru|ko)(/|$)') { $Matches[1] } else { '' }
      if ($targetLang -eq $pageLang -and $pageLang -ne '') {
        $bugs += ($rel + '  ->  ' + $t)
      }
    }
  }
}

if ($bugs.Count -eq 0) { Write-Output 'no self-redirect bugs found' }
else { $bugs | Sort-Object -Unique | ForEach-Object { Write-Output $_ } }
