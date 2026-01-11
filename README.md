# BTC DCA Tracker

Aplikasi sederhana untuk tracking investasi DCA (Dollar Cost Averaging) ke BTC menggunakan Next.js dan PocketBase.

## Fitur

- Input investasi bulanan untuk BTC
- Tracking harga real-time dari CoinGecko
- Kalkulasi total aset dan profit/loss
- Tabel history investasi
- Chart alokasi dana
- Dark theme dengan shadcn/ui

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Setup PocketBase:
   - Download PocketBase dari https://pocketbase.io/docs/
   - Ikuti instruksi di `POCKETBASE_SETUP.md`
   - Jalankan PocketBase: `./pocketbase.exe serve`

3. Setup Environment Variables:
   - Copy `.env.local.example` ke `.env.local`
   - Update `NEXT_PUBLIC_POCKETBASE_URL` jika perlu

4. Run development server:
```bash
pnpm dev
```

## Environment Variables

Buat file `.env.local` dengan:
```
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **PocketBase** - Local backend database
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Charts
- **TypeScript** - Type safety
- **Docker** - Containerization

## Quick Start dengan Docker

```bash
# Build dan jalankan
docker-compose up -d --build

# Akses aplikasi
# Next.js: http://localhost:3000
# PocketBase: http://localhost:8090/_/
```

Lihat `DOCKER_SETUP.md` untuk panduan lengkap.

## Dokumentasi

- `DOCKER_SETUP.md` - Panduan setup Docker
- `POCKETBASE_SETUP.md` - Panduan setup PocketBase manual
- `SETUP.md` - Instruksi setup lengkap (legacy Firebase)

