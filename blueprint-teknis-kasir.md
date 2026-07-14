# Blueprint Teknis: Aplikasi Kasir Toko Sembako
*Dokumen ini siap di-copy-paste ke AI Dev Agent (Claude Code, Cursor, Devin, dll) untuk langsung dieksekusi per task.*

---

## 1. Ringkasan Proyek
Web app kasir single-store untuk toko sembako. Satu role user (akses penuh). Fitur inti: transaksi, manajemen produk & stok, catat bon (utang pelanggan), dashboard, laporan otomatis ke Telegram, export Excel. Tanpa integrasi payment gateway, printer fisik, atau scanner.

## 2. Tech Stack Confirmation
Karena tidak ada preferensi stack spesifik dari owner, dipakai stack default yang solid & cepat dikembangkan untuk agent:

| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Full-stack dalam satu project, cocok untuk agent execution |
| Bahasa | TypeScript | Type-safety, mengurangi bug saat agent generate code |
| UI | Tailwind CSS + shadcn/ui | Styling cepat, komponen siap pakai |
| Database | PostgreSQL | Relasional, cocok untuk transaksi & stok |
| ORM | Prisma | Schema jelas, migration mudah |
| Auth | NextAuth.js (Credentials Provider) | Simple, 1 user saja, tanpa OAuth kompleks |
| Validasi | Zod | Validasi form & API payload |
| PDF Struk | `@react-pdf/renderer` atau `pdf-lib` | Generate struk tanpa printer fisik |
| Export Excel | `exceljs` | Export laporan & backup data |
| Telegram | Telegram Bot API (fetch langsung, tanpa SDK berat) | Kirim laporan & alert stok |
| Scheduler | node-cron | Kirim rekap harian terjadwal |

> **Asumsi:** Jika ada preferensi stack lain (misal mau pakai Laravel, atau SQLite lokal tanpa server), sebutkan — blueprint ini bisa disesuaikan. Kalau tidak, agent lanjut pakai stack di atas.

## 3. Non-Functional Requirements
- Load time halaman kasir < 2 detik.
- Semua input harga/stok pakai validasi (tidak boleh negatif, tidak boleh non-angka).
- Semua endpoint API wajib auth (kecuali login).
- Data transaksi tidak boleh bisa dihapus permanen — hanya void (soft action, status berubah, history tetap ada).
- UI santai/friendly, bukan gaya korporat kaku — warna hangat, rounded corner, tidak terlalu banyak istilah teknis.

---

## 4. Database Schema (Prisma)

```prisma
// schema.prisma

model User {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  products Product[]
}

model Product {
  id               String            @id @default(cuid())
  name             String
  categoryId       String
  category         Category          @relation(fields: [categoryId], references: [id])
  unit             String            // kg, liter, pcs, dus, dst
  buyPrice         Decimal
  sellPrice        Decimal
  stock            Decimal           @default(0)
  minStock         Decimal           @default(5)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  transactionItems TransactionItem[]
  stockLogs        StockLog[]
}

model StockLog {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  type      String   // IN, OUT, ADJUSTMENT
  quantity  Decimal
  note      String?
  createdAt DateTime @default(now())
}

model Transaction {
  id             String            @id @default(cuid())
  invoiceNumber  String            @unique
  subtotal       Decimal
  discount       Decimal           @default(0)
  total          Decimal
  paidAmount     Decimal
  changeAmount   Decimal
  status         String            @default("COMPLETED") // COMPLETED, VOIDED
  voidReason     String?
  createdAt      DateTime          @default(now())
  items          TransactionItem[]
}

model TransactionItem {
  id            String      @id @default(cuid())
  transactionId String
  transaction   Transaction @relation(fields: [transactionId], references: [id])
  productId     String
  product       Product     @relation(fields: [productId], references: [id])
  quantity      Decimal
  priceAtSale   Decimal
  discount      Decimal     @default(0)
  subtotal      Decimal
}

model Debt {
  id            String   @id @default(cuid())
  customerName  String
  customerPhone String?
  amount        Decimal
  paidAmount    Decimal  @default(0)
  status        String   @default("UNPAID") // UNPAID, PARTIAL, PAID
  note          String?
  transactionId String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Settings {
  id                       String  @id @default(cuid())
  storeName                String  @default("Toko Sembako")
  telegramBotToken         String?
  telegramChatId           String?
  lowStockThresholdDefault Decimal @default(5)
  dailyReportTime          String  @default("21:00")
}
```

