import { useEffect, useState } from "react";
import correctSound from "@/assets/audio/sound-aksara-sunda/benar.mp3";
import backgroundMusicSrc from "@/assets/audio/sound-aksara-sunda/musik-latar.mp3";
import clickSound from "@/assets/audio/sound-aksara-sunda/mouse-click.mp3";
import wrongSound from "@/assets/audio/sound-aksara-sunda/salah.mp3";

const recordedVoiceModules = {
  ...import.meta.glob<string>("../assets/audio/sound-aksara-sunda/*.{mp3,m4a,wav,ogg}", {
    eager: true,
    query: "?url",
    import: "default",
  }),
};

export type Progress = {
  studentId: string;
  sessionToken: string;
  sessionExpiresAt: string;
  name: string;
  avatarKey: AvatarKey;
  studentClass: string;
  passwordHash: string;
  totalScore: number;
  highestLevel: number;
  totalPlays: number;
  history: { date: string; level: number; score: number }[];
  music: boolean;
  musicVolume: number;
  sfx: boolean;
};

const KEY = "sunda-game-progress";
const STUDENTS_KEY = "sunda-game-students";

export type AvatarKey = "boy" | "girl";

export type StudentRecord = {
  id: string;
  name: string;
  avatarKey: AvatarKey;
  studentClass: string;
  passwordHash: string;
  totalScore: number;
  highestLevel: number;
  totalPlays: number;
  history: Progress["history"];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const initial: Progress = {
  studentId: "",
  sessionToken: "",
  sessionExpiresAt: "",
  name: "",
  avatarKey: "boy",
  studentClass: "",
  passwordHash: "",
  totalScore: 0,
  highestLevel: 1,
  totalPlays: 0,
  history: [],
  music: true,
  musicVolume: 0.04,
  sfx: true,
};

export function loadProgress(): Progress {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    const merged = { ...initial, ...parsed };

    // Migrate the old default 8% background-music volume to the new 4% default.
    if (merged.musicVolume === 0.08) {
      merged.musicVolume = 0.04;
      localStorage.setItem(KEY, JSON.stringify(merged));
    }

    return merged;
  } catch {
    return initial;
  }
}

export function saveProgress(p: Progress) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function getStudentRecordId(name: string, studentClass: string) {
  return `${studentClass.trim().toLowerCase()}::${name.trim().toLowerCase()}`;
}

export function getCurrentStudentRecordId(
  progress: Pick<Progress, "studentId" | "name" | "studentClass">,
) {
  return progress.studentId || getStudentRecordId(progress.name, progress.studentClass);
}

export function loadStudentRecords(): StudentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    if (!raw) return [];
    const records = JSON.parse(raw);
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

export function saveStudentRecords(records: StudentRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(records));
}

export function findStoredStudentRecord({
  studentId,
  name,
  studentClass,
}: {
  studentId?: string;
  name?: string;
  studentClass?: string;
}) {
  const records = loadStudentRecords();

  if (studentId) {
    const byId = records.find((record) => record.id === studentId);
    if (byId) return byId;
  }

  if (name && studentClass) {
    const normalizedId = getStudentRecordId(name, studentClass);
    const byNameClass = records.find(
      (record) =>
        record.id === normalizedId ||
        getStudentRecordId(record.name, record.studentClass) === normalizedId,
    );
    if (byNameClass) return byNameClass;
  }

  return null;
}

