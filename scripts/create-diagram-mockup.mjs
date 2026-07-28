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
  throw new Error("Chrome/Edge tidak ditemukan untuk render PDF/JPG.");
}

fs.mkdirSync(outDir, { recursive: true });

const assetUrl = (relativePath) => pathToFileURL(path.join(rootDir, relativePath)).href;

const diagramHtmlPath = path.join(outDir, "diagram-alir-game-aksara-sunda.html");
const diagramPdfPath = path.join(rootDir, "diagram-alir-game-aksara-sunda.pdf");
const mockupHtmlPath = path.join(outDir, "mockup-game-aksara-sunda.html");
const mockupPngPath = path.join(outDir, "mockup-game-aksara-sunda.png");
const mockupJpgPath = path.join(rootDir, "mockup-game-aksara-sunda.jpg");

const diagramHtml = String.raw`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Diagram Alir Game Aksara Sunda</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #fff;
      color: #000;
      font-family: "Arial", sans-serif;
    }

    .page {
      width: 1120px;
      height: 770px;
      margin: 0 auto;
      padding: 18px 22px 14px;
      background: #fff;
    }

    .title {
      display: flex;
      align-items: end;
      justify-content: space-between;
      border-bottom: 3px solid #000;
      padding-bottom: 9px;
      margin-bottom: 12px;
    }

    h1 {
      font-size: 29px;
      line-height: 1;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .subtitle {
      max-width: 400px;
      font-size: 11px;
      line-height: 1.35;
      text-align: right;
    }

    svg {
      width: 100%;
      height: 650px;
      display: block;
    }

    .node-title {
      font-weight: 800;
      font-size: 14px;
    }

    .node-text {
      font-size: 11px;
    }

    .small {
      font-size: 10px;
    }

    .label {
      font-size: 10px;
      font-weight: 700;
    }

    .legend {
      display: flex;
      gap: 18px;
      align-items: center;
      font-size: 10px;
      margin-top: 4px;
      border-top: 1px solid #000;
      padding-top: 6px;
    }

    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .sample {
      width: 18px;
      height: 10px;
      border: 1.8px solid #000;
      display: inline-block;
    }

    .dashed {
      border-style: dashed;
      background: #f7f7f7;
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="title">
      <div>
        <h1>Diagram Alir Aplikasi Game Aksara Sunda</h1>
      </div>
      <div class="subtitle">
        Alur dibuat hitam putih agar mudah dicetak. Garis penuh = alur pemain,
        garis putus-putus = alur data/backend, dan admin dapat masuk ke mode cek level tanpa memengaruhi progres siswa.
      </div>
    </section>

    <svg viewBox="0 0 1080 650" role="img" aria-label="Diagram alir aplikasi Game Aksara Sunda">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#000" />
        </marker>
        <style>
          .box { fill: #fff; stroke: #000; stroke-width: 2.2; }
          .box-soft { fill: #f4f4f4; stroke: #000; stroke-width: 2.2; }
          .box-data { fill: #fff; stroke: #000; stroke-width: 2.2; stroke-dasharray: 7 5; }
          .arrow { fill: none; stroke: #000; stroke-width: 2.1; marker-end: url(#arrow); }
          .arrow-dashed { fill: none; stroke: #000; stroke-width: 2; stroke-dasharray: 7 5; marker-end: url(#arrow); }
        </style>
      </defs>

      <rect class="box-soft" x="18" y="18" width="180" height="62" rx="14" />
      <text x="108" y="43" text-anchor="middle" class="node-title">Website Dibuka</text>
      <text x="108" y="61" text-anchor="middle" class="node-text">Cloudflare Worker</text>

      <rect class="box" x="250" y="18" width="190" height="62" rx="14" />
      <text x="345" y="43" text-anchor="middle" class="node-title">Menu Utama</text>
      <text x="345" y="61" text-anchor="middle" class="node-text">Belajar, menulis, baca, progres</text>

      <rect class="box" x="492" y="18" width="170" height="62" rx="14" />
      <text x="577" y="43" text-anchor="middle" class="node-title">Daftar / Masuk</text>
      <text x="577" y="61" text-anchor="middle" class="node-text">Nama, kelas, password</text>

      <rect class="box-data" x="716" y="18" width="185" height="62" rx="14" />
      <text x="808" y="43" text-anchor="middle" class="node-title">Supabase</text>
      <text x="808" y="61" text-anchor="middle" class="node-text">Siswa, admin, progres</text>

      <rect class="box" x="250" y="124" width="190" height="64" rx="14" />
      <text x="345" y="150" text-anchor="middle" class="node-title">Pilih Level</text>
      <text x="345" y="168" text-anchor="middle" class="node-text">Level terkunci/terbuka</text>

      <rect class="box" x="62" y="236" width="190" height="76" rx="14" />
      <text x="157" y="262" text-anchor="middle" class="node-title">Level 1</text>
      <text x="157" y="280" text-anchor="middle" class="node-text">Aksara swara</text>
      <text x="157" y="296" text-anchor="middle" class="node-text">dan angka 0-9</text>

      <rect class="box" x="314" y="236" width="190" height="76" rx="14" />
      <text x="409" y="262" text-anchor="middle" class="node-title">Level 2</text>
      <text x="409" y="280" text-anchor="middle" class="node-text">Aksara ngalagena</text>
      <text x="409" y="296" text-anchor="middle" class="node-text">huruf dasar</text>

      <rect class="box" x="566" y="236" width="190" height="76" rx="14" />
      <text x="661" y="262" text-anchor="middle" class="node-title">Level 3</text>
      <text x="661" y="280" text-anchor="middle" class="node-text">Rarangken</text>
      <text x="661" y="296" text-anchor="middle" class="node-text">dan membaca kata</text>

      <rect class="box" x="818" y="236" width="190" height="76" rx="14" />
      <text x="913" y="262" text-anchor="middle" class="node-title">Level 4</text>
      <text x="913" y="280" text-anchor="middle" class="node-text">Menyusun kalimat</text>
      <text x="913" y="296" text-anchor="middle" class="node-text">sederhana</text>

      <rect class="box-soft" x="314" y="376" width="190" height="70" rx="14" />
      <text x="409" y="402" text-anchor="middle" class="node-title">Kuis Level</text>
      <text x="409" y="420" text-anchor="middle" class="node-text">Pilih jawaban / susun kata</text>

      <rect class="box-soft" x="566" y="376" width="190" height="70" rx="14" />
      <text x="661" y="402" text-anchor="middle" class="node-title">Nilai >= 70%</text>
      <text x="661" y="420" text-anchor="middle" class="node-text">Buka level berikutnya</text>

      <rect class="box-data" x="818" y="376" width="190" height="70" rx="14" />
      <text x="913" y="402" text-anchor="middle" class="node-title">Simpan Progres</text>
      <text x="913" y="420" text-anchor="middle" class="node-text">Level, skor, avatar</text>

      <rect class="box" x="18" y="510" width="180" height="70" rx="14" />
      <text x="108" y="535" text-anchor="middle" class="node-title">Latihan Menulis</text>
      <text x="108" y="553" text-anchor="middle" class="node-text">Cek bentuk huruf</text>

      <rect class="box" x="238" y="510" width="180" height="70" rx="14" />
      <text x="328" y="535" text-anchor="middle" class="node-title">Membaca</text>
      <text x="328" y="553" text-anchor="middle" class="node-text">Audio kata dan aksara</text>

      <rect class="box" x="458" y="510" width="180" height="70" rx="14" />
      <text x="548" y="535" text-anchor="middle" class="node-title">Lihat Progres</text>
      <text x="548" y="553" text-anchor="middle" class="node-text">Ringkasan belajar siswa</text>

      <rect class="box" x="678" y="510" width="180" height="70" rx="14" />
      <text x="768" y="535" text-anchor="middle" class="node-title">Pengaturan</text>
      <text x="768" y="553" text-anchor="middle" class="node-text">Musik, efek, profil</text>

      <rect class="box-soft" x="900" y="510" width="160" height="70" rx="14" />
      <text x="980" y="535" text-anchor="middle" class="node-title">Keluar</text>
      <text x="980" y="553" text-anchor="middle" class="node-text">Reset sesi siswa</text>

      <rect class="box" x="492" y="124" width="170" height="64" rx="14" />
      <text x="577" y="150" text-anchor="middle" class="node-title">Admin Login</text>
      <text x="577" y="168" text-anchor="middle" class="node-text">Tombol kecil kanan atas</text>

      <rect class="box-soft" x="716" y="124" width="185" height="64" rx="14" />
      <text x="808" y="150" text-anchor="middle" class="node-title">Admin Panel</text>
      <text x="808" y="168" text-anchor="middle" class="node-text">Kelola siswa dan admin</text>

      <rect class="box-soft" x="930" y="124" width="130" height="64" rx="14" />
      <text x="995" y="150" text-anchor="middle" class="node-title">Mode Cek</text>
      <text x="995" y="168" text-anchor="middle" class="node-text">Semua level bebas</text>

      <path class="arrow" d="M 198 49 L 250 49" />
      <path class="arrow" d="M 440 49 L 492 49" />
      <path class="arrow-dashed" d="M 662 49 L 716 49" />
      <path class="arrow" d="M 345 80 L 345 124" />
      <path class="arrow" d="M 492 156 L 440 156" />
      <path class="arrow" d="M 440 156 L 345 156" />
      <path class="arrow" d="M 440 49 C 458 88 500 106 566 124" />
      <path class="arrow" d="M 662 156 L 716 156" />
      <path class="arrow" d="M 901 156 L 930 156" />
      <path class="arrow-dashed" d="M 808 188 L 808 218 C 808 350 910 340 913 376" />

      <path class="arrow" d="M 345 188 C 315 214 245 222 157 236" />
      <path class="arrow" d="M 345 188 C 357 214 385 222 409 236" />
      <path class="arrow" d="M 440 156 C 530 174 620 190 661 236" />
      <path class="arrow" d="M 440 156 C 690 166 858 190 913 236" />

      <path class="arrow" d="M 157 312 C 180 350 260 365 314 399" />
      <path class="arrow" d="M 409 312 L 409 376" />
      <path class="arrow" d="M 661 312 C 620 348 560 370 504 399" />
      <path class="arrow" d="M 913 312 C 850 348 790 370 756 399" />
      <path class="arrow" d="M 504 411 L 566 411" />
      <path class="arrow-dashed" d="M 756 411 L 818 411" />
      <path class="arrow" d="M 661 446 C 652 482 508 492 409 446" />
      <text x="505" y="468" class="label">jika belum cukup, ulangi</text>

      <path class="arrow" d="M 345 188 C 255 292 125 392 108 510" />
      <path class="arrow" d="M 345 188 C 335 302 330 410 328 510" />
      <path class="arrow" d="M 345 188 C 445 320 520 420 548 510" />
      <path class="arrow" d="M 345 188 C 560 326 710 420 768 510" />
      <path class="arrow" d="M 345 188 C 760 315 920 420 980 510" />
      <path class="arrow-dashed" d="M 548 510 C 635 470 758 455 913 446" />
      <path class="arrow-dashed" d="M 808 80 L 808 124" />

      <text x="882" y="604" class="small">Audio dipakai di tombol, feedback benar/salah, musik latar, dan pelafalan level.</text>
    </svg>

    <section class="legend">
      <span><i class="sample"></i> Alur layar/interaksi pemain</span>
      <span><i class="sample dashed"></i> Alur data ke Supabase</span>
      <span>Target deploy: https://aksarasunda.my.id</span>
    </section>
  </main>
</body>
</html>`;

