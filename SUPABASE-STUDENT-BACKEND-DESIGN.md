# Supabase Student Backend Design

## Arah Keputusan

Game tetap berupa frontend Vite yang ringan. Supabase dipakai untuk data siswa, progres, riwayat permainan, dan admin pengelola siswa.

Karena siswa kelas 10 belum tentu memakai email, desain yang paling pas adalah:

- Frontend statis tetap jalan di browser.
- Supabase Database menyimpan profil siswa, progres, dan sesi kuis.
- Supabase Edge Functions menangani register/login siswa.
- Supabase Auth menangani login admin.
- Admin mengelola siswa melalui Edge Functions khusus admin.
- Password tidak disimpan dari frontend ke tabel secara langsung.
- Frontend tidak pernah memakai `service_role key`.

## Kenapa Tidak Langsung Tabel dari Frontend?

Form siswa berisi `nama`, `kelas`, dan `password`. Kalau frontend langsung insert ke tabel `students`, password/PIN berisiko salah kelola.

Jalur yang lebih aman:

1. Frontend mengirim `nama`, `kelas`, `password` ke Edge Function `student-register`.
2. Edge Function validasi data.
3. Edge Function membuat `password_hash` di server.
4. Edge Function insert ke tabel `students`.
5. Edge Function mengembalikan `student_id` dan session token.

Dengan pola ini, database tidak perlu membuka akses tulis langsung ke tabel siswa untuk publik.

## Data yang Disimpan

### `admin_profiles`

Menyimpan daftar admin yang boleh mengelola siswa.

- `id`
- `email`
- `display_name`
- `created_at`

Catatan:

- `id` terhubung ke `auth.users.id`.
- Admin login memakai Supabase Auth email + password.
- Admin tidak memakai flow `student-login`.

### `students`

Menyimpan data identitas siswa yang dibutuhkan game.

- `id`
- `display_name`
- `class_name`
- `password_hash`
- `created_at`
- `updated_at`

Catatan:

- `password_hash` tidak pernah dikirim balik ke frontend.
- `display_name + class_name` bisa dibuat unik untuk MVP.
- Kalau nanti ada nama siswa yang sama dalam satu kelas, bisa tambah `student_code`.

### `student_sessions`

Menyimpan token login siswa.

- `id`
- `student_id`
- `token_hash`
- `expires_at`
- `created_at`

Frontend menyimpan token asli di `localStorage`, database hanya menyimpan hash token.

### `student_progress`

Menyimpan progres ringkas.

- `student_id`
- `highest_level`
- `total_score`
- `total_plays`
- `music_enabled`
- `sfx_enabled`
- `updated_at`

### `quiz_attempts`

Menyimpan hasil satu kali kuis.

- `id`
- `student_id`
- `level_number`
- `level_title`
- `score`
- `correct_count`
- `wrong_count`
- `total_questions`
- `created_at`

### `reading_attempts`

Opsional untuk mode membaca.

- `id`
- `student_id`
- `prompt_text`
- `expected_text`
- `answer_text`
- `is_correct`
- `created_at`

### `tracing_attempts`

Opsional untuk mode menulis.

- `id`
- `student_id`
- `target_text`
- `completed`
- `created_at`

### `admin_audit_logs`

Opsional, tapi bagus untuk mencatat aksi admin.

- `id`
- `admin_id`
- `action`
- `target_student_id`
- `metadata`
- `created_at`

## Flow Register

1. Siswa isi `nama`, `kelas`, `password`.
2. Frontend panggil Edge Function `student-register`.
3. Function validasi kelas hanya boleh:
   `10 Satu` sampai `10 Tiga Belas`.
4. Function cek nama di kelas yang sama belum dipakai.
5. Function hash password.
6. Function buat row di `students`.
7. Function buat row awal di `student_progress`.
8. Function buat session token.
9. Frontend simpan `student_id`, `session_token`, nama, dan kelas.

## Flow Login

