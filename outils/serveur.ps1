# Petit serveur local pour tester Mission Galaxie : http://localhost:8080/
param([int]$Port = 8080)

$racine = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$types = @{
  '.html' = 'text/html; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.svg' = 'image/svg+xml'
  '.png' = 'image/png'
  '.ico' = 'image/x-icon'
}

$ecoute = New-Object System.Net.HttpListener
$ecoute.Prefixes.Add("http://localhost:$Port/")
$ecoute.Start()
Write-Host "Mission Galaxie : http://localhost:$Port/"

while ($ecoute.IsListening) {
  try {
    $ctx = $ecoute.GetContext()
    $chemin = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ($chemin -eq '') { $chemin = 'index.html' }
    $fichier = [IO.Path]::GetFullPath((Join-Path $racine $chemin))
    $rep = $ctx.Response
    if ($fichier.StartsWith($racine) -and (Test-Path $fichier -PathType Leaf)) {
      $octets = [IO.File]::ReadAllBytes($fichier)
      $ext = [IO.Path]::GetExtension($fichier).ToLower()
      if ($types.ContainsKey($ext)) { $rep.ContentType = $types[$ext] } else { $rep.ContentType = 'application/octet-stream' }
      $rep.Headers.Add('Cache-Control', 'no-cache')
      $rep.ContentLength64 = $octets.Length
      $rep.OutputStream.Write($octets, 0, $octets.Length)
    } else {
      $rep.StatusCode = 404
    }
    $rep.OutputStream.Close()
  } catch {
    Write-Host "Erreur : $($_.Exception.Message)"
  }
}
