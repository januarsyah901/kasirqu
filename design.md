# Design Document — Aplikasi Kasir (POS System)

## 1. Overview

Aplikasi kasir berbasis desktop/tablet untuk toko retail (minimarket/warung). Fokus utama: transaksi cepat, layout 3-kolom yang jelas antara navigasi, katalog produk, dan keranjang belanja.

**Target device:** Desktop / Tablet landscape (min width 1280px)
**Tema:** Flat design, warna solid, kontras tinggi, border tebal (neo-brutalist style)

---

## 2. Layout Structure

Layout dibagi menjadi **3 kolom utama**:

```
┌──────────┬────────────────────────────┬──────────────┐
│          │  Search Bar        [SCAN]  │  KERANJANG   │
│ SIDEBAR  ├────────────────────────────┤              │
│  (Nav)   │  Kategori Filter (pills)   │  List Item   │
│          ├────────────────────────────┤              │
│  ~200px  │                            │              │
│          │   Grid Produk (4 kolom)    │  ───────     │
│          │                            │  Subtotal    │
│          │                            │  Diskon      │
│          │                            │  TOTAL       │
│          ├────────────────────────────┤              │
│          │      Pagination            │  [BAYAR]     │
│          │                            │  [SIMPAN]    │
│ [Kasir]  │                            │  [CETAK]     │
└──────────┴────────────────────────────┴──────────────┘
```

- **Kolom kiri (Sidebar):** fixed width ±200px, full height
- **Kolom tengah (Katalog):** flexible/fluid width, scrollable grid produk
- **Kolom kanan (Keranjang):** fixed width ±350–400px, full height

---

## 3. Color Palette

| Nama | Hex (approx) | Penggunaan |
|---|---|---|
| Primary Blue | `#1E3FCF` / `#1D4ED8` | Sidebar background, tombol Bayar, harga produk, total |
| Accent Yellow | `#FFD400` | Menu aktif (Penjualan), highlight state aktif |
| Success Green | `#22C55E` | Tombol "Semua" kategori aktif, status online, pagination aktif |
| Danger Red | `#EF4444` | Tombol hapus (X), Kosongkan keranjang |
| Base White | `#FFFFFF` | Background utama, card produk |
| Base Black | `#111111` | Border, teks utama |
| Neutral Gray | `#F3F4F6` | Background input, placeholder |

**Card produk** memakai warna pastel background bergantian per kategori (biru muda, oranye muda, kuning, hijau muda, ungu muda, pink muda) — untuk membedakan visual tanpa mengandalkan teks.

---

## 4. Typography

- **Font:** Sans-serif tebal (contoh: Inter / Poppins Bold untuk heading, Regular untuk body)
- **Heading sidebar/logo:** Bold, ~24px, uppercase (KASIR)
- **Nama produk:** Semi-bold, ~16px
- **Harga produk:** Bold, ~16px, warna putih di atas background biru
- **Label tombol:** Bold, uppercase, ~14px

---

## 5. Component Breakdown

### 5.1 Sidebar (Navigasi Kiri)
- Logo/Title "KASIR" di atas
- Menu list vertikal dengan icon + label:
  - Penjualan (active state → background kuning)
  - Riwayat
  - Produk
  - Pelanggan
  - Laporan
  - Pengaturan
  - Logout
- Footer: profil kasir aktif (avatar, nama "Kasir 01", status "Online" dengan dot hijau)
- Semua menu default berbackground putih dengan border hitam, kecuali item aktif (kuning)

### 5.2 Top Bar (Kolom Tengah — Atas)
- **Search input** full width dengan icon kaca pembesar, placeholder "Cari produk..."
- **Tombol SCAN** di kanan search bar, background biru, icon barcode, teks putih

### 5.3 Kategori Filter
- Baris pill/button horizontal: Semua, Makanan, Minuman, Snack, Kebutuhan, Lainnya
- State aktif ("Semua") → background hijau, teks putih
- State non-aktif → putih dengan border hitam

### 5.4 Grid Produk
- Grid 4 kolom x 3 baris per halaman (12 produk/page)
- Tiap card produk terdiri dari:
  - Ilustrasi/icon produk (area atas, background pastel sesuai kategori)
  - Nama produk (area tengah, background putih)
  - Harga (area bawah, background biru, teks putih, bold)
- Card memakai border hitam tebal, tanpa shadow (flat style)
- Klik card → tambah ke keranjang

### 5.5 Pagination
- Tombol prev (‹) / next (›)
- Nomor halaman sebagai kotak, halaman aktif berwarna hijau

### 5.6 Keranjang (Kolom Kanan)
- Header: "KERANJANG" + tombol "Kosongkan" (merah, icon trash)
- List item keranjang, tiap item menampilkan:
  - Nama produk + harga total (kanan atas)
  - Quantity stepper: tombol (–), input angka, tombol (+)
  - Tombol hapus item (X, merah) di ujung kanan
- Divider garis horizontal antar item

### 5.7 Ringkasan Pembayaran (Bawah Keranjang)
- Subtotal (kiri: label, kanan: nominal)
- Diskon (input angka di tengah + nominal hasil di kanan)
- **TOTAL** — ditonjolkan lebih besar, nominal dengan background hijau/pill
- Tombol aksi (stack vertikal):
  - **BAYAR** — primary button biru besar, shortcut `F9`
  - **SIMPAN** — secondary outline, shortcut `F5`
  - **CETAK STRUK** — secondary outline, shortcut `F7`
  - **TUNDA TRANSAKSI** — secondary outline full width, shortcut `F6`

---

## 6. Interaction & States

| Elemen | Default | Hover | Active/Selected |
|---|---|---|---|
| Menu sidebar | Putih border hitam | Sedikit gelap/gray | Kuning (Penjualan) |
| Kategori pill | Putih border hitam | Sedikit gelap | Hijau + teks putih |
| Card produk | Border hitam | Scale up ringan / border biru | — (langsung trigger add to cart) |
| Qty stepper (+/-) | Putih border hitam | Gelap ringan | — |
| Tombol Bayar | Biru solid | Biru lebih gelap | Disabled jika keranjang kosong |
| Pagination number | Putih | Gray | Hijau (halaman aktif) |

**Keyboard shortcuts** (ditampilkan langsung di tombol):
- `F5` Simpan transaksi
- `F6` Tunda transaksi
- `F7` Cetak struk
- `F9` Bayar

---

## 7. Data Model (Ringkas)

```
Produk {
  id, nama, harga, kategori, stok, gambar
}

CartItem {
  produk_id, nama, harga_satuan, qty, subtotal
}

Transaksi {
  id, tanggal, kasir_id, items[], subtotal, diskon, total, metode_bayar, status
}
```

---

## 8. Responsive Notes

- Minimum lebar layar: 1280px (desktop/tablet POS device)
- Sidebar bisa collapse jadi icon-only di layar < 1366px
- Grid produk menyesuaikan jadi 3 kolom bila lebar tengah menyempit
- Keranjang tetap fixed width & selalu visible (tidak boleh hidden, karena kasir butuh akses cepat)

---

## 9. Accessibility

- Kontras warna tinggi (border hitam tebal di semua elemen) → mudah dibaca di kondisi cahaya toko yang bervariasi
- Tombol besar & touch-friendly (untuk POS layar sentuh)
- Status "Online" pakai indikator warna + teks, bukan warna saja
