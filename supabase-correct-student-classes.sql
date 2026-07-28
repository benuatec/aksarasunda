-- Patch koreksi kelas siswa Game Aksara Sunda
-- Dibuat otomatis dari Link 1 (daftar siswa resmi) dan Link 2 (rekapan pemain game).
-- Tanggal: 2026-05-22 20:05:54
-- Aman untuk skor/progres: hanya mengubah public.students.class_name.

begin;

create temporary table tmp_student_class_corrections (
  game_name text not null,
  old_class_name text not null,
  official_class_name text not null,
  official_name text,
  nis text,
  match_method text,
  match_score numeric
) on commit drop;

insert into tmp_student_class_corrections
  (game_name, old_class_name, official_class_name, official_name, nis, match_method, match_score)
values
  ('Agni Eliana Nursifa', '10 Satu', '10 Delapan', 'AGNI ELIANA NURSIFA', '250010', 'exact', 1),
  ('Ainun latifatul zakiyah', '10 Satu', '10 Sepuluh', 'AINUN LATIFATUL ZAKIYAH', '250016', 'exact', 1),
  ('Alfah khoerunnisa', '10 Satu', '10 Empat', 'Alfah Khoerunnisa', '250021', 'exact', 1),
  ('Alifa Khoirina', '10 Satu', '10 Enam', 'alifa khoirina', '250025', 'exact', 1),
  ('alpan mualip', '10 Satu', '10 Dua', 'ALPAN MUALIP', '250030', 'exact', 1),
  ('ALYA SYARIFATUL WARDAH', '10 Satu', '10 Sembilan', 'ALYA SYARIFATUL WARDAH', '250032', 'exact', 1),
  ('Amelia Dwi Nuraini', '10 Satu', '10 Dua Belas', 'Amelia Dwi Nuraini', '250330', 'exact', 1),
  ('Azkia Raisa Salsabila', '10 Satu', '10 Sepuluh', 'AZKIA RAISA SALSABILA', '250049', 'exact', 1),
  ('Bilqis Nurwafa', '10 Satu', '10 Tiga Belas', 'BILQIS NUR WAFA', '250055', 'fuzzy', 0.966),
  ('CAHYA KAMILA SYABANI', '10 Satu', '10 Sembilan', 'CAHYA KAMILA SYABANI', '250056', 'exact', 1),
  ('Fahmi Nugraha', '10 Satu', '10 Delapan', 'M FAHMI NUGRAHA', '250486', 'fuzzy', 0.929),
  ('Fatih mahdar alfajari', '10 Satu', '10 Sembilan', 'FATIH MAHDAR ALFAJARI', '250079', 'exact', 1),
  ('Hafna Fauzia Ramadhani', '10 Satu', '10 Dua Belas', 'Hafna Fauzai Ramadhani', '250359', 'fuzzy', 0.955),
  ('Hikma sabrina putri', '10 Satu', '10 Tujuh', 'HIKMA SABRINA PUTRI', '250092', 'exact', 1),
  ('Ilma zahratunnisa', '10 Satu', '10 Lima', 'ILMA ZAHRATUNNISA', '666665', 'exact', 1),
  ('Irham Rahman', '10 Satu', '10 Dua', 'IRHAM RAHMAN', '250450', 'exact', 1),
  ('Koswara Rifa lesmana', '10 Satu', '10 Tiga', 'Koswara Rifa Lesmana', '250372', 'exact', 1),
  ('manda zaskia herlina', '10 Satu', '10 Sepuluh', 'Manda Zakia Herlina', '250124', 'fuzzy', 0.974),
  ('Marwa kisywaditul fadilah', '10 Satu', '10 Sebelas', 'marwa kisywadiatul fadilah', '250125', 'fuzzy', 0.98),
  ('Maurits Muhammad rizki', '10 Satu', '10 Sepuluh', 'MAURITS MUHAMMAD RIZKI', '250379', 'exact', 1),
  ('Muhamad Fardan Hariri', '10 Satu', '10 Lima', 'MUHAMAD FARDAN HARIRI', '250134', 'exact', 1),
  ('Muhammad Haqi Alpandi Annazali', '10 Satu', '10 Delapan', 'MUHAMAD HAQI ALPANDI ANNAZALI', '250135', 'exact', 1),
  ('Muhammad Zaky Nurqolbi', '10 Satu', '10 Tiga Belas', 'muhammad zaky nur qolby', '250157', 'fuzzy', 0.93),
  ('Muhammad Zidni Nurrohman', '10 Satu', '10 Lima', 'Muhammad Zidni Nurrohman', '250158', 'exact', 1),
  ('namira cahya kamila', '10 Satu', '10 Empat', 'namira cahya kamila', '250174', 'exact', 1),
  ('Neng zahra aulia', '10 Satu', '10 Sembilan', 'Neng Zahra Aulia', '250407', 'exact', 1),
  ('𝒑𝒖𝒛𝒊 𝒏𝒂𝒅𝒊𝒍𝒍𝒂𝒉', '10 Satu', '10 Lima', 'PUZI NADILLAH', '250197', 'exact', 1),
  ('Raisya Ainayya Azzahra', '10 Satu', '10 Delapan', 'RAISYA AINAYYA AZZAHRA', '250414', 'exact', 1),
  ('RAKHA AZKIYA EL-SHIRAZY', '10 Satu', '10 Delapan', 'RAKHA AZKIYA EL-SHIRAZY', '250215', 'exact', 1),
  ('Rania putri', '10 Satu', '10 Delapan', 'RANIA PUTRI', '250217', 'exact', 1),
  ('Riska Citra Dewi', '10 Satu', '10 Delapan', 'RISKA CITRA DEWI', '250423', 'exact', 1),
  ('Risna Maharani', '10 Satu', '10 Enam', 'Risna Maharani', '250229', 'exact', 1),
  ('Rizky Permana putra', '10 Satu', '10 Sebelas', 'Rizky permana putra', '250544', 'exact', 1),
  ('Roihan Muhammad paujan', '10 Satu', '10 Sembilan', 'ROIHAN MUHAMMAD PAUJAN', '250231', 'exact', 1),
  ('Sinta Amalia zahra', '10 Satu', '10 Enam', 'SINTA AMALIA ZAHRA', '250247', 'exact', 1),
  ('siti nahariah sarifah', '10 Satu', '10 Sembilan', 'SITI NAHARIAH SARIFAH', '250253', 'exact', 1),
  ('Siti zahra nursifani', '10 Satu', '10 Lima', 'SITI ZAHRA NURSIFANI', '250258', 'exact', 1),
  ('Solah Husnul 2513Wafa', '10 Satu', '10 Lima', 'Solah Husnul Wafa', '250261', 'fuzzy', 0.895),
  ('syiva nur azmilatunnisa', '10 Satu', '10 Dua', 'SYIFA NUR AZMILATUNNISA', '250438', 'fuzzy', 0.957),
  ('syra suci saputri', '10 Satu', '10 Delapan', 'Syra Suci Saputri', '250277', 'exact', 1),
  ('Vina nabila', '10 Satu', '10 Dua', 'VINA NABILA', '250287', 'exact', 1),
  ('Zilpi ZilpiAni', '10 Satu', '10 Empat', 'ZILPI ZILPIANI', '250445', 'exact', 1);