export function upsertStudentRecord(progress: Progress) {
  if (!progress.name || !progress.studentClass) return;
  const now = new Date().toISOString();
  const id = getCurrentStudentRecordId(progress);
  const records = loadStudentRecords();
  const existing = records.find((record) => record.id === id);
  const nextRecord: StudentRecord = {
    id,
    name: progress.name,
    avatarKey: progress.avatarKey,
    studentClass: progress.studentClass,
    passwordHash: progress.passwordHash,
    totalScore: progress.totalScore,
    highestLevel: progress.highestLevel,
    totalPlays: progress.totalPlays,
    history: progress.history,
    isActive: existing?.isActive ?? true,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  saveStudentRecords([nextRecord, ...records.filter((record) => record.id !== id)]);
}

export function useProgress() {
  const [p, setP] = useState<Progress>(initial);
  useEffect(() => {
    const loaded = loadProgress();
    setP(loaded);
    upsertStudentRecord(loaded);
  }, []);
  const update = (next: Partial<Progress> | ((p: Progress) => Progress)) => {
    setP((cur) => {
      const n = typeof next === "function" ? next(cur) : { ...cur, ...next };
      saveProgress(n);
      upsertStudentRecord(n);
      return n;
    });
  };
  return [p, update] as const;
}

type GameSound = "click" | "correct" | "wrong";

const soundSources: Record<GameSound, string> = {
  click: clickSound,
  correct: correctSound,
  wrong: wrongSound,
};

const soundVolumes: Record<GameSound, number> = {
  click: 0.45,
  correct: 0.85,
  wrong: 0.85,
};

const recordedVoiceSources = Object.fromEntries(
  Object.entries(recordedVoiceModules)
    .map(([path, source]) => [
      path.match(/\/([^/]+)\.(ogg|mp3|wav|m4a)$/)?.[1]?.toLowerCase() ?? "",
      source,
    ])
    .filter(([key]) => key),
) as Record<string, string>;

const recordedVoiceAliases: Record<string, string> = {
  "bapak maca": "bapak-maca",
  "budi maca": "budi-maca",
  "\u00e9": "e_",
  bener: "bener_",
  "b\u00e9as": "beas",
  "k\u00e9": "ke_ (paneleng)",
  kang: "kang (panyecek)",
  kya: "kya (pamikal)",
  kah: "kah (pangwisad)",
  k: "k (pamaeh)",
  kar: "kar (panglayar)",
  kla: "kla (panyiku)",
  kra: "kra (panyakra)",
};

const pronunciationAliases: Record<string, string> = {
  "0": "nol",
  "1": "hiji",
  "2": "dua",
  "3": "tilu",
  "4": "opat",
  "5": "lima",
  "6": "genep",
  "7": "tujuh",
  "8": "dalapan",
  "9": "salapan",
};

const numberVoiceAliases: Record<string, string> = {
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  nol: "0",
  hiji: "1",
  dua: "2",
  tilu: "3",
  opat: "4",
  lima: "5",
  genep: "6",
  tujuh: "7",
  dalapan: "8",
  salapan: "9",
};

let backgroundMusic: HTMLAudioElement | null = null;

function clampVolume(volume: number) {
  if (!Number.isFinite(volume)) return initial.musicVolume;
  return Math.min(1, Math.max(0, volume));
}

function getSavedMusicVolume() {
  return clampVolume(loadProgress().musicVolume ?? initial.musicVolume);
}

function canUseAudio() {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}

function isSfxEnabled() {
  return loadProgress().sfx;
}

function getRecordedVoiceSource(key: string) {
  const cleanKey = key.trim().toLowerCase();
  const normalized = pronunciationAliases[cleanKey] ?? cleanKey;
  const numberAlias = numberVoiceAliases[cleanKey] ?? numberVoiceAliases[normalized];

  if (numberAlias) {
    const numberSource = recordedVoiceSources[numberAlias];
    if (numberSource) return numberSource;
  }

  const alias = recordedVoiceAliases[cleanKey] ?? recordedVoiceAliases[normalized];
  const candidates = [
    cleanKey,
    normalized,
    alias,
    cleanKey.replace(/\s+/g, "-"),
    cleanKey.replace(/\s+/g, ""),
    cleanKey.replace(/-+/g, " "),
    normalized.replace(/\s+/g, "-"),
    normalized.replace(/\s+/g, ""),
    normalized.replace(/-+/g, " "),
    alias?.replace(/\s+/g, "-"),
    alias?.replace(/\s+/g, ""),
    alias?.replace(/-+/g, " "),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const source = recordedVoiceSources[candidate];
    if (source) return source;
  }

  return null;
}

export function hasRecordedPronunciation(text: string) {
  return Boolean(getRecordedVoiceSource(text));
}

export function hasRecordedWords(words: string[]) {
  const cleanWords = words.map((word) => word.trim()).filter(Boolean);
  if (!cleanWords.length) return false;

  const phrase = cleanWords.join(" ").toLowerCase();
  if (getRecordedVoiceSource(phrase)) return true;

  return cleanWords.every((word) => Boolean(getRecordedVoiceSource(word)));
}

function getBackgroundMusic() {
  if (!canUseAudio()) return null;
  if (!backgroundMusic) {
    backgroundMusic = new Audio(backgroundMusicSrc);
    backgroundMusic.loop = true;
    backgroundMusic.volume = getSavedMusicVolume();
  }
  return backgroundMusic;
}

export function playSound(sound: GameSound) {
  if (!canUseAudio() || !isSfxEnabled()) return;
  const audio = new Audio(soundSources[sound]);
  audio.volume = soundVolumes[sound];
  void audio.play().catch(() => undefined);
}

export function playClick() {
  playSound("click");
}

export function playCorrect() {
  playSound("correct");
}

export function playWrong() {
  playSound("wrong");
}

export function speakLetter(text: string) {
  const rawText = text.trim().toLowerCase();
  const naturalVoice = getRecordedVoiceSource(rawText);
  if (!naturalVoice || !canUseAudio()) return false;

  const audio = new Audio(naturalVoice);
  audio.volume = 1;
  void audio.play().catch(() => undefined);
  return true;
}

export function speakWords(words: string[]) {
  const cleanWords = words.map((word) => word.trim()).filter(Boolean);
  if (!cleanWords.length || typeof window === "undefined" || !canUseAudio()) return false;
  const phrase = cleanWords.join(" ").toLowerCase();
  const phraseVoice = getRecordedVoiceSource(phrase);

  if (phraseVoice) {
    const audio = new Audio(phraseVoice);
    audio.volume = 1;
    void audio.play().catch(() => undefined);
    return true;
  }

  const wordVoices = cleanWords.map((word) => getRecordedVoiceSource(word));
  if (wordVoices.some((source) => !source)) return false;

  wordVoices.forEach((source, index) => {
    window.setTimeout(() => {
      if (!source) return;
      const audio = new Audio(source);
      audio.volume = 1;
      void audio.play().catch(() => undefined);
    }, index * 900);
  });

  return true;
}

export function setBackgroundMusicVolume(volume: number) {
  const music = getBackgroundMusic();
  if (!music) return;

  music.volume = clampVolume(volume);
}

export function setBackgroundMusic(enabled: boolean, volume = getSavedMusicVolume()) {
  const music = getBackgroundMusic();
  if (!music) return;
  music.volume = clampVolume(volume);

  if (enabled) {
    void music.play().catch(() => undefined);
    return;
  }

  music.pause();
  music.currentTime = 0;
}

export function handleInteractiveAudioGesture(target: EventTarget | null) {
  if (typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) return;
  const interactive = target.closest("button, a, [role='button']");
  if (!interactive) return;

  const disabled =
    interactive.getAttribute("aria-disabled") === "true" ||
    ("disabled" in interactive && Boolean(interactive.disabled));

  if (disabled) return;

  playClick();

  if (loadProgress().music) {
    setBackgroundMusic(true);
  }
}
