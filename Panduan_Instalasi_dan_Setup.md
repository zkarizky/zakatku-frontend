# Panduan Instalasi dan Setup Proyek Zakatku Frontend

Dokumen ini berisi panduan teknis yang merangkum daftar pustaka (packages) yang digunakan, cara melakukan instalasi, dan panduan konfigurasi pada proyek `zakatku-frontend`.

## 1. Instalasi Lingkungan Dasar (Persiapan)

Sebelum menjalankan instalasi package di dalam proyek, pastikan perangkat komputer Anda telah terpasang:
- **Node.js** (Sangat disarankan versi minimal v20.x ke atas)
- **Git** (Opsional, digunakan untuk menarik / clone repository kode)

## 2. Setup Proyek yang Sudah Ada (Cara Singkat)

Jika Anda sudah memiliki file proyek ini sepenuhnya, cara termudah untuk menginstal seluruh konfigurasi package yang ada di `package.json` adalah:

1. Buka terminal atau *command prompt*.
2. Arahkan direktori terminal ke root folder proyek (contoh: `cd c:\laragon\www\zakatku-frontend`).
3. Jalankan perintah instalasi utama:
   ```bash
   npm install
   ```
   *Perintah ini akan membaca file `package.json` dan secara otomatis mengunduh serta mengelola versi semua package yang dibutuhkan ke dalam folder `node_modules`.*

4. Jalankan Server:
   ```bash
   npm run dev
   ```

---

## 3. Daftar Package dan Perintah Instalasi Manual (Dari Nol)

Bagian ini bermanfaat apabila Anda ingin membangun ulang aplikasinya, memiliki kendala di satu package tertentu, atau sekadar ingin melihat daftar secara terpisah.

### A. Dependensi Utama (Production Dependencies)

Paket ini digunakan untuk fitur dan jalannya aplikasi:

1. **Next.js & React (Core Framework & UI)**
   Secara spesifik Next.js digunakan berbarengan dengan React dan React DOM.
   ```bash
   npm install next@16.1.6 react@19.2.3 react-dom@19.2.3
   ```

2. **Axios**
   Digunakan untuk melakukan HTTP Requests (memanggil REST API backend).
   ```bash
   npm install axios
   ```

3. **js-cookie**
   Digunakan untuk membaca, menulis, dan mengelola Cookies di browser (biasanya untuk Authentikasi dan Token Session).
   ```bash
   npm install js-cookie
   ```

### B. Dependensi Pengembangan (Development Dependencies)

Paket-paket ini diinstal sebagai spesifik bagian `devDependencies` menggunakan `npm install -D` atau `--save-dev`. Mereka bertugas membantu para developer mengerjakan kode:

1. **TypeScript dan Definisi Tipe Data**
   Menambahkan dukungan penuh untuk TypeScript (`.ts` / `.tsx`).
   ```bash
   npm install -D typescript @types/node @types/react @types/react-dom
   ```

2. **Tailwind CSS v4 (Styling)**
   Digunakan agar bisa menata gaya antarmuka hanya melalui penggunaan nama *class* di *markup*.
   ```bash
   npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer
   ```

3. **ESLint & Konfigurasi Next.js (Linter)**
   Mengecek standar dan perbaikan kualitas kode agar konsisten di setiap pengembangan.
   ```bash
   npm install -D eslint eslint-config-next
   ```

## 4. Proses Setup & Konfigurasi Khusus (Bila membangun dari nol)

Jika aplikasi ini dikonfigurasi ulang secara manual, hal-hal berikut umumnya perlu diperhatikan sesusai *stack* pada React/Next.js:

- **Inisialisasi TypeScript**: Anda harus menjalankan perintah `npx tsc --init` sekali untuk menghasilkan `tsconfig.json`. (Dalam proyek ini sudah ada `tsconfig.json`).
- **Inisialisasi Tailwind**: Setelah instalasi plugin Tailwind pada Node.js, file integrasi konfigurasi dibutuhkan (`tailwind.config.js`). Selain itu, `app/globals.css` juga perlu ditambahkan direktif `@tailwind base; @tailwind components; @tailwind utilities;`.
- **Inisialisasi ESLint**: Dapat dibuat menggunakan perintah setup Next.js atau menjalankan `npx eslint --init` terkait `eslint.config.mjs`.

## Kesimpulan

Seluruh kebutuhan instalasi sudah terangkum sangat rapi di file `package.json`. Hal ini membuat tugas tim pengembang saat memindahkan direktori kerja jauh lebih ringkas cukup dengan sebaris perintah utama: **`npm install`** pada direktori sumber.