---

## 5. Struktur Folder

```
/app
  /(auth)
    /login/page.tsx
  /(dashboard)
    /dashboard/page.tsx
    /kasir/page.tsx
    /produk/page.tsx
    /produk/[id]/page.tsx
    /stok/page.tsx
    /bon/page.tsx
    /laporan/page.tsx
    /pengaturan/page.tsx
    layout.tsx
  /api
    /auth/[...nextauth]/route.ts
    /products/route.ts
    /products/[id]/route.ts
    /stock/route.ts
    /transactions/route.ts
    /transactions/[id]/void/route.ts
    /debts/route.ts
    /debts/[id]/route.ts
    /debts/[id]/pay/route.ts
    /reports/summary/route.ts
    /reports/export/route.ts
    /telegram/send/route.ts
    /cron/daily-report/route.ts
/components
  /ui/            (komponen shadcn)
  /kasir/         (ProductSearch, Cart, PaymentModal, ReceiptPreview)
  /produk/        (ProductForm, ProductTable, CategoryForm)
  /stok/          (StockLogTable, StockInForm, LowStockBadge)
  /bon/           (DebtTable, DebtForm, DebtPaymentModal)
  /dashboard/     (SummaryCards, LowStockAlert, RecentTransactions, QuickAddTransactionButton)
  /laporan/       (SalesChart, TopProductsTable, ExportButton)
/lib
  db.ts           (Prisma client singleton)
  auth.ts         (NextAuth config)
  telegram.ts     (helper kirim pesan ke Telegram)
  utils.ts        (format rupiah, format tanggal, generate invoice number)
  validations.ts  (Zod schemas: productSchema, transactionSchema, debtSchema, dll)
/prisma
  schema.prisma
  seed.ts         (seed 1 user + kategori default)
```

---