const flowchartDiagramHtml = String.raw`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Diagram Alir Game Aksara Sunda</title>
  <style>
    @page {
      size: 520mm 850mm;
      margin: 10mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #fff;
      color: #000;
      font-family: "Times New Roman", Times, serif;
    }

    .page {
      position: relative;
      width: 1860px;
      height: 3000px;
      margin: 0 auto;
      background: #fff;
      overflow: hidden;
    }

    h1,
    h2 {
      position: absolute;
      left: 0;
      width: 100%;
      margin: 0;
      text-align: center;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    h1 {
      top: 70px;
      font-size: 42px;
    }

    h2 {
      top: 125px;
      font-size: 36px;
    }

    svg.lines {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .node {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px 20px;
      border: 3px solid #000;
      background: #fff;
      text-align: center;
      line-height: 1.18;
      font-size: 26px;
      white-space: pre-line;
    }

    .small {
      font-size: 22px;
    }

    .large {
      font-size: 31px;
    }

    .title-node {
      font-size: 30px;
      font-weight: 700;
    }

    .left {
      align-items: flex-start;
      justify-content: flex-start;
      text-align: left;
    }

    .terminator {
      border-radius: 999px;
    }

    .process {
      border-radius: 0;
    }

    .data {
      border: 0;
      clip-path: polygon(12% 0, 100% 0, 88% 100%, 0 100%);
    }

    .data::before {
      content: "";
      position: absolute;
      inset: 0;
      background: #000;
      clip-path: polygon(12% 0, 100% 0, 88% 100%, 0 100%, 12% 0, calc(12% + 3px) 3px, 4px calc(100% - 3px), calc(88% - 3px) calc(100% - 3px), calc(100% - 4px) 3px, calc(12% + 3px) 3px);
      pointer-events: none;
    }

    .decision {
      border: 0;
      transform: rotate(45deg);
    }

    .decision::before {
      content: "";
      position: absolute;
      inset: 0;
      border: 3px solid #000;
      background: #fff;
      z-index: -1;
    }

    .decision .inside {
      transform: rotate(-45deg);
      width: 74%;
      line-height: 1.15;
    }

    .document {
      border: 0;
      clip-path: polygon(0 0, 100% 0, 100% 84%, 84% 84%, 66% 88%, 50% 96%, 35% 100%, 18% 98%, 0 90%);
    }

    .document::before {
      content: "";
      position: absolute;
      inset: 0;
      background: #000;
      clip-path: polygon(0 0, 100% 0, 100% 84%, 84% 84%, 66% 88%, 50% 96%, 35% 100%, 18% 98%, 0 90%, 0 0, 3px 3px, 3px calc(90% - 4px), 19% calc(98% - 3px), 34% calc(100% - 4px), 49% calc(96% - 4px), 65% calc(88% - 4px), 83% calc(84% - 3px), calc(100% - 3px) calc(84% - 3px), calc(100% - 3px) 3px, 3px 3px);
      pointer-events: none;
    }

    .caption {
      position: absolute;
      font-size: 20px;
      line-height: 1.15;
      text-align: center;
    }
  </style>
</head>
<body>
  <main class="page">
    <h1>DIAGRAM ALIR</h1>
    <h2>GAME AKSARA SUNDA</h2>

    <svg class="lines" viewBox="0 0 1860 2700" aria-hidden="true">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8.8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="#000" />
        </marker>
      </defs>
      <g fill="none" stroke="#000" stroke-width="3" marker-end="url(#arrow)">
        <path d="M930 235 L930 290" />
        <path d="M930 410 L930 460" />
        <path d="M930 570 L930 630" />
        <path d="M930 740 L930 790" />
        <path d="M930 890 L930 955" />

        <path d="M930 1035 L180 1035 L180 1110" />
        <path d="M930 1035 L500 1035 L500 1110" />
        <path d="M930 1035 L820 1035 L820 1110" />
        <path d="M930 1035 L1140 1035 L1140 1110" />
        <path d="M930 1035 L1460 1035 L1460 1110" />
        <path d="M930 1035 L1690 1035 L1690 1110" />

        <path d="M180 1405 L180 1460" />
        <path d="M180 1600 L180 1660" />
        <path d="M180 1780 L180 1865" />
        <path d="M180 2045 L180 2120" />
        <path d="M180 2240 L180 2295" />

        <path d="M500 1405 L500 1460" />
        <path d="M500 1585 L500 1660" />
        <path d="M500 1870 L500 1945" />
        <path d="M500 2145 L500 2220" />

        <path d="M820 1405 L820 1460" />
        <path d="M820 1585 L820 1660" />
        <path d="M820 1870 L820 1945" />
        <path d="M820 2145 L820 2220" />

        <path d="M1140 1405 L1140 1460" />
        <path d="M1140 1615 L1140 1690" />

        <path d="M1460 1405 L1460 1460" />
        <path d="M1460 1640 L1460 1710" />

        <path d="M1690 1405 L1690 1460" />
        <path d="M1690 1635 L1690 1710" />

        <path d="M180 2385 L930 2385 L930 2310" />
        <path d="M500 2385 L930 2385" />
        <path d="M820 2385 L930 2385" />
        <path d="M1140 1840 L1140 1945" />
        <path d="M1140 2145 L930 2220" />
        <path d="M930 2420 L930 2490" />

        <path d="M1098 2338 L1280 2338 L1280 2190" />
        <path d="M1098 2338 L1340 2338 L1340 2420" />
        <path d="M1340 2580 L1340 2630" />
        <path d="M1340 2338 L1535 2338 L1535 2120" />
        <path d="M1535 1940 L1535 1860" />

        <path d="M1565 1860 L1690 1860 L1690 1790" />
        <path d="M1535 1940 L1535 2020" />
      </g>
      <g fill="none" stroke="#000" stroke-width="3">
        <path d="M168 1035 L192 1035" />
        <path d="M488 1035 L512 1035" />
        <path d="M808 1035 L832 1035" />
        <path d="M1128 1035 L1152 1035" />
        <path d="M1448 1035 L1472 1035" />
        <path d="M1678 1035 L1702 1035" />
      </g>
    </svg>

    <div class="node terminator large" style="left: 720px; top: 175px; width: 420px; height: 80px;">Mulai</div>
    <div class="node process left large" style="left: 640px; top: 290px; width: 580px; height: 120px;">Halaman Awal
Wilujeng Sumping
"Game Aksara Sunda"</div>
    <div class="node process large" style="left: 640px; top: 460px; width: 580px; height: 110px;">Daftar / Masuk Siswa
Nama, Kelas, Password</div>
    <div class="node data large" style="left: 660px; top: 630px; width: 540px; height: 110px;">Data Siswa</div>
    <div class="node process title-node" style="left: 660px; top: 790px; width: 540px; height: 100px;">MENU UTAMA</div>

    <div class="node process left small" style="left: 50px; top: 1110px; width: 260px; height: 295px;">1. MULAI BELAJAR
(AKSARA SUNDA)

- Level 1 Swara & Angka
- Level 2 Ngalagena
- Level 3 Rarangken & Kata
- Level 4 Menyusun Kalimat</div>

    <div class="node process left small" style="left: 370px; top: 1110px; width: 260px; height: 295px;">2. LATIHAN MENULIS
(TRACING HURUF)

- Pilih huruf / kata
- Menebalkan huruf
- Menulis ulang</div>

    <div class="node process left small" style="left: 690px; top: 1110px; width: 260px; height: 295px;">3. MEMBACA

- Tampilan aksara / kata / kalimat
- Suara bacaan
- Pemain membaca</div>

    <div class="node process left small" style="left: 1010px; top: 1110px; width: 260px; height: 295px;">4. LIHAT PROGRES

- Data pemain
- Skor tertinggi
- Level tercapai
- Statistik belajar</div>

    <div class="node process left small" style="left: 1330px; top: 1110px; width: 260px; height: 295px;">5. PENGATURAN

- Musik ON / OFF
- Suara ON / OFF
- Avatar profil</div>

    <div class="node process left small" style="left: 1610px; top: 1110px; width: 230px; height: 295px;">6. ADMIN

- Login admin
- Kelola siswa
- Kelola user admin
- Export XLS
- Mode cek level</div>

    <div class="node process left small" style="left: 40px; top: 1460px; width: 280px; height: 140px;">MULAI KUIS

- Tampilkan aksara
- Suara pelafalan
- Pilihan jawaban / susun kata</div>

    <div class="node process left small" style="left: 360px; top: 1460px; width: 280px; height: 125px;">PEMAIN MENULIS
DI LAYAR</div>

    <div class="node process left small" style="left: 680px; top: 1460px; width: 280px; height: 125px;">PEMAIN MEMBACA
(Voice / baca sendiri)</div>

    <div class="node document left small" style="left: 1010px; top: 1460px; width: 260px; height: 155px;">TAMPILKAN DATA

- Level tertinggi
- Total skor
- Status belajar</div>

    <div class="node document left small" style="left: 1330px; top: 1460px; width: 260px; height: 180px;">SIMPAN PENGATURAN

- Musik latar
- Efek tombol
- Profil siswa</div>

    <div class="node process left small" style="left: 1600px; top: 1460px; width: 250px; height: 175px;">ADMIN PANEL

- Tambah/edit siswa
- Reset password
- Reset progres
- Kelola admin</div>

    <div class="node process title-node" style="left: 20px; top: 1660px; width: 320px; height: 120px;">PEMAIN MEMILIH
JAWABAN</div>

    <div class="node data large" style="left: 340px; top: 1660px; width: 320px; height: 210px;">FEEDBACK

- Bagus
- Coba lagi
+ Suara</div>

    <div class="node data large" style="left: 660px; top: 1660px; width: 320px; height: 210px;">FEEDBACK

- Bagus
- Coba lagi
+ Suara</div>

    <div class="node process left small" style="left: 1560px; top: 1710px; width: 250px; height: 150px;">MODE CEK LEVEL

Admin bebas mencoba level tanpa menyimpan skor siswa.</div>

    <div class="node decision large" style="left: 20px; top: 1865px; width: 320px; height: 320px;"><div class="inside">JAWABAN
BENAR?</div></div>

    <div class="node process left small" style="left: 360px; top: 1945px; width: 280px; height: 200px;">Simpan Hasil
Latihan Menulis
ke Supabase</div>

    <div class="node process left small" style="left: 680px; top: 1945px; width: 280px; height: 200px;">Simpan Hasil
Latihan Membaca
ke Supabase</div>

    <div class="node process left small" style="left: 1390px; top: 2020px; width: 290px; height: 170px;">NAIK KE
LEVEL BERIKUTNYA</div>

    <div class="node document left small" style="left: 1510px; top: 1860px; width: 300px; height: 260px;">HALAMAN HASIL AKHIR

Tampilkan:
- Skor akhir
- Level kategori
- Perlu belajar lagi / cukup / sangat baik</div>

    <div class="node document left small" style="left: 1585px; top: 2200px; width: 250px; height: 285px;">PILIHAN AKHIR

- Main lagi
- Lanjut level
- Lihat progres
- Kembali ke menu</div>

    <div class="node document left small" style="left: 25px; top: 2295px; width: 300px; height: 250px;">FEEDBACK SALAH

"Lepat!"

Tampilkan jawaban benar
dan suara penjelasan</div>

    <div class="node document left small" style="left: 345px; top: 2295px; width: 300px; height: 250px;">FEEDBACK BENAR

"Leres!"

+ 10 poin
+ suara benar</div>

    <div class="node decision large" style="left: 680px; top: 2220px; width: 500px; height: 500px;"><div class="inside">SOAL TERAKHIR
LEVEL INI?</div></div>

    <div class="node process left small" style="left: 1160px; top: 2420px; width: 330px; height: 160px;">Simpan Skor Akhir
dan Progres Pemain
ke Supabase</div>

    <div class="node process left small" style="left: 1250px; top: 2190px; width: 300px; height: 150px;">HASIL LEVEL

Tampilkan skor sementara</div>

    <div class="node decision large" style="left: 720px; top: 2490px; width: 420px; height: 420px;"><div class="inside">SKOR
MEMENUHI
SYARAT
NAIK LEVEL?</div></div>

    <div class="node process left small" style="left: 380px; top: 2550px; width: 300px; height: 170px;">TETAP DI
LEVEL SAAT INI

Ulangi level</div>

    <div class="node terminator large" style="left: 1190px; top: 2630px; width: 300px; height: 90px;">SELESAI</div>

    <div class="caption" style="left: 1080px; top: 2310px; width: 130px;">Ya</div>
    <div class="caption" style="left: 560px; top: 2535px; width: 130px;">Tidak</div>
    <div class="caption" style="left: 1230px; top: 2305px; width: 130px;">Ya</div>
    <div class="caption" style="left: 465px; top: 2220px; width: 130px;">Benar</div>
    <div class="caption" style="left: 65px; top: 2220px; width: 130px;">Salah</div>
  </main>
</body>
</html>`;

