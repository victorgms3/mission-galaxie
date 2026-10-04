# Génère les icônes PNG de l'application (tête d'Alvin dans son casque).
Add-Type -AssemblyName System.Drawing

$sortie = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\icons'))

function Couleur([string]$hex, [int]$a = 255) {
  $c = [System.Drawing.ColorTranslator]::FromHtml($hex)
  [System.Drawing.Color]::FromArgb($a, $c.R, $c.G, $c.B)
}

function Dessiner([int]$N, [string]$fichier) {
  $k = $N / 512.0
  $s = 2.3 * $k
  function X([double]$x) { [float]((256 + ($x - 100) * 2.3) * $k) }
  function Y([double]$y) { [float]((270 + ($y - 102) * 2.3) * $k) }
  function P([double]$x, [double]$y) { New-Object System.Drawing.PointF (X $x), (Y $y) }
  function Pinceau([string]$hex, [int]$a = 255) { New-Object System.Drawing.SolidBrush (Couleur $hex $a) }
  function Crayon([string]$hex, [double]$largeur, [int]$a = 255) {
    $p = New-Object System.Drawing.Pen (Couleur $hex $a), ([float]($largeur * $s))
    $p.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $p.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $p.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $p
  }
  function Ellipse($g, $pinceau, $crayon, [double]$cx, [double]$cy, [double]$rx, [double]$ry) {
    $x = X ($cx - $rx); $y = Y ($cy - $ry); $w = [float](2 * $rx * $s); $h = [float](2 * $ry * $s)
    if ($pinceau) { $g.FillEllipse($pinceau, $x, $y, $w, $h) }
    if ($crayon) { $g.DrawEllipse($crayon, $x, $y, $w, $h) }
  }
  function Polygone($g, $pinceau, $crayon, $points) {
    $pts = [System.Drawing.PointF[]]$points
    if ($pinceau) { $g.FillPolygon($pinceau, $pts) }
    if ($crayon) { $g.DrawPolygon($crayon, $pts) }
  }

  $bmp = New-Object System.Drawing.Bitmap $N, $N
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  # Fond (plein cadre pour l'icône « maskable » d'Android)
  $fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.PointF 0, 0), (New-Object System.Drawing.PointF 0, $N), (Couleur '#2a1b78'), (Couleur '#0b1030')
  $g.FillRectangle($fond, 0, 0, $N, $N)
  $blanc = Pinceau '#ffffff'
  foreach ($e in @(@(80, 90, 5), @(430, 70, 4), @(450, 400, 5), @(60, 420, 3), @(400, 200, 3), @(120, 250, 3))) {
    $r = $e[2] * $k
    $g.FillEllipse($blanc, [float]($e[0] * $k - $r), [float]($e[1] * $k - $r), [float](2 * $r), [float](2 * $r))
  }

  $gris = Pinceau '#9aa4af'
  $trait = Crayon '#7d8793' 2
  $rose = Pinceau '#f4a9bb'

  # Oreilles
  Polygone $g $gris $trait @((P 60 82), (P 64 36), (P 96 62))
  Polygone $g $rose $null @((P 67 74), (P 69 48), (P 87 63))
  Polygone $g $gris $trait @((P 140 82), (P 136 36), (P 104 62))
  Polygone $g $rose $null @((P 133 74), (P 131 48), (P 113 63))

  # Tête
  Ellipse $g $gris $trait 100 102 48 44

  # Rayures tigrées
  $rayure = Crayon '#5f6874' 5
  foreach ($l in @(@(100, 62, 100, 78), @(88, 64, 91, 77), @(112, 64, 109, 77), @(55, 96, 67, 99), @(55, 107, 66, 107), @(145, 96, 133, 99), @(145, 107, 134, 107))) {
    $g.DrawLine($rayure, (P $l[0] $l[1]), (P $l[2] $l[3]))
  }

  # Museau
  Ellipse $g (Pinceau '#e3e8ee') $null 100 124 23 15

  # Yeux verts
  foreach ($cx in @(80, 120)) {
    Ellipse $g (Pinceau '#3fcf72') (Crayon '#1d7f45' 2.5) $cx 100 12 13
    Ellipse $g (Pinceau '#17202a') $null $cx 100 5 9
    Ellipse $g $blanc $null ($cx - 4) 95 3.2 3.2
  }

  # Nez et bouche
  Polygone $g (Pinceau '#f2879f') $null @((P 94 113), (P 106 113), (P 100 120))
  $bouche = Crayon '#4a515c' 2.5
  $g.DrawBezier($bouche, (P 100 120), (P 100 124.7), (P 97.3 127.3), (P 92 128))
  $g.DrawBezier($bouche, (P 100 120), (P 100 124.7), (P 102.7 127.3), (P 108 128))

  # Casque
  Ellipse $g (Pinceau '#bfe3ff' 45) (Crayon '#d6ecff' 4) 100 102 72 72
  $reflet = Crayon '#ffffff' 7 180
  $g.DrawArc($reflet, (X 40), (Y 42), [float](120 * $s), [float](120 * $s), [float]198, [float]58)

  $bmp.Save($fichier, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

Dessiner 192 (Join-Path $sortie 'icon-192.png')
Dessiner 512 (Join-Path $sortie 'icon-512.png')
Write-Host "Icônes créées dans $sortie"
