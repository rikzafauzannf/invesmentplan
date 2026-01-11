# Cara Mengosongkan Rules di PocketBase (PENTING!)

Error **403 "Only superusers can perform this action"** terjadi karena collection rules belum dikosongkan.

## Langkah-langkah:

1. **Buka PocketBase Admin UI:**
   - Buka browser ke: http://127.0.0.1:8090/_/
   - Login dengan admin account Anda

2. **Buka Collection "investments":**
   - Klik menu **Collections** di sidebar kiri
   - Klik collection **investments**

3. **Klik Tab "API Rules":**
   - Di bagian atas, klik tab **API Rules**
   - Anda akan melihat 5 rules:
     - List/Search rule
     - View rule
     - Create rule
     - Update rule
     - Delete rule

4. **Kosongkan SEMUA Rules:**
   - **Hapus semua teks** dari setiap rule (biarkan kosong/blank)
   - Jangan isi dengan apapun, termasuk `@request.auth.id != ""`
   - Pastikan semua 5 rules benar-benar kosong

5. **Klik "Save":**
   - Setelah semua rules dikosongkan, klik tombol **Save** di bagian bawah
   - Tunggu sampai muncul notifikasi "Collection updated"

6. **Test Aplikasi:**
   - Coba tambah investasi lagi di aplikasi
   - Seharusnya sudah tidak ada error 403

## Visual Guide:

```
┌─────────────────────────────────────┐
│ Collections > investments           │
├─────────────────────────────────────┤
│ [Fields] [API Rules] [Indexes] ... │  ← Klik "API Rules"
├─────────────────────────────────────┤
│                                     │
│ List/Search rule:                   │
│ [                    ]  ← KOSONGKAN │
│                                     │
│ View rule:                          │
│ [                    ]  ← KOSONGKAN │
│                                     │
│ Create rule:                        │
│ [                    ]  ← KOSONGKAN │
│                                     │
│ Update rule:                        │
│ [                    ]  ← KOSONGKAN │
│                                     │
│ Delete rule:                        │
│ [                    ]  ← KOSONGKAN │
│                                     │
│              [ Save ]               │  ← Klik Save
└─────────────────────────────────────┘
```

## Catatan Penting:

⚠️ **Rules kosong = akses penuh untuk semua orang**
- Ini **HANYA untuk development/local**
- **TIDAK aman untuk production**
- Untuk production, gunakan authentication dengan rules yang sesuai

✅ **Setelah rules dikosongkan:**
- Aplikasi bisa create, read, update, delete data tanpa error
- Tidak perlu authentication untuk development

## Jika Masih Error:

1. Pastikan PocketBase sedang berjalan
2. Refresh browser (Ctrl+F5)
3. Cek console di browser untuk error detail
4. Pastikan collection name tepat: `investments` (lowercase, tidak ada spasi)

