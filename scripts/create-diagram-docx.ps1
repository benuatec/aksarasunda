param(
  [string]$ImagePath = "D:\GAME\aksara-sunda\diagram-alir-game-aksara-sunda.jpg",
  [string[]]$OutputPaths = @(
    "D:\GAME\aksara-sunda\diagram-alir-game-aksara-sunda.docx",
    "D:\GAME\aset-baru\diagramalir-aksarasunda.docx"
  )
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ImagePath)) {
  throw "Gambar diagram tidak ditemukan: $ImagePath"
}

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression.FileSystem

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$imageExtension = [System.IO.Path]::GetExtension($ImagePath).TrimStart(".").ToLowerInvariant()

$imageContentType = switch ($imageExtension) {
  "png" { "image/png" }
  "jpg" { "image/jpeg" }
  "jpeg" { "image/jpeg" }
  default { throw "Format gambar belum didukung keur DOCX: .$imageExtension" }
}

$imageFileName = "diagram-alir.$imageExtension"

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

$image = [System.Drawing.Image]::FromFile($ImagePath)
try {
  $aspectRatio = $image.Width / $image.Height
}
finally {
  $image.Dispose()
}

$maxWidthInches = 10.92
$maxHeightInches = 7.58

$imageWidthInches = $maxWidthInches
$imageHeightInches = $imageWidthInches / $aspectRatio

if ($imageHeightInches -gt $maxHeightInches) {
  $imageHeightInches = $maxHeightInches
  $imageWidthInches = $imageHeightInches * $aspectRatio
}

$imageWidthEmu = [int64][math]::Round($imageWidthInches * 914400)
$imageHeightEmu = [int64][math]::Round($imageHeightInches * 914400)
$createdAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$contentTypesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="$imageExtension" ContentType="$imageContentType"/>
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
      <vt:lpstr>Diagram Alir Game Aksara Sunda</vt:lpstr>
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
  <dc:title>Diagram Alir Game Aksara Sunda</dc:title>
  <dc:subject>Diagram Alir</dc:subject>
  <dc:creator>Codex</dc:creator>
  <cp:keywords>diagram alir, game aksara sunda</cp:keywords>
  <dc:description>Diagram alir aplikasi Game Aksara Sunda dina wangun dokumen Word.</dc:description>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$createdAt</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$createdAt</dcterms:modified>
</cp:coreProperties>
"@

$documentRelsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/$imageFileName"/>
</Relationships>
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
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
            mc:Ignorable="w14 wp14">
  <w:body>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="0" w:after="0"/>
      </w:pPr>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0">
            <wp:extent cx="$imageWidthEmu" cy="$imageHeightEmu"/>
            <wp:effectExtent l="0" t="0" r="0" b="0"/>
            <wp:docPr id="1" name="Diagram Alir"/>
            <wp:cNvGraphicFramePr>
              <a:graphicFrameLocks noChangeAspect="1"/>
            </wp:cNvGraphicFramePr>
            <a:graphic>
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic>
                  <pic:nvPicPr>
                    <pic:cNvPr id="0" name="$imageFileName"/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="rId1"/>
                    <a:stretch>
                      <a:fillRect/>
                    </a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="$imageWidthEmu" cy="$imageHeightEmu"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect">
                      <a:avLst/>
                    </a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>
    <w:sectPr>
      <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
      <w:pgMar w:top="420" w:right="420" w:bottom="420" w:left="420" w:header="180" w:footer="180" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$stagingRoot = Join-Path $env:TEMP ("diagram-docx-" + [Guid]::NewGuid().ToString("N"))
$zipPath = Join-Path $env:TEMP ("diagram-docx-" + [Guid]::NewGuid().ToString("N") + ".zip")

try {
  [System.IO.Directory]::CreateDirectory($stagingRoot) | Out-Null
  [System.IO.Directory]::CreateDirectory((Join-Path $stagingRoot "_rels")) | Out-Null
  [System.IO.Directory]::CreateDirectory((Join-Path $stagingRoot "docProps")) | Out-Null
  [System.IO.Directory]::CreateDirectory((Join-Path $stagingRoot "word")) | Out-Null
  [System.IO.Directory]::CreateDirectory((Join-Path $stagingRoot "word\_rels")) | Out-Null
  [System.IO.Directory]::CreateDirectory((Join-Path $stagingRoot "word\media")) | Out-Null

  Write-Utf8File -Path (Join-Path $stagingRoot "[Content_Types].xml") -Content $contentTypesXml
  Write-Utf8File -Path (Join-Path $stagingRoot "_rels\.rels") -Content $rootRelsXml
  Write-Utf8File -Path (Join-Path $stagingRoot "docProps\app.xml") -Content $appXml
  Write-Utf8File -Path (Join-Path $stagingRoot "docProps\core.xml") -Content $coreXml
  Write-Utf8File -Path (Join-Path $stagingRoot "word\document.xml") -Content $documentXml
  Write-Utf8File -Path (Join-Path $stagingRoot "word\_rels\document.xml.rels") -Content $documentRelsXml

  Copy-Item -LiteralPath $ImagePath -Destination (Join-Path $stagingRoot "word\media\$imageFileName")

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
