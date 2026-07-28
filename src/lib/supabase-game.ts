import {
  findStoredStudentRecord,
  type AvatarKey,
  type Progress,
  type StudentRecord,
} from "@/game/store";
import { supabase } from "@/lib/supabase";

type StudentPayload = {
  student?: {
    id: string;
    display_name: string;
    class_name: string;
    avatar_key?: string | null;
    is_active: boolean;
  };
  progress?: {
    highest_level: number;
    total_score: number;
    total_plays: number;
    music_enabled: boolean;
    sfx_enabled: boolean;
    updated_at?: string;
  };
  history?: Array<{
    date?: string;
    level?: number;
    score?: number;
  }>;
  session_token?: string;
  expires_at?: string;
  passed?: boolean;
};

type AdminStudentRow = {
  id: string;
  display_name: string;
  class_name: string;
  avatar_key?: string | null;
  is_active: boolean;
  highest_level: number;
  total_score: number;
  total_plays: number;
  created_at: string;
  updated_at: string;
};

type AdminUserRow = {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  last_sign_in_at: string | null;
};

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastSignInAt: string | null;
};

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase can dikonfigurasi. Eusian heula VITE_SUPABASE_URL jeung VITE_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}

export function friendlySupabaseError(message: string) {
  const normalized = message.toUpperCase();

  if (normalized.includes("STUDENT_ALREADY_EXISTS"))
    return "Siswa jeung ngaran sarta kelas éta geus kadaptar.";
  if (normalized.includes("INVALID_LOGIN")) return "Ngaran, kelas, atawa sandi can cocog.";
  if (normalized.includes("INVALID_SESSION")) return "Sesi siswa geus béak. Asup deui nya.";
  if (normalized.includes("ADMIN_REQUIRED")) return "Akun ieu can kadaptar jadi admin.";
  if (normalized.includes("NAME_TOO_SHORT")) return "Ngaran siswa sahenteuna 2 karakter.";
  if (normalized.includes("PASSWORD_TOO_SHORT")) return "Sandi sahenteuna 4 karakter.";
  if (normalized.includes("INVALID_CLASS")) return "Kelas can cocog jeung daptar kelas.";
  if (normalized.includes("INVALID_AVATAR")) return "Pilihan poto profil can cocog.";
  if (normalized.includes("INVALID_EMAIL")) return "Email can bener.";
  if (normalized.includes("STUDENT_NOT_FOUND")) return "Data siswa can kapanggih.";
  if (normalized.includes("AUTH_USER_NOT_FOUND"))
    return "Email admin can aya di Supabase Authentication.";
  if (normalized.includes("ADMIN_NOT_FOUND")) return "Admin can kapanggih.";
  if (normalized.includes("ADMIN_ALREADY_EXISTS")) return "Email éta geus jadi admin.";
  if (normalized.includes("CANNOT_REMOVE_SELF"))
    return "Admin nu keur asup teu bisa nyabut hak admin sorangan.";
  if (normalized.includes("CANNOT_REMOVE_LAST_ADMIN"))
    return "Sahenteuna kudu aya hiji admin aktif.";

  return message || "Aya masalah waktu ngahubungi Supabase.";
}

async function rpcJson<T>(functionName: string, params: Record<string, unknown>) {
  const client = requireSupabase();
  const { data, error } = await client.rpc(functionName, params);

  if (error) {
    throw new Error(friendlySupabaseError(error.message));
  }

  return data as T;
}

function normalizeAvatarKey(avatarKey?: string | null): AvatarKey {
  return avatarKey === "girl" ? "girl" : "boy";
}

function adminRowToStudentRecord(row: AdminStudentRow): StudentRecord {
  return {
    id: row.id,
    name: row.display_name,
    avatarKey: normalizeAvatarKey(row.avatar_key),
    studentClass: row.class_name,
    passwordHash: "",
    totalScore: Number(row.total_score ?? 0),
    highestLevel: Number(row.highest_level ?? 1),
    totalPlays: Number(row.total_plays ?? 0),
    history: [],
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function adminRowToAdminUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
    lastSignInAt: row.last_sign_in_at,
  };
}

