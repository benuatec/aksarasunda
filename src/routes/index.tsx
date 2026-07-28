import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { Frame, Panel } from "@/game/Frame";
import {
  AKSARA_ANGKA,
  AKSARA_NGALAGENA,
  AKSARA_SWARA,
  KATA,
  LEVELS,
  getLearningLevel,
  isSentenceExercise,
  shuffle,
  type Aksara,
  type SentenceExercise,
} from "@/game/data";
import {
  findStoredStudentRecord,
  hasRecordedPronunciation,
  hasRecordedWords,
  getCurrentStudentRecordId,
  getStudentRecordId,
  loadStudentRecords,
  playCorrect,
  playWrong,
  saveStudentRecords,
  setBackgroundMusic,
  setBackgroundMusicVolume,
  speakLetter,
  speakWords,
  type AvatarKey,
  type Progress,
  type StudentRecord,
  useProgress,
} from "@/game/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  adminCreateStudent as createSupabaseStudent,
  adminDeleteStudent as deleteSupabaseStudent,
  adminAddAdminByEmail as addSupabaseAdminByEmail,
  adminListStudents as listSupabaseStudents,
  adminListAdmins as listSupabaseAdmins,
  adminRemoveAdmin as removeSupabaseAdmin,
  adminResetStudentPassword as resetSupabaseStudentPassword,
  adminResetStudentProgress as resetSupabaseStudentProgress,
  adminUpdateAdmin as updateSupabaseAdmin,
  adminUpdateStudent as updateSupabaseStudent,
  finishQuizResult,
  recordActivityProgress,
  refreshStudentSession,
  saveReadingAttempt,
  saveTracingAttempt,
  signInAdmin,
  signOutAdmin,
  syncStudentLocalProgress,
  studentLogin,
  studentLogout,
  studentPayloadToProgress,
  studentRegister,
  updateStudentAvatar,
  updateStudentSettings,
  type AdminUser,
} from "@/lib/supabase-game";
import sgGreet from "@/assets/sg-greet.jpg";
import sgWave from "@/assets/sg-wave.jpg";
import sgHero from "@/assets/sg-hero.jpg";
import sgBoyWave from "@/assets/sg-boy-wave.png";
import sgHappy from "@/assets/sg-happy.jpg";
import feedbackBoySad from "@/assets/feedback-boy-sad.png";
import {
  BookOpen,
  Music,
  Volume2,
  Heart,
  Star,
  Lock,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Trash2,
  Home,
  Trophy,
  PartyPopper,
  Pencil,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  ShieldCheck,
  Users,
  UserPlus,
  Search,
  KeyRound,
  Wifi,
  WifiOff,
  Download,
  RefreshCw,
  Edit3,
  UserCog,
  Mail,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Game });

type Screen =
  | "splash"
  | "name"
  | "menu"
  | "levelSelect"
  | "learn"
  | "quiz"
  | "writing"
  | "reading"
  | "result"
  | "finalCelebration"
  | "progress"
  | "settings"
  | "adminLogin"
  | "adminPanel";

type ProgressUpdate = Partial<Progress> | ((p: Progress) => Progress);

const STUDENT_CLASS_OPTIONS = [
  "10 Satu",
  "10 Dua",
  "10 Tiga",
  "10 Empat",
  "10 Lima",
  "10 Enam",
  "10 Tujuh",
  "10 Delapan",
  "10 Sembilan",
  "10 Sepuluh",
  "10 Sebelas",
  "10 Dua Belas",
  "10 Tiga Belas",
];

type AvatarAsset = {
  label: string;
  image: string;
  description: string;
  feedbackHappyImage: string;
  feedbackSadImage: string;
};

const PROFILE_AVATARS: Record<AvatarKey, AvatarAsset> = {
  boy: {
    label: "Lalaki",
    image: sgBoyWave,
    description: "Avatar siswa lalaki",
    feedbackHappyImage: sgHappy,
    feedbackSadImage: feedbackBoySad,
  },
  girl: {
    label: "Awewe",
    image: sgGreet,
    description: "Avatar siswa awewe",
    feedbackHappyImage: sgGreet,
    feedbackSadImage: sgGreet,
  },
};

const CONFETTI_COLORS = ["#facc15", "#22c55e", "#38bdf8", "#fb7185", "#f97316", "#a3e635"];

const CONFETTI_PIECES = Array.from({ length: 88 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 101}%`,
  delay: `${((index * 19) % 80) / 10}s`,
  duration: `${3.4 + ((index * 13) % 24) / 10}s`,
  size: `${7 + ((index * 11) % 10)}px`,
  height: `${10 + ((index * 17) % 15)}px`,
  drift: `${-70 + ((index * 29) % 141)}px`,
  rotation: `${(index * 47) % 360}deg`,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  radius: index % 5 === 0 ? "9999px" : index % 3 === 0 ? "2px" : "5px",
}));

const FIREWORKS = [
  { left: "18%", top: "24%", color: "#facc15", delay: "0s" },
  { left: "82%", top: "18%", color: "#38bdf8", delay: "0.35s" },
  { left: "50%", top: "13%", color: "#fb7185", delay: "0.75s" },
];

const LOCAL_ADMIN_PASSWORD = "admin123";

type WritingCategoryKey = "swara" | "angka" | "ngalagena";

const WRITING_CATEGORIES: {
  id: WritingCategoryKey;
  label: string;
  hint: string;
  items: Aksara[];
}[] = [
  {
    id: "swara",
    label: "Aksara Swara",
    hint: "Latihan vokal mandiri heula.",
    items: AKSARA_SWARA,
  },
  {
    id: "angka",
    label: "Angka Sunda",
    hint: "Nulis angka 0 nepi ka 9.",
    items: AKSARA_ANGKA,
  },
  {
    id: "ngalagena",
    label: "Aksara Ngalagena",
    hint: "Huruf dasar tina aksara Sunda.",
    items: AKSARA_NGALAGENA,
  },
];

function getProfileAvatar(avatarKey?: string) {
  return PROFILE_AVATARS[avatarKey as AvatarKey] ?? PROFILE_AVATARS.boy;
}

function getFeedbackAvatar(avatarKey: AvatarKey | undefined, ok: boolean) {
  const avatar = getProfileAvatar(avatarKey);
  return {
    image: ok ? avatar.feedbackHappyImage : avatar.feedbackSadImage,
    description: `${avatar.description} ${ok ? "senang" : "sedih"}`,
  };
}

function ProfileAvatar({
  avatarKey,
  size = "md",
  className = "",
}: {
  avatarKey?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const avatar = getProfileAvatar(avatarKey);
  const sizes = {
    sm: "h-11 w-11",
    md: "h-20 w-20",
    lg: "h-36 w-36",
  };

  return (
    <img
      src={avatar.image}
      alt={avatar.description}
      className={`${sizes[size]} rounded-full border-2 border-emerald-950/30 bg-amber-100 object-cover object-top shadow ${className}`}
    />
  );
}

function FeedbackProfileImage({
  avatarKey,
  ok,
  className = "h-56 w-56",
  showBadge,
}: {
  avatarKey?: AvatarKey;
  ok: boolean;
  className?: string;
  showBadge?: boolean;
}) {
  const activeAvatarKey: AvatarKey = avatarKey === "girl" ? "girl" : "boy";
  const profileAvatar = getProfileAvatar(avatarKey);
  const feedbackAvatar = getFeedbackAvatar(avatarKey, ok);
  const shouldShowBadge = showBadge ?? ok;
  const isGirlSadOverlay = !ok && activeAvatarKey === "girl";

  return (
    <div
      className={`relative mx-auto mt-3 overflow-hidden rounded-3xl border-4 bg-amber-100 shadow-lg ${
        ok ? "border-primary/60 shadow-primary/20" : "border-destructive/60 shadow-destructive/20"
      } ${className}`}
    >
      {isGirlSadOverlay ? (
        <div className="flex h-full w-full items-center justify-center p-2">
          <div className="relative h-full aspect-[615/922]">
            <img
              src={feedbackAvatar.image}
              alt={feedbackAvatar.description}
              className="h-full w-full object-contain object-center"
            />
            <div className="absolute left-[22%] top-[25.5%] h-[1.6%] w-[14%] -rotate-[12deg] rounded-full bg-emerald-950" />
            <div className="absolute left-[57%] top-[25.5%] h-[1.6%] w-[14%] rotate-[12deg] rounded-full bg-emerald-950" />
            <div className="absolute left-[46%] top-[27.5%] h-[2%] w-[3%] rotate-[18deg] rounded-full bg-emerald-950/35" />
            <div className="absolute left-[34%] top-[36%] h-[8.5%] w-[27%] rounded-[999px] bg-[#f7d1b5]/95 blur-[3px]" />
            <svg
              viewBox="0 0 100 60"
              className="absolute left-[35%] top-[39%] h-[7%] w-[24%]"
              aria-hidden="true"
            >
              <path
                d="M14 40 Q50 14 86 40"
                fill="none"
                stroke="#211614"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M20 43 Q50 22 80 43"
                fill="none"
                stroke="#6F4F48"
                strokeOpacity="0.38"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      ) : (
        <img
          src={feedbackAvatar.image}
          alt={feedbackAvatar.description}
          className={`h-full w-full ${ok ? "object-cover object-top" : "object-contain object-center p-2"}`}
        />
      )}
      {shouldShowBadge && (
        <div className="absolute right-3 top-3 rounded-full bg-amber-50/95 p-1.5 shadow-md ring-2 ring-white/80">
          <img
            src={profileAvatar.image}
            alt={profileAvatar.description}
            className="h-11 w-11 rounded-full border-2 border-emerald-950/20 object-cover object-top"
          />
        </div>
      )}
    </div>
  );
}

function AvatarPicker({
  value,
  onChange,
}: {
  value: AvatarKey;
  onChange: (avatarKey: AvatarKey) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(Object.entries(PROFILE_AVATARS) as [AvatarKey, (typeof PROFILE_AVATARS)[AvatarKey]][]).map(
        ([key, option]) => {
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`rounded-2xl border-2 p-3 text-center transition hover:-translate-y-0.5 ${
                selected
                  ? "border-primary bg-primary/15 shadow"
                  : "border-emerald-950/25 bg-white/45 hover:bg-white/70"
              }`}
            >
              <img
                src={option.image}
                alt={option.description}
                className="mx-auto h-20 w-20 rounded-full bg-amber-100 object-cover object-top"
              />
              <div className="mt-2 text-sm font-black text-foreground">{option.label}</div>
              <div
                className={`mx-auto mt-1 h-2 w-2 rounded-full ${selected ? "bg-primary" : "bg-transparent"}`}
              />
            </button>
          );
        },
      )}
    </div>
  );
}

async function hashStudentPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeStudentIdentity(name: string, studentClass: string) {
  return `${studentClass.trim().toLowerCase()}::${name.trim().replace(/\s+/g, " ").toLowerCase()}`;
}

function shouldSyncLocalProgress(
  localRecord: StudentRecord | null,
  payload: Awaited<ReturnType<typeof studentLogin>>,
) {
  const backendName = payload.student?.display_name ?? "";
  const backendClass = payload.student?.class_name ?? "";

  if (!localRecord || !backendName || !backendClass) return false;

  const sameIdentity =
    normalizeStudentIdentity(localRecord.name, localRecord.studentClass) ===
    normalizeStudentIdentity(backendName, backendClass);

  if (!sameIdentity) return false;

  const backendScore = Number(payload.progress?.total_score ?? 0);
  const backendLevel = Number(payload.progress?.highest_level ?? 1);
  const backendPlays = Number(payload.progress?.total_plays ?? 0);

  return (
    localRecord.totalScore > backendScore ||
    localRecord.highestLevel > backendLevel ||
    localRecord.totalPlays > backendPlays
  );
}

async function exportStudentsXls(students: StudentRecord[], label: string) {
  if (students.length === 0) {
    toast.error("Teu aya data siswa keur diekspor");
    return;
  }

  const rows: Array<Array<string | number>> = [
    [
      "Ngaran",
      "Kelas",
      "Status",
      "Level Pangluhurna",
      "Jumlah Skor",
      "Jumlah Maén",
      "Dijieun",
      "Diropéa",
    ],
    ...students.map((student) => [
      student.name,
      student.studentClass,
      student.isActive ? "Aktif" : "Teu aktif",
      student.highestLevel,
      student.totalScore,
      student.totalPlays,
      student.createdAt,
      student.updatedAt,
    ]),
  ];
  const safeLabel =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "semua";

  try {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 28 },
      { wch: 16 },
      { wch: 12 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 22 },
      { wch: 22 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa");
    const excelData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelData], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `game-aksara-sunda-siswa-${safeLabel}.xlsx`;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("XLSX siswa geus diundeur");
  } catch (error) {
    console.error(error);
    toast.error("Gagal nyieun file XLSX");
  }
}

function playPronunciation(text: string) {
  const started = speakLetter(text);
  if (!started) {
    toast.error("Sora bacaan can aya atawa browser can ngadukung audio");
  }
}

function playSentence(words: string[]) {
  const cleanWords = words.map((word) => word.trim()).filter(Boolean);
  const started = speakWords(cleanWords);
  if (!started) {
    toast.error("Sora bacaan can aya atawa browser can ngadukung audio");
  }
}

function AudioButton({
  children,
  onClick,
  label,
  className = "",
  iconClassName = "h-5 w-5",
}: {
  children?: React.ReactNode;
  onClick: () => void;
  label: string;
  className?: string;
  iconClassName?: string;
}) {
  const hasPositionClass = /\b(absolute|fixed|sticky)\b/.test(className);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group ${hasPositionClass ? "" : "relative"} isolate inline-flex items-center justify-center overflow-visible rounded-full bg-primary text-primary-foreground shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:bg-emerald-600 hover:shadow-[0_0_28px_rgba(250,204,21,0.72)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300/70 active:scale-95 ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-yellow-300/35 opacity-0 blur-md transition-all duration-300 group-hover:scale-150 group-hover:opacity-100" />
      <span className="pointer-events-none absolute -inset-1 -z-10 rounded-full border-2 border-yellow-200/80 opacity-0 transition-all duration-300 group-hover:scale-125 group-hover:opacity-100" />
      <span className="pointer-events-none absolute -inset-2 -z-10 rounded-full border border-emerald-50/70 opacity-0 transition-all delay-75 duration-300 group-hover:scale-150 group-hover:opacity-80" />
      <Volume2
        className={`${iconClassName} shrink-0 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125`}
        aria-hidden="true"
      />
      {children ? (
        <span className="transition-transform duration-300 group-hover:translate-x-0.5">
          {children}
        </span>
      ) : null}
    </button>
  );
}

function ShiftedUpperRarangkenMark({ wide = false }: { wide?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-[-0.18em] block ${
        wide ? "left-[0.34em] h-[0.32em] w-[0.5em]" : "left-[0.34em] h-[0.32em] w-[0.46em]"
      }`}
    >
      {wide ? (
        <svg className="h-full w-full overflow-visible" viewBox="0 0 80 54" focusable="false">
          <path
            d="M -39.15625 -113.40625 L -57.90625 -143.25 L -47.25 -143.25 L -42 -134.546875 L -36.75 -143.25 L -29.09375 -143.25 L -38.25 -128.40625 L -35.703125 -124.046875 L -24.15625 -143.25 L -13.5 -143.25 L -32.25 -113.40625 Z"
            fill="currentColor"
            transform="translate(67 147)"
          />
        </svg>
      ) : (
        <svg className="h-full w-full overflow-visible" viewBox="0 0 64 48" focusable="false">
          <path
            d="M10 8 L32 38 L54 8"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="13"
          />
        </svg>
      )}
    </span>
  );
}

