$ErrorActionPreference = 'Stop'
$root = 'c:\Users\ravin\Videos\instacalc-main-2026\instacalc-main - omni - Cline'
Set-Location $root

$labels = [System.IO.File]::ReadAllText((Join-Path $root 'scratch\nav-labels.json'), (New-Object System.Text.UTF8Encoding($false))) | ConvertFrom-Json

function Read-TextUtf8($path) {
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
  $enc = New-Object System.Text.UTF8Encoding($hasBom)
  $text = [System.IO.File]::ReadAllText($path, $enc)
  return @($text, $enc)
}

# Determine language + link targets per folder context
# targets = array of 4 hrefs: Home, About, Contact, Privacy
function Get-NavConfig($relPath) {
  $p = $relPath -replace '\\','/'
  $parts = $p.Split('/')
  $name = $parts[-1]
  $dir = if ($parts.Count -eq 1) { '' } else { $parts[0..($parts.Count-2)] -join '/' }

  $l = $null; $targets = $null
  switch -Regex ($dir) {
    '^$'                  { $l = 'en'; $targets = @('index.html','aboutus.html','contactus.html','privacypolicy.html') }
    '^us$'                { $l = 'en'; $targets = @('index.html','../aboutus.html','../contactus.html','../privacypolicy.html') }
    '^(duration|moretools)$' { $l = 'en'; $targets = @('../index.html','../aboutus.html','../contactus.html','../privacypolicy.html') }
    '^ja$'                { $l = 'ja'; $targets = @('index.html','aboutus.html','contactus.html','privacypolicy.html') }
    '^ja/(duration|moretools)$' { $l = 'ja'; $targets = @('../index.html','../aboutus.html','../contactus.html','../privacypolicy.html') }
    '^ru$'                { $l = 'ru'; $targets = @('index.html','aboutus.html','contactus.html','privacypolicy.html') }
    '^ru/(duration|moretools)$' { $l = 'ru'; $targets = @('../index.html','../aboutus.html','../contactus.html','../privacypolicy.html') }
    '^ko$'                { $l = 'ko'; $targets = @('index.html','../aboutus.html','../contactus.html','../privacypolicy.html') }
    '^ko/moretools$'      { $l = 'ko'; $targets = @('../index.html','../../aboutus.html','../../contactus.html','../../privacypolicy.html') }
    default               { return $null }
  }

  # Active link
  $activeIdx = -1
  if ($name -eq 'index.html') { $activeIdx = 0 }
  elseif ($name -like 'aboutus*') { $activeIdx = 1 }
  elseif ($name -like 'contactus*') { $activeIdx = 2 }
  elseif ($name -like 'privacypolicy*') { $activeIdx = 3 }

  return @{ labels = $labels.$l; targets = $targets; active = $activeIdx; lang = $l }
}

function Build-NavAnchors($cfg) {
  $out = @()
  for ($i = 0; $i -lt 4; $i++) {
    $cls = if ($i -eq $cfg.active) { ' class="active"' } else { '' }
    $out += ('        <a href="' + $cfg.targets[$i] + '"' + $cls + '>' + $cfg.labels[$i] + '</a>')
  }
  return ($out -join "`r`n")
}

$stats = @{ changed = 0; unchanged = 0; navsReplaced = 0 }

Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch '\\scratch' } | ForEach-Object {
  $rel = $_.FullName.Substring($root.Length + 1)
  $cfg = Get-NavConfig $rel
  if ($null -eq $cfg) { return }

  $pair = Read-TextUtf8 $_.FullName
  $text = $pair[0]; $enc = $pair[1]
  $orig = $text

  if ($rel -eq '404.html') {
    # Special case: replace the popular-links nav with canonical 4
    $anchors = Build-NavAnchors $cfg
    $text = [regex]::Replace($text, '(?s)(<nav class="links"[^>]*>).*?(</nav>)', ('$1' + "`r`n" + $anchors + "`r`n" + '$2'))
  } else {
    $anchors = Build-NavAnchors $cfg
    $text = [regex]::Replace($text, '(?s)(<nav\b[^>]*id="(?:mainNav|siteNav)"[^>]*>).*?(</nav>)', {
      param($m)
      $stats.navsReplaced++
      $m.Groups[1].Value + "`r`n" + $anchors + "`r`n      " + $m.Groups[2].Value
    })
  }

  if ($text -cne $orig) {
    [System.IO.File]::WriteAllText($_.FullName, $text, $enc)
    $stats.changed++
  } else {
    $stats.unchanged++
  }
}

Write-Output ("files changed: " + $stats.changed + " / unchanged: " + $stats.unchanged + " / navs replaced: " + $stats.navsReplaced)