const cleanDiagramHtml = String.raw`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Diagram Alir Game Aksara Sunda</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: #000;
      background: #fff;
      font-family: Arial, Helvetica, sans-serif;
    }

    .page {
      width: 1120px;
      height: 770px;
      margin: 0 auto;
      padding: 18px 22px;
      background: #fff;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 28px;
      border-bottom: 3px solid #000;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }

    h1 {
      margin: 0;
      font-size: 30px;
      line-height: 1;
      letter-spacing: -0.03em;
    }

    .header p {
      width: 410px;
      margin: 0;
      text-align: right;
      font-size: 11px;
      line-height: 1.35;
    }

    .section {
      border: 2px solid #000;
      border-radius: 18px;
      padding: 14px;
      margin-bottom: 13px;
      break-inside: avoid;
    }

    .section-title {
      display: inline-block;
      margin: -27px 0 10px 10px;
      padding: 4px 12px;
      background: #fff;
      border: 2px solid #000;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .row {
      display: grid;
      grid-template-columns: 1fr 34px 1fr 34px 1fr 34px 1fr;
      gap: 0;
      align-items: stretch;
    }

    .level-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .feature-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }

    .admin-row {
      display: grid;
      grid-template-columns: 1fr 34px 1fr 34px 1.2fr 1.4fr;
      gap: 0;
      align-items: stretch;
    }

    .card {
      min-height: 76px;
      border: 2px solid #000;
      border-radius: 14px;
      padding: 10px 12px;
      background: #fff;
    }

    .card.soft {
      background: #f2f2f2;
    }

    .card.data {
      border-style: dashed;
      background: #fafafa;
    }

    .card strong {
      display: block;
      font-size: 15px;
      line-height: 1.05;
      margin-bottom: 5px;
    }

    .card span {
      display: block;
      font-size: 11px;
      line-height: 1.28;
    }

    .level {
      min-height: 126px;
    }

    .level strong {
      font-size: 16px;
    }

    .arrow {
      display: grid;
      place-items: center;
      font-size: 27px;
      font-weight: 900;
    }

    .note-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-top: 11px;
    }

    .mini {
      border: 1.8px solid #000;
      border-radius: 12px;
      padding: 9px 10px;
      min-height: 52px;
      font-size: 11px;
      line-height: 1.3;
      background: #fff;
    }

    .mini strong {
      display: block;
      font-size: 12px;
      margin-bottom: 3px;
    }

    .footer {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      font-size: 11px;
      line-height: 1.35;
    }

    .pill {
      display: inline-block;
      border: 1.6px solid #000;
      border-radius: 999px;
      padding: 2px 7px;
      margin-right: 4px;
      font-weight: 800;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="header">
      <h1>Diagram Alir Aplikasi Game Aksara Sunda</h1>
      <p>Diagram ini dibuat hitam putih agar mudah dicetak. Alur utama dibuat bertahap: siswa masuk, memilih level, belajar, kuis, lalu progres tersimpan.</p>
    </header>

    <section class="section">
      <div class="section-title">Alur Pemain</div>
      <div class="row">
        <div class="card soft">
          <strong>1. Buka Website</strong>
          <span>Aplikasi berjalan di Cloudflare melalui domain aksarasunda.my.id.</span>
        </div>
        <div class="arrow">→</div>
        <div class="card">
          <strong>2. Menu Utama</strong>
          <span>Pemain memilih Mulai Belajar, Latihan Menulis, Membaca, Progres, Pengaturan, atau Keluar.</span>
        </div>
        <div class="arrow">→</div>
        <div class="card">
          <strong>3. Daftar / Masuk</strong>
          <span>Siswa mengisi nama, kelas 10 Satu sampai 10 Tiga Belas, password, dan avatar.</span>
        </div>
        <div class="arrow">→</div>
        <div class="card">
          <strong>4. Pilih Level</strong>
          <span>Level terbuka bertahap sesuai hasil kuis dan progres siswa.</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-title">Urutan Level Belajar</div>
      <div class="level-row">
        <div class="card level">
          <strong>Level 1: Swara & Angka</strong>
          <span>Mengenal aksara swara dan angka 0-9. Cocok sebagai pemanasan sebelum huruf dasar.</span>
        </div>
        <div class="card level">
          <strong>Level 2: Ngalagena</strong>
          <span>Mengenal semua huruf dasar aksara Sunda dan mendengar audio pelafalan.</span>
        </div>
        <div class="card level">
          <strong>Level 3: Rarangken & Kata</strong>
          <span>Mengenal rarangken, nama tandanya, lalu membaca kata seperti kuda, bapak, sapi, bumi.</span>
        </div>
        <div class="card level">
          <strong>Level 4: Menyusun Kalimat</strong>
          <span>Menyusun kata menjadi kalimat sederhana seperti kuda aya dan bapak maca.</span>
        </div>
      </div>
      <div class="note-grid">
        <div class="mini"><strong>Belajar dulu</strong>Setiap level menampilkan contoh aksara, bacaan latin, catatan, dan tombol suara jika tersedia.</div>
        <div class="mini"><strong>Kuis</strong>Setelah materi, siswa menjawab soal. Level berikutnya terbuka jika nilai minimal 70%.</div>
        <div class="mini"><strong>Progres</strong>Skor, level tertinggi, avatar, dan status siswa disimpan agar bisa dilanjutkan lagi.</div>
      </div>
    </section>

    <section class="section">
      <div class="section-title">Fitur Dari Menu</div>
      <div class="feature-row">
        <div class="card"><strong>Mulai Belajar</strong><span>Masuk ke level belajar dan kuis.</span></div>
        <div class="card"><strong>Latihan Menulis</strong><span>Cek bentuk huruf dan beri feedback benar/salah.</span></div>
        <div class="card"><strong>Membaca</strong><span>Latihan membaca aksara, kata, dan audio.</span></div>
        <div class="card"><strong>Lihat Progres</strong><span>Melihat ringkasan level dan skor siswa.</span></div>
        <div class="card"><strong>Pengaturan / Keluar</strong><span>Atur suara, profil, lalu keluar dari sesi siswa.</span></div>
      </div>
    </section>

    <section class="section">
      <div class="section-title">Admin & Data</div>
      <div class="admin-row">
        <div class="card soft">
          <strong>Tombol Admin</strong>
          <span>Tombol kecil di kanan atas agar tidak mengganggu pemain.</span>
        </div>
        <div class="arrow">→</div>
        <div class="card soft">
          <strong>Login Admin</strong>
          <span>Admin masuk untuk mengelola data.</span>
        </div>
        <div class="arrow">→</div>
        <div class="card soft">
          <strong>Admin Panel</strong>
          <span>Tambah/edit siswa, reset password, reset progres, export XLS, kelola user admin, dan mode cek level.</span>
        </div>
        <div class="card data">
          <strong>Supabase</strong>
          <span>Menyimpan daftar siswa, progres belajar, data admin, dan fungsi RPC agar akses tetap aman.</span>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div><span class="pill">Audio</span> Tombol, feedback benar/salah, musik latar, dan suara pelafalan level menggunakan file audio lokal aplikasi.</div>
      <div><span class="pill">Deploy</span> Frontend/game berjalan di Cloudflare, sedangkan data siswa dan admin disimpan di Supabase.</div>
    </footer>
  </main>
</body>
</html>`;