function AksaraGlyphPart({ part }: { part: string }) {
  const isPamepetKa = part === "\u1B8A\u1BA8";
  const isPaneuleungKa = part === "\u1B8A\u1BA9";

  if (isPamepetKa || isPaneuleungKa) {
    return (
      <span
        aria-label={part}
        className="relative inline-block w-[0.9em] shrink-0 overflow-visible px-0.5 leading-none"
      >
        <span aria-hidden="true">{"\u1B8A"}</span>
        <ShiftedUpperRarangkenMark wide={isPaneuleungKa} />
      </span>
    );
  }

  return <span className="inline-block shrink-0 px-0.5">{part}</span>;
}

function AksaraWord({ word, className = "" }: { word: string; className?: string }) {
  const parts = segmentAksaraWord(word);

  return (
    <span className={`inline-flex shrink-0 items-end justify-center py-2 ${className}`}>
      {parts.map((part, index) => (
        <AksaraGlyphPart key={`${word}-${part}-${index}`} part={part} />
      ))}
    </span>
  );
}

function AksaraSentence({
  words,
  className = "",
  gapClassName = "gap-x-4 gap-y-6 md:gap-y-8",
  wordClassName = "",
}: {
  words: string[];
  className?: string;
  gapClassName?: string;
  wordClassName?: string;
}) {
  return (
    <div className={`font-aksara flex flex-wrap justify-center ${gapClassName} ${className}`}>
      {words.map((word, index) => (
        <AksaraWord key={`${word}-${index}`} word={word} className={wordClassName} />
      ))}
    </div>
  );
}

function getSentenceDifficulty(question: SentenceExercise, index: number) {
  const totalChars = question.words.reduce((sum, word) => sum + word.length, 0);
  const duplicateWords = question.words.length - new Set(question.words).size;

  return question.words.length * 1000 + totalChars * 10 + duplicateWords * 25 + index;
}

