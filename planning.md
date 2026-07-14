# Planning: Aplikasi Kasir Toko Sembako

## 1. Ringkasan
Web app kasir untuk toko sembako milik sendiri (single-store). Fokus: transaksi cepat, kontrol stok, catat utang pelanggan, dan laporan otomatis ke Telegram. Tidak ada multi-tenant, tidak ada integrasi payment gateway/printer khusus, hanya 1 role user (kasir/owner, akses penuh).

## 2. Target Pengguna
- Pemilik toko sembako yang merangkap sebagai kasir.
- Tidak ada pembedaan hak akses (role tunggal, semua fitur bisa diakses).

## 3. Platform & Tech Constraints
- Web app (bisa diakses dari browser, desktop/tablet di meja kasir).
- Terhubung internet (untuk kirim laporan ke Telegram).
- Belum ada preferensi stack spesifik — bisa disesuaikan saat tahap development.

## 4. Fitur (MVP)

### 4.1 Transaksi & Kasir
- Input transaksi cepat (cari produk manual, tanpa scanner)
- Keranjang belanja + hitung kembalian otomatis
- Diskon per item / per transaksi
- Void/batal transaksi
- Cetak/preview struk (PDF, tanpa printer khusus)
- Riwayat transaksi harian

### 4.2 Manajemen Produk & Stok
- CRUD produk (nama, kategori, harga beli, harga jual, satuan)
- Stok otomatis berkurang saat transaksi
- Alert stok menipis
- Riwayat stock in/out (restock manual)
- Kategori produk (sembako, minuman, snack, dll)
- Satuan variatif (kg, liter, pcs, dus)

### 4.3 Laporan & Telegram
- Laporan penjualan harian/mingguan/bulanan
- Laporan produk terlaris
- Laporan keuntungan (harga jual - harga beli)
- Auto-kirim rekap harian ke Telegram (dijadwalkan, misal jam tutup toko)
- Notif stok menipis ke Telegram
- ~~Notif real-time tiap transaksi~~ (tidak dipakai, terlalu ramai)

### 4.4 User & Akses
- Single role: kasir = owner, akses penuh ke semua fitur (transaksi, stok, laporan, keuntungan)
- Login sederhana (1 akun, tanpa manajemen multi-user)

### 4.5 Utang/Piutang (Bon)
- Catat utang pelanggan (nama, jumlah, tanggal, item jika perlu)
- Tandai lunas manual
- ~~Reminder pelunasan otomatis~~ (tidak dipakai)

### 4.6 Dashboard
- Ringkasan omzet hari ini
- Transaksi terakhir
- Stok kritis (menipis)
- **Tombol "Tambah Transaksi"** langsung dari dashboard (akses cepat ke kasir)

### 4.7 Lain-lain
- Backup data / export ke Excel

## 5. Out of Scope (Fase Ini)
- Multi-tenant / multi-toko
- Multi-role & manajemen hak akses berjenjang
- Integrasi payment gateway (QRIS, dll)
- Integrasi printer struk fisik
- Integrasi barcode scanner
- Notifikasi real-time per transaksi
- Reminder pelunasan otomatis

## 6. UI/UX Notes
- Gaya santai, tidak kaku — cocok dipakai kasir toko sehari-hari, bukan tampilan korporat.
- Prioritas: alur transaksi harus cepat dan minim klik.
- Dashboard jadi halaman utama saat buka app, dengan akses cepat ke transaksi baru.

## 7. Next Steps
- [ ] Tentukan tech stack (frontend, backend, database)
- [ ] Desain skema database (produk, transaksi, stok, utang, user)
- [ ] Setup bot Telegram untuk laporan otomatis
- [ ] Wireframe halaman: Dashboard, Kasir, Produk/Stok, Bon, Laporan
- [ ] Bangun MVP bertahap: Kasir → Stok → Bon → Laporan Telegram
