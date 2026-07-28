param(
  [string[]]$OutputPaths = @(
    "D:\GAME\aksara-sunda\diagram-alir-game-aksara-sunda.docx",
    "D:\GAME\aksara-sunda\diagram-alir-game-aksara-sunda-editable.docx",
    "D:\GAME\aset-baru\diagramalir-aksarasunda.docx",
    "D:\GAME\aset-baru\diagramalir-aksarasunda-editable.docx"
  )
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$invariant = [System.Globalization.CultureInfo]::InvariantCulture
$scale = 0.28

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

  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Escape-XmlText {
  param([string]$Text)

  if ($null -eq $Text) {
    return ""
  }

  return $Text.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;")
}

function Format-Number {
  param([double]$Value)

  return [string]::Format($invariant, "{0:0.##}", $Value)
}

function To-Points {
  param([double]$Value)

  return (Format-Number ($Value * $scale)) + "pt"
}

function New-RunXml {
  param(
    [string]$Text,
    [int]$FontSize = 18,
    [bool]$Bold = $false
  )

  $escaped = Escape-XmlText $Text
  $boldXml = if ($Bold) { "<w:b/>" } else { "" }
  $sizeHalfPoints = $FontSize * 2

  return "<w:r><w:rPr>$boldXml<w:sz w:val=`"$sizeHalfPoints`"/></w:rPr><w:t xml:space=`"preserve`">$escaped</w:t></w:r>"
}

function New-TextboxContentXml {
  param(
    [string]$Text,
    [string]$Align = "center",
    [int]$FontSize = 18,
    [bool]$Bold = $false
  )

  $lines = ($Text -split "`r?`n")
  $paragraphs = foreach ($line in $lines) {
    $safeLine = if ($line.Length -eq 0) { " " } else { $line }
    "<w:p><w:pPr><w:jc w:val=`"$Align`"/></w:pPr>$(New-RunXml -Text $safeLine -FontSize $FontSize -Bold $Bold)</w:p>"
  }

  return "<w:txbxContent>" + ($paragraphs -join "") + "</w:txbxContent>"
}

function New-ShapeStyle {
  param(
    [double]$X,
    [double]$Y,
    [double]$Width,
    [double]$Height,
    [int]$ZIndex = 1
  )

  return "position:absolute;margin-left:$(To-Points $X);margin-top:$(To-Points $Y);width:$(To-Points $Width);height:$(To-Points $Height);z-index:$ZIndex;mso-wrap-style:none;visibility:visible"
}

function New-TextShapeXml {
  param(
    [string]$Id,
    [double]$X,
    [double]$Y,
    [double]$Width,
    [double]$Height,
    [string]$Text,
    [int]$FontSize = 18,
    [bool]$Bold = $false,
    [string]$Align = "center"
  )

  $style = New-ShapeStyle -X $X -Y $Y -Width $Width -Height $Height -ZIndex 10
  $textboxContent = New-TextboxContentXml -Text $Text -Align $Align -FontSize $FontSize -Bold $Bold

  return @"
<w:r>
  <w:pict>
    <v:rect id="$Id" o:allowincell="f" stroked="f" filled="f" style="$style">
      <v:textbox inset="0pt,0pt,0pt,0pt">$textboxContent</v:textbox>
    </v:rect>
  </w:pict>
</w:r>
"@
}

function New-BoxShapeXml {
  param(
    [string]$Id,
    [ValidateSet("rect", "roundrect", "data", "document", "diamond")]
    [string]$ShapeType,
    [double]$X,
    [double]$Y,
    [double]$Width,
    [double]$Height,
    [string]$Text,
    [int]$FontSize = 18,
    [bool]$Bold = $false,
    [string]$Align = "center"
  )

  $style = New-ShapeStyle -X $X -Y $Y -Width $Width -Height $Height -ZIndex 20
  $textboxInset = if ($Align -eq "left") { "7pt,6pt,7pt,6pt" } else { "5pt,5pt,5pt,5pt" }
  $textboxContent = New-TextboxContentXml -Text $Text -Align $Align -FontSize $FontSize -Bold $Bold

  switch ($ShapeType) {
    "rect" {
      return @"
<w:r>
  <w:pict>
    <v:rect id="$Id" o:allowincell="f" fillcolor="#ffffff" strokecolor="#000000" strokeweight="1.5pt" style="$style">
      <v:textbox inset="$textboxInset">$textboxContent</v:textbox>
    </v:rect>
  </w:pict>
</w:r>
"@
    }
    "roundrect" {
      return @"
<w:r>
  <w:pict>
    <v:roundrect id="$Id" arcsize="50%" o:allowincell="f" fillcolor="#ffffff" strokecolor="#000000" strokeweight="1.5pt" style="$style">
      <v:textbox inset="$textboxInset">$textboxContent</v:textbox>
    </v:roundrect>
  </w:pict>
</w:r>
"@
    }
    "data" {
      return @"
<w:r>
  <w:pict>
    <v:shape id="$Id" o:allowincell="f" coordsize="100,100" path="m 12,0 l 100,0,88,100,0,100 x e" fillcolor="#ffffff" strokecolor="#000000" strokeweight="1.5pt" style="$style">
      <v:textbox inset="$textboxInset">$textboxContent</v:textbox>
    </v:shape>
  </w:pict>
</w:r>
"@
    }
    "document" {
      return @"
<w:r>
  <w:pict>
    <v:shape id="$Id" o:allowincell="f" coordsize="100,100" path="m 0,0 l 100,0,100,84,84,84,66,88,50,96,35,100,18,98,0,90 x e" fillcolor="#ffffff" strokecolor="#000000" strokeweight="1.5pt" style="$style">
      <v:textbox inset="$textboxInset">$textboxContent</v:textbox>
    </v:shape>
  </w:pict>
</w:r>
"@
    }
    "diamond" {
      return @"
<w:r>
  <w:pict>
    <v:shape id="$Id" o:allowincell="f" coordsize="100,100" path="m 50,0 l 100,50,50,100,0,50 x e" fillcolor="#ffffff" strokecolor="#000000" strokeweight="1.5pt" style="$style">
      <v:textbox inset="10pt,10pt,10pt,10pt">$textboxContent</v:textbox>
    </v:shape>
  </w:pict>
</w:r>
"@
    }
  }
}

function New-LineXml {
  param(
    [string]$Id,
    [double[]]$Points,
    [bool]$ArrowOnLastSegment = $true
  )

  $parts = @()
  for ($index = 0; $index -lt ($Points.Count - 3); $index += 2) {
    $x1 = $Points[$index]
    $y1 = $Points[$index + 1]
    $x2 = $Points[$index + 2]
    $y2 = $Points[$index + 3]
    $segmentId = "$Id-$index"
    $arrow = if ($ArrowOnLastSegment -and $index -eq ($Points.Count - 4)) { ' endarrow="block"' } else { "" }
    $from = "$(To-Points $x1),$(To-Points $y1)"
    $to = "$(To-Points $x2),$(To-Points $y2)"

    $parts += @"
<w:r>
  <w:pict>
    <v:line id="$segmentId" o:allowincell="f" from="$from" to="$to" style="position:absolute;z-index:5;mso-wrap-style:none;visibility:visible" strokecolor="#000000" strokeweight="1.2pt"$arrow />
  </w:pict>
</w:r>
"@
  }

  return ($parts -join "")
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

$shapeXmlParts = @()

foreach ($title in $titleShapes) {
  $shapeXmlParts += New-TextShapeXml -Id $title.id -X $title.x -Y $title.y -Width $title.w -Height $title.h -Text $title.text -FontSize $title.font -Bold $title.bold -Align $title.align
}

$lineIndex = 1
foreach ($pathText in $plainPaths) {
  $coords = $pathText -split " " | ForEach-Object { [double]$_ }
  $shapeXmlParts += New-LineXml -Id ("plain-" + $lineIndex) -Points $coords -ArrowOnLastSegment $false
  $lineIndex += 1
}

foreach ($pathText in $arrowPaths) {
  $coords = $pathText -split " " | ForEach-Object { [double]$_ }
  $shapeXmlParts += New-LineXml -Id ("arrow-" + $lineIndex) -Points $coords -ArrowOnLastSegment $true
  $lineIndex += 1
}

foreach ($node in $nodes) {
  $shapeXmlParts += New-BoxShapeXml -Id $node.id -ShapeType $node.type -X $node.x -Y $node.y -Width $node.w -Height $node.h -Text $node.text -FontSize $node.font -Bold $node.bold -Align $node.align
}

foreach ($caption in $captions) {
  $shapeXmlParts += New-TextShapeXml -Id $caption.id -X $caption.x -Y $caption.y -Width $caption.w -Height $caption.h -Text $caption.text -FontSize 8 -Bold $false -Align "center"
}

$shapeXml = $shapeXmlParts -join ""
$createdAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$contentTypesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"@

$rootRelsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

$appXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
            xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Title</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>1</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="1" baseType="lpstr">
      <vt:lpstr>Diagram Alir Game Aksara Sunda Editable</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
  <Company>Codex</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>
"@

$coreXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Diagram Alir Game Aksara Sunda Editable</dc:title>
  <dc:subject>Diagram Alir</dc:subject>
  <dc:creator>Codex</dc:creator>
  <cp:keywords>diagram alir, game aksara sunda, editable</cp:keywords>
  <dc:description>Versi Word editable pikeun diagram alir Game Aksara Sunda.</dc:description>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$createdAt</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$createdAt</dcterms:modified>
</cp:coreProperties>
"@

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
            xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
            xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
            xmlns:wne="http://schemas.microsoft.com/office/2006/wordml"
            xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
            mc:Ignorable="w14 wp14">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr><w:sz w:val="2"/></w:rPr>
        <w:t xml:space="preserve"> </w:t>
      </w:r>
      $shapeXml
    </w:p>
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="360" w:right="360" w:bottom="360" w:left="360" w:header="180" w:footer="180" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$stagingRoot = Join-Path $env:TEMP ("diagram-word-editable-" + [Guid]::NewGuid().ToString("N"))
$zipPath = Join-Path $env:TEMP ("diagram-word-editable-" + [Guid]::NewGuid().ToString("N") + ".zip")

try {
  [System.IO.Directory]::CreateDirectory($stagingRoot) | Out-Null
  [System.IO.Directory]::CreateDirectory((Join-Path $stagingRoot "_rels")) | Out-Null
  [System.IO.Directory]::CreateDirectory((Join-Path $stagingRoot "docProps")) | Out-Null
  [System.IO.Directory]::CreateDirectory((Join-Path $stagingRoot "word")) | Out-Null

  Write-Utf8File -Path (Join-Path $stagingRoot "[Content_Types].xml") -Content $contentTypesXml
  Write-Utf8File -Path (Join-Path $stagingRoot "_rels\.rels") -Content $rootRelsXml
  Write-Utf8File -Path (Join-Path $stagingRoot "docProps\app.xml") -Content $appXml
  Write-Utf8File -Path (Join-Path $stagingRoot "docProps\core.xml") -Content $coreXml
  Write-Utf8File -Path (Join-Path $stagingRoot "word\document.xml") -Content $documentXml

  if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }

  [System.IO.Compression.ZipFile]::CreateFromDirectory($stagingRoot, $zipPath)

  foreach ($outputPath in $OutputPaths) {
    $outputDir = Split-Path -Parent $outputPath
    if ($outputDir) {
      [System.IO.Directory]::CreateDirectory($outputDir) | Out-Null
    }

    Copy-Item -LiteralPath $zipPath -Destination $outputPath -Force
  }
}
finally {
  if (Test-Path -LiteralPath $stagingRoot) {
    Remove-Item -LiteralPath $stagingRoot -Recurse -Force
  }

  if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }
}