## 6. Service Layer / API Routes

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/auth/[...nextauth]` | Login |
| GET/POST | `/api/products` | List & create produk |
| GET/PATCH/DELETE | `/api/products/[id]` | Detail, update, hapus produk |
| POST | `/api/stock` | Stock in/out/adjustment manual |
| GET/POST | `/api/transactions` | List riwayat & buat transaksi baru |
| POST | `/api/transactions/[id]/void` | Void transaksi |
| GET/POST | `/api/debts` | List & catat bon baru |
| PATCH | `/api/debts/[id]` | Update data bon |
| POST | `/api/debts/[id]/pay` | Bayar cicilan/lunas bon |
| GET | `/api/reports/summary` | Data untuk dashboard & laporan |
| GET | `/api/reports/export` | Export Excel |
| POST | `/api/telegram/send` | Kirim pesan manual ke Telegram |
| GET | `/api/cron/daily-report` | Dipanggil scheduler, kirim rekap harian |

---

## 7. Execution Roadmap

### Milestone 0 — Setup & Arsitektur

**TASK-001: Inisialisasi Project**
- Objective: Setup project Next.js + TypeScript + Tailwind + shadcn/ui + node-cron siap pakai.
- Technical Steps:
  1. `npx create-next-app@latest kasir-sembako --typescript --tailwind --app`
  2. Install shadcn/ui, init, tambah komponen dasar (button, input, table, dialog, card, badge)
  3. Install `node-cron` untuk scheduler
  4. Setup ESLint + Prettier
  5. Buat struktur folder sesuai Bagian 5
- Prompt for Dev Agent:
  > "Buat project Next.js 14 App Router dengan TypeScript, Tailwind CSS, dan shadcn/ui. Install library tambahan: node-cron (untuk scheduler cron job). Tambahkan komponen shadcn: button, input, table, dialog, card, badge, form. Buat struktur folder sesuai: /app, /components, /lib, /prisma seperti didefinisikan di blueprint ini. Pastikan project bisa `npm run dev` tanpa error."
- DoD: Project jalan di localhost, struktur folder sesuai, tidak ada error/warning build, node-cron berhasil diinstall.

**TASK-002: Setup Database & Prisma**
- Objective: Koneksi ke PostgreSQL dan schema Prisma siap migrate.
- Technical Steps:
  1. Install Prisma, init `prisma/schema.prisma` dengan model di Bagian 4
  2. Setup `.env` dengan `DATABASE_URL`
  3. Jalankan `npx prisma migrate dev --name init`
  4. Buat `lib/db.ts` singleton Prisma Client
- Prompt for Dev Agent:
  > "Setup Prisma dengan PostgreSQL. Gunakan schema.prisma persis seperti di Bagian 4 blueprint (model User, Category, Product, StockLog, Transaction, TransactionItem, Debt, Settings). Jalankan migration awal dan buat singleton PrismaClient di lib/db.ts agar tidak multiple instance saat dev."
- DoD: `npx prisma studio` bisa buka semua tabel tanpa error.

**TASK-003: Seed Data Awal**
- Objective: Ada 1 user login default + beberapa kategori default.
- Technical Steps:
  1. Buat `prisma/seed.ts`: 1 user (username/password default), kategori (Sembako, Minuman, Snack, Rokok, Lainnya)
  2. Hash password pakai bcrypt
  3. Daftarkan seed script di `package.json`
- Prompt for Dev Agent:
  > "Buat prisma/seed.ts yang membuat 1 user default (username: admin, password di-hash dengan bcrypt) dan 5 kategori produk default: Sembako, Minuman, Snack, Rokok, Lainnya. Daftarkan script `prisma db seed` di package.json."
- DoD: `npx prisma db seed` berhasil, data muncul di Prisma Studio.

---

### Milestone 1 — Autentikasi

**TASK-004: Setup NextAuth Credentials**
- Objective: Login dengan username & password, session protect semua halaman dashboard.
- Technical Steps:
  1. Install `next-auth`, setup Credentials Provider di `lib/auth.ts`
  2. Buat route `/api/auth/[...nextauth]/route.ts`
  3. Buat middleware untuk proteksi route `/(dashboard)/*`
  4. Buat halaman `/login` dengan form sederhana
- Prompt for Dev Agent:
  > "Implementasikan NextAuth.js dengan Credentials Provider di lib/auth.ts. Validasi username & password terhadap tabel User (bandingkan password hash pakai bcrypt.compare). Buat middleware.ts yang redirect ke /login jika belum login saat akses route group (dashboard). Buat halaman login sederhana dengan form username & password, tampilkan error jika salah."
- DoD: Tidak bisa akses `/dashboard`, `/kasir`, dll tanpa login. Login sukses redirect ke `/dashboard`.

---

### Milestone 2 — Manajemen Produk & Kategori

**TASK-005: API CRUD Produk**
- Objective: Endpoint create/read/update/delete produk & kategori.
- Technical Steps:
  1. Buat Zod schema `productSchema` di `lib/validations.ts`
  2. Implementasikan `GET/POST /api/products` dan `GET/PATCH/DELETE /api/products/[id]`
  3. Validasi harga & stok tidak boleh negatif
- Prompt for Dev Agent:
  > "Buat API routes untuk CRUD Product di /api/products dan /api/products/[id]. Gunakan Prisma dan validasi payload dengan Zod (nama wajib, harga beli & jual harus angka positif, kategori wajib ada). Sertakan endpoint untuk list kategori juga."
- DoD: Bisa create/update/delete produk via Postman/Thunder Client, validasi error muncul kalau data invalid.

**TASK-006: Halaman Manajemen Produk**
- Objective: UI untuk lihat, tambah, edit, hapus produk.
- Technical Steps:
  1. Halaman `/produk`: table produk (nama, kategori, harga, stok), search & filter kategori
  2. Modal/form tambah & edit produk (`ProductForm.tsx`)
  3. Konfirmasi sebelum hapus produk
  4. Badge "stok menipis" di row produk yang stok < minStock
- Prompt for Dev Agent:
  > "Buat halaman /produk yang menampilkan tabel semua produk (nama, kategori, harga beli, harga jual, stok, satuan) dengan search bar dan filter kategori. Tambahkan tombol 'Tambah Produk' yang membuka dialog form (nama, kategori, unit, harga beli, harga jual, stok awal, min stok). Tampilkan badge merah 'Stok Menipis' jika stok < minStock. Sertakan aksi edit & hapus per row dengan konfirmasi dialog sebelum hapus."
- DoD: CRUD produk berfungsi penuh dari UI, badge stok menipis muncul dengan benar.

**TASK-007: Manajemen Kategori**
- Objective: CRUD kategori sederhana (bisa dari halaman produk atau pengaturan).
- Technical Steps:
  1. Tambah dialog kelola kategori di halaman `/produk`
  2. API sudah dibuat di TASK-005, tinggal koneksi UI
- Prompt for Dev Agent:
  > "Tambahkan fitur kelola kategori (tambah/edit/hapus) dalam bentuk dialog terpisah yang bisa dibuka dari halaman /produk. Kategori dipakai sebagai dropdown saat tambah/edit produk."
- DoD: Kategori baru langsung muncul di dropdown form produk tanpa reload manual.

---

### Milestone 3 — Manajemen Stok

**TASK-008: API Stock In/Out**
- Objective: Endpoint untuk catat stok masuk/keluar/adjustment manual, otomatis update stok produk.
- Technical Steps:
  1. `POST /api/stock`: terima productId, type (IN/OUT/ADJUSTMENT), quantity, note
  2. Update `Product.stock` sesuai type dalam 1 transaction Prisma (`$transaction`)
  3. Simpan record di `StockLog`
- Prompt for Dev Agent:
  > "Buat API POST /api/stock yang menerima productId, type (IN/OUT/ADJUSTMENT), quantity, note. Gunakan prisma.$transaction untuk update Product.stock (tambah jika IN, kurangi jika OUT, set langsung jika ADJUSTMENT) sekaligus insert record baru ke StockLog. Validasi stok tidak boleh minus setelah OUT."
- DoD: Stok produk berubah sesuai type, riwayat tercatat di StockLog, tidak bisa jadi minus.

**TASK-009: Halaman Riwayat & Input Stok**
- Objective: UI untuk restock manual dan lihat riwayat perubahan stok.
- Technical Steps:
  1. Halaman `/stok`: form cepat stock in/out per produk
  2. Table riwayat StockLog (produk, type, qty, note, tanggal)
- Prompt for Dev Agent:
  > "Buat halaman /stok dengan form untuk mencatat stok masuk/keluar (pilih produk, jenis, jumlah, catatan opsional) yang memanggil API POST /api/stock. Di bawah form, tampilkan tabel riwayat StockLog terbaru (produk, tipe, jumlah, catatan, tanggal), diurutkan dari terbaru."
- DoD: Restock manual langsung update stok produk & muncul di riwayat.

---

### Milestone 4 — Modul Kasir / Transaksi

**TASK-010: API Buat Transaksi**
- Objective: Endpoint create transaksi lengkap dengan item, hitung total, kurangi stok otomatis.
- Technical Steps:
  1. `POST /api/transactions`: terima array items (productId, qty, discount), overall discount, paidAmount
  2. Hitung subtotal per item, total, kembalian
  3. Generate `invoiceNumber` (misal format `INV-YYYYMMDD-0001`)
  4. Dalam 1 `$transaction`: insert Transaction + TransactionItem, kurangi stok tiap produk, insert StockLog type OUT
  5. Validasi stok cukup sebelum transaksi diproses
- Prompt for Dev Agent:
  > "Buat API POST /api/transactions. Input: array items [{productId, quantity, discount}], discount keseluruhan, paidAmount. Di dalam prisma.$transaction: hitung subtotal tiap item (harga jual saat itu dikurangi diskon), total keseluruhan, changeAmount = paidAmount - total. Generate invoiceNumber format INV-YYYYMMDD-XXXX (increment harian). Simpan Transaction + TransactionItem, kurangi stok tiap Product, dan insert StockLog type OUT untuk tiap item. Kembalikan error jika stok produk tidak cukup, jangan lanjutkan transaksi."
- DoD: Transaksi tersimpan, stok berkurang sesuai, invoice number unik & berurutan per hari.

**TASK-011: UI Kasir — Cart & Product Search**
- Objective: Halaman kasir cepat: cari produk, tambah ke keranjang, atur qty & diskon.
- Technical Steps:
  1. Search bar produk (nama), klik untuk tambah ke cart
  2. Cart: list item, qty +/-, diskon per item, subtotal live
  3. Ringkasan: subtotal, diskon keseluruhan, total
- Prompt for Dev Agent:
  > "Buat halaman /kasir dengan search bar produk (real-time filter by nama). Klik hasil pencarian menambahkan produk ke cart di sisi kanan. Cart menampilkan list item dengan qty (bisa +/- atau input manual), diskon per item, dan subtotal per baris yang update live. Di bawah cart tampilkan ringkasan: subtotal, input diskon keseluruhan, dan total akhir."
- DoD: Cart update real-time, kalkulasi subtotal & total akurat.

**TASK-012: UI Kasir — Pembayaran & Struk**
- Objective: Modal pembayaran (input uang diterima, hitung kembalian), lalu generate struk PDF.
- Technical Steps:
  1. Modal "Bayar": input paidAmount, tampilkan kembalian real-time, tombol konfirmasi
  2. Setelah konfirmasi, call API `POST /api/transactions`
  3. Tampilkan preview struk (bisa print via browser / download PDF pakai `@react-pdf/renderer`)
- Prompt for Dev Agent:
  > "Buat modal pembayaran di halaman kasir: input jumlah uang diterima, tampilkan kembalian otomatis (paidAmount - total), tombol 'Selesaikan Transaksi' yang memanggil POST /api/transactions. Setelah sukses, tampilkan preview struk (nama toko, tanggal, list item, subtotal, diskon, total, bayar, kembalian, invoice number) dengan opsi 'Cetak/Download PDF' menggunakan @react-pdf/renderer atau window.print()."
- DoD: Transaksi selesai → cart kosong otomatis → struk bisa dicetak/download dengan data akurat.

**TASK-013: Void Transaksi**
- Objective: Bisa membatalkan transaksi (dari riwayat), stok dikembalikan.
- Technical Steps:
  1. Halaman riwayat transaksi (bisa di `/kasir` tab riwayat atau `/laporan`)
  2. Tombol void per transaksi + input alasan
  3. `POST /api/transactions/[id]/void`: ubah status jadi VOIDED, kembalikan stok, insert StockLog type IN dengan note "Void transaksi #invoice"
- Prompt for Dev Agent:
  > "Buat API POST /api/transactions/[id]/void yang menerima voidReason. Ubah status Transaction jadi VOIDED, kembalikan stok tiap produk terkait (insert StockLog type IN dengan note referensi invoice), dan simpan voidReason. Buat UI tombol 'Void' di riwayat transaksi dengan dialog konfirmasi + input alasan wajib diisi."
- DoD: Transaksi ter-void, stok kembali, riwayat tetap menampilkan transaksi (status VOIDED, bukan terhapus).

---

### Milestone 5 — Modul Bon (Utang Piutang)

**TASK-014: API CRUD Bon**
- Objective: Catat, lihat, update status bon pelanggan.
- Technical Steps:
  1. `GET/POST /api/debts`, `PATCH /api/debts/[id]`
  2. `POST /api/debts/[id]/pay`: tambah paidAmount, update status (UNPAID/PARTIAL/PAID otomatis berdasarkan paidAmount vs amount)
- Prompt for Dev Agent:
  > "Buat API CRUD untuk model Debt di /api/debts (create, list) dan /api/debts/[id] (update). Buat juga POST /api/debts/[id]/pay yang menerima nominal pembayaran, menambah ke paidAmount, dan otomatis update status: PAID jika paidAmount >= amount, PARTIAL jika sebagian, UNPAID jika 0."
- DoD: Status bon berubah otomatis sesuai pembayaran, tidak bisa overpay melebihi total utang (atau bisa, tapi ditandai lunas + kembalian dicatat di note).

**TASK-015: Halaman Bon**
- Objective: UI catat bon baru & lihat daftar bon dengan status.
- Technical Steps:
  1. Table daftar bon (nama pelanggan, jumlah, terbayar, sisa, status)
  2. Form tambah bon baru
  3. Modal bayar cicilan/lunas
- Prompt for Dev Agent:
  > "Buat halaman /bon menampilkan tabel semua catatan bon (nama pelanggan, no HP opsional, jumlah utang, sudah dibayar, sisa, status badge UNPAID/PARTIAL/PAID). Tambahkan tombol 'Catat Bon Baru' (form: nama, no HP opsional, jumlah, catatan) dan tombol 'Bayar' per row yang membuka modal input nominal pembayaran, memanggil POST /api/debts/[id]/pay."
- DoD: Bon baru tercatat, pembayaran cicilan update sisa & status dengan benar.

**TASK-016: Bon dari Transaksi Kasir (opsional link)**
- Objective: Saat transaksi di kasir, ada opsi "Bayar sebagian, sisanya jadi bon".
- Technical Steps:
  1. Di modal pembayaran kasir, tambah opsi "Catat sisa sebagai bon" jika paidAmount < total
  2. Saat konfirmasi, buat Transaction + Debt sekaligus (link via transactionId)
- Prompt for Dev Agent:
  > "Di modal pembayaran halaman kasir, tambahkan checkbox 'Catat sisa sebagai bon' yang muncul jika paidAmount kurang dari total. Jika dicentang, minta input nama pelanggan, lalu saat submit buat Transaction seperti biasa DAN buat record Debt baru dengan amount = total - paidAmount, transactionId = id transaksi terkait."
- DoD: Transaksi dengan pembayaran kurang otomatis muncul di halaman /bon dengan sisa yang benar.

---

### Milestone 6 — Dashboard

**TASK-017: API Ringkasan Dashboard**
- Objective: Endpoint data agregat untuk dashboard.
- Technical Steps:
  1. `GET /api/reports/summary`: omzet hari ini, jumlah transaksi hari ini, list produk stok kritis, 5 transaksi terakhir
- Prompt for Dev Agent:
  > "Buat API GET /api/reports/summary yang mengembalikan: total omzet hari ini (sum Transaction.total dimana status COMPLETED dan createdAt hari ini), jumlah transaksi hari ini, list produk dengan stock < minStock, dan 5 transaksi terakhir (invoice, total, waktu)."
- DoD: Response API sesuai kebutuhan dashboard, angka omzet akurat dibanding data manual.

**TASK-018: Halaman Dashboard**
- Objective: Halaman utama setelah login, ringkasan + akses cepat kasir.
- Technical Steps:
  1. Card: Omzet Hari Ini, Jumlah Transaksi, Jumlah Produk Stok Kritis
  2. List stok kritis (nama produk, sisa stok)
  3. List 5 transaksi terakhir
  4. **Tombol besar "+ Tambah Transaksi"** yang langsung navigasi ke `/kasir`
- Prompt for Dev Agent:
  > "Buat halaman /dashboard sebagai landing page setelah login. Tampilkan summary cards (Omzet Hari Ini, Jumlah Transaksi Hari Ini, Jumlah Produk Stok Kritis) menggunakan data dari GET /api/reports/summary. Di bawahnya tampilkan list produk stok kritis dan tabel 5 transaksi terakhir. Tambahkan tombol besar dan mencolok '+ Tambah Transaksi' di bagian atas halaman (misal pojok kanan atas atau floating action button) yang mengarahkan ke halaman /kasir."
- DoD: Dashboard menampilkan data real dari database, tombol tambah transaksi langsung membuka halaman kasir.

---

### Milestone 7 — Laporan & Export Excel

**TASK-019: API Laporan Penjualan**
- Objective: Data laporan harian/mingguan/bulanan, produk terlaris, keuntungan.
- Technical Steps:
  1. `GET /api/reports/summary?range=daily|weekly|monthly`
  2. Query total penjualan per periode, group by produk untuk terlaris, hitung profit (sellPrice - buyPrice) * qty terjual
- Prompt for Dev Agent:
  > "Extend API /api/reports/summary dengan query param range (daily/weekly/monthly). Kembalikan: total penjualan per periode, top 5 produk terlaris (berdasarkan quantity terjual dari TransactionItem), dan total keuntungan (sum dari (priceAtSale - Product.buyPrice) * quantity untuk transaksi status COMPLETED dalam periode tersebut)."
- DoD: Data laporan akurat untuk ketiga range, keuntungan terhitung benar berdasarkan harga beli saat itu.

**TASK-020: Halaman Laporan**
- Objective: UI laporan dengan filter periode, grafik, dan tabel produk terlaris.
- Technical Steps:
  1. Filter tab: Harian / Mingguan / Bulanan
  2. Chart penjualan (pakai `recharts` atau sejenis)
  3. Tabel produk terlaris & keuntungan
- Prompt for Dev Agent:
  > "Buat halaman /laporan dengan tab filter Harian/Mingguan/Bulanan. Tampilkan grafik line/bar chart penjualan menggunakan recharts, diikuti tabel produk terlaris (nama, qty terjual, total omzet) dan card total keuntungan periode tersebut."
- DoD: Grafik & tabel update sesuai filter periode yang dipilih.

**TASK-021: Export Excel & Backup**
- Objective: Export data transaksi/produk ke Excel untuk backup.
- Technical Steps:
  1. `GET /api/reports/export?type=transactions|products|debts`
  2. Generate file `.xlsx` pakai `exceljs`, return sebagai download
  3. Tombol export di halaman laporan & produk
- Prompt for Dev Agent:
  > "Buat API GET /api/reports/export dengan query param type (transactions/products/debts) yang generate file Excel menggunakan library exceljs berisi data lengkap dari tabel terkait, dan kembalikan sebagai file download (Content-Disposition attachment). Tambahkan tombol 'Export Excel' di halaman /laporan dan /produk yang memanggil endpoint ini."
- DoD: File Excel ter-download berisi data lengkap dan format rapi (header jelas, format angka rupiah).

---

### Milestone 8 — Integrasi Telegram

**TASK-022: Helper Kirim Pesan Telegram**
- Objective: Fungsi reusable untuk kirim pesan ke bot Telegram.
- Technical Steps:
  1. `lib/telegram.ts`: fungsi `sendTelegramMessage(text: string)` pakai `fetch` ke `https://api.telegram.org/bot<TOKEN>/sendMessage`
  2. Ambil token & chatId dari tabel `Settings`
- Prompt for Dev Agent:
  > "Buat lib/telegram.ts dengan fungsi sendTelegramMessage(text: string) yang mengirim POST request ke https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage dengan chat_id dan text. Ambil token dan chat_id dari tabel Settings di database. Handle error jika gagal kirim (log error, jangan crash aplikasi)."
- DoD: Fungsi bisa dites manual dan pesan sukses masuk ke chat Telegram.

**TASK-023: Halaman Pengaturan Telegram**
- Objective: Owner bisa input Bot Token & Chat ID sendiri dari UI.
- Technical Steps:
  1. Halaman `/pengaturan`: form input `telegramBotToken`, `telegramChatId`, `dailyReportTime`
  2. Tombol "Tes Kirim Pesan" untuk validasi setting
- Prompt for Dev Agent:
  > "Buat halaman /pengaturan dengan form untuk mengisi Telegram Bot Token, Telegram Chat ID, dan jam pengiriman laporan harian (dailyReportTime). Simpan ke tabel Settings. Sertakan tombol 'Tes Kirim Pesan' yang memanggil sendTelegramMessage dengan pesan test, untuk memastikan konfigurasi benar sebelum dipakai otomatis."
- DoD: Setting tersimpan, tombol tes berhasil mengirim pesan ke Telegram yang dikonfigurasi.

**TASK-024: Cron Rekap Harian & Alert Stok Menipis**
- Objective: Otomatis kirim rekap harian di jam tertentu, dan alert saat ada produk stok menipis.
- Technical Steps:
  1. Setup node-cron di aplikasi: buat file `/lib/cron.ts` yang mengatur scheduler
  2. Fungsi `dailyReportJob`: hitung omzet hari ini, jumlah transaksi, produk terlaris hari ini → format pesan → kirim via Telegram, dijalankan sesuai jam di `Settings.dailyReportTime`
  3. Trigger alert stok menipis: saat stok berubah (di TASK-008/010) langsung cek apakah stock < minStock → kirim pesan Telegram
- Prompt for Dev Agent:
  > "Setup node-cron library dan buat file lib/cron.ts. Di file tersebut, buat fungsi scheduleJobs() yang membaca Settings.dailyReportTime lalu schedule job dengan cron expression. Job ini menghitung ringkasan hari itu (omzet, jumlah transaksi, produk terlaris) dan kirimnya via sendTelegramMessage dengan format pesan rapi (pakai emoji secukupnya, contoh: 📊 Rekap Hari Ini). Panggil scheduleJobs() saat aplikasi startup (di middleware atau app.ts). Tambahkan juga logic: setiap kali stok produk berkurang (endpoint stock/transactions), cek apakah stock < minStock — jika ya, langsung panggil sendTelegramMessage dengan pesan alert stok menipis untuk produk tersebut."
- DoD: Pesan rekap harian terkirim otomatis sesuai jadwal yang dikonfigurasi, alert stok menipis terkirim saat stok produk turun di bawah ambang batas.

---

### Milestone 9 — Polish & Deployment

**TASK-025: Responsif & UI Polish**
- Objective: Pastikan semua halaman rapi di desktop & tablet (kasir sering pakai tablet/laptop kecil).
- Technical Steps:
  1. Review responsive semua halaman (grid produk, cart kasir, table)
  2. Konsisten warna, spacing, rounded corner sesuai tone santai
  3. Loading state & empty state di semua list/table
- Prompt for Dev Agent:
  > "Review seluruh halaman (dashboard, kasir, produk, stok, bon, laporan, pengaturan) untuk memastikan tampilan responsif di layar tablet (768px) dan desktop. Tambahkan loading skeleton saat fetch data dan empty state yang friendly (misal ilustrasi/teks santai) saat data kosong (belum ada produk, belum ada transaksi, dll)."
- DoD: Semua halaman terlihat rapi di ukuran layar 768px ke atas, ada loading & empty state di semua list.

**TASK-026: Testing Alur End-to-End**
- Objective: Pastikan alur utama bebas bug sebelum dipakai toko real.
- Technical Steps:
  1. Test manual: tambah produk → transaksi → stok berkurang → cek dashboard → cek laporan
  2. Test: transaksi kurang bayar → jadi bon → bayar cicilan → lunas
  3. Test: void transaksi → stok kembali
  4. Test: laporan harian terkirim ke Telegram
- Prompt for Dev Agent:
  > "Lakukan testing manual end-to-end untuk skenario berikut dan catat bug yang ditemukan: (1) tambah produk baru lalu lakukan transaksi kasir, pastikan stok berkurang & muncul di dashboard/laporan; (2) transaksi dengan bayar kurang dari total, pastikan tercatat sebagai bon, lalu lakukan pembayaran cicilan hingga lunas; (3) void sebuah transaksi, pastikan stok kembali; (4) trigger endpoint cron daily-report manual dan pastikan pesan masuk ke Telegram dengan data yang benar."
- DoD: Semua skenario di atas berjalan tanpa error, data konsisten di semua halaman terkait.

**TASK-027: Deployment**
- Objective: App live dan bisa diakses owner toko (deployment ke server pilihan).
- Technical Steps:
  1. Setup database production (PostgreSQL).
  2. Setup server (bisa VPS, Docker, atau server lain sesuai pilihan).
  3. Set environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, dll).
  4. Jalankan migration production.
- Prompt for Dev Agent:
  > "Persiapkan deployment aplikasi (tanpa Vercel): (1) Setup database PostgreSQL production, (2) Siapkan environment variable di server production (.env.production dengan DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, dan konfigurasi Telegram), (3) Jalankan `npm run build` dan verifikasi build sukses, (4) Jalankan `npx prisma migrate deploy` untuk apply schema ke database production, (5) Jalankan seed sekali untuk membuat user admin awal, (6) Start aplikasi di server dengan `npm run start` atau sesuai setup deployment pilihan (Docker, PM2, systemd, dll)."
- DoD: App bisa diakses dari server production, login berhasil, transaksi & laporan berfungsi normal, cron job daily report dan alert stok menjalankan dengan lancar.

---

## 8. Definition of Done (Keseluruhan Proyek)
- [ ] Semua 27 task di atas selesai & lolos DoD masing-masing
- [ ] Owner bisa login, transaksi, kelola produk/stok, catat bon, lihat dashboard & laporan tanpa bantuan developer
- [ ] Rekap harian & alert stok menipis rutin masuk ke Telegram
- [ ] Data bisa di-export ke Excel sebagai backup
- [ ] Tidak ada data transaksi yang hilang/terhapus permanen (hanya void)

## 9. Urutan Eksekusi yang Disarankan
`M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9`
(Setiap milestone bergantung pada schema & API dari milestone sebelumnya — jangan loncat, terutama M0-M1 harus solid dulu sebelum lanjut fitur.)
