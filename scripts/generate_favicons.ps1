Add-Type -AssemblyName System.Drawing

$baseDir = Split-Path -Parent $PSScriptRoot
$srcPath = Join-Path $baseDir "frontend\public\logo.jpg"
$publicDir = Join-Path $baseDir "frontend\public"

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Save-Resized($img, $width, $height, $outFile, $format) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graph.DrawImage($img, 0, 0, $width, $height)
    $dest = Join-Path $publicDir $outFile
    $bmp.Save($dest, $format)
    $graph.Dispose()
    $bmp.Dispose()
    Write-Host "Created: $dest"
}

Save-Resized $srcImg 48 48 "favicon-48x48.png" ([System.Drawing.Imaging.ImageFormat]::Png)
Save-Resized $srcImg 96 96 "favicon-96x96.png" ([System.Drawing.Imaging.ImageFormat]::Png)
Save-Resized $srcImg 192 192 "favicon-192x192.png" ([System.Drawing.Imaging.ImageFormat]::Png)
Save-Resized $srcImg 180 180 "apple-touch-icon.png" ([System.Drawing.Imaging.ImageFormat]::Png)

# Pour favicon.ico standard (header ICO + PNG 48x48)
$png48Path = Join-Path $publicDir "favicon-48x48.png"
$icoPath = Join-Path $publicDir "favicon.ico"
$pngBytes = [System.IO.File]::ReadAllBytes($png48Path)

# Construire un fichier .ico valide contenant le PNG 48x48 (standard moderne supporté par tous les navigateurs et Google)
$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $ms
# ICONDIR header: 0 (reserved), 1 (type ICO), 1 (number of images)
$bw.Write([uint16]0)
$bw.Write([uint16]1)
$bw.Write([uint16]1)
# ICONDIRENTRY: width (48), height (48), colors (0), reserved (0), planes (1), bpp (32), size, offset (22)
$bw.Write([byte]48)
$bw.Write([byte]48)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([uint16]1)
$bw.Write([uint16]32)
$bw.Write([uint32]$pngBytes.Length)
$bw.Write([uint32]22)
# Image data
$bw.Write($pngBytes)
$bw.Flush()
[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())
$bw.Dispose()
$ms.Dispose()
Write-Host "Created valid ICO: $icoPath"

$srcImg.Dispose()
