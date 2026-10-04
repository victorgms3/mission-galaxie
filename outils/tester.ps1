# Ouvre une page du projet dans Microsoft Edge sans fenêtre (mode « headless »).
#  -Mode dom      : exécute la page puis affiche le contenu de <pre id="resultat"> (ou toute la page)
#  -Mode capture  : enregistre une capture d'écran PNG (chemin -Sortie)
# Exemples :
#   powershell -ExecutionPolicy Bypass -File outils/tester.ps1 -Page "tests/banques.html?fichier=paquets-1"
#   powershell -ExecutionPolicy Bypass -File outils/tester.ps1 -Page "tests/galerie.html" -Mode capture -Sortie "$env:TEMP\galerie.png"
param(
  [Parameter(Mandatory = $true)][string]$Page,
  [ValidateSet('dom', 'capture')][string]$Mode = 'dom',
  [int]$Largeur = 1280,
  [int]$Hauteur = 800,
  [int]$Attente = 10000,
  [string]$Sortie = ''
)

$racine = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$edge = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'Microsoft Edge (ou Chrome) introuvable.' }

$chemin, $requete = $Page -split '\?', 2
$fichier = Join-Path $racine $chemin
if (-not (Test-Path $fichier)) { throw "Page introuvable : $fichier" }
$url = 'file:///' + ($fichier -replace '\\', '/')
if ($requete) { $url += '?' + $requete }

$temp = Join-Path $env:TEMP ('mg-edge-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force $temp | Out-Null
$options = @('--headless=new', '--disable-gpu', '--no-first-run', '--disable-extensions', '--mute-audio',
  "--user-data-dir=$temp\profil", "--virtual-time-budget=$Attente", "--window-size=$Largeur,$Hauteur",
  '--hide-scrollbars', '--allow-file-access-from-files')

try {
  if ($Mode -eq 'capture') {
    if (-not $Sortie) { $Sortie = Join-Path $env:TEMP 'mg-capture.png' }
    $Sortie = [IO.Path]::GetFullPath($Sortie)
    Start-Process -FilePath $edge -ArgumentList ($options + @("--screenshot=$Sortie", $url)) -Wait -WindowStyle Hidden
    if (Test-Path $Sortie) { Write-Output "Capture : $Sortie" } else { Write-Output 'Echec de la capture.' }
  } else {
    $dom = Join-Path $temp 'dom.html'
    Start-Process -FilePath $edge -ArgumentList ($options + @('--dump-dom', $url)) -RedirectStandardOutput $dom -Wait -WindowStyle Hidden
    $html = [IO.File]::ReadAllText($dom, [Text.Encoding]::UTF8)
    $m = [regex]::Match($html, '<pre id="resultat"[^>]*>([\s\S]*?)</pre>')
    if ($m.Success) { Write-Output ([Net.WebUtility]::HtmlDecode($m.Groups[1].Value)) } else { Write-Output $html }
  }
} finally {
  Start-Sleep -Milliseconds 300
  Remove-Item -Recurse -Force $temp -ErrorAction SilentlyContinue
}
