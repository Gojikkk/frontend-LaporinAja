# LaporinAja — frontend

Frontend React untuk wireframe halaman publik, pelapor, dan administrator platform. Rute memakai padanan Indonesia pada PRD untuk sementara (OQ-08 belum diputuskan tim). Prototype kompetisi ini bukan kanal resmi pemerintah.

## Menjalankan

Gunakan Node.js 20 atau lebih baru:

```sh
npm install
npm run dev
```

Vite membuka frontend pada `http://localhost:5173`. Untuk produksi, jalankan `npm run build`.

## Struktur frontend

```text
src/
  app/App.tsx                  route table and page composition
  components/ui.tsx            shared navigation, buttons, badges, cards, primary-report card, timeline, dialog, toast
  features/
    public/pages.tsx            landing, reports, detail, statistics, about, privacy
    auth/pages.tsx              login and registration
    reporter/pages.tsx          reporter dashboard, report form, private tracking
    admin/pages.tsx             admin dashboard, report queue, report review
    admin/categories.tsx        admin report category management (LAP-30)
    admin/shell.tsx             admin workspace navigation and page title
    admin/data.ts               shared store re-export for admin screens
    system/pages.tsx            403 and 404 views
    */index.ts                  feature exports
  shared/
    api/client.ts               REST client, credentials, CSRF, normalized errors
    report-data.ts              status/category types and public card shape
    report-store.ts             demo report store shared by admin, public, reporter
  styles/global.css             responsive global design system
  styles/admin.css              admin workspace (LAP-23/LAP-30 theme, .adm)
  styles/theme.css              shared LAP-23 theme for public/reporter (.app-theme)
  styles/home.css               Beranda layout (hero, kategori, statistik, penutup)
  main.tsx                      React entry point and BrowserRouter
  vite-env.d.ts                 Vite environment types
```

Routing, komponen bersama, data demo, dan layar peran berada di modul terpisah agar perubahan tiap bagian lebih mudah ditelusuri.

## URL API per environment

Salin `.env.example` menjadi `.env.local` untuk lokal dan atur `VITE_API_URL`. Contoh:

```dotenv
VITE_API_URL=https://api.example.test/api
VITE_CSRF_COOKIE_NAME=csrfToken
VITE_CSRF_HEADER_NAME=X-CSRF-Token
# Alternative to a shared-domain readable CSRF cookie:
VITE_CSRF_ENDPOINT=/auth/csrf
```

Vite membaca nilai `VITE_*` saat build. Atur URL sesuai environment dan bangun ulang aplikasi untuk setiap deployment.

## Kontrak integrasi browser/API

- Semua request menggunakan `credentials: "include"`; sesi harus berupa cookie `HttpOnly`, `Secure` di HTTPS, dengan kebijakan `SameSite` dan domain yang sesuai topologi deployment.
- Frontend tidak menyimpan token sesi di `localStorage` atau `sessionStorage`. Cookie CSRF opsional boleh dibaca jika server memang menerbitkannya; nama cookie dan header dapat dikonfigurasi. Jangan isi variabel CSRF dengan nama cookie sesi.
- Browser mengirim `Origin` secara otomatis. Server Express perlu mengizinkan origin frontend secara eksplisit, mengaktifkan CORS `credentials: true`, menjawab preflight, dan memeriksa `Origin` untuk operasi mutasi. Jika server memakai token CSRF, terbitkan cookie CSRF yang dapat dibaca JavaScript dan set nama cookie/header di environment frontend.
- Untuk deployment lintas-site yang tidak dapat membaca cookie CSRF API, set `VITE_CSRF_ENDPOINT` ke endpoint yang mengembalikan token CSRF di `{ "data": { "csrfToken": "..." } }`; token hanya ditahan di memori selama halaman terbuka.
- API mengembalikan error konsisten `{ "error": { "code", "message", "fields" } }`. Klien memetakannya ke `ApiError`; kegagalan jaringan menampilkan pesan umum bahasa Indonesia.
- Endpoint yang dipakai form: `POST /auth/register`, `POST /auth/login`, dan `POST /reports` (multipart). Halaman laporan, statistik, dan layar admin memakai data demonstrasi dari `src/shared/report-store.ts`; hasil moderasi admin (status, catatan tindak lanjut, linimasa) langsung tercermin di halaman publik dan pelapor.

## Aturan laporan duplikat

- Backend nantinya mengirim `primary_report_code` pada objek laporan. Field ini hanya terisi saat status `DUPLICATE` dan berisi kode laporan yang menjadi acuan.
- Admin dapat menandai laporan berstatus `SUBMITTED`, `VERIFIED`, atau `IN_PROGRESS` sebagai duplikat, memilih laporan utama, dan menulis catatan opsional. Pilihan laporan utama dibatasi ke laporan yang sudah tampil di publik, bukan duplikat, dan bukan laporan itu sendiri sehingga rantai rujukan maksimal satu tingkat.
- Laporan utama muncul lebih dulu bila kategorinya sama dengan laporan duplikat.
- Menandai duplikat menambah entri linimasa dan tetap membuat laporan dapat dibaca publik lewat kartu "Laporan ini tercatat sebagai laporan serupa" yang menautkan ke laporan utama.
- Bila laporan yang menjadi acuan kemudian ditandai duplikat, rujukan laporan lain dialihkan ke acuan barunya agar rantai tetap satu tingkat.
- Kartu rujukan hanya menautkan laporan utama yang masih tampil publik. Bila laporan utama ditolak, kartu menampilkan keterangan tanpa tautan agar tidak berujung pada halaman kosong.
- Status `DUPLICATE` dapat dikembalikan ke antrean verifikasi; saat status berubah keluar dari `DUPLICATE`, `primary_report_code` dikosongkan.
- Laporan duplikat tetap tampil di `/laporan` dan tetap dihitung pada statistik.

## Rute utama

Publik: `/`, `/laporan`, `/laporan/:code`, `/statistik`, `/tentang`, `/kebijakan-privasi`, `/masuk`, `/daftar`.

Pelapor: `/dashboard`, `/lapor/baru`, `/dashboard/laporan/:code`.

Administrator platform: `/admin`, `/admin/laporan`, `/admin/laporan/:code`, `/admin/kategori`, `/admin/statistik`.

Halaman sistem: `/403` untuk akses ditolak; rute lain yang tidak dikenal menampilkan 404.

## Responsif dan aksesibilitas

Layout dimulai dari layar kecil, dengan breakpoint 430, 760, dan 1000 px untuk halaman publik/pelapor, serta 640, 900, dan 1400 px untuk ruang kerja admin. Pada ukuran penerimaan 360, 768, dan 1280 px konten mengalir tanpa lebar tetap. Status selalu berikon dan berteks, field memiliki label, kontrol interaktif memiliki fokus terlihat, serta tinggi tombol minimum 44 px. Warna status memakai pasangan latar/teks gelap; aksi utama memakai oranye #F97316 dengan teks navy #0F172A yang tetap sama saat hover (tanpa perubahan warna teks, transparansi, atau bayangan tambahan).
