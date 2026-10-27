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
  components/ui.tsx            shared navigation, buttons, badges, cards, timeline, dialog, toast
  features/
    public/pages.tsx            landing, reports, detail, statistics, about, privacy
    auth/pages.tsx              login and registration
    reporter/pages.tsx          reporter dashboard, report form, private tracking
    admin/pages.tsx             admin queue and report review
    system/pages.tsx            403 and 404 views
    */index.ts                  feature exports
  shared/
    api/client.ts               REST client, credentials, CSRF, normalized errors
    report-data.ts              shared report/status types and demo data
  styles/global.css             responsive global design system
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
- Endpoint yang dipakai form: `POST /auth/register`, `POST /auth/login`, dan `POST /reports` (multipart). Wireframe halaman laporan dan statistik memakai data demonstrasi.

## Rute utama

Publik: `/`, `/laporan`, `/laporan/:code`, `/statistik`, `/tentang`, `/kebijakan-privasi`, `/masuk`, `/daftar`.

Pelapor: `/dashboard`, `/lapor/baru`, `/dashboard/laporan/:code`.

Administrator platform: `/admin`, `/admin/laporan`, `/admin/laporan/:code`, `/admin/statistik`.

## Responsif dan aksesibilitas

Layout dimulai dari layar kecil, dengan breakpoint 430, 760, dan 1000 px; pada ukuran penerimaan 360, 768, dan 1280 px konten mengalir tanpa lebar tetap. Status selalu berikon dan berteks, field memiliki label, kontrol interaktif memiliki fokus terlihat, serta tinggi tombol minimum 44 px. Warna status memakai pasangan latar/teks gelap; aksi utama memakai biru-teal gelap dan teks putih.
