param(
  [string]$OutputPath = "D:\GAME\aksara-sunda\Panduan-Langkah-Membuat-Game-Aksara-Sunda.docx"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

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

function New-Paragraph {
  param(
    [string]$Text,
    [int]$FontSize = 24,
    [bool]$Bold = $false
  )

  $safe = Escape-XmlText $Text
  $boldXml = if ($Bold) { "<w:b/>" } else { "" }
  $sizeHalf = $FontSize
  return "<w:p><w:r><w:rPr>$boldXml<w:sz w:val=`"$sizeHalf`"/><w:szCs w:val=`"$sizeHalf`"/></w:rPr><w:t xml:space=`"preserve`">$safe</w:t></w:r></w:p>"
}

$lines = @(
  @{ text = "Panduan Lengkap Membuat Game Aksara Sunda"; size = 34; bold = $true },
  @{ text = "Dokumen ini menjelaskan aplikasi yang dipakai dan langkah rinci dari nol sampai online."; size = 22; bold = $false },
  @{ text = ""; size = 22; bold = $false },

  @{ text = "1. Aplikasi yang dipakai"; size = 28; bold = $true },
  @{ text = "- Node.js LTS: untuk menjalankan JavaScript dan npm."; size = 22; bold = $false },
  @{ text = "- Visual Studio Code: editor utama untuk coding."; size = 22; bold = $false },
  @{ text = "- Git + GitHub (opsional): version control dan backup kode."; size = 22; bold = $false },
  @{ text = "- Browser (Chrome/Edge): tes game di localhost."; size = 22; bold = $false },
  @{ text = "- Supabase: backend untuk data siswa, progres, admin."; size = 22; bold = $false },
  @{ text = "- Cloudflare Workers: host/deploy website game."; size = 22; bold = $false },
  @{ text = "- draw.io (diagrams.net): membuat diagram alir editable."; size = 22; bold = $false },
  @{ text = ""; size = 22; bold = $false },

  @{ text = "2. Persiapan awal project"; size = 28; bold = $true },
  @{ text = "a) Install Node.js LTS dari website resmi Node.js."; size = 22; bold = $false },
  @{ text = "b) Cek instalasi dengan perintah: node -v dan npm -v."; size = 22; bold = $false },
  @{ text = "c) Buat folder project, contoh: D:\GAME\aksara-sunda."; size = 22; bold = $false },
  @{ text = "d) Buka folder di Visual Studio Code."; size = 22; bold = $false },
  @{ text = "e) Install dependency dengan npm install."; size = 22; bold = $false },
  @{ text = ""; size = 22; bold = $false },

  @{ text = "3. Struktur teknologi game"; size = 28; bold = $true },
  @{ text = "- Frontend: Vite + TanStack React (UI, route, state game)."; size = 22; bold = $false },
  @{ text = "- Asset: gambar, ikon, dan audio di folder src/assets."; size = 22; bold = $false },
  @{ text = "- Logika game: level, skor, validasi jawaban di src/game dan src/routes."; size = 22; bold = $false },
  @{ text = "- Backend data: Supabase (PostgreSQL + fungsi SQL + RLS)."; size = 22; bold = $false },
  @{ text = ""; size = 22; bold = $false },

  @{ text = "4. Menjalankan game secara lokal"; size = 28; bold = $true },
  @{ text = "a) Jalankan: npm run dev"; size = 22; bold = $false },
  @{ text = "b) Buka URL lokal, contoh: http://localhost:3010."; size = 22; bold = $false },
  @{ text = "c) Tes menu utama, level, latihan menulis, membaca, progres, dan pengaturan."; size = 22; bold = $false },
  @{ text = "d) Pastikan audio, tombol, dan transisi berjalan normal."; size = 22; bold = $false },
  @{ text = ""; size = 22; bold = $false },

  @{ text = "5. Menyiapkan konten pembelajaran"; size = 28; bold = $true },
  @{ text = "a) Susun materi level: swara, angka, ngalagena, rarangken, kalimat."; size = 22; bold = $false },
  @{ text = "b) Masukkan data soal/konten ke file data game."; size = 22; bold = $false },
  @{ text = "c) Simpan audio ke folder: src/assets/audio/sound-aksara-sunda."; size = 22; bold = $false },
  @{ text = "d) Samakan nama file audio dengan nama kata/kalimat agar auto-terbaca."; size = 22; bold = $false },
  @{ text = "e) Hilangkan speaker otomatis untuk soal yang belum punya audio."; size = 22; bold = $false },
  @{ text = ""; size = 22; bold = $false },

  @{ text = "6. Membuat backend Supabase"; size = 28; bold = $true },
  @{ text = "a) Buat project baru di Supabase."; size = 22; bold = $false },
  @{ text = "b) Buat tabel penting: students, progress/activity, admin_profiles."; size = 22; bold = $false },
  @{ text = "c) Buat function SQL untuk register siswa, update progres, list siswa, dan admin."; size = 22; bold = $false },
  @{ text = "d) Aktifkan RLS dan policy yang aman (anon/authenticated sesuai kebutuhan)."; size = 22; bold = $false },
  @{ text = "e) Ambil Project URL dan anon key dari Supabase Settings > API."; size = 22; bold = $false },
  @{ text = ""; size = 22; bold = $false },

  @{ text = "7. Menghubungkan frontend ke Supabase"; size = 28; bold = $true },
  @{ text = "a) Isi variabel environment di file .env.local."; size = 22; bold = $false },
  @{ text = "b) Gunakan client Supabase di kode untuk login/register/progres."; size = 22; bold = $false },
  @{ text = "c) Tes skenario: siswa daftar, main, skor tersimpan, admin lihat data."; size = 22; bold = $false },
  @{ text = ""; size = 22; bold = $false },

  @{ text = "8. Fitur admin panel"; size = 28; bold = $true },
  @{ text = "a) Tambahkan login admin terpisah dari siswa."; size = 22; bold = $false },
  @{ text = "b) Buat halaman kelola siswa: tambah, edit, reset password, reset progres."; size = 22; bold = $false },
  @{ text = "c) Tambahkan kelola user admin juga."; size = 22; bold = $false },
  @{ text = "d) Tambahkan export data (XLS/PDF sesuai kebutuhan)."; size = 22; bold = $false },
  @{ text = ""; size = 22; bold = $false },

  @{ text = "9. Build dan deploy ke Cloudflare"; size = 28; bold = $true },
  @{ text = "a) Install Wrangler CLI: npm i -D wrangler (atau global)."; size = 22; bold = $false },
  @{ text = "b) Login Cloudflare: npx wrangler login."; size = 22; bold = $false },
  @{ text = "c) Build project: npm run build."; size = 22; bold = $false },
  @{ text = "d) Deploy: npx wrangler deploy."; size = 22; bold = $false },
  @{ text = "e) Cek URL workers.dev untuk memastikan website online."; size = 22; bold = $false },
  @{ text = ""; size = 22; bold = $false },

  @{ text = "10. Menghubungkan domain sendiri"; size = 28; bold = $true },
  @{ text = "a) Tambahkan domain (misal .my.id) ke Cloudflare."; size = 22; bold = $false },
  @{ text = "b) Ubah nameserver di provider domain (contoh Domainesia) ke Cloudflare."; size = 22; bold = $false },
  @{ text = "c) Buat route Worker ke domain utama."; size = 22; bold = $false },
  @{ text = "d) Pastikan SSL/TLS aktif dan status DNS proxied (awan oranye)."; size = 22; bold = $false },
  @{ text = ""; size = 22; bold = $false },

  @{ text = "11. Checklist sebelum rilis"; size = 28; bold = $true },
  @{ text = "- Semua level bisa dimainkan dari awal sampai akhir."; size = 22; bold = $false },
  @{ text = "- Audio sesuai soal dan tidak ada file rusak/duplikat."; size = 22; bold = $false },
  @{ text = "- Progres siswa tersimpan dan tampil di dashboard."; size = 22; bold = $false },
  @{ text = "- Feedback benar/salah jelas, konsisten, dan pakai bahasa yang sesuai."; size = 22; bold = $false },
  @{ text = "- Tampilan bagus di desktop dan mobile."; size = 22; bold = $false },
  @{ text = "- Build sukses tanpa error: npm run build."; size = 22; bold = $false },
  @{ text = ""; size = 22; bold = $false },

  @{ text = "12. Saran pengembangan berikutnya"; size = 28; bold = $true },
  @{ text = "- Tambah bank soal kalimat bertingkat kesulitan."; size = 22; bold = $false },
  @{ text = "- Tambah statistik detail per siswa dan per level."; size = 22; bold = $false },
  @{ text = "- Tambah mode latihan tanpa skor untuk pemula."; size = 22; bold = $false },
  @{ text = "- Tambah backup data berkala dari Supabase."; size = 22; bold = $false }
)

$paragraphs = foreach ($line in $lines) {
  New-Paragraph -Text $line.text -FontSize $line.size -Bold $line.bold
}

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
    $($paragraphs -join "")
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="900" w:right="900" w:bottom="900" w:left="900" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

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
      <vt:lpstr>Panduan Membuat Game Aksara Sunda</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
  <Company>Game Aksara Sunda</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>
"@

$createdAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$coreXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Panduan Lengkap Membuat Game Aksara Sunda</dc:title>
  <dc:subject>Panduan Teknis</dc:subject>
  <dc:creator>Codex</dc:creator>
  <cp:keywords>aksara sunda, vite, tanstack react, supabase, cloudflare</cp:keywords>
  <dc:description>Langkah rinci membuat dan deploy Game Aksara Sunda.</dc:description>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$createdAt</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$createdAt</dcterms:modified>
</cp:coreProperties>
"@

$stagingRoot = Join-Path $env:TEMP ("panduan-aksara-" + [Guid]::NewGuid().ToString("N"))
$zipPath = Join-Path $env:TEMP ("panduan-aksara-" + [Guid]::NewGuid().ToString("N") + ".zip")

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

  $outputDir = Split-Path -Parent $OutputPath
  if ($outputDir) {
    [System.IO.Directory]::CreateDirectory($outputDir) | Out-Null
  }

  Copy-Item -LiteralPath $zipPath -Destination $OutputPath -Force
}
finally {
  if (Test-Path -LiteralPath $stagingRoot) {
    Remove-Item -LiteralPath $stagingRoot -Recurse -Force
  }

  if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }
}