const tidyFlowchartDiagramHtml = String.raw`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Diagram Alir Game Aksara Sunda</title>
  <style>
    @page {
      size: 420mm 1350mm;
      margin: 10mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #fff;
      color: #000;
      font-family: "Times New Roman", Times, serif;
    }

    .page {
      width: 1480px;
      margin: 0 auto;
      padding: 48px 34px 60px;
      background: #fff;
    }

    h1,
    h2 {
      margin: 0;
      text-align: center;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    h1 {
      font-size: 44px;
    }

    h2 {
      margin-top: 18px;
      font-size: 38px;
    }

    .top-flow {
      width: 620px;
      margin: 46px auto 36px;
    }

    .shape {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 82px;
      padding: 16px 22px;
      border: 3px solid #000;
      background: #fff;
      text-align: center;
      font-size: 29px;
      line-height: 1.18;
      white-space: pre-line;
    }

    .shape.left {
      align-items: flex-start;
      justify-content: flex-start;
      text-align: left;
    }

    .shape.small {
      font-size: 22px;
    }

    .shape.medium {
      font-size: 25px;
    }

    .shape.terminator {
      border-radius: 999px;
    }

    .shape.data {
      border: 0;
      min-height: 92px;
      clip-path: polygon(12% 0, 100% 0, 88% 100%, 0 100%);
    }

    .shape.data::before {
      content: "";
      position: absolute;
      inset: 0;
      background: #000;
      clip-path: polygon(12% 0, 100% 0, 88% 100%, 0 100%, 12% 0, calc(12% + 3px) 3px, 4px calc(100% - 3px), calc(88% - 3px) calc(100% - 3px), calc(100% - 4px) 3px, calc(12% + 3px) 3px);
      pointer-events: none;
    }

    .shape.document {
      border: 0;
      min-height: 138px;
      clip-path: polygon(0 0, 100% 0, 100% 82%, 84% 82%, 66% 88%, 50% 96%, 34% 100%, 18% 98%, 0 90%);
    }

    .shape.document::before {
      content: "";
      position: absolute;
      inset: 0;
      background: #000;
      clip-path: polygon(0 0, 100% 0, 100% 82%, 84% 82%, 66% 88%, 50% 96%, 34% 100%, 18% 98%, 0 90%, 0 0, 3px 3px, 3px calc(90% - 4px), 19% calc(98% - 3px), 34% calc(100% - 4px), 49% calc(96% - 4px), 65% calc(88% - 4px), 83% calc(82% - 3px), calc(100% - 3px) calc(82% - 3px), calc(100% - 3px) 3px, 3px 3px);
      pointer-events: none;
    }

    .diamond-wrap {
      width: 360px;
      height: 220px;
      margin: 0 auto;
      position: relative;
    }

    .diamond {
      position: absolute;
      inset: 16px 86px;
      transform: rotate(45deg);
      border: 3px solid #000;
      background: #fff;
    }

    .diamond-text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 25px;
      line-height: 1.16;
      white-space: pre-line;
    }

    .arrow-down {
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 42px;
      line-height: 1;
    }

    .arrow-right {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 44px;
      line-height: 1;
    }

    .section-title {
      width: fit-content;
      margin: 42px auto 22px;
      padding: 9px 26px;
      border: 3px solid #000;
      border-radius: 999px;
      font-size: 27px;
      font-weight: 700;
      background: #fff;
    }

    .menu-root {
      width: 530px;
      margin: 0 auto;
      font-weight: 700;
    }

    .branch-grid {
      position: relative;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 22px;
      margin-top: 28px;
      padding-top: 52px;
    }

    .branch-grid::before {
      content: "";
      position: absolute;
      top: 14px;
      left: 7%;
      right: 7%;
      height: 3px;
      background: #000;
    }

    .lane {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 18px;
      min-width: 0;
    }

    .lane::before {
      content: "↓";
      position: absolute;
      top: -54px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 42px;
      line-height: 1;
      background: #fff;
    }

    .learning-flow {
      width: 1040px;
      margin: 22px auto 0;
    }

    .row {
      display: grid;
      grid-template-columns: 1fr 80px 1fr;
      gap: 20px;
      align-items: center;
      margin: 12px 0;
    }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 36px;
      margin: 16px 0;
    }

    .three-col {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 28px;
      margin: 18px 0;
    }

    .note {
      font-size: 18px;
      line-height: 1.2;
      text-align: center;
      font-style: italic;
    }

    .end-row {
      display: grid;
      grid-template-columns: 1fr 80px 1fr;
      gap: 20px;
      align-items: center;
      width: 840px;
      margin: 12px auto 0;
    }

    .footer-note {
      margin-top: 34px;
      border-top: 3px solid #000;
      padding-top: 14px;
      font-size: 20px;
      text-align: center;
      line-height: 1.3;
    }
  </style>
</head>
<body>
  <main class="page">
    <h1>DIAGRAM ALIR</h1>
    <h2>GAME AKSARA SUNDA</h2>

    <section class="top-flow">
      <div class="shape terminator">Mulai</div>
      <div class="arrow-down">↓</div>
      <div class="shape left">Halaman Awal
Wilujeng Sumping
"Game Aksara Sunda"</div>
      <div class="arrow-down">↓</div>
      <div class="shape">Daftar / Masuk Siswa
Nama, Kelas, Password, Avatar</div>
      <div class="arrow-down">↓</div>
      <div class="shape data">Data Siswa</div>
      <div class="arrow-down">↓</div>
      <div class="shape" style="font-weight: 700;">MENU UTAMA</div>
    </section>

    <section>
      <div class="branch-grid">
        <div class="lane">
          <div class="shape left small">1. MULAI BELAJAR
(AKSARA SUNDA)

- Level 1 Swara & Angka
- Level 2 Ngalagena
- Level 3 Rarangken & Kata
- Level 4 Menyusun Kalimat</div>
          <div class="shape left small">Masuk ke alur belajar dan kuis level.</div>
        </div>

        <div class="lane">
          <div class="shape left small">2. LATIHAN MENULIS
(TRACING HURUF)

- Pilih huruf / kata
- Menebalkan huruf
- Menulis ulang</div>
          <div class="shape left small">Pemain menulis di layar.</div>
          <div class="shape data medium">Feedback
Bagus / Coba Lagi
+ Suara</div>
          <div class="shape document left small">Simpan hasil
latihan menulis.</div>
        </div>

        <div class="lane">
          <div class="shape left small">3. MEMBACA

- Tampilan aksara / kata / kalimat
- Suara bacaan
- Pemain membaca</div>
          <div class="shape left small">Pemain membaca
(voice / baca sendiri).</div>
          <div class="shape data medium">Feedback
Bagus / Coba Lagi
+ Suara</div>
          <div class="shape document left small">Simpan hasil
latihan membaca.</div>
        </div>

        <div class="lane">
          <div class="shape left small">4. LIHAT PROGRES

- Data pemain
- Skor tertinggi
- Level tercapai
- Statistik belajar</div>
          <div class="shape document left small">Tampilkan progres
dari Supabase.</div>
        </div>

        <div class="lane">
          <div class="shape left small">5. PENGATURAN

- Musik ON / OFF
- Suara ON / OFF
- Avatar profil</div>
          <div class="shape document left small">Simpan pengaturan
profil dan audio.</div>
        </div>

        <div class="lane">
          <div class="shape left small">6. ADMIN

- Login admin
- Kelola siswa
- Kelola user admin
- Export XLS
- Mode cek level</div>
          <div class="shape left small">Admin Panel</div>
          <div class="shape left small">Mode cek level:
admin bisa mencoba semua level tanpa menyimpan skor siswa.</div>
        </div>
      </div>
    </section>

    <div class="section-title">ALUR MULAI BELAJAR DAN KUIS</div>

    <section class="learning-flow">
      <div class="shape">Pilih Level Belajar</div>
      <div class="arrow-down">↓</div>
      <div class="shape left">Materi Level

- Contoh aksara Sunda
- Nama / bacaan latin
- Tombol suara pelafalan
- Catatan singkat</div>
      <div class="arrow-down">↓</div>
      <div class="shape left">Mulai Kuis

- Tampilkan aksara / kata / kalimat
- Pilihan jawaban
- Susun kata untuk Level 4</div>
      <div class="arrow-down">↓</div>
      <div class="shape">Pemain Memilih Jawaban</div>
      <div class="arrow-down">↓</div>

      <div class="diamond-wrap">
        <div class="diamond"></div>
        <div class="diamond-text">Jawaban
Benar?</div>
      </div>

      <div class="two-col">
        <div>
          <div class="note">Jika salah</div>
          <div class="arrow-down">↓</div>
          <div class="shape document left small">FEEDBACK SALAH

"Lepat!"

Tampilkan jawaban benar
dan suara penjelasan.</div>
        </div>
        <div>
          <div class="note">Jika benar</div>
          <div class="arrow-down">↓</div>
          <div class="shape document left small">FEEDBACK BENAR

"Leres!"

Tambah poin
dan suara benar.</div>
        </div>
      </div>

      <div class="arrow-down">↓</div>
      <div class="shape left">Update Skor dan Progres Sementara

Lanjut ke soal berikutnya sampai soal level selesai.</div>
      <div class="arrow-down">↓</div>

      <div class="diamond-wrap">
        <div class="diamond"></div>
        <div class="diamond-text">Soal Terakhir
Level Ini?</div>
      </div>

      <div class="row">
        <div>
          <div class="note">Tidak</div>
          <div class="arrow-down">↓</div>
          <div class="shape small">Kembali ke soal berikutnya.</div>
        </div>
        <div class="arrow-right">→</div>
        <div>
          <div class="note">Ya</div>
          <div class="arrow-down">↓</div>
          <div class="shape left small">HASIL LEVEL

Tampilkan skor sementara
dan jumlah jawaban benar.</div>
        </div>
      </div>

      <div class="arrow-down">↓</div>
      <div class="diamond-wrap" style="width: 460px; height: 250px;">
        <div class="diamond" style="inset: 18px 108px;"></div>
        <div class="diamond-text">Skor Memenuhi
Syarat Naik Level?</div>
      </div>

      <div class="two-col">
        <div>
          <div class="note">Tidak</div>
          <div class="arrow-down">↓</div>
          <div class="shape document left small">Tetap di level saat ini.

Siswa dapat mengulang level.</div>
        </div>
        <div>
          <div class="note">Ya</div>
          <div class="arrow-down">↓</div>
          <div class="shape left small">Naik ke Level Berikutnya</div>
        </div>
      </div>

      <div class="arrow-down">↓</div>
      <div class="three-col">
        <div class="shape document left small">HALAMAN HASIL AKHIR

- Skor akhir
- Level kategori
- Perlu belajar lagi / cukup / sangat baik</div>
        <div class="shape document left small">Simpan Skor Akhir
dan Progres Pemain
ke Supabase.</div>
        <div class="shape document left small">PILIHAN AKHIR

- Main lagi
- Lanjut level
- Lihat progres
- Kembali ke menu</div>
      </div>

      <div class="end-row">
        <div></div>
        <div class="arrow-down">↓</div>
        <div></div>
      </div>
      <div class="shape terminator" style="width: 360px; margin: 0 auto;">Selesai</div>
    </section>

  </main>
</body>
</html>`;