export function studentPayloadToProgress(payload: StudentPayload, current: Progress): Progress {
  const studentId = payload.student?.id ?? current.studentId;
  const displayName = payload.student?.display_name ?? current.name;
  const className = payload.student?.class_name ?? current.studentClass;
  const storedRecord = findStoredStudentRecord({
    studentId,
    name: displayName,
    studentClass: className,
  });
  const totalScore = Number(payload.progress?.total_score ?? current.totalScore);
  const highestLevel = Number(payload.progress?.highest_level ?? current.highestLevel);
  const totalPlays = Number(payload.progress?.total_plays ?? current.totalPlays);
  const backendLooksReset = totalScore === 0 && totalPlays === 0 && highestLevel <= 1;
  const payloadHistory = Array.isArray(payload.history)
    ? payload.history
        .map((entry) => ({
          date: entry.date ?? "",
          level: Number(entry.level ?? 0),
          score: Number(entry.score ?? 0),
        }))
        .filter((entry) => entry.date && entry.level > 0)
    : [];

  return {
    ...current,
    studentId,
    sessionToken: payload.session_token ?? current.sessionToken,
    sessionExpiresAt: payload.expires_at ?? current.sessionExpiresAt,
    name: displayName,
    studentClass: className,
    avatarKey: payload.student?.avatar_key
      ? normalizeAvatarKey(payload.student.avatar_key)
      : current.avatarKey,
    passwordHash: "",
    totalScore,
    highestLevel,
    totalPlays,
    history:
      payloadHistory.length > 0
        ? payloadHistory
        : backendLooksReset
          ? []
          : current.history.length > 0
            ? current.history
            : (storedRecord?.history ?? []),
    music: payload.progress?.music_enabled ?? current.music,
    sfx: payload.progress?.sfx_enabled ?? current.sfx,
  };
}

export async function studentRegister(displayName: string, className: string, password: string) {
  return rpcJson<StudentPayload>("student_register", {
    input_display_name: displayName,
    input_class_name: className,
    input_password: password,
  });
}

export async function studentLogin(displayName: string, className: string, password: string) {
  return rpcJson<StudentPayload>("student_login", {
    input_display_name: displayName,
    input_class_name: className,
    input_password: password,
  });
}

export async function studentLogout(sessionToken: string) {
  return rpcJson<boolean>("student_logout", {
    input_session_token: sessionToken,
  });
}

export async function refreshStudentSession(sessionToken: string) {
  return rpcJson<StudentPayload>("student_me", {
    input_session_token: sessionToken,
  });
}

export async function updateStudentSettings(
  sessionToken: string,
  musicEnabled: boolean,
  sfxEnabled: boolean,
) {
  return rpcJson<StudentPayload>("update_student_settings", {
    input_session_token: sessionToken,
    input_music_enabled: musicEnabled,
    input_sfx_enabled: sfxEnabled,
  });
}

export async function updateStudentAvatar(sessionToken: string, avatarKey: AvatarKey) {
  return rpcJson<StudentPayload>("update_student_avatar", {
    input_session_token: sessionToken,
    input_avatar_key: avatarKey,
  });
}

export async function recordActivityProgress(sessionToken: string, score: number) {
  return rpcJson<StudentPayload>("record_activity_progress", {
    input_session_token: sessionToken,
    input_score: score,
  });
}

export async function finishQuizResult({
  sessionToken,
  level,
  levelTitle,
  score,
  correct,
  total,
}: {
  sessionToken: string;
  level: number;
  levelTitle: string;
  score: number;
  correct: number;
  total: number;
}) {
  return rpcJson<StudentPayload>("finish_quiz", {
    input_session_token: sessionToken,
    input_level_number: level,
    input_level_title: levelTitle,
    input_score: score,
    input_correct_count: correct,
    input_wrong_count: total - correct,
    input_total_questions: total,
  });
}

export async function syncStudentLocalProgress({
  sessionToken,
  localProgress,
}: {
  sessionToken: string;
  localProgress: Pick<Progress, "totalScore" | "highestLevel" | "totalPlays" | "history">;
}) {
  return rpcJson<StudentPayload>("sync_student_local_progress", {
    input_session_token: sessionToken,
    input_total_score: Math.max(0, Math.trunc(localProgress.totalScore || 0)),
    input_highest_level: Math.max(1, Math.trunc(localProgress.highestLevel || 1)),
    input_total_plays: Math.max(0, Math.trunc(localProgress.totalPlays || 0)),
  });
}

export async function saveReadingAttempt({
  sessionToken,
  promptText,
  expectedText,
  answerText,
  isCorrect,
}: {
  sessionToken: string;
  promptText: string;
  expectedText: string;
  answerText: string;
  isCorrect: boolean;
}) {
  return rpcJson<StudentPayload>("save_reading_attempt", {
    input_session_token: sessionToken,
    input_prompt_text: promptText,
    input_expected_text: expectedText,
    input_answer_text: answerText,
    input_is_correct: isCorrect,
  });
}

