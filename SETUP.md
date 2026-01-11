# Setup Instructions

## 1. Install Dependencies

```bash
npm install
```

## 2. Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru atau gunakan project yang sudah ada
3. Di Project Settings, scroll ke bawah dan copy konfigurasi web app
4. Buat file `.env.local` di root project dengan isi:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 3. Setup Firestore Database

1. Di Firebase Console, buka **Firestore Database**
2. Klik **Create Database**
3. Pilih **Start in test mode** (untuk development)
4. Pilih lokasi database (pilih yang terdekat dengan Anda)
5. Klik **Enable**

## 4. Setup Firestore Rules (Opsional untuk Production)

Untuk production, update rules di Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /investments/{document=**} {
      allow read, write: if true; // Untuk development
      // Untuk production, gunakan authentication:
      // allow read, write: if request.auth != null;
    }
  }
}
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

### Error: Firebase not initialized
- Pastikan file `.env.local` sudah dibuat dengan konfigurasi yang benar
- Restart development server setelah membuat `.env.local`

### Error: Firestore permission denied
- Pastikan Firestore Database sudah dibuat
- Pastikan rules Firestore mengizinkan read/write (untuk development)

### Harga tidak update
- Pastikan koneksi internet aktif
- CoinGecko API memiliki rate limit, tunggu beberapa saat jika error

