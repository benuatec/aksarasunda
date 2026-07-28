param(
  [string[]]$OutputPaths = @(
    "D:\GAME\aksara-sunda\diagram-alir-game-aksara-sunda.drawio",
    "D:\GAME\aset-baru\diagramalir-aksarasunda.drawio"
  )
)

$ErrorActionPreference = "Stop"

function Write-Utf8File {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [string]$Content
  )

  $directory = Split-Path -Parent $Path
  if ($directory) {
    [System.IO.Directory]::CreateDirectory($directory) | Out-Null
  }

  $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Escape-XmlAttribute {
  param([string]$Text)

  if ($null -eq $Text) {
    return ""
  }

  return $Text.Replace("&", "&amp;").Replace('"', "&quot;").Replace("'", "&apos;").Replace("<", "&lt;").Replace(">", "&gt;")
}

function Convert-ToHtmlValue {
  param([string]$Text)

  if ($null -eq $Text) {
    return ""
  }

  $normalized = $Text -replace "`r`n", "`n"
  $escaped = Escape-XmlAttribute $normalized
  return $escaped.Replace("`n", "&lt;br&gt;")
}

function New-GeometryXml {
  param(
    [double]$X,
    [double]$Y,
    [double]$Width,
    [double]$Height
  )

  return "<mxGeometry x=`"$X`" y=`"$Y`" width=`"$Width`" height=`"$Height`" as=`"geometry`"/>"
}

function Get-TextStyle {
  param(
    [int]$FontSize,
    [bool]$Bold,
    [string]$Align
  )

  $fontStyle = if ($Bold) { 1 } else { 0 }
  $mxAlign = if ($Align -eq "left") { "left" } else { "center" }

  return "text;html=1;strokeColor=none;fillColor=none;whiteSpace=wrap;align=$mxAlign;verticalAlign=middle;spacingTop=2;spacingLeft=4;spacingRight=4;fontSize=$FontSize;fontFamily=Times New Roman;fontStyle=$fontStyle;"
}

function Get-NodeStyle {
  param(
    [string]$ShapeType,
    [int]$FontSize,
    [bool]$Bold,
    [string]$Align
  )

  $fontStyle = if ($Bold) { 1 } else { 0 }
  $mxAlign = if ($Align -eq "left") { "left" } else { "center" }
  $spacingLeft = if ($Align -eq "left") { 8 } else { 4 }
  $base = "html=1;whiteSpace=wrap;strokeColor=#000000;fillColor=#ffffff;fontSize=$FontSize;fontFamily=Times New Roman;fontStyle=$fontStyle;align=$mxAlign;verticalAlign=middle;spacingLeft=$spacingLeft;spacingRight=6;spacingTop=6;spacingBottom=6;"

  switch ($ShapeType) {
    "rect" { return "rounded=0;$base" }
    "roundrect" { return "rounded=1;arcSize=24;absoluteArcSize=1;$base" }
    "data" { return "shape=parallelogram;perimeter=parallelogramPerimeter;size=0.12;$base" }
    "document" { return "shape=document;boundedLbl=1;$base" }
    "diamond" { return "rhombus;$base" }
    default { return $base }
  }
}

function New-TextCellXml {
  param(
    [string]$Id,
    [double]$X,
    [double]$Y,
    [double]$Width,
    [double]$Height,
    [string]$Text,
    [int]$FontSize,
    [bool]$Bold,
    [string]$Align = "center"
  )

  $value = Convert-ToHtmlValue $Text
  $style = Escape-XmlAttribute (Get-TextStyle -FontSize $FontSize -Bold $Bold -Align $Align)
  $geometry = New-GeometryXml -X $X -Y $Y -Width $Width -Height $Height

  return "<mxCell id=`"$Id`" value=`"$value`" style=`"$style`" vertex=`"1`" parent=`"1`">$geometry</mxCell>"
}