const mockupHtml = String.raw`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Mockup Game Aksara Sunda</title>
  <style>
    @font-face {
      font-family: "Noto Sunda Local";
      src: url("${assetUrl("tmp-mockup-fonts/NotoSansSundanese-GoogleFonts.ttf")}") format("truetype");
      font-weight: 400;
      font-style: normal;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #17452e;
      font-family: "Trebuchet MS", "Segoe UI", sans-serif;
      color: #112515;
    }

    .poster {
      width: 1800px;
      min-height: 2400px;
      padding: 70px;
      background:
        linear-gradient(180deg, rgba(11, 80, 70, 0.34), rgba(8, 50, 28, 0.74)),
        url("${assetUrl("src/assets/sunda-bg.jpg")}") center / cover;
      position: relative;
      overflow: hidden;
    }

    .poster::before {
      content: "";
      position: absolute;
      inset: 24px;
      border: 18px solid rgba(8, 38, 24, 0.58);
      pointer-events: none;
    }

    .hero {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 38px;
      color: #fff3c2;
      text-shadow: 0 5px 18px rgba(0, 0, 0, 0.45);
    }

    .hero h1 {
      margin: 0;
      font-size: 78px;
      letter-spacing: -0.04em;
      line-height: 0.92;
    }

    .hero p {
      margin: 14px 0 0;
      max-width: 760px;
      font-size: 27px;
      line-height: 1.25;
      color: #fff9df;
      font-weight: 700;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      border: 3px solid #fff1bd;
      border-radius: 999px;
      background: rgba(12, 63, 40, 0.88);
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.03em;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
    }

    .grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 34px;
    }

    .screen {
      min-height: 610px;
      border: 5px solid #17442a;
      border-radius: 34px;
      background:
        linear-gradient(180deg, rgba(255, 244, 203, 0.96), rgba(255, 235, 175, 0.96));
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.46);
      overflow: hidden;
      position: relative;
    }

    .screen-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 24px 30px;
      border-bottom: 3px solid rgba(23, 68, 42, 0.32);
      background: rgba(255, 248, 221, 0.75);
    }

    .screen-title {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 11px 18px;
      border-radius: 14px;
      background: #0d3a2b;
      color: #fff2bc;
      font-weight: 900;
      font-size: 21px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .mini-note {
      font-size: 18px;
      font-weight: 800;
      color: #1a5f2c;
    }

    .screen-body {
      padding: 30px;
    }

    .menu-preview {
      display: grid;
      grid-template-columns: 1fr 270px;
      gap: 32px;
      align-items: center;
      min-height: 460px;
    }

    .character-card {
      border-radius: 30px;
      padding: 30px;
      min-height: 405px;
      background:
        linear-gradient(135deg, rgba(28, 126, 52, 0.28), rgba(255, 201, 40, 0.24)),
        url("${assetUrl("src/assets/sg-boy-wave.png")}") bottom center / contain no-repeat;
      border: 3px solid rgba(23, 68, 42, 0.28);
    }

    .logo-card {
      display: inline-block;
      padding: 12px 20px;
      border-radius: 18px;
      background: rgba(13, 58, 43, 0.9);
      color: #fff2bc;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 0.03em;
    }

    .menu-buttons {
      display: grid;
      gap: 13px;
    }

    .menu-button {
      border-radius: 999px;
      padding: 15px 22px;
      font-weight: 900;
      font-size: 24px;
      border: 0;
      box-shadow: inset 0 -5px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.18);
      color: #102713;
      white-space: nowrap;
    }

    .green { background: #23863a; color: #fff8d4; }
    .yellow { background: #ffc928; }
    .pink { background: #c96ad2; }
    .blue { background: #88d8ff; }
    .cream { background: #f3eab5; }
    .salmon { background: #ed8888; }

    .small-admin {
      position: absolute;
      right: 28px;
      top: 26px;
      border-radius: 999px;
      padding: 8px 15px;
      background: #0d3a2b;
      color: #fff2bc;
      font-size: 17px;
      font-weight: 900;
      z-index: 3;
    }

    .menu-note {
      margin-right: 86px;
    }

    .form-card {
      max-width: 520px;
      margin: 0 auto;
      padding: 28px;
      border: 3px solid rgba(23, 68, 42, 0.42);
      border-radius: 28px;
      background: rgba(255, 249, 225, 0.86);
      box-shadow: 0 18px 42px rgba(0, 0, 0, 0.14);
    }

    .field {
      height: 58px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      margin: 13px 0;
      border: 3px solid #90a5a1;
      border-radius: 14px;
      background: #fffaf0;
      font-size: 23px;
      font-weight: 700;
      color: #243629;
    }

    .avatar-row {
      display: flex;
      gap: 14px;
      margin: 18px 0;
    }

    .avatar-pill {
      flex: 1;
      display: grid;
      place-items: center;
      min-height: 82px;
      border-radius: 22px;
      border: 3px solid #17442a;
      background: rgba(34, 132, 56, 0.13);
      font-size: 22px;
      font-weight: 900;
      color: #167c2b;
    }

    .primary-button {
      width: 100%;
      height: 64px;
      border-radius: 18px;
      border: 3px solid #0d4c1e;
      background: #19822f;
      color: #fff7c7;
      font-size: 25px;
      font-weight: 900;
      box-shadow: inset 0 -5px rgba(0, 0, 0, 0.15);
    }

    .level-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 22px;
    }

    .level-card {
      min-height: 180px;
      border: 3px solid #17442a;
      border-radius: 26px;
      padding: 24px;
      background: #fff8df;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    }

    .level-card strong {
      display: block;
      color: #0c7d2b;
      font-size: 29px;
      margin-bottom: 8px;
    }

    .level-card span {
      display: block;
      font-size: 21px;
      line-height: 1.3;
      color: #4b4634;
      font-weight: 700;
    }

    .glyph-panel {
      display: grid;
      place-items: center;
      min-height: 400px;
      border-radius: 30px;
      background: rgba(255, 250, 232, 0.78);
      position: relative;
      text-align: center;
      border: 3px solid rgba(23, 68, 42, 0.16);
    }

    .glyph-label {
      position: absolute;
      top: 22px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 22px;
      border-radius: 999px;
      background: #fffdf2;
      border: 2px solid #cfc7aa;
      color: #147b2b;
      font-size: 22px;
      font-weight: 900;
    }

    .speaker {
      position: absolute;
      top: 24px;
      right: 24px;
      display: grid;
      place-items: center;
      width: 68px;
      height: 68px;
      border-radius: 999px;
      background: #19822f;
      color: #fff8d4;
      font-size: 36px;
      font-weight: 900;
      box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
    }

    .aksara {
      font-family: "Noto Sunda Local", "Noto Sans Sundanese", sans-serif;
      font-size: 142px;
      line-height: 0.95;
      color: #102612;
    }

    .read {
      margin-top: 28px;
      font-size: 34px;
      font-weight: 500;
    }

    .read strong {
      color: #0b872e;
      font-weight: 900;
    }

    .sentence-row {
      display: grid;
      gap: 18px;
      margin-top: 24px;
    }

    .slot {
      min-height: 70px;
      border: 3px dashed #1d7332;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      color: #13772c;
      font-size: 24px;
      font-weight: 900;
      background: rgba(255, 255, 255, 0.42);
    }

    .choice-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .choice {
      border-radius: 18px;
      padding: 18px 10px;
      border: 3px solid #17442a;
      background: #fff9e5;
      text-align: center;
      font-size: 23px;
      font-weight: 900;
      color: #142a19;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }

    .stat {
      border-radius: 20px;
      border: 3px solid rgba(23, 68, 42, 0.42);
      background: #fff2c8;
      padding: 18px;
      min-height: 102px;
    }

    .stat span {
      display: block;
      color: #4a513e;
      font-size: 16px;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .stat strong {
      font-size: 36px;
      color: #07822b;
    }

    .admin-table {
      border: 3px solid rgba(23, 68, 42, 0.42);
      border-radius: 22px;
      overflow: hidden;
      background: #fff9e2;
    }

    .table-row {
      display: grid;
      grid-template-columns: 1.2fr 1fr 0.6fr 1.3fr;
      gap: 10px;
      padding: 15px 18px;
      border-bottom: 2px solid rgba(23, 68, 42, 0.2);
      align-items: center;
      font-size: 18px;
      font-weight: 800;
    }

    .table-row:last-child {
      border-bottom: 0;
    }

    .chip {
      display: inline-block;
      width: fit-content;
      padding: 7px 12px;
      border-radius: 999px;
      background: #d5ffd8;
      border: 2px solid #39a648;
      color: #087126;
      font-size: 16px;
      font-weight: 900;
    }

    .footer {
      position: relative;
      z-index: 1;
      margin-top: 38px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 30px;
      border-radius: 28px;
      background: rgba(13, 58, 43, 0.88);
      color: #fff3c2;
      font-size: 24px;
      font-weight: 900;
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
    }
  </style>
</head>
<body>
  <main class="poster">
    <section class="hero">
      <div>
        <h1>Game Aksara Sunda</h1>
        <p>Mockup gabungan layar utama, registrasi siswa, pemilihan level, materi belajar, menyusun kalimat, dan admin panel.</p>
      </div>
      <div class="badge">aksarasunda.my.id</div>
    </section>

    <section class="grid">
      <article class="screen">
        <div class="small-admin">Admin</div>
        <header class="screen-header">
          <div class="screen-title">01 Menu Utama</div>
          <div class="mini-note menu-note">Tombol besar untuk pemain</div>
        </header>
        <div class="screen-body menu-preview">
          <div class="character-card">
            <div class="logo-card">Game Aksara Sunda</div>
          </div>
          <div class="menu-buttons">
            <button class="menu-button green">Mulai Belajar</button>
            <button class="menu-button yellow">Latihan Menulis</button>
            <button class="menu-button pink">Membaca</button>
            <button class="menu-button blue">Lihat Progres</button>
            <button class="menu-button cream">Pengaturan</button>
            <button class="menu-button salmon">Keluar</button>
          </div>
        </div>
      </article>

      <article class="screen">
        <header class="screen-header">
          <div class="screen-title">02 Daftar Siswa</div>
          <div class="mini-note">Nama, kelas, password</div>
        </header>
        <div class="screen-body">
          <div class="form-card">
            <div class="field">Nama siswa: Budi</div>
            <div class="field">Kelas: 10 Satu</div>
            <div class="field">Password: ******</div>
            <div class="avatar-row">
              <div class="avatar-pill">Laki-laki</div>
              <div class="avatar-pill">Perempuan</div>
            </div>
            <button class="primary-button">Masuk / Daftar</button>
          </div>
        </div>
      </article>

      <article class="screen">
        <header class="screen-header">
          <div class="screen-title">03 Pilih Level</div>
          <div class="mini-note">Flow bertahap dari mudah ke sulit</div>
        </header>
        <div class="screen-body">
          <div class="level-grid">
            <div class="level-card">
              <strong>Level 1</strong>
              <span>Aksara swara dan angka 0-9. Fokus mengenal bunyi awal.</span>
            </div>
            <div class="level-card">
              <strong>Level 2</strong>
              <span>Aksara ngalagena, huruf dasar, dan audio pelafalan.</span>
            </div>
            <div class="level-card">
              <strong>Level 3</strong>
              <span>Rarangken lengkap lalu membaca kata pendek.</span>
            </div>
            <div class="level-card">
              <strong>Level 4</strong>
              <span>Menyusun kalimat sederhana dari kata yang sudah dipelajari.</span>
            </div>
          </div>
        </div>
      </article>

      <article class="screen">
        <header class="screen-header">
          <div class="screen-title">04 Belajar Aksara</div>
          <div class="mini-note">Speaker hover/click untuk suara</div>
        </header>
        <div class="screen-body">
          <div class="glyph-panel">
            <div class="glyph-label">Rarangken: Paneuleung</div>
            <div class="speaker">♪</div>
            <div>
              <div class="aksara">ᮊᮩ</div>
              <div class="read">Bacaannya: <strong>keu</strong></div>
            </div>
          </div>
        </div>
      </article>

      <article class="screen">
        <header class="screen-header">
          <div class="screen-title">05 Menyusun Kalimat</div>
          <div class="mini-note">Level 4 tanpa harus bingung</div>
        </header>
        <div class="screen-body">
          <div class="glyph-panel">
            <div class="speaker">♪</div>
            <div>
              <div class="aksara" style="font-size: 92px;">ᮊᮥᮓ ᮃᮚ</div>
              <div class="read">Kalimat: <strong>kuda aya</strong></div>
              <div class="sentence-row">
                <div class="slot">kuda + aya</div>
                <div class="choice-row">
                  <div class="choice">kuda</div>
                  <div class="choice">aya</div>
                  <div class="choice">sapi</div>
                  <div class="choice">bumi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="screen">
        <header class="screen-header">
          <div class="screen-title">06 Admin Panel</div>
          <div class="mini-note">Kelola siswa dan user admin</div>
        </header>
        <div class="screen-body">
          <div class="stats">
            <div class="stat"><span>Total Siswa</span><strong>3</strong></div>
            <div class="stat"><span>Siswa Aktif</span><strong>3</strong></div>
            <div class="stat"><span>Nonaktif</span><strong>0</strong></div>
            <div class="stat"><span>Total Skor</span><strong>180</strong></div>
          </div>
          <div class="admin-table">
            <div class="table-row">
              <strong>Nama</strong><strong>Kelas</strong><strong>Level</strong><strong>Aksi</strong>
            </div>
            <div class="table-row">
              <span>Budi</span><span>10 Satu</span><span>3</span><span><i class="chip">Edit</i> <i class="chip">Reset</i></span>
            </div>
            <div class="table-row">
              <span>Jono</span><span>10 Dua</span><span>2</span><span><i class="chip">Password</i> <i class="chip">XLS</i></span>
            </div>
            <div class="table-row">
              <span>Teguh</span><span>10 Tiga Belas</span><span>4</span><span><i class="chip">Admin</i> <i class="chip">Hapus</i></span>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="footer">
      <span>Alur: register siswa → belajar bertahap → kuis → progres tersimpan di Supabase.</span>
      <span>Deploy: Cloudflare</span>
    </section>
  </main>
</body>
</html>`;