export async function saveTracingAttempt(
  sessionToken: string,
  targetText: string,
  completed = true,
) {
  return rpcJson<StudentPayload>("save_tracing_attempt", {
    input_session_token: sessionToken,
    input_target_text: targetText,
    input_completed: completed,
  });
}

export async function signInAdmin(email: string, password: string) {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(friendlySupabaseError(error.message));
  }
}

export async function signOutAdmin() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function adminListStudents(className: string, search: string) {
  const rows = await rpcJson<AdminStudentRow[]>("admin_list_students", {
    input_class_name: className === "Semua" ? null : className,
    input_search: search.trim() || null,
  });

  return rows.map(adminRowToStudentRecord);
}

export async function adminCreateStudent(displayName: string, className: string, password: string) {
  const payload = await rpcJson<StudentPayload>("admin_create_student", {
    input_display_name: displayName,
    input_class_name: className,
    input_password: password,
  });

  return {
    id: payload.student?.id ?? crypto.randomUUID(),
    name: payload.student?.display_name ?? displayName,
    avatarKey: normalizeAvatarKey(payload.student?.avatar_key),
    studentClass: payload.student?.class_name ?? className,
    passwordHash: "",
    totalScore: Number(payload.progress?.total_score ?? 0),
    highestLevel: Number(payload.progress?.highest_level ?? 1),
    totalPlays: Number(payload.progress?.total_plays ?? 0),
    history: [],
    isActive: payload.student?.is_active ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: payload.progress?.updated_at ?? new Date().toISOString(),
  } satisfies StudentRecord;
}

export async function adminUpdateStudent(
  studentId: string,
  patch: { displayName?: string; className?: string; isActive?: boolean },
) {
  const payload = await rpcJson<StudentPayload>("admin_update_student", {
    input_student_id: studentId,
    input_display_name: patch.displayName ?? null,
    input_class_name: patch.className ?? null,
    input_is_active: patch.isActive ?? null,
  });

  return {
    id: payload.student?.id ?? studentId,
    name: payload.student?.display_name ?? patch.displayName ?? "",
    avatarKey: normalizeAvatarKey(payload.student?.avatar_key),
    studentClass: payload.student?.class_name ?? patch.className ?? "",
    passwordHash: "",
    totalScore: Number(payload.progress?.total_score ?? 0),
    highestLevel: Number(payload.progress?.highest_level ?? 1),
    totalPlays: Number(payload.progress?.total_plays ?? 0),
    history: [],
    isActive: payload.student?.is_active ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: payload.progress?.updated_at ?? new Date().toISOString(),
  } satisfies StudentRecord;
}

export async function adminResetStudentPassword(studentId: string, password: string) {
  return rpcJson<boolean>("admin_reset_student_password", {
    input_student_id: studentId,
    input_new_password: password,
  });
}

export async function adminResetStudentProgress(studentId: string) {
  const payload = await rpcJson<StudentPayload>("admin_reset_student_progress", {
    input_student_id: studentId,
  });

  return {
    id: payload.student?.id ?? studentId,
    name: payload.student?.display_name ?? "",
    avatarKey: normalizeAvatarKey(payload.student?.avatar_key),
    studentClass: payload.student?.class_name ?? "",
    passwordHash: "",
    totalScore: Number(payload.progress?.total_score ?? 0),
    highestLevel: Number(payload.progress?.highest_level ?? 1),
    totalPlays: Number(payload.progress?.total_plays ?? 0),
    history: [],
    isActive: payload.student?.is_active ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: payload.progress?.updated_at ?? new Date().toISOString(),
  } satisfies StudentRecord;
}

export async function adminDeleteStudent(studentId: string) {
  return rpcJson<boolean>("admin_delete_student", {
    input_student_id: studentId,
  });
}

export async function adminListAdmins() {
  const rows = await rpcJson<AdminUserRow[]>("admin_list_admins", {});
  return rows.map(adminRowToAdminUser);
}

export async function adminAddAdminByEmail(email: string, displayName: string) {
  const row = await rpcJson<AdminUserRow>("admin_add_admin_by_email", {
    input_email: email,
    input_display_name: displayName || null,
  });

  return adminRowToAdminUser(row);
}

export async function adminUpdateAdmin(adminId: string, displayName: string) {
  const row = await rpcJson<AdminUserRow>("admin_update_admin", {
    input_admin_id: adminId,
    input_display_name: displayName,
  });

  return adminRowToAdminUser(row);
}

export async function adminRemoveAdmin(adminId: string) {
  return rpcJson<boolean>("admin_remove_admin", {
    input_admin_id: adminId,
  });
}
