# Setup PocketBase untuk Local Development

PocketBase adalah backend yang sangat ringan dan bisa dijalankan secara lokal. Ini akan menggantikan Firebase untuk menghemat penyimpanan.

## 1. Download PocketBase

### Windows:
1. Download dari: https://pocketbase.io/docs/
2. Atau langsung download: https://github.com/pocketbase/pocketbase/releases/latest
3. Pilih file untuk Windows (misalnya: `pocketbase_X.X.X_windows_amd64.zip`)
4. Extract file `pocketbase.exe` ke folder project Anda atau folder terpisah

### Alternatif dengan pnpm (jika tersedia):
```bash
# Install PocketBase secara global (opsional)
pnpm add -g pocketbase
```

## 2. Setup PocketBase

1. **Jalankan PocketBase:**
   ```bash
   # Jika di folder project
   ./pocketbase.exe serve
   
   # Atau jika di path terpisah
   C:\path\to\pocketbase.exe serve
   ```

2. **Akses Admin UI:**
   - Buka browser ke: http://127.0.0.1:8090/_/
   - Buat admin account pertama kali (email & password)

## 3. Buat Collection "investments"

1. Di PocketBase Admin UI, klik **Collections**
2. Klik **New Collection**
3. Nama collection: `investments`
4. Klik **Create**

### Tambahkan Fields:

1. **date** (Text)
   - Type: Text
   - Required: Yes

2. **coinSymbol** (Text)
   - Type: Text
   - Required: Yes
   - Default: `btc`

3. **amount** (Number)
   - Type: Number
   - Required: Yes
   - Min: 0

4. **price** (Number)
   - Type: Number
   - Required: Yes
   - Min: 0

5. **quantity** (Number)
   - Type: Number
   - Required: Yes
   - Min: 0

> [!NOTE]
> Fields `btcAmount`, `btcPrice`, dan `btcQuantity` tetap dipertahankan untuk kompatibilitas data lama, tetapi data baru akan disimpan di field generic di atas.


### Set Collection Rules (PENTING!):

1. Klik tab **API Rules** di collection `investments`
2. **PENTING:** Untuk development, kosongkan SEMUA rules agar bisa akses tanpa authentication:
   - **List/Search rule:** (kosongkan - biarkan blank)
   - **View rule:** (kosongkan - biarkan blank)
   - **Create rule:** (kosongkan - biarkan blank)
   - **Update rule:** (kosongkan - biarkan blank)
   - **Delete rule:** (kosongkan - biarkan blank)

3. Klik **Save** setelah mengosongkan semua rules

**Catatan:**
- Rules kosong = akses penuh untuk semua orang (hanya untuk development!)
- Jika rules tidak dikosongkan, akan muncul error 403 "Only superusers can perform this action"
- Untuk production, gunakan authentication dengan rules yang sesuai

## 4. Update Environment Variables

Buat atau update file `.env.local`:

```env
# PocketBase Configuration
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

## 5. Jalankan Aplikasi

1. **Terminal 1 - Jalankan PocketBase:**
   ```bash
   ./pocketbase.exe serve
   ```

2. **Terminal 2 - Jalankan Next.js:**
   ```bash
   pnpm dev
   ```

## 6. Migrasi Data dari Firebase (Opsional)

Jika Anda punya data di Firebase yang ingin dipindahkan:

1. Export data dari Firebase Console
2. Import ke PocketBase melalui Admin UI atau API

## Troubleshooting

### PocketBase tidak bisa dijalankan
- Pastikan port 8090 tidak digunakan aplikasi lain
- Cek firewall settings
- Coba jalankan dengan `--http=127.0.0.1:8091` untuk port berbeda

### Error "Collection not found"
- Pastikan collection `investments` sudah dibuat
- Pastikan nama collection tepat: `investments` (lowercase)

### Error "Failed to fetch"
- Pastikan PocketBase sedang berjalan
- Cek URL di `.env.local` sudah benar
- Cek CORS settings di PocketBase (default sudah allow all untuk development)

## Keuntungan PocketBase

✅ **Gratis** - Tidak ada limit penyimpanan  
✅ **Local** - Data tersimpan di komputer Anda  
✅ **Ringan** - Hanya beberapa MB  
✅ **Real-time** - Support real-time subscriptions  
✅ **Admin UI** - Interface untuk manage data  
✅ **REST API** - Standard REST API  

## Data Location

Data PocketBase tersimpan di folder `pb_data` di lokasi dimana Anda menjalankan `pocketbase.exe`.

**Backup data:** Copy folder `pb_data` untuk backup.

