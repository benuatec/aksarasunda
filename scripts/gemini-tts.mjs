import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_MODEL = "gemini-2.5-flash-preview-tts";
const DEFAULT_VOICE = "Kore";
const DEFAULT_OUT_DIR = "src/assets/audio/tts";
const DEFAULT_WORDS_FILE = "scripts/tts-words.json";
const DEFAULT_DELAY_MS = 22000;
const SAMPLE_RATE = 24000;
const CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

function printHelp() {
  console.log(`
Gemini TTS helper for Game Aksara Sunda

Usage:
  npm run tts:gemini -- aya maca budi
  npm run tts:gemini -- --text "kuda aya" --name kuda-aya
  npm run tts:gemini -- --file scripts/tts-words.json --overwrite

Options:
  --file <path>       JSON list of { "name": "...", "text": "..." }
  --text <text>       Generate one audio file from text
  --name <name>       File name for --text output, without extension
  --out <dir>         Output directory, default ${DEFAULT_OUT_DIR}
  --voice <name>      Gemini prebuilt voice, default ${DEFAULT_VOICE}
  --model <name>      Gemini TTS model, default ${DEFAULT_MODEL}
  --style <text>      Speaking style instruction
  --delay-ms <ms>     Delay between requests, default ${DEFAULT_DELAY_MS}
  --overwrite         Replace existing files
  --help              Show this help

API key:
  Put GEMINI_API_KEY=... in .env.local, or set it in your terminal env.
`);
}

function parseArgs(argv) {
  const options = {
    file: "",
    text: "",
    name: "",
    out: DEFAULT_OUT_DIR,
    voice: DEFAULT_VOICE,
    model: DEFAULT_MODEL,
    style:
      "Ucapkan dengan suara guru yang ramah, natural, pelan, dan jelas untuk game belajar aksara Sunda.",
    delayMs: DEFAULT_DELAY_MS,
    overwrite: false,
    help: false,
    words: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--overwrite") {
      options.overwrite = true;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) {
        throw new Error(`Option ${arg} membutuhkan nilai.`);
      }
      index += 1;
      if (key === "delay-ms") {
        options.delayMs = Number(next);
        if (!Number.isFinite(options.delayMs) || options.delayMs < 0) {
          throw new Error("--delay-ms harus berupa angka 0 atau lebih.");
        }
        continue;
      }
      if (!["file", "text", "name", "out", "voice", "model", "style"].includes(key)) {
        throw new Error(`Option tidak dikenal: ${arg}`);
      }
      options[key] = next;
    } else {
      options.words.push(arg);
    }
  }

  return options;
}

async function loadEnvFile(filename) {
  if (!existsSync(filename)) return;
  const raw = await fs.readFile(filename, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    let value = rawValue;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function slugifyName(text) {
  const trimmed = text.trim().toLowerCase();
  if (trimmed === "é") return "e-acute";
  return (
    trimmed
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "audio"
  );
}

async function loadEntries(options) {
  if (options.text) {
    return [
      {
        name: options.name || slugifyName(options.text),
        text: options.text,
      },
    ];
  }

  if (options.words.length > 0) {
    return options.words.map((word) => ({
      name: slugifyName(word),
      text: word,
    }));
  }

  const file = options.file || DEFAULT_WORDS_FILE;
  const raw = await fs.readFile(file, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`${file} harus berisi array JSON.`);
  }

  return parsed.map((entry, index) => {
    if (typeof entry === "string") {
      return { name: slugifyName(entry), text: entry };
    }
    if (!entry || typeof entry.text !== "string") {
      throw new Error(`Entry nomor ${index + 1} harus punya field "text".`);
    }
    return {
      name:
        typeof entry.name === "string" && entry.name
          ? slugifyName(entry.name)
          : slugifyName(entry.text),
      text: entry.text,
      prompt: typeof entry.prompt === "string" ? entry.prompt : "",
    };
  });
}

function wavFromPcm(pcm) {
  const blockAlign = (CHANNELS * BITS_PER_SAMPLE) / 8;
  const byteRate = SAMPLE_RATE * blockAlign;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(BITS_PER_SAMPLE, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

function makePrompt(entry, style) {
  const instruction = entry.prompt || style;
  return `${instruction} Ucapkan hanya teks transcript ini, tanpa tambahan kata lain: "${entry.text}"`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateAudio({ apiKey, entry, model, voice, style }) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: makePrompt(entry, style) }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice,
              },
            },
          },
        },
      }),
    },
  );

  const body = await response.text();
  if (!response.ok) {
    const error = new Error(`Gemini API gagal (${response.status}): ${body}`);
    error.status = response.status;
    throw error;
  }

  const json = JSON.parse(body);
  const base64 = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64) {
    throw new Error(`Gemini API tidak mengembalikan audio untuk "${entry.text}".`);
  }

  return wavFromPcm(Buffer.from(base64, "base64"));
}

async function generateAudioWithRetry(args) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      return await generateAudio(args);
    } catch (error) {
      const retryable = error?.status === 429 || error?.status === 503;
      if (!retryable || attempt === 4) throw error;
      const waitMs = 65000;
      console.log(
        `  Gemini sedang limit, tunggu ${Math.round(waitMs / 1000)} detik lalu coba lagi.`,
      );
      await sleep(waitMs);
    }
  }

  throw new Error("Gemini API gagal setelah beberapa percobaan.");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  await loadEnvFile(".env.local");
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum ada. Tambahkan GEMINI_API_KEY=... ke .env.local.");
  }

  const entries = await loadEntries(options);
  const outDir = path.resolve(options.out);
  await fs.mkdir(outDir, { recursive: true });

  console.log(
    `Generating ${entries.length} audio file(s) with ${options.model}, voice ${options.voice}.`,
  );
  for (const [index, entry] of entries.entries()) {
    const output = path.join(outDir, `${entry.name}.wav`);
    if (existsSync(output) && !options.overwrite) {
      console.log(`- skip ${entry.name}.wav (sudah ada, pakai --overwrite untuk ganti)`);
      continue;
    }

    const wav = await generateAudioWithRetry({
      apiKey,
      entry,
      model: options.model,
      voice: options.voice,
      style: options.style,
    });
    await fs.writeFile(output, wav);
    console.log(`- wrote ${path.relative(process.cwd(), output)} (${entry.text})`);
    if (options.delayMs > 0 && index < entries.length - 1) {
      await sleep(options.delayMs);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
