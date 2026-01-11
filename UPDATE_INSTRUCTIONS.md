# Instruksi Update ke Latest Version

## Update Dependencies

Setelah update `package.json` dengan versi terbaru, jalankan:

```bash
# Hapus node_modules dan lock file
rm -rf node_modules pnpm-lock.yaml

# Install ulang dengan versi terbaru
pnpm install

# Atau langsung update semua ke latest
pnpm update --latest
```

## Breaking Changes yang Perlu Diperhatikan

### Next.js 16
- Menggunakan React 19 secara default
- Beberapa API mungkin berubah, tapi aplikasi ini sudah kompatibel

### React 19
- Type definitions berubah, sudah diupdate di package.json
- Tidak ada perubahan kode yang diperlukan untuk aplikasi ini

### Firebase 12
- API tetap sama, tidak ada breaking changes untuk Firestore

### Recharts 3
- Beberapa prop mungkin berubah, tapi komponen chart sudah kompatibel

### Tailwind CSS
- Tetap menggunakan v3 untuk kompatibilitas dengan shadcn/ui
- v4 memiliki breaking changes besar

## Troubleshooting

Jika ada error setelah update:

1. **Clear cache:**
   ```bash
   rm -rf .next node_modules pnpm-lock.yaml
   pnpm install
   ```

2. **Check TypeScript errors:**
   ```bash
   pnpm run lint
   ```

3. **Rebuild:**
   ```bash
   pnpm run build
   ```

## Versi yang Digunakan

- Next.js: 16.1.1 (latest)
- React: 19.2.3 (latest)
- Firebase: 12.7.0 (latest)
- Tailwind CSS: 3.4.19 (stable, v4 has breaking changes)
- Recharts: 3.6.0 (latest)
- TypeScript: 5.7.2 (latest)