function New-NodeCellXml {
  param(
    [string]$Id,
    [string]$ShapeType,
    [double]$X,
    [double]$Y,
    [double]$Width,
    [double]$Height,
    [string]$Text,
    [int]$FontSize,
    [bool]$Bold,
    [string]$Align = "center"
  )

  $value = Convert-ToHtmlValue $Text
  $style = Escape-XmlAttribute (Get-NodeStyle -ShapeType $ShapeType -FontSize $FontSize -Bold $Bold -Align $Align)
  $geometry = New-GeometryXml -X $X -Y $Y -Width $Width -Height $Height

  return "<mxCell id=`"$Id`" value=`"$value`" style=`"$style`" vertex=`"1`" parent=`"1`">$geometry</mxCell>"
}

function New-EdgeCellXml {
  param(
    [string]$Id,
    [double[]]$Points,
    [bool]$Arrow
  )

  $endArrow = if ($Arrow) { "block" } else { "none" }
  $endFill = if ($Arrow) { "1" } else { "0" }
  $style = Escape-XmlAttribute "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;endArrow=$endArrow;endFill=$endFill;"

  $sourcePoint = "<mxPoint x=`"$($Points[0])`" y=`"$($Points[1])`" as=`"sourcePoint`"/>"
  $targetPoint = "<mxPoint x=`"$($Points[$Points.Count - 2])`" y=`"$($Points[$Points.Count - 1])`" as=`"targetPoint`"/>"

  $waypointsXml = ""
  if ($Points.Count -gt 4) {
    $waypoints = @()
    for ($index = 2; $index -lt ($Points.Count - 2); $index += 2) {
      $waypoints += "<mxPoint x=`"$($Points[$index])`" y=`"$($Points[$index + 1])`"/>"
    }

    $waypointsXml = "<Array as=`"points`">" + ($waypoints -join "") + "</Array>"
  }

  return "<mxCell id=`"$Id`" value=`"`" style=`"$style`" edge=`"1`" parent=`"1`"><mxGeometry relative=`"1`" as=`"geometry`">$sourcePoint$targetPoint$waypointsXml</mxGeometry></mxCell>"
}

$titleShapes = @(
  @{ id = "title-1"; x = 0; y = 70; w = 1860; h = 40; text = "DIAGRAM ALIR"; font = 18; bold = $true; align = "center" },
  @{ id = "title-2"; x = 0; y = 125; w = 1860; h = 34; text = "GAME AKSARA SUNDA"; font = 15; bold = $true; align = "center" }
)

$nodes = @(
  @{ id = "n-1"; type = "roundrect"; x = 720; y = 175; w = 420; h = 80; text = "Mulai"; font = 12; bold = $false; align = "center" },
  @{ id = "n-2"; type = "rect"; x = 640; y = 290; w = 580; h = 120; text = "Halaman Awal`nWilujeng Sumping`n`"Game Aksara Sunda`""; font = 12; bold = $false; align = "left" },
  @{ id = "n-3"; type = "rect"; x = 640; y = 460; w = 580; h = 110; text = "Daftar / Masuk Siswa`nNama, Kelas, Password"; font = 12; bold = $false; align = "center" },
  @{ id = "n-4"; type = "data"; x = 660; y = 630; w = 540; h = 110; text = "Data Siswa"; font = 12; bold = $false; align = "center" },
  @{ id = "n-5"; type = "rect"; x = 660; y = 790; w = 540; h = 100; text = "MENU UTAMA"; font = 12; bold = $true; align = "center" },
  @{ id = "n-6"; type = "rect"; x = 50; y = 1110; w = 260; h = 295; text = "1. MULAI BELAJAR`n(AKSARA SUNDA)`n`n- Level 1 Swara & Angka`n- Level 2 Ngalagena`n- Level 3 Rarangken & Kata`n- Level 4 Menyusun Kalimat"; font = 9; bold = $false; align = "left" },
  @{ id = "n-7"; type = "rect"; x = 370; y = 1110; w = 260; h = 295; text = "2. LATIHAN MENULIS`n(TRACING HURUF)`n`n- Pilih huruf / kata`n- Menebalkan huruf`n- Menulis ulang"; font = 9; bold = $false; align = "left" },
  @{ id = "n-8"; type = "rect"; x = 690; y = 1110; w = 260; h = 295; text = "3. MEMBACA`n`n- Tampilan aksara / kata / kalimat`n- Suara bacaan`n- Pemain membaca"; font = 9; bold = $false; align = "left" },
  @{ id = "n-9"; type = "rect"; x = 1010; y = 1110; w = 260; h = 295; text = "4. LIHAT PROGRES`n`n- Data pemain`n- Skor tertinggi`n- Level tercapai`n- Statistik belajar"; font = 9; bold = $false; align = "left" },
  @{ id = "n-10"; type = "rect"; x = 1330; y = 1110; w = 260; h = 295; text = "5. PENGATURAN`n`n- Musik ON / OFF`n- Suara ON / OFF`n- Avatar profil"; font = 9; bold = $false; align = "left" },
  @{ id = "n-11"; type = "rect"; x = 1610; y = 1110; w = 230; h = 295; text = "6. ADMIN`n`n- Login admin`n- Kelola siswa`n- Kelola user admin`n- Export XLS`n- Mode cek level"; font = 9; bold = $false; align = "left" },
  @{ id = "n-12"; type = "rect"; x = 40; y = 1460; w = 280; h = 140; text = "MULAI KUIS`n`n- Tampilkan aksara`n- Suara pelafalan`n- Pilihan jawaban / susun kata"; font = 9; bold = $false; align = "left" },
  @{ id = "n-13"; type = "rect"; x = 360; y = 1460; w = 280; h = 125; text = "PEMAIN MENULIS`nDI LAYAR"; font = 9; bold = $false; align = "left" },
  @{ id = "n-14"; type = "rect"; x = 680; y = 1460; w = 280; h = 125; text = "PEMAIN MEMBACA`n(Voice / baca sendiri)"; font = 9; bold = $false; align = "left" },
  @{ id = "n-15"; type = "document"; x = 1010; y = 1460; w = 260; h = 155; text = "TAMPILKAN DATA`n`n- Level tertinggi`n- Total skor`n- Status belajar"; font = 9; bold = $false; align = "left" },
  @{ id = "n-16"; type = "document"; x = 1330; y = 1460; w = 260; h = 180; text = "SIMPAN PENGATURAN`n`n- Musik latar`n- Efek tombol`n- Profil siswa"; font = 9; bold = $false; align = "left" },
  @{ id = "n-17"; type = "rect"; x = 1600; y = 1460; w = 250; h = 175; text = "ADMIN PANEL`n`n- Tambah/edit siswa`n- Reset password`n- Reset progres`n- Kelola admin"; font = 9; bold = $false; align = "left" },
  @{ id = "n-18"; type = "rect"; x = 20; y = 1660; w = 320; h = 120; text = "PEMAIN MEMILIH`nJAWABAN"; font = 10; bold = $true; align = "center" },
  @{ id = "n-19"; type = "data"; x = 340; y = 1660; w = 320; h = 210; text = "FEEDBACK`n`n- Bagus`n- Coba lagi`n+ Suara"; font = 10; bold = $false; align = "center" },
  @{ id = "n-20"; type = "data"; x = 660; y = 1660; w = 320; h = 210; text = "FEEDBACK`n`n- Bagus`n- Coba lagi`n+ Suara"; font = 10; bold = $false; align = "center" },
  @{ id = "n-21"; type = "rect"; x = 1560; y = 1710; w = 250; h = 150; text = "MODE CEK LEVEL`n`nAdmin bebas mencoba level tanpa menyimpan skor siswa."; font = 8; bold = $false; align = "left" },
  @{ id = "n-22"; type = "diamond"; x = 20; y = 1865; w = 320; h = 320; text = "JAWABAN`nBENAR?"; font = 10; bold = $false; align = "center" },
  @{ id = "n-23"; type = "rect"; x = 360; y = 1945; w = 280; h = 200; text = "Simpan Hasil`nLatihan Menulis`nke Supabase"; font = 9; bold = $false; align = "left" },
  @{ id = "n-24"; type = "rect"; x = 680; y = 1945; w = 280; h = 200; text = "Simpan Hasil`nLatihan Membaca`nke Supabase"; font = 9; bold = $false; align = "left" },
  @{ id = "n-25"; type = "rect"; x = 1390; y = 2020; w = 290; h = 170; text = "NAIK KE`nLEVEL BERIKUTNYA"; font = 10; bold = $false; align = "left" },
  @{ id = "n-26"; type = "document"; x = 1510; y = 1860; w = 300; h = 260; text = "HALAMAN HASIL AKHIR`n`nTampilkan:`n- Skor akhir`n- Level kategori`n- Perlu belajar lagi / cukup / sangat baik"; font = 8; bold = $false; align = "left" },
  @{ id = "n-27"; type = "document"; x = 1585; y = 2200; w = 250; h = 285; text = "PILIHAN AKHIR`n`n- Main lagi`n- Lanjut level`n- Lihat progres`n- Kembali ke menu"; font = 8; bold = $false; align = "left" },
  @{ id = "n-28"; type = "document"; x = 25; y = 2295; w = 300; h = 250; text = "FEEDBACK SALAH`n`n`"Lepat!`"`n`nTampilkan jawaban benar`ndan suara penjelasan"; font = 8; bold = $false; align = "left" },
  @{ id = "n-29"; type = "document"; x = 345; y = 2295; w = 300; h = 250; text = "FEEDBACK BENAR`n`n`"Leres!`"`n`n+ 10 poin`n+ suara benar"; font = 8; bold = $false; align = "left" },
  @{ id = "n-30"; type = "diamond"; x = 680; y = 2220; w = 500; h = 500; text = "SOAL TERAKHIR`nLEVEL INI?"; font = 11; bold = $false; align = "center" },
  @{ id = "n-31"; type = "rect"; x = 1160; y = 2420; w = 330; h = 160; text = "Simpan Skor Akhir`ndan Progres Pemain`nke Supabase"; font = 9; bold = $false; align = "left" },
  @{ id = "n-32"; type = "rect"; x = 1250; y = 2190; w = 300; h = 150; text = "HASIL LEVEL`n`nTampilkan skor sementara"; font = 9; bold = $false; align = "left" },
  @{ id = "n-33"; type = "diamond"; x = 720; y = 2490; w = 420; h = 420; text = "SKOR`nMEMENUHI`nSYARAT`nNAIK LEVEL?"; font = 10; bold = $false; align = "center" },
  @{ id = "n-34"; type = "rect"; x = 380; y = 2550; w = 300; h = 170; text = "TETAP DI`nLEVEL SAAT INI`n`nUlangi level"; font = 9; bold = $false; align = "left" },
  @{ id = "n-35"; type = "roundrect"; x = 1190; y = 2630; w = 300; h = 90; text = "SELESAI"; font = 12; bold = $false; align = "center" }
)

$captions = @(
  @{ id = "c-1"; x = 1080; y = 2310; w = 130; h = 24; text = "Ya" },
  @{ id = "c-2"; x = 560; y = 2535; w = 130; h = 24; text = "Tidak" },
  @{ id = "c-3"; x = 1230; y = 2305; w = 130; h = 24; text = "Ya" },
  @{ id = "c-4"; x = 465; y = 2220; w = 130; h = 24; text = "Benar" },
  @{ id = "c-5"; x = 65; y = 2220; w = 130; h = 24; text = "Salah" }
)

$arrowPaths = @(
  "930 235 930 290",
  "930 410 930 460",
  "930 570 930 630",
  "930 740 930 790",
  "930 890 930 955",
  "930 1035 180 1035 180 1110",
  "930 1035 500 1035 500 1110",
  "930 1035 820 1035 820 1110",
  "930 1035 1140 1035 1140 1110",
  "930 1035 1460 1035 1460 1110",
  "930 1035 1690 1035 1690 1110",
  "180 1405 180 1460",
  "180 1600 180 1660",
  "180 1780 180 1865",
  "180 2045 180 2120",
  "180 2240 180 2295",
  "500 1405 500 1460",
  "500 1585 500 1660",
  "500 1870 500 1945",
  "500 2145 500 2220",
  "820 1405 820 1460",
  "820 1585 820 1660",
  "820 1870 820 1945",
  "820 2145 820 2220",
  "1140 1405 1140 1460",
  "1140 1615 1140 1690",
  "1460 1405 1460 1460",
  "1460 1640 1460 1710",
  "1690 1405 1690 1460",
  "1690 1635 1690 1710",
  "180 2385 930 2385 930 2310",
  "500 2385 930 2385",
  "820 2385 930 2385",
  "1140 1840 1140 1945",
  "1140 2145 930 2220",
  "930 2420 930 2490",
  "1098 2338 1280 2338 1280 2190",
  "1098 2338 1340 2338 1340 2420",
  "1340 2580 1340 2630",
  "1340 2338 1535 2338 1535 2120",
  "1535 1940 1535 1860",
  "1565 1860 1690 1860 1690 1790",
  "1535 1940 1535 2020"
)

$plainPaths = @(
  "168 1035 192 1035",
  "488 1035 512 1035",
  "808 1035 832 1035",
  "1128 1035 1152 1035",
  "1448 1035 1472 1035",
  "1678 1035 1702 1035"
)

$cellXmlParts = @(
  '<mxCell id="0"/>',
  '<mxCell id="1" parent="0"/>'
)

foreach ($title in $titleShapes) {
  $cellXmlParts += New-TextCellXml -Id $title.id -X $title.x -Y $title.y -Width $title.w -Height $title.h -Text $title.text -FontSize $title.font -Bold $title.bold -Align $title.align
}

$lineIndex = 1
foreach ($pathText in $plainPaths) {
  $coords = $pathText -split " " | ForEach-Object { [double]$_ }
  $cellXmlParts += New-EdgeCellXml -Id ("plain-" + $lineIndex) -Points $coords -Arrow $false
  $lineIndex += 1
}

foreach ($pathText in $arrowPaths) {
  $coords = $pathText -split " " | ForEach-Object { [double]$_ }
  $cellXmlParts += New-EdgeCellXml -Id ("arrow-" + $lineIndex) -Points $coords -Arrow $true
  $lineIndex += 1
}

foreach ($node in $nodes) {
  $cellXmlParts += New-NodeCellXml -Id $node.id -ShapeType $node.type -X $node.x -Y $node.y -Width $node.w -Height $node.h -Text $node.text -FontSize $node.font -Bold $node.bold -Align $node.align
}

foreach ($caption in $captions) {
  $cellXmlParts += New-TextCellXml -Id $caption.id -X $caption.x -Y $caption.y -Width $caption.w -Height $caption.h -Text $caption.text -FontSize 8 -Bold $false -Align "center"
}

$cellsXml = ($cellXmlParts -join "")
$modifiedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$diagramId = [Guid]::NewGuid().ToString("N")

$drawioXml = @"
<mxfile host="app.diagrams.net" modified="$modifiedAt" agent="Codex" version="24.7.17" compressed="false">
  <diagram id="$diagramId" name="Diagram Alir Game Aksara Sunda">
    <mxGraphModel dx="2200" dy="3200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2200" pageHeight="3200" math="0" shadow="0">
      <root>$cellsXml</root>
    </mxGraphModel>
  </diagram>
</mxfile>
"@

foreach ($outputPath in $OutputPaths) {
  Write-Utf8File -Path $outputPath -Content $drawioXml
}