fs.writeFileSync(diagramHtmlPath, tidyFlowchartDiagramHtml, "utf8");
fs.writeFileSync(mockupHtmlPath, mockupHtml, "utf8");

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
    `--print-to-pdf=${diagramPdfPath}`,
    pathToFileURL(diagramHtmlPath).href,
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
    "--window-size=1800,2400",
    "--virtual-time-budget=2500",
    `--screenshot=${mockupPngPath}`,
    pathToFileURL(mockupHtmlPath).href,
  ],
  "Render PNG mockup",
);

const convertScript = `
Add-Type -AssemblyName System.Drawing
$png = [System.Drawing.Image]::FromFile('${mockupPngPath.replaceAll("'", "''")}')
$bitmap = New-Object System.Drawing.Bitmap($png.Width, $png.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear([System.Drawing.Color]::White)
$graphics.DrawImage($png, 0, 0, $png.Width, $png.Height)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 92L)
$bitmap.Save('${mockupJpgPath.replaceAll("'", "''")}', $codec, $params)
$graphics.Dispose()
$bitmap.Dispose()
$png.Dispose()
`;

run(
  "powershell",
  ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", convertScript],
  "Konversi JPG mockup",
);

console.log(`PDF diagram: ${diagramPdfPath}`);
console.log(`JPG mockup: ${mockupJpgPath}`);
console.log(`Sumber HTML: ${diagramHtmlPath}`);
console.log(`Sumber HTML: ${mockupHtmlPath}`);