-- Preview data yang akan diubah. Jalankan SELECT ini dulu kalau mau cek sebelum COMMIT.
select
  s.id,
  s.display_name as nama_di_database,
  s.class_name as kelas_sekarang,
  c.official_class_name as kelas_resmi,
  c.official_name as nama_di_daftar_resmi,
  c.match_method,
  c.match_score
from public.students s
join tmp_student_class_corrections c
  on public.normalize_student_name(s.display_name) = public.normalize_student_name(c.game_name)
 and s.class_name = c.old_class_name
order by c.official_class_name, s.display_name;

with candidates as (
  select
    s.id,
    s.display_name,
    s.display_name_key,
    s.class_name as old_class_name,
    c.official_class_name,
    count(*) over (
      partition by c.official_class_name, s.display_name_key
    ) as same_destination_count
  from public.students s
  join tmp_student_class_corrections c
    on public.normalize_student_name(s.display_name) = public.normalize_student_name(c.game_name)
   and s.class_name = c.old_class_name
  where s.class_name is distinct from c.official_class_name
),
safe_candidates as (
  select candidate.*
  from candidates candidate
  where candidate.same_destination_count = 1
    and not exists (
      select 1
      from public.students target
      where target.class_name = candidate.official_class_name
        and target.display_name_key = candidate.display_name_key
        and target.id <> candidate.id
    )
),
updated as (
  update public.students s
  set
    class_name = candidate.official_class_name,
    updated_at = now()
  from safe_candidates candidate
  where s.id = candidate.id
  returning s.id, s.display_name, candidate.old_class_name, s.class_name as new_class_name
)
select count(*) as jumlah_siswa_dikoreksi_tanpa_bentrok from updated;

-- Siswa di bawah ini tidak diupdate karena berpotensi bentrok unique key.
-- Cek manual dulu: biasanya ini akun ganda dari siswa yang sama.
with candidates as (
  select
    s.id,
    s.display_name,
    s.display_name_key,
    s.class_name as old_class_name,
    c.official_class_name,
    count(*) over (
      partition by c.official_class_name, s.display_name_key
    ) as same_destination_count
  from public.students s
  join tmp_student_class_corrections c
    on public.normalize_student_name(s.display_name) = public.normalize_student_name(c.game_name)
   and s.class_name = c.old_class_name
  where s.class_name is distinct from c.official_class_name
)
select
  candidate.id as id_yang_mau_dipindah,
  candidate.display_name as nama_yang_mau_dipindah,
  candidate.old_class_name as kelas_sekarang,
  candidate.official_class_name as kelas_resmi,
  case
    when candidate.same_destination_count > 1 then 'bentrok antar akun yang sama-sama mau dipindah'
    when target.id is not null then 'sudah ada akun duplikat di kelas resmi'
    else 'aman'
  end as alasan_dilewati,
  target.id as id_duplikat_di_kelas_resmi,
  target.display_name as nama_duplikat_di_kelas_resmi,
  target.class_name as kelas_duplikat
from candidates candidate
left join public.students target
  on target.class_name = candidate.official_class_name
 and target.display_name_key = candidate.display_name_key
 and target.id <> candidate.id
where candidate.same_destination_count > 1
   or target.id is not null
order by candidate.official_class_name, candidate.display_name;

-- Cek nama koreksi yang tidak ketemu di database. Harusnya kosong atau sedikit jika data sudah berubah sebelumnya.
select c.*
from tmp_student_class_corrections c
where not exists (
  select 1
  from public.students s
  where public.normalize_student_name(s.display_name) = public.normalize_student_name(c.game_name)
    and s.class_name = c.official_class_name
);

commit;
