# 🌌 Crypto DCA Tracker | Next-Gen Portfolio Intelligence

<p align="center">
  <img src="public/assets/readme/showcase.png" width="100%" alt="Futuristic Crypto Showcase" />
</p>

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![PocketBase](https://img.shields.io/badge/PocketBase-0.22-blue?style=for-the-badge&logo=pocketbase)](https://pocketbase.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![ShadcnUI](https://img.shields.io/badge/UI-Shadcn-white?style=for-the-badge&logo=shadcnui)](https://ui.shadcn.com/)

---

## ⚡ Supported Ecosystem
Pilih aset favorit Anda dalam lingkungan yang teroptimasi. Kami mendukung berbagai koin dengan volatilitas dan potensi tinggi:

<div align="center">
  <table>
    <tr>
      <td align="center"><img src="https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400" width="50" style="border-radius: 10px;" /><br/><b>Bitcoin</b></td>
      <td align="center"><img src="https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628" width="50" style="border-radius: 10px;" /><br/><b>Ethereum</b></td>
      <td align="center"><img src="https://assets.coingecko.com/coins/images/50882/standard/hyperliquid.jpg?1729431300" width="50" style="border-radius: 10px;" /><br/><b>Hyperliquid</b></td>
    </tr>
    <tr>
      <td align="center"><img src="https://assets.coingecko.com/coins/images/26375/standard/sui-ocean-square.png?1727791290" width="50" style="border-radius: 10px;" /><br/><b>Sui</b></td>
      <td align="center"><img src="https://assets.coingecko.com/coins/images/44/standard/xrp-symbol-white-128.png?1696501442" width="50" style="border-radius: 10px;" /><br/><b>XRP</b></td>
      <td align="center"><img src="https://assets.coingecko.com/coins/images/5/standard/dogecoin.png?1696501409" width="50" style="border-radius: 10px;" /><br/><b>Dogecoin</b></td>
    </tr>
    <tr>
      <td align="center"><img src="https://assets.coingecko.com/coins/images/26580/standard/ONDO.png?1696525656" width="50" style="border-radius: 10px;" /><br/><b>Ondo</b></td>
      <td align="center"><img src="https://coin-images.coingecko.com/coins/images/975/large/cardano.png?1696502090" width="50" style="border-radius: 10px;" /><br/><b>Cardano</b></td>
      <td align="center"><i>Future assets loading...</i></td>
    </tr>
  </table>
</div>

---

## 🚀 Vision
**Crypto DCA Tracker** bukan sekadar aplikasi pencatat angka. Ini adalah terminal kontrol futuristik untuk strategi *Dollar Cost Averaging* Anda. Dirancang dengan estetika *Cyber-Dark* yang premium dan performa yang sangat responsif, aplikasi ini membantu Anda menavigasi volatilitas pasar kripto dengan data yang akurat dan visualisasi yang memukau.

---

## ✨ Fitur Utama (Core Engines)

### 📊 1. Multi-Dimensional Dashboard
Dapatkan gambaran instan tentang seluruh kekayaan digital Anda dalam satu layar.
- **Unified Portfolio Overview**: Gabungan seluruh koin dalam satu grafik alokasi.
- **Real-time Stats**: Pantau *Net Invested*, *Current Value*, dan *Profit/Loss* secara *real-time*.
- **Area Profit Charts**: Visualisasi profit/loss pribadi yang elegan dengan ApexCharts, lengkap dengan gradien warna dinamis (Hijau/Merah).

### 📈 2. Market Intelligence & Professional Charts
Bukan hanya data pribadi, pantau juga pergerakan pasar layaknya profesional:
- **TradingView Integration**: Embed chart real-time TradingView untuk setiap koin yang dipilih.
- **Dynamic Intervals**: Pilih durasi chart mulai dari 5m, 15m, hingga 1h untuk analisa yang lebih dalam.
- **Live News Feed**: Berita kripto terbaru yang relevan dengan koin yang sedang Anda pantau.

### 🪙 3. Multi-Coin Ecosystem
Satu aplikasi untuk semua aset favorit Anda:
- **Major Assets**: Bitcoin (BTC), Ethereum (ETH).
- [x] **Hype & Trending**: Hyperliquid (HYPE), Sui (SUI), XRP, Dogecoin (DOGE), Ondo Finance (ONDO), Cardano (ADA).
- **Auto-Price Sync**: Harga koin terupdate secara otomatis melalui integrasi API CoinGecko.

### 🛡️ 4. Smart Transaction Engine & Persistence
- **Buy/Sell Logic**: Mendukung pencatatan pembelian (DCA) maupun penarikan (*Withdraw/Sell*).
- **LocalStorage Persistence**: Data chart tersimpan di browser Anda, tidak hilang saat refresh.
- **Auto-Pruning Logic**: Sistem otomatis membersihkan data lama setiap 24 jam untuk menjaga performa dan limit penyimpanan browser.

---

## 💎 Keunggulan (Why This App?)

| Keunggulan | Deskripsi |
| :--- | :--- |
| **Estetika Premium** | Antarmuka *Dark Mode* dengan efek *glassmorphism* dan komponen Shadcn UI. |
| **Data Integrity** | Sistem validasi saldo yang mencegah kesalahan pencatatan transaksi. |
| **User Experience** | Grafik yang interaktif, tooltip detail, dan layout yang teroptimasi untuk layar desktop. |
| **Privacy First** | Data sensitif transaksi tersimpan aman di database PocketBase pribadi Anda. |

---

## 👤 Direkomendasikan Untuk

- **Investor DCA**: Anda yang rutin membeli kripto setiap minggu/bulan dan ingin tahu "Berapa sih harga rata-rata beli saya sekarang?".
- **Holders Jangka Panjang**: Anda yang ingin melihat pertumbuhan aset dari waktu ke waktu tanpa harus membuka *exchange* yang membingungkan.
- **Crypto Enthusiasts**: Anda yang menyukai teknologi modern dengan tampilan antarmuka yang futuristik dan bersih.

---

## 🛠️ Stack Teknologi

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Database**: [PocketBase](https://pocketbase.io/)
- **Styling**: Tailwind CSS & Shadcn UI
- **Charts**: ApexCharts & Recharts
- **Market Data**: TradingView Advanced Widget
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast)

---

## 🛰️ Technical Pulse
```zsh
> Initializing Neural-Portfolio Core... [DONE]
> Syncing with Global Liquidity Nodes... [OK]
> Verifying Asset Integrity (BTC/ETH/ADA)... [100%]
> Status: SYSTEM OPTIMAL | READY FOR DCA
```

---

## 📦 Cara Instalasi

1. **Clone Repository**
   ```bash
   git clone https://github.com/rikzafauzannf/invesmentplan.git
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Setup PocketBase**
   - Jalankan `pocketbase.exe serve`.
   - Buat koleksi `investments` sesuai panduan di aplikasi.

4. **Environment Variables**
   Buat file `.env.local`:
   ```env
   NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
   ```

5. **Run Development**
   ```bash
   pnpm dev
   ```

---

<p align="center">
  Dibuat dengan ❤️ untuk masa depan desentralisasi.
</p>
