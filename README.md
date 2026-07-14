# KasirQu

Sistem kasir web untuk toko sembako. Transaksi cepat, kontrol stok, catat utang pelanggan, dan laporan otomatis ke Telegram. Dirancang untuk pemilik toko yang merangkap sebagai kasir: alur minimal klik, tampilan santai, bukan korporat.

## Fitur Utama

- **Kasir & Transaksi** — input barang manual tanpa scanner, keranjang belanja, hitung kembalian otomatis, diskon per item/transaksi, void transaksi, dan cetak struk ke PDF.
- **Produk & Stok** — CRUD produk (nama, kategori, harga beli/jual, satuan), stok otomatis turun saat transaksi, alert stok menipis, dan riwayat stock in/out.
- **Utang / Piutang (Bon)** — catat utang pelanggan, tandai lunas secara manual.
- **Laporan** — omzet harian/mingguan/bulanan, produk terlaris, dan keuntungan (harga jual − harga beli).
- **Telegram** — rekap harian otomatis di jam tutup toko dan notifikasi stok menipis.
- **Dashboard** — ringkasan omzet hari ini, transaksi terakhir, stok kritis, dan tombol akses cepat ke kasir.
- **Export** — backup data ke Excel.

## Tech Stack

| Lapisan     | Teknologi                                                          |
| ----------- | ------------------------------------------------------------------ |
| Framework   | Next.js 16 (App Router) + React 19                                 |
| Bahasa      | TypeScript                                                         |
| Styling     | Tailwind CSS 4 + shadcn/ui (Radix)                                 |
| Database    | PostgreSQL + Prisma ORM                                            |
| Auth        | NextAuth (Auth.js) v5                                              |
| Chart       | Recharts                                                           |
| PDF         | @react-pdf/renderer                                                |
| Excel       | ExcelJS                                                           |
| Laporan     | node-cron + Telegram Bot API                                       |

## Persyaratan

- Node.js 20+
- PostgreSQL (lokal atau cloud)
- Token Bot Telegram (untuk laporan otomatis)

## Mulai Cepat

1. **Clone repo**

   ```bash
   git clone https://github.com/januarsyah901/kasirqu.git
   cd kasirqu
   ```

2. **Install dependensi**

   ```bash
   npm install
   ```

3. **Siapkan environment**

   Salin `.env` dan sesuaikan nilainya:

   ```bash
   cp .env .env.local
   ```

   | Variabel         | Keterangan                                            |
   | ---------------- | ----------------------------------------------------- |
   | `DATABASE_URL`   | Koneksi PostgreSQL, misal `postgresql://user:pass@host:5432/db` |
   | `NEXTAUTH_SECRET`| Secret acak untuk sesi (wajib di production)          |
   | `NEXTAUTH_URL`   | Base URL aplikasi, default `http://localhost:3000`    |

4. **Setup database**

   ```bash
   npm run db:seed
   ```

   Perintah di atas menjalankan `prisma generate` lalu mengisi data awal (produk, akun, dll).

5. **Jalankan aplikasi**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## NPM Scripts

| Perintah            | Fungsi                                             |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Jalankan server development                         |
| `npm run build`     | Build production                                   |
| `npm run start`     | Jalankan hasil build                               |
| `npm run lint`      | Jalankan ESLint                                    |
| `npm run db:seed`   | Generate Prisma client + isi data awal             |
| `npm run prisma:studio` | Buka Prisma Studio untuk lihat/edit data       |

## Struktur Singkat

```
src/            Kode aplikasi (App Router, komponen, lib)
prisma/         Schema database & seed
public/         Aset statis
```

## Catatan

Single-store, single-role (kasir = owner, akses penuh). Belum mendukung multi-toko, multi-akun berjenjang, payment gateway (QRIS), printer struk fisik, atau barcode scanner.
