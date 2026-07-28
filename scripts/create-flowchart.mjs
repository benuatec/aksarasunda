import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "generated-docs");

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const chromePath = chromeCandidates.find((candidate) => fs.existsSync(candidate));

if (!chromePath) {
  throw new Error("Chrome atawa Edge teu kapanggih keur nyetak diagram.");
}

fs.mkdirSync(outDir, { recursive: true });

const htmlPath = path.join(outDir, "diagram-alir-game-aksara-sunda.html");
const pdfPath = path.join(rootDir, "diagram-alir-game-aksara-sunda.pdf");
const pngPath = path.join(rootDir, "diagram-alir-game-aksara-sunda.png");

const html = String.raw`<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <title>Diagram Alir Game Aksara Sunda</title>
    <style>
      @page {
        size: A4 landscape;
        margin: 7mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        background: #ffffff;
        color: #000000;
      }

      .page {
        width: 1120px;
        min-height: 770px;
        margin: 0 auto;
        padding: 18px 20px 14px;
        background: #ffffff;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 20px;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 3px solid #000000;
      }

      h1 {
        margin: 0;
        font-size: 30px;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .subtitle {
        max-width: 430px;
        font-size: 11px;
        line-height: 1.4;
        text-align: right;
      }

      svg {
        width: 100%;
        height: 650px;
        display: block;
      }

      .lane-title {
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.08em;
      }

      .node-title {
        font-size: 13px;
        font-weight: 800;
      }

      .node-text {
        font-size: 10px;
      }

      .label {
        font-size: 10px;
        font-weight: 700;
      }

      .footer {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        border-top: 1px solid #000000;
        padding-top: 6px;
        margin-top: 4px;
        font-size: 10px;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="header">
        <div>
          <h1>Diagram Alir Game Aksara Sunda</h1>
        </div>
        <div class="subtitle">
          Ringkesan alur aplikasi versi ayeuna. Warna dijieun hideung bodas supaya gampang dibaca,
          dicitak, jeung dipake keur presentasi atawa dokumen sakola.
        </div>
      </section>

      <svg viewBox="0 0 1080 650" role="img" aria-label="Diagram alir Game Aksara Sunda">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#000000" />
          </marker>
          <style>
            .lane { fill: #ffffff; stroke: #000000; stroke-width: 1.6; }
            .node { fill: #ffffff; stroke: #000000; stroke-width: 2; }
            .soft { fill: #f3f3f3; stroke: #000000; stroke-width: 2; }
            .data { fill: #ffffff; stroke: #000000; stroke-width: 2; stroke-dasharray: 7 5; }
            .arrow { fill: none; stroke: #000000; stroke-width: 2; marker-end: url(#arrow); }
            .dashed { fill: none; stroke: #000000; stroke-width: 1.8; stroke-dasharray: 7 5; marker-end: url(#arrow); }
          </style>
        </defs>

        <rect class="lane" x="10" y="12" width="1060" height="118" rx="16" />
        <rect class="lane" x="10" y="142" width="1060" height="164" rx="16" />
        <rect class="lane" x="10" y="318" width="1060" height="140" rx="16" />
        <rect class="lane" x="10" y="470" width="1060" height="156" rx="16" />

        <text x="28" y="34" class="lane-title">AKSES PEMAIN</text>
        <text x="28" y="164" class="lane-title">ALUR BELAJAR DAN KUIS</text>
        <text x="28" y="340" class="lane-title">FITUR LATIHAN DAN PENGATURAN</text>
        <text x="28" y="492" class="lane-title">ADMIN DAN PENYIMPANAN DATA</text>

        <rect class="soft" x="36" y="54" width="150" height="54" rx="14" />
        <text x="111" y="77" text-anchor="middle" class="node-title">Website Dibuka</text>
        <text x="111" y="94" text-anchor="middle" class="node-text">Cloudflare</text>

        <rect class="node" x="226" y="54" width="150" height="54" rx="14" />
        <text x="301" y="77" text-anchor="middle" class="node-title">Halaman Awal</text>
        <text x="301" y="94" text-anchor="middle" class="node-text">Logo, musik, tombol asup</text>

        <rect class="node" x="416" y="54" width="164" height="54" rx="14" />
        <text x="498" y="77" text-anchor="middle" class="node-title">Daftar / Masuk</text>
        <text x="498" y="94" text-anchor="middle" class="node-text">Ngaran, kelas, sandi, avatar</text>

        <rect class="node" x="620" y="54" width="160" height="54" rx="14" />
        <text x="700" y="77" text-anchor="middle" class="node-title">Menu Utama</text>
        <text x="700" y="94" text-anchor="middle" class="node-text">Pilih fitur kaulinan</text>

        <rect class="data" x="820" y="54" width="214" height="54" rx="14" />
        <text x="927" y="77" text-anchor="middle" class="node-title">Supabase</text>
        <text x="927" y="94" text-anchor="middle" class="node-text">Siswa, admin, progres, skor</text>

        <path class="arrow" d="M 186 81 H 226" />
        <path class="arrow" d="M 376 81 H 416" />
        <path class="arrow" d="M 580 81 H 620" />
        <path class="dashed" d="M 580 68 C 650 30, 760 26, 820 58" />
        <path class="dashed" d="M 780 94 H 820" />

        <rect class="node" x="40" y="192" width="170" height="70" rx="16" />
        <text x="125" y="218" text-anchor="middle" class="node-title">Mulai Belajar</text>
        <text x="125" y="236" text-anchor="middle" class="node-text">Asup ka materi level</text>

        <rect class="node" x="250" y="192" width="198" height="70" rx="16" />
        <text x="349" y="215" text-anchor="middle" class="node-title">Pilih Level 1 - 4</text>
        <text x="349" y="233" text-anchor="middle" class="node-text">Muka bertahap ti gampang ka hésé</text>
        <text x="349" y="248" text-anchor="middle" class="node-text">1 Swara & angka | 2 Ngalagena</text>
        <text x="349" y="260" text-anchor="middle" class="node-text">3 Rarangken | 4 Nyusun kalimah</text>

        <rect class="node" x="488" y="192" width="170" height="70" rx="16" />
        <text x="573" y="218" text-anchor="middle" class="node-title">Materi Level</text>
        <text x="573" y="236" text-anchor="middle" class="node-text">Aksara, audio, conto, latihan</text>

        <rect class="soft" x="698" y="192" width="166" height="70" rx="16" />
        <text x="781" y="218" text-anchor="middle" class="node-title">Kuis Level</text>
        <text x="781" y="236" text-anchor="middle" class="node-text">Milih jawaban atawa nyusun kecap</text>

        <rect class="soft" x="904" y="192" width="140" height="70" rx="16" />
        <text x="974" y="215" text-anchor="middle" class="node-title">Lulus?</text>
        <text x="974" y="233" text-anchor="middle" class="node-text">Leres: buka level</text>
        <text x="974" y="248" text-anchor="middle" class="node-text">Henteu: ulin deui</text>

        <rect class="data" x="698" y="278" width="166" height="56" rx="16" />
        <text x="781" y="302" text-anchor="middle" class="node-title">Simpan Progres</text>
        <text x="781" y="319" text-anchor="middle" class="node-text">Skor, level, riwayat</text>

        <path class="arrow" d="M 210 227 H 250" />
        <path class="arrow" d="M 448 227 H 488" />
        <path class="arrow" d="M 658 227 H 698" />
        <path class="arrow" d="M 864 227 H 904" />
        <path class="arrow" d="M 974 262 V 294 H 864" />
        <path class="dashed" d="M 864 306 H 820 V 108" />
        <text x="884" y="286" class="label">skor</text>

        <path class="arrow" d="M 700 334 C 610 354, 470 356, 360 346" />
        <text x="520" y="365" class="label">lanjut ka level saterusna</text>

        <rect class="node" x="40" y="374" width="180" height="58" rx="16" />
        <text x="130" y="398" text-anchor="middle" class="node-title">Latihan Menulis</text>
        <text x="130" y="416" text-anchor="middle" class="node-text">Niron bentuk aksara</text>

        <rect class="node" x="260" y="374" width="180" height="58" rx="16" />
        <text x="350" y="398" text-anchor="middle" class="node-title">Membaca</text>
        <text x="350" y="416" text-anchor="middle" class="node-text">Audio jeung maca kecap</text>

        <rect class="soft" x="480" y="374" width="180" height="58" rx="16" />
        <text x="570" y="398" text-anchor="middle" class="node-title">Feedback</text>
        <text x="570" y="416" text-anchor="middle" class="node-text">Leres / lepat + sora</text>

        <rect class="soft" x="700" y="374" width="160" height="58" rx="16" />
        <text x="780" y="398" text-anchor="middle" class="node-title">Lihat Progres</text>
        <text x="780" y="416" text-anchor="middle" class="node-text">Ringkesan skor jeung level</text>

        <rect class="node" x="900" y="374" width="144" height="58" rx="16" />
        <text x="972" y="398" text-anchor="middle" class="node-title">Pengaturan</text>
        <text x="972" y="416" text-anchor="middle" class="node-text">Musik, SFX, kaluar</text>

        <path class="arrow" d="M 220 403 H 260" />
        <path class="arrow" d="M 440 403 H 480" />
        <path class="arrow" d="M 660 403 H 700" />
        <path class="arrow" d="M 860 403 H 900" />
        <path class="dashed" d="M 570 432 V 448 H 820 V 108" />

        <rect class="soft" x="40" y="528" width="150" height="62" rx="16" />
        <text x="115" y="553" text-anchor="middle" class="node-title">Tombol Admin</text>
        <text x="115" y="571" text-anchor="middle" class="node-text">Leutik di pojok luhur</text>

        <rect class="soft" x="230" y="528" width="150" height="62" rx="16" />
        <text x="305" y="553" text-anchor="middle" class="node-title">Login Admin</text>
        <text x="305" y="571" text-anchor="middle" class="node-text">Email jeung sandi</text>

        <rect class="soft" x="420" y="528" width="188" height="62" rx="16" />
        <text x="514" y="553" text-anchor="middle" class="node-title">Dashboard Admin</text>
        <text x="514" y="571" text-anchor="middle" class="node-text">Statistik jeung tabel siswa</text>

        <rect class="soft" x="648" y="500" width="188" height="56" rx="16" />
        <text x="742" y="523" text-anchor="middle" class="node-title">Kelola Siswa</text>
        <text x="742" y="540" text-anchor="middle" class="node-text">Tambah, edit, reset, aktifkeun</text>

        <rect class="soft" x="648" y="570" width="188" height="56" rx="16" />
        <text x="742" y="593" text-anchor="middle" class="node-title">Kelola Admin</text>
        <text x="742" y="610" text-anchor="middle" class="node-text">Tambah jeung atur admin</text>

        <rect class="data" x="876" y="528" width="168" height="62" rx="16" />
        <text x="960" y="553" text-anchor="middle" class="node-title">Data di Supabase</text>
        <text x="960" y="571" text-anchor="middle" class="node-text">RPC, auth, progres, export</text>

        <path class="arrow" d="M 190 559 H 230" />
        <path class="arrow" d="M 380 559 H 420" />
        <path class="arrow" d="M 608 559 H 648" />
        <path class="dashed" d="M 836 528 H 876" />
        <path class="dashed" d="M 836 598 H 876" />

        <text x="540" y="638" text-anchor="middle" class="node-text">
          Alur utama: asup -> pilih fitur -> diajar -> kuis -> feedback -> progres kasimpen.
        </text>
      </svg>

      <section class="footer">
        <span>Versi ieu nyocogkeun struktur game anu ayeuna: 4 level, latihan menulis, membaca, progres, pangaturan, jeung panel admin.</span>
        <span>Target situs: aksarasunda.my.id</span>
      </section>
    </main>
  </body>
</html>`;

fs.writeFileSync(htmlPath, html, "utf8");

function run(command, args, label) {
  const result = spawnSync(command, args, { stdio: "pipe", encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${label} gagal.\n${result.stdout}\n${result.stderr}`);
  }
}

run(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--print-to-pdf-no-header",
    "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ],
  "Render PDF diagram",
);

run(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--window-size=1500,1100",
    "--virtual-time-budget=2000",
    `--screenshot=${pngPath}`,
    pathToFileURL(htmlPath).href,
  ],
  "Render PNG diagram",
);

console.log(`PDF diagram: ${pdfPath}`);
console.log(`PNG diagram: ${pngPath}`);
console.log(`Sumber HTML: ${htmlPath}`);