function Btn({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "soft";
  className?: string;
  disabled?: boolean;
}) {
  const base =
    "rounded-xl px-6 py-3 font-semibold transition-all active:translate-y-0.5 shadow-md disabled:opacity-50";
  const styles = {
    primary:
      "bg-primary text-primary-foreground hover:brightness-110 border-2 border-emerald-950/40",
    ghost:
      "bg-[var(--paper)] text-foreground border-2 border-emerald-950/50 hover:bg-[var(--paper-deep)]",
    danger:
      "bg-destructive text-destructive-foreground hover:brightness-110 border-2 border-red-950/40",
    soft: "bg-accent text-accent-foreground hover:brightness-105 border-2 border-amber-900/40",
  }[variant];
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

function MenuActionButton({
  children,
  icon: Icon,
  onClick,
  className,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-[52px] w-full items-center gap-3 rounded-[999px] border-2 border-emerald-950/25 px-5 py-3 text-left text-[1.05rem] font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_0_rgba(35,28,15,0.2),0_12px_18px_rgba(35,28,15,0.18)] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5 sm:min-h-[56px] sm:text-[1.12rem] ${className}`}
    >
      <Icon className="h-6 w-6 shrink-0 stroke-[2.8] text-current sm:h-7 sm:w-7" />
      <span className="leading-none">{children}</span>
    </button>
  );
}

function Game() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [progress, setProgress] = useProgress();
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminTestMode, setAdminTestMode] = useState(false);
  const [level, setLevel] = useState(1);
  const [lastResult, setLastResult] = useState<{
    score: number;
    correct: number;
    total: number;
  } | null>(null);
  const checkedSessionRef = useRef("");
  const supabaseReady = isSupabaseConfigured();

  const go = (s: Screen) => setScreen(s);
  const syncStudentSettings = (music: boolean, sfx: boolean, token = progress.sessionToken) => {
    if (!supabaseReady || !token) return;
    void updateStudentSettings(token, music, sfx).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Pangaturan can kasimpen ka Supabase");
    });
  };
  const syncStudentAvatar = (token: string, avatarKey: AvatarKey) => {
    if (!supabaseReady || !token) return;

    void updateStudentAvatar(token, avatarKey)
      .then((payload) => {
        setProgress((current) => studentPayloadToProgress(payload, current));
      })
      .catch(() => undefined);
  };
  const syncActivityProgress = (score: number, token = progress.sessionToken) => {
    if (!supabaseReady || !token || score <= 0) return;

    void recordActivityProgress(token, score)
      .then((payload) => {
        setProgress((current) => studentPayloadToProgress(payload, current));
      })
      .catch(() => undefined);
  };
  const awardWritingProgress = (score: number) => {
    setProgress((p) => ({
      ...p,
      totalScore: p.totalScore + score,
      totalPlays: p.totalPlays + 1,
    }));
    syncActivityProgress(score);
  };
  const toggleMusic = () => {
    setProgress((p) => {
      const music = !p.music;
      setBackgroundMusic(music, p.musicVolume);
      syncStudentSettings(music, p.sfx, p.sessionToken);
      return { ...p, music };
    });
  };
  const changeMusicVolume = (musicVolume: number) => {
    const nextVolume = Math.min(1, Math.max(0, musicVolume));
    setProgress((p) => {
      setBackgroundMusicVolume(nextVolume);
      if (p.music) {
        setBackgroundMusic(true, nextVolume);
      }
      return { ...p, musicVolume: nextVolume };
    });
  };
  const toggleSfx = () => {
    setProgress((p) => {
      const sfx = !p.sfx;
      syncStudentSettings(p.music, sfx, p.sessionToken);
      return { ...p, sfx };
    });
  };
  const handleStudentAuth = async ({
    mode,
    avatarKey,
    name,
    password,
    studentClass,
  }: {
    mode: "register" | "login";
    avatarKey: AvatarKey;
    name: string;
    password: string;
    studentClass: string;
  }) => {
    if (supabaseReady) {
      let payload =
        mode === "login"
          ? await studentLogin(name, studentClass, password)
          : await studentRegister(name, studentClass, password);

      if (mode === "login" && payload.session_token) {
        const localRecord = findStoredStudentRecord({
          name,
          studentClass,
        });

        if (shouldSyncLocalProgress(localRecord, payload)) {
          payload = await syncStudentLocalProgress({
            sessionToken: payload.session_token,
            localProgress: {
              totalScore: localRecord.totalScore,
              highestLevel: localRecord.highestLevel,
              totalPlays: localRecord.totalPlays,
              history: localRecord.history,
            },
          });
          toast.success("Progres lokal geus disaluyukeun ka akun siswa.");
        }
      }

      setProgress((current) => {
        const nextProgress = studentPayloadToProgress(payload, current);
        return {
          ...nextProgress,
          avatarKey: mode === "register" ? avatarKey : nextProgress.avatarKey,
        };
      });
      if (mode === "register") {
        syncStudentAvatar(payload.session_token ?? "", avatarKey);
      }
      toast.success(mode === "login" ? "Siswa hasil asup" : "Siswa hasil daptar");
      go("menu");
      return;
    }

    setProgress({
      name,
      avatarKey,
      studentClass,
      passwordHash: await hashStudentPassword(password),
      studentId: "",
      sessionToken: "",
      sessionExpiresAt: "",
    });
    toast.success("Profil lokal geus disimpen");
    go("menu");
  };
  const handleAdminLogin = async ({ email, password }: { email: string; password: string }) => {
    if (supabaseReady) {
      await signInAdmin(email, password);
    } else if (password !== LOCAL_ADMIN_PASSWORD) {
      throw new Error("Sandi admin can cocog");
    }

    setAdminUnlocked(true);
    toast.success("Admin hasil asup");
    go("adminPanel");
  };
  const handleAdminExit = async () => {
    if (supabaseReady) {
      await signOutAdmin();
    }

    setAdminTestMode(false);
    setAdminUnlocked(false);
    go("splash");
  };
  const startAdminTestMode = () => {
    setAdminTestMode(true);
    setLevel(1);
    toast("Mode coba admin aktif. Skor moal disimpen.");
    go("levelSelect");
  };
  const leaveAdminTestMode = () => {
    setAdminTestMode(false);
    go(adminUnlocked ? "adminPanel" : "splash");
  };
  const clearStudentProfile = () => {
    if (supabaseReady && progress.sessionToken) {
      void studentLogout(progress.sessionToken).catch(() => undefined);
    }

    setAdminTestMode(false);
    setProgress({
      name: "",
      studentClass: "",
      avatarKey: "boy",
      passwordHash: "",
      studentId: "",
      sessionToken: "",
      sessionExpiresAt: "",
      totalScore: 0,
      highestLevel: 1,
      totalPlays: 0,
      history: [],
    });
    go("name");
  };
  const syncQuizResult = (score: number, correct: number, total: number) => {
    if (!supabaseReady || !progress.sessionToken) return;

    void finishQuizResult({
      sessionToken: progress.sessionToken,
      level,
      levelTitle: getLearningLevel(level).name,
      score,
      correct,
      total,
    })
      .then((payload) => {
        setProgress((current) => studentPayloadToProgress(payload, current));
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Hasil kuis can kasimpen ka Supabase");
      });
  };

  useEffect(() => {
    if (
      !supabaseReady ||
      !progress.sessionToken ||
      checkedSessionRef.current === progress.sessionToken
    )
      return;

    checkedSessionRef.current = progress.sessionToken;
    void refreshStudentSession(progress.sessionToken)
      .then((payload) => {
        setProgress((current) => studentPayloadToProgress(payload, current));
      })
      .catch((error) => {
        checkedSessionRef.current = "";
        setProgress({ studentId: "", sessionToken: "", sessionExpiresAt: "" });
        toast.error(error instanceof Error ? error.message : "Sesi siswa kudu asup deui");
      });
  }, [progress.sessionToken, setProgress, supabaseReady]);

  return (
    <>
      {screen === "splash" && (
        <Splash
          musicEnabled={progress.music}
          onToggleMusic={toggleMusic}
          onStart={() => {
            setAdminTestMode(false);
            go(progress.name && progress.studentClass ? "menu" : "name");
          }}
          onAdmin={() => go(adminUnlocked ? "adminPanel" : "adminLogin")}
        />
      )}
      {screen === "adminLogin" && (
        <AdminLogin
          supabaseReady={supabaseReady}
          onBack={() => go("splash")}
          onLogin={handleAdminLogin}
        />
      )}
      {screen === "adminPanel" && (
        <AdminPanel
          supabaseReady={supabaseReady}
          progress={progress}
          onUpdateProgress={setProgress}
          onTestGame={startAdminTestMode}
          onBack={handleAdminExit}
        />
      )}
      {screen === "name" && (
        <NameScreen
          supabaseReady={supabaseReady}
          initialName={progress.name}
          initialClass={progress.studentClass}
          initialAvatar={progress.avatarKey}
          onBack={() => go("splash")}
          onContinue={handleStudentAuth}
        />
      )}
      {screen === "menu" && (
        <Menu
          progress={progress}
          onLearn={() => {
            setAdminTestMode(false);
            go("levelSelect");
          }}
          onWriting={() => go("writing")}
          onReading={() => go("reading")}
          onQuiz={() => {
            setAdminTestMode(false);
            setLevel(progress.highestLevel || 1);
            go("quiz");
          }}
          onProgress={() => go("progress")}
          onSettings={() => go("settings")}
          onExit={clearStudentProfile}
        />
      )}
      {screen === "levelSelect" && (
        <LevelSelect
          progress={progress}
          unlockAll={adminTestMode}
          adminMode={adminTestMode}
          onPick={(lv: number) => {
            setLevel(lv);
            go("learn");
          }}
          onBack={() => (adminTestMode ? leaveAdminTestMode() : go("menu"))}
        />
      )}
      {screen === "learn" && (
        <Learn level={level} onNext={() => go("quiz")} onBack={() => go("levelSelect")} />
      )}
      {screen === "quiz" && (
        <Quiz
          level={level}
          avatarKey={progress.avatarKey}
          onDone={(score, correct, total) => {
            if (adminTestMode) {
              toast("Mode admin: hasil teu disimpen ka data siswa.");
              setLastResult({ score, correct, total });
              go("result");
              return;
            }

            setProgress((p) => ({
              ...p,
              totalScore: p.totalScore + score,
              highestLevel: Math.max(
                p.highestLevel,
                Math.min(LEVELS.length, level + (correct / total >= 0.7 ? 1 : 0)),
              ),
              totalPlays: p.totalPlays + 1,
              history: [
                {
                  date: new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }),
                  level,
                  score,
                },
                ...p.history,
              ].slice(0, 8),
            }));
            syncQuizResult(score, correct, total);
            setLastResult({ score, correct, total });
            go("result");
          }}
          onBack={() => (adminTestMode ? go("levelSelect") : go("menu"))}
        />
      )}
      {screen === "writing" && (
        <Writing
          sessionToken={progress.sessionToken}
          onComplete={awardWritingProgress}
          onBack={() => go("menu")}
        />
      )}
      {screen === "reading" && (
        <Reading
          sessionToken={progress.sessionToken}
          avatarKey={progress.avatarKey}
          onDone={(score, correct, total) => {
            setProgress((p) => ({
              ...p,
              totalScore: p.totalScore + score,
              totalPlays: p.totalPlays + 1,
              history: [
                {
                  date: new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }),
                  level,
                  score,
                },
                ...p.history,
              ].slice(0, 8),
            }));
            syncActivityProgress(score);
            setLastResult({ score, correct, total });
            go("result");
          }}
          onBack={() => go("menu")}
        />
      )}
      {screen === "result" && (
        <Result
          {...lastResult!}
          level={level}
          adminMode={adminTestMode}
          onAgain={() => go("quiz")}
          onNext={() => {
            if (level >= LEVELS.length) {
              go("finalCelebration");
              return;
            }
            const nl = level + 1;
            setLevel(nl);
            go("learn");
          }}
          onMenu={() => go(adminTestMode ? "levelSelect" : "menu")}
          onProgress={() => go(adminTestMode ? "adminPanel" : "progress")}
          onExit={adminTestMode ? leaveAdminTestMode : clearStudentProfile}
        />
      )}
      {screen === "finalCelebration" && (
        <FinalCelebration
          onMenu={() => {
            setLevel(1);
            go(adminTestMode ? "levelSelect" : "menu");
          }}
        />
      )}
      {screen === "progress" && <ProgressScreen progress={progress} onBack={() => go("menu")} />}
      {screen === "settings" && (
        <Settings
          progress={progress}
          onSave={(name, avatarKey) => {
            setProgress({ name, avatarKey });
            syncStudentAvatar(progress.sessionToken, avatarKey);
            toast.success("Pangaturan geus disimpen");
          }}
          onToggleMusic={toggleMusic}
          onChangeMusicVolume={changeMusicVolume}
          onToggleSfx={toggleSfx}
          onChangeProfile={clearStudentProfile}
          onReset={() => {
            setProgress((p) => ({
              ...p,
              totalScore: 0,
              highestLevel: 1,
              totalPlays: 0,
              history: [],
            }));
            toast.success("Progres geus dibalikeun");
          }}
          onBack={() => go("menu")}
        />
      )}
    </>
  );
}

// ---- Screens ----

function Splash({
  musicEnabled,
  onAdmin,
  onStart,
  onToggleMusic,
}: {
  musicEnabled: boolean;
  onAdmin: () => void;
  onStart: () => void;
  onToggleMusic: () => void;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const toggleMusic = () => {
    const nextMusic = !musicEnabled;
    onToggleMusic();
    toast(nextMusic ? "Musik dihurungkeun" : "Musik dipareuman");
  };
  return (
    <Frame>
      <button
        type="button"
        onClick={onAdmin}
        aria-label="Asup admin"
        title="Admin"
        className="fixed right-3 top-3 z-20 inline-flex h-8 items-center gap-1 rounded-full border border-emerald-950/20 bg-emerald-950/35 px-2.5 text-[0.68rem] font-black uppercase tracking-wide text-amber-100/70 opacity-65 shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:bg-emerald-900/70 hover:text-amber-100 hover:opacity-100 md:right-5 md:top-5"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Admin
      </button>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-2 text-2xl font-medium text-emerald-50 drop-shadow">
          Wilujeng Sumping
        </div>
        <h1 className="text-7xl font-bold tracking-tight text-amber-100 drop-shadow-lg md:text-8xl">
          SUNDA GAME
        </h1>
        <p className="mt-3 text-lg text-emerald-50/90 drop-shadow">Kaulinan Diajar Aksara Sunda</p>
        <img
          src={sgHero}
          alt="Karakter Sunda"
          className="my-4 h-64 w-auto rounded-2xl object-cover drop-shadow-xl"
        />
        <Btn onClick={onStart} className="px-12 text-xl">
          MIMITI
        </Btn>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn variant="ghost" className="text-sm" onClick={() => setShowHelp(true)}>
            <BookOpen className="mr-2 inline h-4 w-4" />
            Pituduh
          </Btn>
          <Btn variant="ghost" className="text-sm" onClick={toggleMusic}>
            <Music className="mr-2 inline h-4 w-4" />
            {musicEnabled ? "Musik: Hurung" : "Musik: Pareum"}
          </Btn>
        </div>
      </div>
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowHelp(false)}
        >
          <Panel className="max-w-lg p-6">
            <div onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold text-primary">Pituduh Kaulinan</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  1. Pilih <b>Mimiti Diajar</b> keur mikawanoh aksara Sunda.
                </li>
                <li>
                  2. Unggal level ditungtungan ku <b>Kuis</b>. Kudu 70% leres supaya level
                  salajengna kabuka.
                </li>
                <li>
                  3. Hidep boga <b>3 nyawa</b> dina unggal kuis. Ati-ati ngajawab!
                </li>
                <li>
                  4. Paké <b>Latihan Nulis</b> keur nebalkeun aksara dina kanvas.
                </li>
                <li>
                  5. Pencét tombol <Volume2 className="inline h-4 w-4" /> keur ngadangukeun bacaan.
                </li>
              </ul>
              <div className="mt-5 text-right">
                <Btn onClick={() => setShowHelp(false)}>Tutup</Btn>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </Frame>
  );
}

function NameScreen({
  initialName,
  initialClass,
  initialAvatar,
  supabaseReady,
  onBack,
  onContinue,
}: {
  initialName: string;
  initialClass: string;
  initialAvatar: AvatarKey;
  supabaseReady: boolean;
  onBack: () => void;
  onContinue: (student: {
    mode: "register" | "login";
    avatarKey: AvatarKey;
    name: string;
    studentClass: string;
    password: string;
  }) => Promise<void> | void;
}) {
  const [name, setName] = useState(initialName);
  const [studentClass, setStudentClass] = useState(initialClass);
  const [avatarKey, setAvatarKey] = useState<AvatarKey>(initialAvatar || "boy");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"register" | "login">("register");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName) {
      toast.error("Ngaran siswa kudu dieusian");
      return;
    }

    if (!studentClass) {
      toast.error("Pilih kelas heula");
      return;
    }

    if (trimmedPassword.length < 4) {
      toast.error("Sandi sahenteuna 4 karakter");
      return;
    }

    setIsSubmitting(true);
    try {
      await onContinue({
        mode,
        avatarKey,
        name: trimmedName,
        studentClass,
        password: trimmedPassword,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Data siswa can hasil diolah");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Frame>
      <div className="flex flex-1 items-center justify-center">
        <Panel className="w-full max-w-xl p-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            {mode === "register" ? "DAPTAR SISWA" : "ASUP SISWA"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {supabaseReady
              ? "Data siswa nyambung ka Supabase."
              : "Mode lokal hurung nepi ka Supabase key dieusian."}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-emerald-950/10 p-1">
            <button
              onClick={() => setMode("register")}
              className={`rounded-xl px-4 py-2 text-sm font-black transition ${mode === "register" ? "bg-primary text-primary-foreground shadow" : "text-foreground"}`}
            >
              Daptar
            </button>
            <button
              onClick={() => setMode("login")}
              className={`rounded-xl px-4 py-2 text-sm font-black transition ${mode === "login" ? "bg-primary text-primary-foreground shadow" : "text-foreground"}`}
            >
              Asup
            </button>
          </div>
          <div className="mt-6 space-y-3 text-left">
            <div>
              <span className="text-sm font-bold text-foreground">Poto Profil</span>
              <div className="mt-2">
                <AvatarPicker value={avatarKey} onChange={setAvatarKey} />
              </div>
            </div>
            <label className="block">
              <span className="text-sm font-bold text-foreground">Ngaran</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ketik ngaran siswa"
                className="mt-1 w-full rounded-lg border-2 border-emerald-950/40 bg-white/70 px-4 py-3 text-lg outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-foreground">Kelas</span>
              <div className="relative mt-1">
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className={`w-full appearance-none rounded-lg border-2 border-emerald-950/40 bg-white/70 px-4 py-3 pr-12 text-lg outline-none transition focus:border-primary ${studentClass ? "text-foreground" : "text-muted-foreground"}`}
                >
                  <option value="" disabled>
                    Pilih kelas
                  </option>
                  {STUDENT_CLASS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground" />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-foreground">Sandi</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Sahenteuna 4 karakter"
                className="mt-1 w-full rounded-lg border-2 border-emerald-950/40 bg-white/70 px-4 py-3 text-lg outline-none focus:border-primary"
              />
            </label>
          </div>
          <Btn onClick={submit} disabled={isSubmitting} className="mt-6 w-full text-lg">
            {isSubmitting ? "DIOLAH..." : mode === "register" ? "DAPTAR" : "ASUP"}
          </Btn>
          <Btn
            variant="ghost"
            onClick={onBack}
            className="mt-3 flex w-full items-center justify-center gap-2 text-sm"
          >
            <Home className="h-4 w-4" />
            Balik ka Mimiti
          </Btn>
        </Panel>
      </div>
    </Frame>
  );
}

function AdminLogin({
  supabaseReady,
  onBack,
  onLogin,
}: {
  supabaseReady: boolean;
  onBack: () => void;
  onLogin: (credentials: { email: string; password: string }) => Promise<void> | void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (supabaseReady && !email.trim()) {
      toast.error("Email admin kudu dieusian");
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogin({ email: email.trim(), password });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Admin can hasil asup");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Frame title="Admin">
      <div className="flex flex-1 items-center justify-center">
        <Panel className="w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <h2 className="mt-4 text-3xl font-black text-foreground">ADMIN PANEL</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {supabaseReady
              ? "Asup ku akun admin Supabase."
              : "Mode lokal: paké sandi admin samentara."}
          </p>
          {supabaseReady && (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email admin"
              className="mt-6 w-full rounded-lg border-2 border-emerald-950/40 bg-white/70 px-4 py-3 text-lg outline-none focus:border-primary"
            />
          )}
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            type="password"
            placeholder="Sandi admin"
            className={`${supabaseReady ? "mt-3" : "mt-6"} w-full rounded-lg border-2 border-emerald-950/40 bg-white/70 px-4 py-3 text-lg outline-none focus:border-primary`}
          />
          {!supabaseReady && (
            <div className="mt-2 text-xs text-muted-foreground">
              Sandi lokal samentara: admin123
            </div>
          )}
          <div className="mt-6 flex gap-2">
            <Btn variant="ghost" onClick={onBack} className="flex-1">
              <ChevronLeft className="mr-1 inline h-4 w-4" />
              Balik
            </Btn>
            <Btn onClick={submit} disabled={isSubmitting} className="flex-1">
              <ShieldCheck className="mr-1 inline h-4 w-4" />
              {isSubmitting ? "Asup..." : "Asup"}
            </Btn>
          </div>
        </Panel>
      </div>
    </Frame>
  );
}

function AdminPanel({
  supabaseReady,
  progress,
  onUpdateProgress,
  onTestGame,
  onBack,
}: {
  supabaseReady: boolean;
  progress: Progress;
  onUpdateProgress: (next: ProgressUpdate) => void;
  onTestGame: () => void;
  onBack: () => Promise<void> | void;
}) {
  const [students, setStudents] = useState<StudentRecord[]>(() =>
    supabaseReady ? [] : loadStudentRecords(),
  );
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("Semua");
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState(STUDENT_CLASS_OPTIONS[0]);
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [adminView, setAdminView] = useState<"students" | "admins">("students");

  const currentStudentId =
    progress.name && progress.studentClass ? getCurrentStudentRecordId(progress) : "";

  const persistStudents = (nextStudents: StudentRecord[]) => {
    setStudents(nextStudents);
    saveStudentRecords(nextStudents);
  };

  useEffect(() => {
    if (!supabaseReady) {
      setStudents(loadStudentRecords());
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    void listSupabaseStudents(classFilter, search)
      .then((nextStudents) => {
        if (!cancelled) setStudents(nextStudents);
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Daptar siswa can bisa dimuat");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [classFilter, reloadKey, search, supabaseReady]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesClass = classFilter === "Semua" || student.studentClass === classFilter;
      const matchesSearch =
        !normalizedSearch ||
        student.name.toLowerCase().includes(normalizedSearch) ||
        student.studentClass.toLowerCase().includes(normalizedSearch);

      return matchesClass && matchesSearch;
    });
  }, [classFilter, search, students]);

  const activeCount = students.filter((student) => student.isActive).length;
  const totalScore = students.reduce((sum, student) => sum + student.totalScore, 0);
  const inactiveCount = students.length - activeCount;
  const exportLabel = `${classFilter}-${search.trim() || "semua"}`;
  const refreshStudents = () => {
    if (!supabaseReady) {
      setStudents(loadStudentRecords());
      toast.success("Data lokal geus dimuat deui");
      return;
    }

    setReloadKey((key) => key + 1);
  };

  const addStudent = async () => {
    const trimmedName = newName.trim();
    const trimmedPassword = newPassword.trim();

    if (trimmedName.length < 2) {
      toast.error("Ngaran siswa sahenteuna 2 karakter");
      return;
    }

    if (trimmedPassword.length < 4) {
      toast.error("Sandi sahenteuna 4 karakter");
      return;
    }

    setIsSaving(true);
    try {
      if (supabaseReady) {
        const nextStudent = await createSupabaseStudent(trimmedName, newClass, trimmedPassword);
        setStudents((current) => [nextStudent, ...current]);
      } else {
        const id = getStudentRecordId(trimmedName, newClass);
        if (students.some((student) => student.id === id)) {
          toast.error("Siswa jeung ngaran sarta kelas eta geus aya");
          return;
        }

        const now = new Date().toISOString();
        const nextStudent: StudentRecord = {
          id,
          name: trimmedName,
          studentClass: newClass,
          passwordHash: await hashStudentPassword(trimmedPassword),
          totalScore: 0,
          highestLevel: 1,
          totalPlays: 0,
          history: [],
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };

        persistStudents([nextStudent, ...students]);
      }

      setNewName("");
      setNewPassword("");
      toast.success("Siswa geus ditambahkeun");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Siswa can hasil ditambahkeun");
    } finally {
      setIsSaving(false);
    }
  };

  const updateStudent = async (studentId: string, patch: Partial<StudentRecord>) => {
    const target = students.find((student) => student.id === studentId);
    if (!target) return;

    if (supabaseReady) {
      try {
        const updatedStudent = await updateSupabaseStudent(studentId, {
          displayName: patch.name ?? target.name,
          className: patch.studentClass ?? target.studentClass,
          isActive: patch.isActive ?? target.isActive,
        });

        setStudents((current) =>
          current.map((student) => (student.id === studentId ? updatedStudent : student)),
        );

        if (currentStudentId === studentId) {
          onUpdateProgress({
            name: updatedStudent.name,
            studentClass: updatedStudent.studentClass,
          });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Data siswa can hasil diropéa");
      }
      return;
    }

    const nextName = patch.name ?? target.name;
    const nextClass = patch.studentClass ?? target.studentClass;
    const nextId = getStudentRecordId(nextName, nextClass);

    if (nextId !== studentId && students.some((student) => student.id === nextId)) {
      toast.error("Ngaran jeung kelas eta geus dipaké siswa sejen");
      return;
    }

    const updatedStudent: StudentRecord = {
      ...target,
      ...patch,
      id: nextId,
      name: nextName,
      studentClass: nextClass,
      updatedAt: new Date().toISOString(),
    };

    persistStudents(
      students.map((student) => (student.id === studentId ? updatedStudent : student)),
    );

    if (currentStudentId === studentId) {
      onUpdateProgress({
        name: updatedStudent.name,
        studentClass: updatedStudent.studentClass,
      });
    }
  };

  const resetStudentProgress = async (studentId: string) => {
    if (supabaseReady) {
      try {
        const updatedStudent = await resetSupabaseStudentProgress(studentId);
        setStudents((current) =>
          current.map((student) => (student.id === studentId ? updatedStudent : student)),
        );

        if (currentStudentId === studentId) {
          onUpdateProgress({
            totalScore: 0,
            highestLevel: 1,
            totalPlays: 0,
            history: [],
          });
        }

        toast.success("Progres siswa geus dibalikeun");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Progres siswa can hasil dibalikeun");
      }
      return;
    }

    const nextStudents = students.map((student) =>
      student.id === studentId
        ? {
            ...student,
            totalScore: 0,
            highestLevel: 1,
            totalPlays: 0,
            history: [],
            updatedAt: new Date().toISOString(),
          }
        : student,
    );
    persistStudents(nextStudents);

    if (currentStudentId === studentId) {
      onUpdateProgress({
        totalScore: 0,
        highestLevel: 1,
        totalPlays: 0,
        history: [],
      });
    }

    toast.success("Progres siswa geus dibalikeun");
  };

  const resetStudentPassword = async (studentId: string) => {
    const target = students.find((student) => student.id === studentId);
    if (!target) return;

    const password = window.prompt(`Sandi anyar keur ${target.name}`);
    if (!password) return;

    if (password.trim().length < 4) {
      toast.error("Sandi sahenteuna 4 karakter");
      return;
    }

    try {
      if (supabaseReady) {
        await resetSupabaseStudentPassword(studentId, password.trim());
      } else {
        await updateStudent(studentId, {
          passwordHash: await hashStudentPassword(password.trim()),
        });
      }

      toast.success("Sandi siswa geus diropéa");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sandi siswa can hasil diropéa");
    }
  };

  const editStudentName = async (studentId: string) => {
    const target = students.find((student) => student.id === studentId);
    if (!target) return;

    const name = window.prompt("Ngaran anyar siswa", target.name);
    if (!name) return;

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error("Ngaran siswa sahenteuna 2 karakter");
      return;
    }

    await updateStudent(studentId, { name: trimmedName });
  };

  const deleteStudent = async (studentId: string) => {
    const target = students.find((student) => student.id === studentId);
    if (!target) return;

    if (!window.confirm(`Pupus siswa ${target.name}?`)) return;

    try {
      if (supabaseReady) {
        await deleteSupabaseStudent(studentId);
        setStudents((current) => current.filter((student) => student.id !== studentId));
      } else {
        persistStudents(students.filter((student) => student.id !== studentId));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Siswa can hasil dipupus");
      return;
    }

    if (currentStudentId === studentId) {
      onUpdateProgress({
        name: "",
        studentClass: "",
        passwordHash: "",
        studentId: "",
        sessionToken: "",
        sessionExpiresAt: "",
        totalScore: 0,
        highestLevel: 1,
        totalPlays: 0,
        history: [],
      });
    }

    toast.success("Siswa geus dipupus");
  };

  return (
    <Frame title="Admin Panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Panel className="flex items-center gap-3 px-4 py-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <div className="text-lg font-black leading-none">Atur Siswa</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              {supabaseReady ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" />
              )}
              {supabaseReady ? "Nyambung ka Supabase" : "Tingalian lokal samemeh Supabase aktif"}
            </div>
          </div>
        </Panel>
        <div className="flex flex-wrap gap-2">
          <Btn variant="soft" onClick={onTestGame}>
            <BookOpen className="mr-1 inline h-4 w-4" />
            Coba Kaulinan
          </Btn>
          {adminView === "students" && (
            <>
              <Btn variant="soft" onClick={() => exportStudentsXls(filteredStudents, exportLabel)}>
                <Download className="mr-1 inline h-4 w-4" />
                Ekspor XLSX
              </Btn>
              <Btn variant="ghost" onClick={refreshStudents} disabled={isLoading}>
                <RefreshCw className={`mr-1 inline h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Anyarkeun
              </Btn>
            </>
          )}
          <Btn variant="ghost" onClick={onBack}>
            <ChevronLeft className="mr-1 inline h-4 w-4" />
            Kaluar Admin
          </Btn>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => setAdminView("students")}
          className={`rounded-full border-2 px-5 py-2 text-sm font-black transition ${adminView === "students" ? "border-primary bg-primary text-primary-foreground shadow" : "border-emerald-950/40 bg-[var(--paper)] text-foreground"}`}
        >
          <Users className="mr-1 inline h-4 w-4" />
          Atur Siswa
        </button>
        <button
          onClick={() => setAdminView("admins")}
          className={`rounded-full border-2 px-5 py-2 text-sm font-black transition ${adminView === "admins" ? "border-primary bg-primary text-primary-foreground shadow" : "border-emerald-950/40 bg-[var(--paper)] text-foreground"}`}
        >
          <UserCog className="mr-1 inline h-4 w-4" />
          Pamaké Admin
        </button>
      </div>

      {adminView === "students" ? (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
            <Panel className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Jumlah Siswa
              </div>
              <div className="mt-2 text-3xl font-black text-primary">{students.length}</div>
            </Panel>
            <Panel className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4" />
                Siswa Aktif
              </div>
              <div className="mt-2 text-3xl font-black text-primary">{activeCount}</div>
            </Panel>
            <Panel className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <X className="h-4 w-4" />
                Teu Aktif
              </div>
              <div className="mt-2 text-3xl font-black text-primary">{inactiveCount}</div>
            </Panel>
            <Panel className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                Jumlah Skor
              </div>
              <div className="mt-2 text-3xl font-black text-primary">{totalScore}</div>
            </Panel>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
            <Panel className="p-5">
              <div className="flex items-center gap-2 text-lg font-black text-primary">
                <UserPlus className="h-5 w-5" />
                Tambahkeun Siswa
              </div>
              <div className="mt-4 space-y-3">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ngaran siswa"
                  className="w-full rounded-lg border-2 border-emerald-950/40 bg-white/70 px-4 py-3 outline-none focus:border-primary"
                />
                <select
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="w-full rounded-lg border-2 border-emerald-950/40 bg-white/70 px-4 py-3 outline-none focus:border-primary"
                >
                  {STUDENT_CLASS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  placeholder="Sandi mimiti"
                  className="w-full rounded-lg border-2 border-emerald-950/40 bg-white/70 px-4 py-3 outline-none focus:border-primary"
                />
                <Btn onClick={addStudent} disabled={isSaving} className="w-full">
                  <UserPlus className="mr-1 inline h-4 w-4" />
                  {isSaving ? "Nambahkeun..." : "Tambahkeun"}
                </Btn>
              </div>
            </Panel>

            <Panel className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-lg font-black text-primary">
                    <Users className="h-5 w-5" />
                    Daptar Siswa
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Nembongkeun {filteredStudents.length} siswa
                    {classFilter !== "Semua" ? ` ti ${classFilter}` : ""}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Teangan ngaran"
                      className="w-full rounded-lg border-2 border-emerald-950/40 bg-white/70 py-2 pl-9 pr-3 outline-none focus:border-primary sm:w-[180px]"
                    />
                  </label>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="rounded-lg border-2 border-emerald-950/40 bg-white/70 px-3 py-2 outline-none focus:border-primary"
                  >
                    <option value="Semua">Sakabéh Kelas</option>
                    {STUDENT_CLASS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 max-h-[430px] overflow-auto rounded-xl border-2 border-emerald-950/20 bg-white/35">
                {isLoading ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Ngamuat data siswa...
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Can aya siswa nu cocog.
                  </div>
                ) : (
                  <div className="min-w-[860px] divide-y divide-emerald-950/10">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="grid grid-cols-[1.4fr_150px_90px_90px_330px] items-center gap-3 px-4 py-3 text-sm"
                      >
                        <div>
                          <div className="font-black text-foreground">{student.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {student.history.length} riwayat skor
                          </div>
                        </div>
                        <select
                          value={student.studentClass}
                          onChange={(e) =>
                            updateStudent(student.id, { studentClass: e.target.value })
                          }
                          className="rounded-lg border border-emerald-950/30 bg-white/70 px-2 py-2 text-xs outline-none"
                        >
                          {STUDENT_CLASS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <div>
                          <div className="text-xs text-muted-foreground">Level</div>
                          <div className="font-black">{student.highestLevel}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Skor</div>
                          <div className="font-black">{student.totalScore}</div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <button
                            onClick={() => editStudentName(student.id)}
                            className="rounded-lg border border-sky-900/30 bg-sky-100 px-2 py-1 text-xs font-bold text-sky-900"
                          >
                            <Edit3 className="mr-1 inline h-3.5 w-3.5" />
                            Ropéa
                          </button>
                          <button
                            onClick={() =>
                              updateStudent(student.id, { isActive: !student.isActive })
                            }
                            className={`rounded-lg border px-2 py-1 text-xs font-bold ${student.isActive ? "border-primary bg-primary/15 text-primary" : "border-red-900/30 bg-red-100 text-red-800"}`}
                          >
                            {student.isActive ? "Aktif" : "Teu aktif"}
                          </button>
                          <button
                            onClick={() => resetStudentPassword(student.id)}
                            className="rounded-lg border border-emerald-900/30 bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-900"
                          >
                            <KeyRound className="mr-1 inline h-3.5 w-3.5" />
                            Sandi
                          </button>
                          <button
                            onClick={() => resetStudentProgress(student.id)}
                            className="rounded-lg border border-amber-900/30 bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900"
                          >
                            Balikeun
                          </button>
                          <button
                            onClick={() => deleteStudent(student.id)}
                            className="rounded-lg border border-red-900/30 bg-red-100 px-2 py-1 text-xs font-bold text-red-800"
                          >
                            Pupus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </>
      ) : (
        <AdminUsersPanel supabaseReady={supabaseReady} />
      )}
    </Frame>
  );
}

function AdminUsersPanel({ supabaseReady }: { supabaseReady: boolean }) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!supabaseReady) {
      setAdmins([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    void listSupabaseAdmins()
      .then((nextAdmins) => {
        if (!cancelled) setAdmins(nextAdmins);
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Daptar admin can bisa dimuat");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, supabaseReady]);

  const addAdmin = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = displayName.trim();

    if (!trimmedEmail.includes("@")) {
      toast.error("Email admin can leres");
      return;
    }

    setIsSaving(true);
    try {
      const nextAdmin = await addSupabaseAdminByEmail(trimmedEmail, trimmedName);
      setAdmins((current) => [nextAdmin, ...current.filter((admin) => admin.id !== nextAdmin.id)]);
      setEmail("");
      setDisplayName("");
      toast.success("Hak admin geus ditambahkeun");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Admin can hasil ditambahkeun");
    } finally {
      setIsSaving(false);
    }
  };

  const editAdminName = async (admin: AdminUser) => {
    const nextName = window.prompt("Ngaran tampilan admin", admin.displayName);
    if (!nextName) return;

    const trimmedName = nextName.trim();
    if (trimmedName.length < 2) {
      toast.error("Ngaran admin sahenteuna 2 karakter");
      return;
    }

    try {
      const updatedAdmin = await updateSupabaseAdmin(admin.id, trimmedName);
      setAdmins((current) => current.map((item) => (item.id === admin.id ? updatedAdmin : item)));
      toast.success("Admin geus diropéa");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Admin can hasil diropéa");
    }
  };

  const removeAdmin = async (admin: AdminUser) => {
    if (!window.confirm(`Cabut hak admin ti ${admin.email}?`)) return;

    try {
      await removeSupabaseAdmin(admin.id);
      setAdmins((current) => current.filter((item) => item.id !== admin.id));
      toast.success("Hak admin geus dicabut");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hak admin can hasil dicabut");
    }
  };

  return (
    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
      <Panel className="p-5">
        <div className="flex items-center gap-2 text-lg font-black text-primary">
          <UserCog className="h-5 w-5" />
          Tambahkeun Pamaké Admin
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Jieun heula akun admin di Supabase Authentication, tuluy lebetkeun emailna di dieu keur
          méré hak admin.
        </p>
        <div className="mt-4 space-y-3">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="email-admin@contoh.com"
            className="w-full rounded-lg border-2 border-emerald-950/40 bg-white/70 px-4 py-3 outline-none focus:border-primary"
          />
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Ngaran tampilan admin"
            className="w-full rounded-lg border-2 border-emerald-950/40 bg-white/70 px-4 py-3 outline-none focus:border-primary"
          />
          <Btn onClick={addAdmin} disabled={!supabaseReady || isSaving} className="w-full">
            <ShieldCheck className="mr-1 inline h-4 w-4" />
            {isSaving ? "Nambahkeun..." : "Tambahkeun Admin"}
          </Btn>
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-black text-primary">
              <ShieldCheck className="h-5 w-5" />
              Daptar Pamaké Admin
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{admins.length} admin aktif</div>
          </div>
          <Btn
            variant="ghost"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={isLoading || !supabaseReady}
          >
            <RefreshCw className={`mr-1 inline h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Anyarkeun
          </Btn>
        </div>

        {!supabaseReady ? (
          <div className="mt-4 rounded-xl border-2 border-amber-900/20 bg-amber-100/70 p-4 text-sm text-amber-950">
            Fitur pamaké admin aktif sanggeus Supabase dikonfigurasi.
          </div>
        ) : (
          <div className="mt-4 max-h-[430px] overflow-auto rounded-xl border-2 border-emerald-950/20 bg-white/35">
            {isLoading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Ngamuat admin...</div>
            ) : admins.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Can aya admin sejen.
              </div>
            ) : (
              <div className="min-w-[720px] divide-y divide-emerald-950/10">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="grid grid-cols-[1.4fr_1fr_210px] items-center gap-3 px-4 py-3 text-sm"
                  >
                    <div>
                      <div className="font-black text-foreground">{admin.displayName}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {admin.email}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Login panungtungan
                      <div className="font-bold text-foreground">
                        {admin.lastSignInAt
                          ? new Date(admin.lastSignInAt).toLocaleString("id-ID")
                          : "-"}
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <button
                        onClick={() => editAdminName(admin)}
                        className="rounded-lg border border-sky-900/30 bg-sky-100 px-2 py-1 text-xs font-bold text-sky-900"
                      >
                        <Edit3 className="mr-1 inline h-3.5 w-3.5" />
                        Ropéa
                      </button>
                      <button
                        onClick={() => removeAdmin(admin)}
                        className="rounded-lg border border-red-900/30 bg-red-100 px-2 py-1 text-xs font-bold text-red-800"
                      >
                        Cabut Admin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

function Menu({
  progress,
  onLearn,
  onWriting,
  onReading,
  onQuiz,
  onProgress,
  onSettings,
  onExit,
}: {
  progress: Progress;
  onLearn: () => void;
  onWriting: () => void;
  onReading: () => void;
  onQuiz: () => void;
  onProgress: () => void;
  onSettings: () => void;
  onExit: () => void;
}) {
  return (
    <Frame>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Panel className="flex min-w-0 items-center gap-3 px-3 py-2">
          <ProfileAvatar avatarKey={progress.avatarKey} size="sm" />
          <span className="min-w-0 pr-3 font-semibold">
            Sampurasun, {progress.name}!{" "}
            <span className="break-words text-xs text-muted-foreground">
              {progress.studentClass}
            </span>
          </span>
        </Panel>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Panel className="flex items-center gap-2 px-4 py-2">
            <Star className="h-4 w-4 text-amber-500" />
            <div className="text-xs">
              Level<div className="font-bold">{progress.highestLevel}</div>
            </div>
          </Panel>
          <Panel className="flex items-center gap-2 px-4 py-2">
            <Star className="h-4 w-4 text-amber-500" />
            <div className="text-xs">
              Skor<div className="font-bold">{progress.totalScore}</div>
            </div>
          </Panel>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-7xl font-bold text-amber-100 drop-shadow-lg">SUNDA GAME</h1>
        <p className="mt-2 text-emerald-50">Kaulinan Diajar Aksara Sunda</p>
        <div className="mt-9 flex w-full max-w-[340px] flex-col gap-2.5">
          <MenuActionButton icon={BookOpen} onClick={onLearn} className="bg-[#3f8e41] text-white">
            Mimiti Diajar
          </MenuActionButton>
          <MenuActionButton icon={Pencil} onClick={onWriting} className="bg-[#f0c431] text-black">
            Latihan Nulis
          </MenuActionButton>
          <MenuActionButton icon={Volume2} onClick={onReading} className="bg-[#c96de6] text-black">
            Maca
          </MenuActionButton>
          <MenuActionButton
            icon={BarChart3}
            onClick={onProgress}
            className="bg-[#79bdf1] text-black"
          >
            Tingali Progres
          </MenuActionButton>
          <MenuActionButton
            icon={SettingsIcon}
            onClick={onSettings}
            className="bg-[#f2e6b8] text-black"
          >
            Pangaturan
          </MenuActionButton>
          <MenuActionButton icon={LogOut} onClick={onExit} className="bg-[#e6959d] text-black">
            Kaluar
          </MenuActionButton>
        </div>
      </div>
    </Frame>
  );
}

function LevelSelect({
  progress,
  unlockAll = false,
  adminMode = false,
  onPick,
  onBack,
}: {
  progress: Progress;
  unlockAll?: boolean;
  adminMode?: boolean;
  onPick: (level: number) => void;
  onBack: () => void;
}) {
  return (
    <Frame>
      <Panel className="mx-auto mt-6 w-full max-w-3xl p-8">
        <h2 className="text-center text-3xl font-bold text-primary">PILIH LEVEL</h2>
        {adminMode && (
          <div className="mx-auto mt-3 w-fit rounded-full bg-emerald-950 px-4 py-2 text-xs font-black uppercase tracking-wide text-amber-100">
            Mode Coba Admin: kabéh level kabuka, skor teu disimpen
          </div>
        )}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {LEVELS.map((l) => {
            const unlocked = unlockAll || l.id <= progress.highestLevel;
            return (
              <button
                key={l.id}
                onClick={() => unlocked && onPick(l.id)}
                disabled={!unlocked}
                className={`rounded-xl border-2 p-4 text-center transition ${unlocked ? "border-primary bg-amber-50 hover:scale-105" : "border-muted bg-muted/40 opacity-60"}`}
              >
                <div className="font-bold">Level {l.id}</div>
                <div className="mt-1 text-xs text-muted-foreground">{l.name}</div>
                <div className="mt-1 text-[0.7rem] text-muted-foreground">{l.desc}</div>
                <div className="mt-3 flex justify-center">
                  {unlocked ? (
                    <Star className="h-10 w-10 fill-amber-400 text-amber-500" />
                  ) : (
                    <Lock className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="mt-2 text-xs">
                  {unlocked ? `${l.items.length} materi` : "Dikonci"}
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {adminMode
            ? "Pilih level mana wae keur mariksa materi jeung kuis."
            : "Rengsekeun level samemehna supaya level salajengna kabuka."}
        </p>
      </Panel>
      <div className="mt-4">
        <Btn variant="ghost" onClick={onBack}>
          <ChevronLeft className="mr-1 inline h-4 w-4" />
          Balik
        </Btn>
      </div>
    </Frame>
  );
}

function Settings({
  progress,
  onSave,
  onReset,
  onBack,
  onToggleMusic,
  onChangeMusicVolume,
  onToggleSfx,
  onChangeProfile,
}: {
  progress: Progress;
  onSave: (n: string, avatarKey: AvatarKey) => void;
  onReset: () => void;
  onBack: () => void;
  onToggleMusic: () => void;
  onChangeMusicVolume: (volume: number) => void;
  onToggleSfx: () => void;
  onChangeProfile: () => void;
}) {
  const [name, setName] = useState(progress.name);
  const [avatarKey, setAvatarKey] = useState<AvatarKey>(progress.avatarKey || "boy");
  const [confirm, setConfirm] = useState(false);
  const musicVolumePercent = Math.round((progress.musicVolume ?? 0.04) * 100);
  return (
    <Frame title="Pangaturan">
      <Panel className="mx-auto mt-6 w-full max-w-2xl p-8">
        <h2 className="text-2xl font-bold text-primary">Pangaturan</h2>
        <div className="mt-6 space-y-4">
          <div>
            <div className="text-sm font-semibold">Poto Profil</div>
            <p className="mb-2 text-xs text-muted-foreground">Pilih avatar lalaki atawa awewe.</p>
            <AvatarPicker value={avatarKey} onChange={setAvatarKey} />
          </div>
          <div>
            <label className="text-sm font-semibold">Ngaran Pamaén</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-emerald-950/40 bg-white/70 px-4 py-3 outline-none focus:border-primary"
            />
            <Btn className="mt-2" onClick={() => name.trim() && onSave(name.trim(), avatarKey)}>
              Simpen Profil
            </Btn>
          </div>
          <div className="border-t border-emerald-950/20 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Music className="h-4 w-4" />
                Musik
              </div>
              <Btn variant={progress.music ? "primary" : "ghost"} onClick={onToggleMusic}>
                {progress.music ? "Hurung" : "Pareum"}
              </Btn>
            </div>
            <div className="rounded-xl border border-emerald-950/15 bg-white/45 px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                <span>Volume Musik Latar</span>
                <span className="rounded-full bg-emerald-900/10 px-2 py-0.5 text-xs text-primary">
                  {musicVolumePercent}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={musicVolumePercent}
                disabled={!progress.music}
                onChange={(e) => onChangeMusicVolume(Number(e.target.value) / 100)}
                className="mt-3 h-2 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Volume musik latar"
              />
              <div className="mt-1 flex justify-between text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Kecil</span>
                <span>Besar</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Volume2 className="h-4 w-4" />
                Efek Suara
              </div>
              <Btn variant={progress.sfx ? "primary" : "ghost"} onClick={onToggleSfx}>
                {progress.sfx ? "Hurung" : "Pareum"}
              </Btn>
            </div>
          </div>
          <div className="border-t border-emerald-950/20 pt-4">
            <div className="text-sm font-semibold">Ganti Profil</div>
            <p className="text-xs text-muted-foreground">
              Balik ka kaca input ngaran keur ganti pamaén.
            </p>
            <Btn variant="soft" className="mt-2" onClick={onChangeProfile}>
              Ganti Profil
            </Btn>
          </div>
          <div className="border-t border-emerald-950/20 pt-4">
            <div className="text-sm font-semibold">Pupus Progres</div>
            <p className="text-xs text-muted-foreground">
              Pupus kabéh skor, level, jeung riwayat. Aksi ieu teu bisa dibatalkeun.
            </p>
            {!confirm ? (
              <Btn variant="danger" className="mt-2" onClick={() => setConfirm(true)}>
                <Trash2 className="mr-1 inline h-4 w-4" />
                Pupus Progres
              </Btn>
            ) : (
              <div className="mt-2 flex gap-2">
                <Btn
                  variant="danger"
                  onClick={() => {
                    onReset();
                    setConfirm(false);
                  }}
                >
                  Enya, Pupus
                </Btn>
                <Btn variant="ghost" onClick={() => setConfirm(false)}>
                  Batal
                </Btn>
              </div>
            )}
          </div>
        </div>
      </Panel>
      <div className="mt-4">
        <Btn variant="ghost" onClick={onBack}>
          <ChevronLeft className="mr-1 inline h-4 w-4" />
          Balik
        </Btn>
      </div>
    </Frame>
  );
}

function Learn({
  level,
  onNext,
  onBack,
}: {
  level: number;
  onNext: () => void;
  onBack: () => void;
}) {
  const learningLevel = getLearningLevel(level);
  const list = learningLevel.items;
  const [i, setI] = useState(0);
  const a = list[i];
  const isSentenceItem = isSentenceExercise(a);
  const shouldShowSpeaker = isSentenceItem
    ? !a.hideSpeaker && hasRecordedWords(a.words)
    : hasRecordedPronunciation(a.latin);
  const isRarangkenLevel = level === 3;
  const isRarangkenItem = !isSentenceItem && a.kind === "rarangken";
  const isLongRarangkenExample = isRarangkenItem && a.char.length > 3;
  const isWordReadingItem = !isSentenceItem && a.char.length > 2 && !isRarangkenItem;
  const shouldSegmentAksara = !isSentenceItem && a.char.length > 2;
  const aksaraParts = shouldSegmentAksara ? segmentAksaraWord(a.char) : [a.char];
  return (
    <Frame title={`Level ${level} - ${learningLevel.name}`}>
      <div className="mb-2 text-right text-sm font-semibold text-emerald-50">
        {i + 1} / {list.length}
      </div>
      <Panel className="relative mx-auto w-full max-w-2xl p-10 text-center">
        {!isSentenceItem && shouldShowSpeaker && (
          <AudioButton
            onClick={() => playPronunciation(a.latin)}
            className="absolute right-6 top-6 p-3"
            iconClassName="h-6 w-6"
            label="Dangukeun bacaan"
          />
        )}
        {isSentenceItem ? (
          <>
            {shouldShowSpeaker && (
              <AudioButton
                onClick={() => playSentence(a.words)}
                className="mx-auto mb-4 p-3"
                iconClassName="h-6 w-6"
                label="Dangukeun kalimah"
              />
            )}
            <div className="mb-4 rounded-2xl border border-emerald-950/15 bg-white/50 px-4 py-3 text-sm font-semibold text-muted-foreground">
              Ieu kaca diajar conto kalimah. Kartu kecap di handap can keur diklik. Lamun geus
              paham, pencét <b className="text-primary">Mimiti Kaulinan Susun Kecap</b> di handap.
            </div>
            <div className="rounded-2xl bg-amber-50/70 px-4 py-8">
              <AksaraSentence
                words={a.aksaraWords}
                className="text-6xl text-foreground md:text-7xl"
                gapClassName="gap-x-3 gap-y-6 md:gap-y-8"
              />
            </div>
            <div className="mt-6 text-2xl">
              Kalimah: <span className="font-bold text-primary">{a.latin}</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {a.words.map((word, index) => (
                <div
                  key={`${word}-${index}`}
                  className="rounded-2xl border-2 border-emerald-950/20 bg-white/60 p-3"
                >
                  <div className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Conto kecap
                  </div>
                  <div className="font-aksara text-4xl leading-none text-foreground">
                    {a.aksaraWords[index]}
                  </div>
                  <div className="mt-2 text-lg font-black text-primary">{word}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">{a.note}</div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 inline-flex rounded-full border border-emerald-950/15 bg-white/55 px-4 py-2 text-base font-black text-primary sm:text-lg">
              {isRarangkenItem ? (
                <>
                  Rarangken: <span className="ml-1 text-foreground">{a.title}</span>
                </>
              ) : (
                a.title
              )}
            </div>
            <div
              className={`font-aksara mx-auto flex min-h-[210px] max-w-full flex-wrap items-center justify-center overflow-visible px-4 text-foreground ${
                isWordReadingItem || isLongRarangkenExample
                  ? "gap-1 py-8 text-[clamp(4rem,14vw,8.5rem)] leading-[1.05]"
                  : isRarangkenLevel
                    ? "pt-8 pb-10 text-[150px] leading-[1.35]"
                    : "text-[180px] leading-[1.15]"
              }`}
            >
              {aksaraParts.map((part, index) => (
                <AksaraGlyphPart key={`${part}-${index}`} part={part} />
              ))}
            </div>
            <div className="mt-6 text-2xl">
              Bacaanna: <span className="font-bold text-primary">{a.latin}</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{a.note}</div>
          </>
        )}
      </Panel>
      {isSentenceItem ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Btn variant="ghost" onClick={onBack}>
            <ChevronLeft className="mr-1 inline h-4 w-4" />
            Pilih Level
          </Btn>
          <Btn variant="soft" onClick={() => setI((current) => (current + 1) % list.length)}>
            Tingali Conto Sejen
            <ChevronRight className="ml-1 inline h-4 w-4" />
          </Btn>
          <Btn onClick={onNext}>Mimiti Kaulinan Susun Kecap</Btn>
        </div>
      ) : (
        <div className="mt-6 flex justify-between">
          <Btn variant="ghost" onClick={() => (i === 0 ? onBack() : setI(i - 1))}>
            <RotateCcw className="mr-1 inline h-4 w-4" />
            Samemehna
          </Btn>
          <Btn onClick={() => (i + 1 < list.length ? setI(i + 1) : onNext())}>
            Salajengna
            <ChevronRight className="ml-1 inline h-4 w-4" />
          </Btn>
        </div>
      )}
    </Frame>
  );
}

function Quiz({
  level,
  avatarKey,
  onDone,
  onBack,
}: {
  level: number;
  avatarKey: AvatarKey;
  onDone: (score: number, correct: number, total: number) => void;
  onBack: () => void;
}) {
  const learningLevel = getLearningLevel(level);
  const sentenceItems = learningLevel.items.filter(isSentenceExercise);

  if (sentenceItems.length > 0) {
    return (
      <SentenceQuiz
        level={level}
        levelName={learningLevel.name}
        questions={sentenceItems}
        avatarKey={avatarKey}
        onDone={onDone}
        onBack={onBack}
      />
    );
  }

  return (
    <AksaraQuiz
      level={level}
      learningLevel={learningLevel}
      avatarKey={avatarKey}
      onDone={onDone}
      onBack={onBack}
    />
  );
}

function AksaraQuiz({
  level,
  learningLevel,
  avatarKey,
  onDone,
  onBack,
}: {
  level: number;
  learningLevel: ReturnType<typeof getLearningLevel>;
  avatarKey: AvatarKey;
  onDone: (score: number, correct: number, total: number) => void;
  onBack: () => void;
}) {
  const questions = useMemo(
    () => shuffle(learningLevel.items).slice(0, Math.min(10, learningLevel.items.length)),
    [learningLevel],
  );
  const total = questions.length;
  const [i, setI] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<null | {
    ok: boolean;
    answer: string;
    score: number;
    correct: number;
    hearts: number;
  }>(null);

  const q = questions[i];
  const isRarangkenLevel = level === 3;
  const isRarangkenQuestion = q.kind === "rarangken";
  const isLongRarangkenQuestion = isRarangkenQuestion && q.char.length > 3;
  const isWordReadingQuestion = q.char.length > 2 && !isRarangkenQuestion;
  const aksaraQuestionParts = q.char.length > 2 ? segmentAksaraWord(q.char) : [q.char];
  const options = useMemo(() => {
    const wrongs = shuffle(learningLevel.items.filter((x) => x.latin !== q.latin)).slice(0, 3);
    return shuffle([q, ...wrongs]);
  }, [learningLevel, q]);

  const choose = (latin: string) => {
    if (feedback) return;
    const ok = latin === q.latin;
    const nextScore = score + (ok ? 10 : 0);
    const nextCorrect = correct + (ok ? 1 : 0);
    const nextHearts = ok ? hearts : hearts - 1;
    if (ok) {
      playCorrect();
      setScore(nextScore);
      setCorrect(nextCorrect);
      toast.success("Leres! Pilihan hidep pas.");
    } else {
      playWrong();
      setHearts(nextHearts);
      toast.error(`Lepat. Anu leres: ${q.latin}`);
    }
    setFeedback({
      ok,
      answer: q.latin,
      score: nextScore,
      correct: nextCorrect,
      hearts: nextHearts,
    });
  };

  const next = () => {
    if (!feedback) return;
    const gameOver = !feedback.ok && feedback.hearts <= 0;
    setFeedback(null);
    if (gameOver || i + 1 >= total) onDone(feedback.score, feedback.correct, total);
    else setI(i + 1);
  };

  if (feedback) {
    return (
      <Frame title={`Level ${level} - ${learningLevel.name}`}>
        <TopBar hearts={hearts} score={score} />
        <Panel className="mx-auto mt-6 w-full max-w-2xl p-12 text-center">
          {feedback.ok ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-12 w-12" />
              </div>
              <h2 className="mt-4 text-5xl font-bold text-primary">LERES!</h2>
              <p className="mt-2 text-lg">Pilihan hidep leres!</p>
              <FeedbackProfileImage avatarKey={avatarKey} ok />
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center gap-4 text-destructive">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                  <X className="h-12 w-12" />
                </div>
                <h2 className="text-5xl font-black text-destructive">LEPAT!</h2>
              </div>
              <p className="mt-4 text-xl font-bold leading-tight">Waleran nu leres nyaéta:</p>
              <FeedbackProfileImage
                avatarKey={avatarKey}
                ok={false}
                className="h-64 w-full max-w-sm"
              />
            </>
          )}
          <div className="mt-3 text-4xl font-bold">{feedback.answer}</div>
          <Btn onClick={next} className="mt-8 w-full max-w-xs">
            Teraskeun
          </Btn>
        </Panel>
      </Frame>
    );
  }

  return (
    <Frame title={`Level ${level} - ${learningLevel.name}`}>
      <TopBar hearts={hearts} score={score} onBack={onBack} />
      <Panel className="mx-auto mt-6 w-full max-w-2xl p-8">
        <p className="text-center text-sm text-muted-foreground">
          Pilih waleran anu cocog jeung aksara Sunda ieu!
        </p>
        <div className="mt-4 rounded-xl border-2 border-dashed border-emerald-950/30 p-6 text-center">
          <div
            className={`font-aksara flex min-h-[170px] max-w-full flex-wrap items-center justify-center overflow-visible px-3 ${
              isWordReadingQuestion || isLongRarangkenQuestion
                ? "gap-1 py-6 text-[clamp(3rem,12vw,6.75rem)] leading-[1.05]"
                : isRarangkenLevel
                  ? "pt-7 pb-9 text-[120px] leading-[1.35]"
                  : "text-[140px] leading-[1.15]"
            }`}
          >
            {aksaraQuestionParts.map((part, index) => (
              <AksaraGlyphPart key={`${part}-${index}`} part={part} />
            ))}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {options.map((o) => (
            <button
              key={o.latin}
              onClick={() => choose(o.latin)}
              className="rounded-xl border-2 border-emerald-950/40 bg-[var(--paper-deep)] py-4 text-xl font-bold hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              {o.latin}
            </button>
          ))}
        </div>
        <div className="mt-4 text-right text-sm text-muted-foreground">
          {i + 1} / {total}
        </div>
      </Panel>
    </Frame>
  );
}

function SentenceQuiz({
  level,
  levelName,
  questions,
  avatarKey,
  onDone,
  onBack,
}: {
  level: number;
  levelName: string;
  questions: SentenceExercise[];
  avatarKey: AvatarKey;
  onDone: (score: number, correct: number, total: number) => void;
  onBack: () => void;
}) {
  const orderedQuestions = useMemo(
    () =>
      questions
        .map((question, index) => ({ question, index }))
        .sort(
          (left, right) =>
            getSentenceDifficulty(left.question, left.index) -
            getSentenceDifficulty(right.question, right.index),
        )
        .map(({ question }) => question),
    [questions],
  );
  const total = orderedQuestions.length;
  const [i, setI] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<Array<{ id: string; word: string }>>([]);
  const [feedback, setFeedback] = useState<null | {
    ok: boolean;
    answer: string;
    chosen: string;
    score: number;
    correct: number;
    hearts: number;
  }>(null);

  const q = orderedQuestions[i];
  const shouldShowSpeaker = !q.hideSpeaker && hasRecordedWords(q.words);
  const choices = useMemo(
    () => shuffle(q.choices.map((word, index) => ({ id: `${q.latin}-${word}-${index}`, word }))),
    [q],
  );
  const aksaraWordClass =
    q.words.length >= 5
      ? "text-3xl md:text-4xl"
      : q.words.length >= 4
        ? "text-4xl md:text-5xl"
        : "text-6xl md:text-7xl";

  const addWord = (choice: { id: string; word: string }) => {
    if (feedback) return;
    setSelected((current) => {
      if (current.some((item) => item.id === choice.id) || current.length >= q.words.length)
        return current;
      return [...current, choice];
    });
  };

  const removeWord = (index: number) => {
    if (feedback) return;
    setSelected((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const checkAnswer = () => {
    if (feedback) return;
    if (selected.length !== q.words.length) {
      toast.error("Susun heula kabéh kecap.");
      return;
    }

    const chosen = selected.map((item) => item.word).join(" ");
    const ok = chosen === q.words.join(" ");
    const nextScore = score + (ok ? 10 : 0);
    const nextCorrect = correct + (ok ? 1 : 0);
    const nextHearts = ok ? hearts : hearts - 1;

    if (ok) {
      playCorrect();
      setScore(nextScore);
      setCorrect(nextCorrect);
      toast.success("Leres! Kalimahna geus leres.");
    } else {
      playWrong();
      setHearts(nextHearts);
      toast.error(`Lepat. Anu leres: ${q.latin}`);
    }

    setFeedback({
      ok,
      answer: q.latin,
      chosen,
      score: nextScore,
      correct: nextCorrect,
      hearts: nextHearts,
    });
  };

  const next = () => {
    if (!feedback) return;
    const gameOver = !feedback.ok && feedback.hearts <= 0;
    setFeedback(null);
    setSelected([]);
    if (gameOver || i + 1 >= total) onDone(feedback.score, feedback.correct, total);
    else setI(i + 1);
  };

  if (feedback) {
    return (
      <Frame title={`Level ${level} - ${levelName}`}>
        <TopBar hearts={hearts} score={score} />
        <Panel className="mx-auto mt-6 w-full max-w-2xl p-10 text-center">
          {feedback.ok ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-12 w-12" />
              </div>
              <h2 className="mt-4 text-5xl font-bold text-primary">LERES!</h2>
              <p className="mt-2 text-lg">Kalimahna geus leres.</p>
              <FeedbackProfileImage avatarKey={avatarKey} ok />
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center gap-4 text-destructive">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                  <X className="h-12 w-12" />
                </div>
                <h2 className="text-5xl font-black text-destructive">LEPAT!</h2>
              </div>
              <p className="mt-4 text-xl font-bold leading-tight">Runtuyan nu leres nyaéta:</p>
              <FeedbackProfileImage
                avatarKey={avatarKey}
                ok={false}
                className="h-64 w-full max-w-sm"
              />
            </>
          )}
          <div className="font-aksara mt-4 rounded-2xl bg-amber-50/70 px-4 py-4 text-5xl leading-none">
            {q.char}
          </div>
          <div className="mt-4 text-3xl font-bold text-primary">{feedback.answer}</div>
          {!feedback.ok && (
            <div className="mt-2 text-sm text-muted-foreground">
              Runtuyan hidep: <span className="font-bold">{feedback.chosen}</span>
            </div>
          )}
          <Btn onClick={next} className="mt-8 w-full max-w-xs">
            Teraskeun
          </Btn>
        </Panel>
      </Frame>
    );
  }

  return (
    <Frame title={`Level ${level} - ${levelName}`}>
      <TopBar hearts={hearts} score={score} onBack={onBack} />
      <Panel className="mx-auto mt-6 w-full max-w-3xl p-8">
        {shouldShowSpeaker && (
          <div className="mb-3 flex justify-end">
            <AudioButton
              onClick={() => playSentence(q.words)}
              className="p-3"
              iconClassName="h-6 w-6"
              label="Dangukeun kalimah"
            />
          </div>
        )}
        <div className="rounded-2xl border-2 border-emerald-950/15 bg-white/45 p-4 text-sm text-muted-foreground">
          <div className="mb-1 font-black text-primary">Cara migawé Level 4</div>
          <p>
            Baca aksara Sunda ti kenca ka katuhu, tuluy pencét kecap latin di handap luyu jeung
            runtuyanana. Lamun runtuyanana lepat, pencét kecap dina bagian waleran keur mupusna.
          </p>
        </div>
        <div className="mt-4 rounded-2xl border-2 border-dashed border-emerald-950/30 bg-amber-50/60 p-6 text-center">
          <AksaraSentence
            words={q.aksaraWords}
            className={`${aksaraWordClass} text-foreground`}
            gapClassName="gap-x-4 gap-y-6 md:gap-y-8"
          />
        </div>

        <div className="mt-6 rounded-2xl border-2 border-emerald-950/20 bg-white/50 p-4">
          <div className="mb-3 text-sm font-black text-primary">Waleran hidep</div>
          <div className="flex min-h-16 flex-wrap items-center gap-2">
            {selected.length === 0 ? (
              <span className="text-sm text-muted-foreground">
                Pencét tombol kecap di handap. Kecapna bakal pindah ka dieu.
              </span>
            ) : (
              selected.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => removeWord(index)}
                  disabled={Boolean(feedback)}
                  className="touch-manipulation rounded-full bg-primary px-4 py-2 text-base font-black text-primary-foreground shadow active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {item.word}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {choices.map((choice) => {
            const isChosen = selected.some((item) => item.id === choice.id);
            const isFull = selected.length >= q.words.length;
            const isDisabled = Boolean(feedback) || isChosen || isFull;

            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => addWord(choice)}
                disabled={isDisabled}
                aria-pressed={isChosen}
                className="touch-manipulation min-h-[92px] rounded-xl border-2 border-emerald-950/40 bg-[var(--paper-deep)] px-3 py-4 text-lg font-black leading-tight shadow-sm transition hover:border-primary hover:bg-primary hover:text-primary-foreground active:translate-y-0.5 active:bg-primary active:text-primary-foreground disabled:cursor-not-allowed disabled:border-emerald-950/15 disabled:bg-white/35 disabled:text-muted-foreground disabled:opacity-60 disabled:shadow-none"
              >
                <span className="block break-words">{choice.word}</span>
                <span className="mt-1 block text-[0.65rem] font-bold uppercase tracking-wide opacity-60">
                  {isChosen ? "Geus dipilih" : "Pencét pilih"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Btn variant="ghost" onClick={() => setSelected([])} disabled={selected.length === 0}>
            Susun Deui
          </Btn>
          <div className="text-sm text-muted-foreground">
            {i + 1} / {total}
          </div>
          <Btn onClick={checkAnswer}>Pariksa Kalimah</Btn>
        </div>
      </Panel>
    </Frame>
  );
}

function TopBar({ hearts, score, onBack }: { hearts: number; score: number; onBack?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      {onBack ? (
        <Btn variant="ghost" onClick={onBack} className="px-3 py-1 text-xs">
          <ChevronLeft className="inline h-3 w-3" />
        </Btn>
      ) : (
        <div />
      )}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((n) => (
            <Heart
              key={n}
              className={`h-6 w-6 ${n < hearts ? "fill-red-500 text-red-500" : "text-muted-foreground/40"}`}
            />
          ))}
        </div>
        <Panel className="px-3 py-1 text-sm font-bold">Skor: {score}</Panel>
      </div>
    </div>
  );
}

function Writing({
  sessionToken,
  onComplete,
  onBack,
}: {
  sessionToken: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}) {
  type TracePoint = { x: number; y: number };
  type TraceBounds = {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
  };

  const WRITING_MIN_POINT_COUNT = 18;
  const WRITING_MIN_LENGTH_RATIO = 0.24;
  const WRITING_MIN_TARGET_COVERAGE = 0.16;
  const WRITING_MIN_TRACE_PRECISION = 0.42;
  const WRITING_MIN_SIZE_RATIO = 0.34;
  const WRITING_MAX_SIZE_RATIO = 1.55;
  const WRITING_MAX_CENTER_OFFSET = 0.34;

  const buildTraceBounds = (
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): TraceBounds => ({
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
  });

  const getTraceMetrics = (tracePaths: string[]) => {
    const points: TracePoint[] = [];
    let totalLength = 0;

    for (const path of tracePaths) {
      const matches = path.match(/-?\d+(?:\.\d+)?/g);

      if (!matches) {
        continue;
      }

      let previous: TracePoint | null = null;

      for (let index = 0; index < matches.length - 1; index += 2) {
        const point = { x: Number(matches[index]), y: Number(matches[index + 1]) };

        points.push(point);

        if (previous) {
          totalLength += Math.hypot(point.x - previous.x, point.y - previous.y);
        }

        previous = point;
      }
    }

    if (points.length === 0) {
      return { points, totalLength, bounds: null as TraceBounds | null };
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      points,
      totalLength,
      bounds: buildTraceBounds(minX, minY, maxX, maxY),
    };
  };

  const getMaskStats = (data: Uint8ClampedArray, width: number, height: number, threshold = 20) => {
    let pixels = 0;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let pixel = 0; pixel < width * height; pixel += 1) {
      const alpha = data[pixel * 4 + 3];

      if (alpha < threshold) {
        continue;
      }

      const x = pixel % width;
      const y = Math.floor(pixel / width);

      pixels += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    return {
      pixels,
      bounds: pixels > 0 ? buildTraceBounds(minX, minY, maxX, maxY) : null,
    };
  };

  const renderGlyphMask = (
    char: string,
    width: number,
    height: number,
    fontSize: number,
    fontFamily: string,
    fontWeight: string,
    centerX: number,
    centerY: number,
  ) => {
    const canvas = document.createElement("canvas");
    const canvasWidth = Math.max(1, Math.round(width));
    const canvasHeight = Math.max(1, Math.round(height));

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillText(char, centerX, centerY);

    return ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
  };

  const renderTraceMask = (tracePaths: string[], width: number, height: number) => {
    const canvas = document.createElement("canvas");
    const canvasWidth = Math.max(1, Math.round(width));
    const canvasHeight = Math.max(1, Math.round(height));

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(14, Math.min(canvasWidth, canvasHeight) * 0.042);

    for (const path of tracePaths) {
      ctx.stroke(new Path2D(path));
    }

    return ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
  };

  const evaluateWritingAttempt = (glyphChar: string, latinLabel: string, tracePaths: string[]) => {
    if (typeof document === "undefined") {
      return { ok: true, text: `Alus! Tulisan "${latinLabel}" geus dipariksa.` };
    }

    const board = boardRef.current;
    const glyph = glyphRef.current;
    const metrics = getTraceMetrics(tracePaths);

    if (!board || !metrics.bounds || metrics.points.length < WRITING_MIN_POINT_COUNT) {
      return {
        ok: false,
        text: "Goresan can cukup. Coba kandelkeun aksarana heula.",
      };
    }

    const boardRect = board.getBoundingClientRect();
    const boardWidth = Math.max(1, boardRect.width);
    const boardHeight = Math.max(1, boardRect.height);
    const minimumLength = Math.min(boardWidth, boardHeight) * WRITING_MIN_LENGTH_RATIO;

    if (metrics.totalLength < minimumLength) {
      return {
        ok: false,
        text: "Goresan masih pondok teuing. Kandelkeun deui nepi ka nuturkeun wangunna.",
      };
    }

    const glyphStyle = glyph ? window.getComputedStyle(glyph) : null;
    const glyphRect = glyph?.getBoundingClientRect();
    const centerX = glyphRect
      ? glyphRect.left - boardRect.left + glyphRect.width / 2
      : boardWidth / 2;
    const centerY = glyphRect
      ? glyphRect.top - boardRect.top + glyphRect.height / 2
      : boardHeight / 2;
    const fontSize = glyphStyle ? Number.parseFloat(glyphStyle.fontSize) || 260 : 260;
    const fontFamily =
      glyphStyle?.fontFamily ?? '"Noto Sans Sundanese", "Fredoka", system-ui, sans-serif';
    const fontWeight = glyphStyle?.fontWeight ?? "400";
    const targetMask = renderGlyphMask(
      glyphChar,
      boardWidth,
      boardHeight,
      fontSize,
      fontFamily,
      fontWeight,
      centerX,
      centerY,
    );
    const traceMask = renderTraceMask(tracePaths, boardWidth, boardHeight);

    if (!targetMask || !traceMask) {
      return {
        ok: false,
        text: "Pariksa tulisan can hasil. Coba deui sakali deui.",
      };
    }

    const canvasWidth = Math.max(1, Math.round(boardWidth));
    const canvasHeight = Math.max(1, Math.round(boardHeight));
    const targetStats = getMaskStats(targetMask, canvasWidth, canvasHeight);
    const traceStats = getMaskStats(traceMask, canvasWidth, canvasHeight);
    const traceBounds = traceStats.bounds ?? metrics.bounds;

    if (
      !targetStats.bounds ||
      !traceBounds ||
      targetStats.pixels === 0 ||
      traceStats.pixels === 0
    ) {
      return {
        ok: false,
        text: "Pariksa tulisan can hasil. Coba deui sakali deui.",
      };
    }

    let overlap = 0;

    for (let pixel = 0; pixel < canvasWidth * canvasHeight; pixel += 1) {
      const targetOn = targetMask[pixel * 4 + 3] >= 20;
      const traceOn = traceMask[pixel * 4 + 3] >= 20;

      if (targetOn && traceOn) {
        overlap += 1;
      }
    }

    const coverage = overlap / targetStats.pixels;
    const precision = overlap / traceStats.pixels;
    const widthRatio = traceBounds.width / Math.max(1, targetStats.bounds.width);
    const heightRatio = traceBounds.height / Math.max(1, targetStats.bounds.height);
    const centerOffsetX =
      Math.abs(traceBounds.cx - targetStats.bounds.cx) / Math.max(1, targetStats.bounds.width);
    const centerOffsetY =
      Math.abs(traceBounds.cy - targetStats.bounds.cy) / Math.max(1, targetStats.bounds.height);

    if (coverage < WRITING_MIN_TARGET_COVERAGE) {
      return {
        ok: false,
        text: "Aksarana can kabalur rata. Kandelkeun deui sapanjang conto hurupna.",
      };
    }

    if (precision < WRITING_MIN_TRACE_PRECISION) {
      return {
        ok: false,
        text: "Goresanana masih can luyu. Cobi tuturkeun wangun aksara nu aya di pengkerna.",
      };
    }

    if (widthRatio < WRITING_MIN_SIZE_RATIO || heightRatio < WRITING_MIN_SIZE_RATIO) {
      return {
        ok: false,
        text: "Tulisanana masih saeutik teuing. Kandelkeun deui leuwih loba bagian hurupna.",
      };
    }

    if (
      widthRatio > WRITING_MAX_SIZE_RATIO ||
      heightRatio > WRITING_MAX_SIZE_RATIO ||
      centerOffsetX > WRITING_MAX_CENTER_OFFSET ||
      centerOffsetY > WRITING_MAX_CENTER_OFFSET
    ) {
      return {
        ok: false,
        text: "Goresanana katingali jauh tina conto. Coba nulis pas dina wangun aksarana.",
      };
    }

    return { ok: true, text: `Alus! Tulisan "${latinLabel}" geus dipariksa.` };
  };

  const boardRef = useRef<SVGSVGElement | null>(null);
  const glyphRef = useRef<HTMLDivElement | null>(null);
  const [category, setCategory] = useState<WritingCategoryKey>("swara");
  const [i, setI] = useState(0);
  const [paths, setPaths] = useState<string[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [feedback, setFeedback] = useState<null | { ok: boolean; text: string }>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(() => new Set());
  const activeCategory =
    WRITING_CATEGORIES.find((item) => item.id === category) ?? WRITING_CATEGORIES[0];
  const list = activeCategory.items;
  const a = list[i];
  const completedKey = `${category}:${a.latin}`;
  const strokePoints = paths.reduce(
    (sum, path) => sum + Math.max(0, path.split(" L ").length - 1),
    0,
  );

  const onPointer = (e: React.PointerEvent<SVGSVGElement>, type: "down" | "move" | "up") => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left,
      y = e.clientY - rect.top;
    if (type === "down") {
      setFeedback(null);
      setDrawing(true);
      setPaths((p) => [...p, `M ${x} ${y}`]);
    } else if (type === "move" && drawing) {
      setPaths((p) => {
        const c = [...p];
        c[c.length - 1] += ` L ${x} ${y}`;
        return c;
      });
    } else if (type === "up") setDrawing(false);
  };

  const resetWriting = () => {
    setPaths([]);
    setFeedback(null);
    setDrawing(false);
  };

  const changeCategory = (nextCategory: WritingCategoryKey) => {
    setCategory(nextCategory);
    setI(0);
    setPaths([]);
    setDrawing(false);
    setFeedback(null);
  };

  const checkWriting = () => {
    if (feedback?.ok) {
      toast("Tulisan ieu geus dipariksa. Pencét Salajengna keur latihan huruf salajengna.");
      return;
    }

    if (paths.length < 1 || strokePoints < 4) {
      playWrong();
      setFeedback({
        ok: false,
        text: "Goresan can cukup. Coba kandelkeun aksarana heula.",
      });
      toast.error("Kandelkeun heula aksarana!");
      return;
    }

    const result = evaluateWritingAttempt(a.char, a.latin, paths);

    if (!result.ok) {
      playWrong();
      setFeedback({ ok: false, text: result.text });
      toast.error("Tulisan can leres keneh.");
      return;
    }

    playCorrect();
    setFeedback({ ok: true, text: result.text });
    if (!completedItems.has(completedKey)) {
      setCompletedItems((current) => new Set(current).add(completedKey));
      onComplete(5);
    }
    if (sessionToken) {
      void saveTracingAttempt(sessionToken, a.latin).catch(() => undefined);
    }
    toast.success(`Alus! Hidep geus nulis "${a.latin}"`);
  };

  const nextWriting = () => {
    setPaths([]);
    setFeedback(null);
    setDrawing(false);
    setI((current) => (current + 1) % list.length);
  };

  return (
    <Frame title="Latihan Nulis">
      <div className="mb-2 flex items-center justify-between">
        <Panel className="px-3 py-1 text-sm">Latihan Nulis</Panel>
        <div className="text-right text-sm font-semibold text-emerald-50">
          <div>{activeCategory.label}</div>
          <div>
            {i + 1} / {list.length}
          </div>
        </div>
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {WRITING_CATEGORIES.map((item) => {
          const active = item.id === category;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => changeCategory(item.id)}
              className={`rounded-2xl border-2 px-4 py-3 text-left shadow-md transition-all active:translate-y-0.5 ${
                active
                  ? "border-emerald-950/60 bg-emerald-100 text-emerald-950"
                  : "border-emerald-950/30 bg-[var(--paper)]/95 text-foreground hover:bg-[var(--paper-deep)]"
              }`}
            >
              <div className="text-sm font-black sm:text-base">{item.label}</div>
              <div className="mt-1 text-xs font-semibold opacity-80 sm:text-sm">{item.hint}</div>
              <div className="mt-2 text-xs font-bold uppercase tracking-wide opacity-70">
                {item.items.length} bahan latihan
              </div>
            </button>
          );
        })}
      </div>
      <Panel className="mx-auto w-full max-w-2xl p-6 text-center">
        <p className="text-sm">
          <span>Kategori: </span>
          <b className="text-primary">{activeCategory.label}</b>
          <span>. Kandelkeun aksara Sunda ieu!</span>
        </p>
        <div className="relative mx-auto mt-3 aspect-square w-full max-w-md rounded-xl border-2 border-dashed border-emerald-950/40 bg-amber-50/40">
          <div
            ref={glyphRef}
            className="font-aksara pointer-events-none absolute inset-0 flex items-center justify-center text-[260px] leading-none text-emerald-950/20"
          >
            {a.char}
          </div>
          <svg
            ref={boardRef}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={(e) => onPointer(e, "down")}
            onPointerMove={(e) => onPointer(e, "move")}
            onPointerUp={(e) => onPointer(e, "up")}
            onPointerLeave={(e) => onPointer(e, "up")}
          >
            {paths.map((d, idx) => (
              <path
                key={idx}
                d={d}
                stroke="oklch(0.5 0.14 145)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          {hasRecordedPronunciation(a.latin) && (
            <AudioButton
              onClick={() => playPronunciation(a.latin)}
              className="absolute right-3 bottom-3 p-2"
              label="Dangukeun bacaan"
            />
          )}
        </div>
        <div className="mt-2 text-xl">
          Bacaanna: <b className="text-primary">{a.latin}</b>
        </div>
        <div className="mt-3 min-h-[44px] rounded-xl border border-emerald-950/15 bg-white/45 px-4 py-2 text-sm font-semibold">
          {feedback ? (
            <span className={feedback.ok ? "text-primary" : "text-destructive"}>
              {feedback.text}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Tulis dina kotak, tuluy pencét Pariksa Tulisan.
            </span>
          )}
        </div>
      </Panel>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center">
        <Btn variant="ghost" onClick={resetWriting} className="px-3 text-sm sm:text-base">
          <RotateCcw className="mr-1 inline h-4 w-4" />
          Deui
        </Btn>
        <Btn variant="ghost" onClick={onBack} className="px-3 text-sm sm:text-base">
          Menu
        </Btn>
        <Btn
          variant="soft"
          onClick={checkWriting}
          className="col-span-2 px-3 text-sm sm:col-span-1 sm:text-base"
        >
          <Check className="mr-1 inline h-4 w-4" />
          Pariksa Tulisan
        </Btn>
        <Btn onClick={nextWriting} className="col-span-2 px-3 text-sm sm:col-span-1 sm:text-base">
          Salajengna
        </Btn>
      </div>
    </Frame>
  );
}

function segmentAksaraWord(text: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("su", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }

  return Array.from(text);
}

function Reading({
  sessionToken,
  avatarKey,
  onDone,
  onBack,
}: {
  sessionToken: string;
  avatarKey: AvatarKey;
  onDone: (score: number, correct: number, total: number) => void;
  onBack: () => void;
}) {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const k = KATA[i];
  const aksaraParts = segmentAksaraWord(k.aksara);
  const check = () => {
    const ok = ans.trim().toLowerCase() === k.latin.toLowerCase();
    if (ok) {
      playCorrect();
      setScore((s) => s + 10);
      setCorrect((c) => c + 1);
      toast.success("Leres! Waleran hidep pas.");
      setMsg("Leres! Waleran hidep pas.");
    } else {
      playWrong();
      toast.error(`Lepat. Anu leres: ${k.latin}`);
      setMsg(`Lepat. Anu leres: ${k.latin}`);
    }
    if (sessionToken) {
      void saveReadingAttempt({
        sessionToken,
        promptText: k.aksara,
        expectedText: k.latin,
        answerText: ans.trim(),
        isCorrect: ok,
      }).catch(() => undefined);
    }
  };
  const next = () => {
    setAns("");
    setMsg(null);
    if (i + 1 >= KATA.length) onDone(score, correct, KATA.length);
    else setI(i + 1);
  };
  return (
    <Frame title="Maca Kecap">
      <div className="mb-2 flex items-center justify-between">
        <Panel className="px-3 py-1 text-sm">Maca Kecap</Panel>
        <div className="text-sm font-semibold text-emerald-50">
          {i + 1} / {KATA.length}
        </div>
      </div>
      <Panel className="mx-auto w-full max-w-2xl p-4 text-center sm:p-8">
        <p className="text-sm">Baca kecap aksara Sunda ieu!</p>
        <div className="mx-auto mt-4 flex min-h-[120px] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-emerald-950/30 px-2 py-4 sm:min-h-[140px] sm:px-6 sm:py-5">
          <span className="font-aksara flex max-w-full flex-wrap items-center justify-center text-center text-[clamp(2.75rem,13vw,5.25rem)] leading-[0.95] sm:text-[clamp(4rem,11vw,5.75rem)]">
            {aksaraParts.map((part, idx) => (
              <span key={`${part}-${idx}`} className="inline-block shrink-0 px-0.5">
                {part}
              </span>
            ))}
          </span>
        </div>
        {hasRecordedPronunciation(k.latin) && (
          <AudioButton
            onClick={() => playPronunciation(k.latin)}
            className="mx-auto mt-3 gap-2 px-4 py-2"
            label="Dangukeun bacaan"
          >
            Dangukeun
          </AudioButton>
        )}
        <div className="mt-6 text-left">
          <p className="text-sm">Tulis bacaan latin di handap ieu!</p>
          <input
            value={ans}
            onChange={(e) => setAns(e.target.value)}
            placeholder="Ketik waleran..."
            className="mt-2 w-full rounded-lg border-2 border-emerald-950/40 bg-white/70 px-4 py-3 outline-none focus:border-primary"
          />
        </div>
        {msg && (
          <div
            className={`mt-3 font-semibold ${msg.startsWith("Leres") ? "text-primary" : "text-destructive"}`}
          >
            {msg}
          </div>
        )}
        {msg && (
          <FeedbackProfileImage
            avatarKey={avatarKey}
            ok={msg.startsWith("Leres")}
            className="h-32 w-32"
          />
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="ghost" onClick={onBack}>
            Menu
          </Btn>
          {msg ? <Btn onClick={next}>Salajengna</Btn> : <Btn onClick={check}>Pariksa Waleran</Btn>}
        </div>
      </Panel>
    </Frame>
  );
}

function VictoryConfetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {CONFETTI_PIECES.map((piece) => (
        <span
          key={piece.id}
          className="victory-confetti-piece"
          style={
            {
              left: piece.left,
              width: piece.size,
              height: piece.height,
              backgroundColor: piece.color,
              borderRadius: piece.radius,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              "--confetti-drift": piece.drift,
              "--confetti-rotation": piece.rotation,
            } as CSSProperties
          }
        />
      ))}
      {FIREWORKS.map((firework, index) => (
        <span
          key={index}
          className="victory-firework"
          style={
            {
              left: firework.left,
              top: firework.top,
              color: firework.color,
              animationDelay: firework.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function Result({
  score,
  correct,
  total,
  level,
  adminMode = false,
  onAgain,
  onNext,
  onMenu,
  onProgress,
  onExit,
}: {
  score: number;
  correct: number;
  total: number;
  level: number;
  adminMode?: boolean;
  onAgain: () => void;
  onNext: () => void;
  onMenu: () => void;
  onProgress: () => void;
  onExit: () => void;
}) {
  const stars = Math.round((correct / total) * 3);
  const label = stars === 3 ? "Hebat!" : stars === 2 ? "Lumayan!" : "Coba Deui!";
  const passed = correct / total >= 0.7;
  const finalCompleted = level >= LEVELS.length && passed;
  return (
    <Frame>
      {finalCompleted && <VictoryConfetti />}
      <Panel className="relative z-50 mx-auto mt-12 w-full max-w-2xl p-8">
        <div className="mx-auto mb-4 w-fit rounded-lg bg-primary px-6 py-2 font-bold text-primary-foreground">
          {finalCompleted ? "KABEH LEVEL RENGSE" : "HASIL KAULINAN"}
        </div>
        {adminMode && (
          <div className="mx-auto mb-4 w-fit rounded-full bg-emerald-950 px-4 py-2 text-xs font-black uppercase tracking-wide text-amber-100">
            Mode coba admin: hasil ieu teu disimpen
          </div>
        )}
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl bg-[var(--paper-deep)] p-6 text-center">
            <div className="text-sm">Skor Ahir</div>
            <div className="my-1 text-6xl font-bold text-primary">{score}</div>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((n) => (
                <Star
                  key={n}
                  className={`h-7 w-7 ${n < stars ? "fill-amber-400 text-amber-500" : "text-muted-foreground/40"}`}
                />
              ))}
            </div>
            <div className="mt-2 font-semibold">{label}</div>
          </div>
          <div className="rounded-xl bg-[var(--paper-deep)] p-6 text-sm">
            <Row k="Leres" v={correct} />
            <Row k="Lepat" v={total - correct} />
            <Row k="Jumlah Soal" v={total} />
            <Row k="Level" v={level} />
          </div>
        </div>
        <div
          className={`mt-4 rounded-lg p-3 text-center text-sm font-semibold ${passed || adminMode ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}
        >
          {adminMode ? (
            "Mode admin bisa terus ka level mana wae tanpa nyimpen skor."
          ) : finalCompleted ? (
            <>
              <PartyPopper className="mr-1 inline h-4 w-4" />
              Wilujeng! Kabéh level geus hasil direngsekeun.
            </>
          ) : passed ? (
            <>
              <Trophy className="mr-1 inline h-4 w-4" />
              Skor geus nyumponan sarat keur naék level!
            </>
          ) : (
            "Skor can cukup. Tetep di level ieu, ulang deui nya!"
          )}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Btn onClick={onAgain}>Maén Deui</Btn>
          <Btn variant="soft" onClick={onNext} disabled={!adminMode && !passed}>
            {finalCompleted ? "Tingali Perayaan" : "Terus Level"}
          </Btn>
          {!adminMode && (
            <Btn variant="ghost" onClick={onProgress}>
              Tingali Progres
            </Btn>
          )}
          <Btn variant="ghost" onClick={onMenu}>
            {adminMode ? "Pilih Level" : "Menu Mimiti"}
          </Btn>
          <Btn variant="danger" onClick={onExit}>
            {adminMode ? "Balik Admin" : "Kaluar Kaulinan"}
          </Btn>
        </div>
      </Panel>
    </Frame>
  );
}

function FinalCelebration({ onMenu }: { onMenu: () => void }) {
  return (
    <Frame title="Rengse">
      <VictoryConfetti />
      <div className="relative z-50 flex flex-1 flex-col items-center justify-center text-center">
        <div className="rounded-full bg-amber-300/90 p-4 shadow-xl shadow-emerald-950/30">
          <PartyPopper className="h-12 w-12 text-emerald-950" />
        </div>
        <h1 className="mt-2 text-6xl font-bold text-amber-100 drop-shadow-lg">WILUJENG!</h1>
        <p className="mt-3 max-w-md text-lg text-emerald-50 drop-shadow">
          Hidep geus ngarengsekeun kabéh level. Aksara Sunda hidep beuki alus pisan!
        </p>
        <img
          src={sgWave}
          alt=""
          className="my-6 h-64 w-auto rounded-2xl object-cover drop-shadow-xl"
        />
        <Btn onClick={onMenu} className="px-10 text-lg">
          <Home className="mr-2 inline h-5 w-5" />
          Rengse
        </Btn>
      </div>
    </Frame>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-emerald-950/10 py-2 last:border-0">
      <span>{k}</span>
      <span className="font-bold">: {v}</span>
    </div>
  );
}

function ProgressScreen({ progress, onBack }: { progress: Progress; onBack: () => void }) {
  return (
    <Frame>
      <Panel className="mx-auto mt-6 w-full max-w-3xl p-8">
        <div className="mb-4 inline-flex w-fit rounded-md bg-emerald-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-100">
          Progres Diajar
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center text-center">
            <ProfileAvatar avatarKey={progress.avatarKey} size="lg" className="p-1" />
            <div className="mt-2 text-xl font-bold">{progress.name || "Pamaén"}</div>
            {progress.studentClass && (
              <div className="text-sm font-semibold text-muted-foreground">
                {progress.studentClass}
              </div>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <Row k="Kelas" v={progress.studentClass || "-"} />
            <Row k="Jumlah Skor" v={progress.totalScore} />
            <Row k="Level Pangluhurna" v={progress.highestLevel} />
            <Row k="Jumlah Maén" v={`${progress.totalPlays} Kali`} />
          </div>
        </div>
        <div className="mt-6">
          <div className="rounded-t-lg bg-primary px-4 py-2 font-semibold text-primary-foreground">
            Riwayat Skor
          </div>
          <div className="rounded-b-lg border-2 border-t-0 border-emerald-950/30 bg-[var(--paper-deep)] p-3">
            {progress.history.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Can aya riwayat kaulinan.
              </div>
            ) : (
              progress.history.map((h, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-4 border-b border-emerald-950/10 py-2 text-sm last:border-0"
                >
                  <span>{idx + 1}.</span>
                  <span>{h.date}</span>
                  <span>Level {h.level}</span>
                  <span className="text-right font-bold">{h.score}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </Panel>
      <div className="mt-4">
        <Btn variant="ghost" onClick={onBack}>
          <ChevronLeft className="mr-1 inline h-4 w-4" />
          Balik
        </Btn>
      </div>
    </Frame>
  );
}