1. Siswa isi `nama`, `kelas`, `password`.
2. Frontend panggil Edge Function `student-login`.
3. Function cari siswa berdasarkan `nama + kelas`.
4. Function verifikasi password.
5. Function buat session token baru.
6. Frontend ambil progress dari Supabase lewat function atau endpoint khusus.

## Flow Admin Login

1. Admin login memakai Supabase Auth email + password.
2. Frontend admin mengambil session dari Supabase Auth.
3. Admin memanggil Edge Function admin seperti `admin-list-students`.
4. Edge Function cek `auth.uid()` ada di `admin_profiles`.
5. Kalau valid, function boleh membaca atau mengubah data siswa.

## Flow Admin Kelola Siswa

Admin minimal bisa:

- melihat daftar siswa,
- filter berdasarkan kelas,
- membuat siswa baru,
- mengganti kelas siswa,
- reset password/PIN siswa,
- reset progres siswa,
- hapus siswa bila perlu.

Semua aksi admin sebaiknya lewat Edge Functions:

- `admin-list-students`
- `admin-create-student`
- `admin-update-student`
- `admin-reset-student-password`
- `admin-reset-student-progress`
- `admin-delete-student`

Untuk MVP, admin tidak perlu mengubah materi game dulu. Fokus admin hanya pengelolaan siswa.

## Flow Simpan Kuis

1. Game menghitung skor di browser.
2. Saat kuis selesai, frontend panggil Edge Function `finish-quiz`.
3. Function verifikasi session token.
4. Function insert ke `quiz_attempts`.
5. Function update `student_progress`.
6. Function unlock level berikutnya kalau benar minimal 70%.

## RLS dan Keamanan

Untuk tabel siswa dan progres:

- Aktifkan RLS di semua tabel.
- Jangan beri policy publik langsung untuk `students`, `student_sessions`, `student_progress`, dan attempt tables.
- Akses tulis/baca lewat Edge Functions dengan `service_role key`.
- `service_role key` hanya berada di environment Edge Function.
- Admin login dengan Supabase Auth, lalu Edge Function memverifikasi admin lewat tabel `admin_profiles`.
- Siswa tidak boleh membaca daftar siswa lain.
- Admin boleh membaca/mengelola siswa hanya setelah lolos verifikasi admin.

Untuk aset game:

- Gambar, audio, dan JavaScript tetap dari static hosting/CDN.
- Jangan lewat Edge Function agar 1000 siswa bersamaan tetap ringan.

## Skala 1000 Siswa

Desain ini aman untuk 1000 siswa bersamaan karena backend hanya dipakai pada momen penting:

- register/login,
- admin list/filter siswa,
- selesai kuis,
- selesai latihan membaca/menulis,
- ambil progres awal.

Jangan menyimpan setiap klik, setiap suara, atau setiap perpindahan layar ke Supabase.

## Tahap Implementasi

### Tahap 1

- Buat tabel Supabase.
- Buat Edge Function `student-register`.
- Buat Edge Function `student-login`.
- Buat tabel dan login admin.
- Buat Edge Function `admin-list-students`.
- Frontend tetap punya fallback `localStorage`.

### Tahap 2

- Simpan hasil kuis ke `quiz_attempts`.
- Sinkron `student_progress`.
- Tampilkan progres dari Supabase saat login.
- Buat admin create/update/reset siswa.

### Tahap 3

- Tambah `reading_attempts` dan `tracing_attempts`.
- Tambah migrasi data dari progres lokal ke Supabase saat siswa pertama login.
- Tambah audit log admin.

## Catatan Produk

Untuk siswa, istilah `password` bisa tetap dipakai di UI. Secara teknis lebih baik dianggap `PIN/password game`, bukan password akun penting.

Kalau nanti sekolah ingin data lebih resmi, baru tambahkan `student_code` atau `nis_internal`. Untuk sekarang jangan simpan NISN, alamat, nomor HP, atau data pribadi lain.
