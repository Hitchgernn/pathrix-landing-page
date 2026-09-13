# Pathrix - Landing Page

Landing page production untuk **Pathrix**, agen AI berbasis WebGIS untuk mobilitas multimoda di Yogyakarta. Dibuat untuk mengikuti MAPID WebGIS Competition 2026.

## Tech Stack

- **Framework & Build:** Vite 5, React 18, TypeScript
- **Styling:** CSS Modules (Vanilla CSS, no Tailwind/UI kit)
- **3D & Animasi:** Three.js (0.180.0), GSAP 3.12 (ScrollTrigger)
- **Deployment:** Static build target (tanpa server runtime)

## Setup & Instalasi

Pastikan menggunakan Node.js versi terbaru.

```bash
# Install dependensi
npm install

# Jalankan dev server lokal
npm run dev
```

## Daftar Script Command

Berikut beberapa script utama yang sering digunakan di proyek ini:

- `npm run dev` - Menjalankan dev server lokal.
- `npm run build` - Proses build production (typecheck, vite build, dan prerender SSR).
- `npm run serve` - Testing hasil build `dist/` secara lokal (sudah termasuk _headers + gzip). Gunakan ini untuk mengecek hasil akhir, **bukan** `preview`.
- `npm run verify` - Menjalankan script test/verifikasi browser (54 checks).
- `npm run typecheck` - Mengecek typing TypeScript tanpa emit file.
- `npm run images` - Encode ulang aset gambar ke dalam folder `public/img`.
- `npm run model` - Pack ulang model `.glb` Tugu Jogja.

Terdapat juga command spesifik untuk testing Three.js dan scene diorama: `verify:pause`, `verify:weight`, `verify:framing`, dan `verify:vehicles`.

## Catatan Penting Pengembangan

Proyek ini punya standar performa, aksesibilitas, dan spesifikasi desain yang ketat:
- **Diorama 3D (Hero):** Menggunakan `three.js`. Kamera diset statis, elemen yang bergerak cuma kendaraan dan air. Model Tugu Jogja dilindungi lisensi CC BY-NC-ND (wajib menyertakan credit di footer).
- **Styling:** Token warna (light blue & ink) sudah diatur di `src/styles/tokens.css` agar lolos kontras WCAG AA. Tolong jangan tambah framework CSS eksternal.
- **Prerendering & i18n:** Support Bahasa Indonesia (`/id/`) dan Inggris (default `/`). Markup HTML di-prerender saat proses build supaya SEO friendly dan page tetap bisa dibaca meskipun user mematikan JavaScript.
- **GSAP:** Digunakan untuk animasi scroll. Desain dibuat dengan pendekatan graceful degradation (kalau GSAP gagal diload, website tetap harus bisa dipakai seperti biasa).

Untuk detail teknis, architecture decision, dan panduan desain lebih lengkap, silakan cek file `AGENTS.md` dan `DESIGN.md`.
