# Setup Instructions

> [!IMPORTANT]
> **Migrasi Backend:** Aplikasi ini telah dimigrasi dari Firebase ke **PocketBase** untuk performa yang lebih baik dan kemudahan penggunaan secara lokal.

## 1. Setup Backend (PocketBase)

Silakan ikuti panduan lengkap pengaturan database di file terpisah:
👉 **[POCKETBASE_SETUP.md](file:///c:/Users/rikza/Documents/development/invesmentplan/POCKETBASE_SETUP.md)**

## 2. Install Dependencies

Gunakan `pnpm` atau `npm` untuk menginstall dependencies:

```bash
pnpm install
# atau
npm install
```

## 3. Environment Variables

Buat file `.env.local` di root project dengan isi:

```env
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```


## 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Catatan Penting

### Harga Emas

Aplikasi saat ini menggunakan harga emas perkiraan (sekitar 965,000 IDR/gram). Untuk harga emas real-time yang lebih akurat, Anda bisa:

1. Menggunakan API berbayar seperti [metals-api.com](https://metals-api.com/)
2. Atau menggunakan API gratis lainnya

Untuk mengupdate, edit file `app/api/prices/route.ts` dan uncomment bagian API emas.

### Harga BTC

Aplikasi menggunakan CoinGecko API (gratis) untuk mendapatkan harga BTC real-time dalam IDR.

## Troubleshooting

### Error: PocketBase not initialized
- Pastikan PocketBase sedang berjalan (`./pocketbase.exe serve`)
- Pastikan file `.env.local` sudah dibuat dengan URL yang benar
- Restart development server setelah membuat `.env.local`

### Error: PocketBase permission denied (403)
- Pastikan semua **API Rules** di koleksi `investments` sudah dikosongkan (blank) di Admin UI.

### Harga tidak update
- Pastikan koneksi internet aktif.
- API koin (CoinGecko) memiliki rate limit, tunggu beberapa saat jika error.

