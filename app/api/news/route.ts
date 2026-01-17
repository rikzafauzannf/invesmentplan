import { NextRequest, NextResponse } from 'next/server';

// Curated Analysis based on latest market research (Jan 2026)
const CURATED_ANALYSIS: Record<string, { summary: string; potential: string; sentiment: 'bullish' | 'bearish' | 'neutral' }> = {
    btc: {
        summary: 'Bitcoin (BTC) sedang berkonsolidasi di $92k-$98k. Inflow ETF di awal 2026 mencapai >$1.1M, menunjukkan minat institusi yang tetap masif.',
        potential: 'Breakout di atas $105,000 menjadi target jangka pendek. Prediksi 2026 berkisar antara $120k hingga $175k.',
        sentiment: 'bullish',
    },
    eth: {
        summary: 'Ethereum (ETH) stabil di $3,318. Resistansi kunci di $3,400 dan support di $2,700. Inflow ETF diharapkan mendorong ke $5,000.',
        potential: 'Target breakout selanjutnya di $3,963 - $5,000 jika momentum akumulasi institusional terus berlanjut.',
        sentiment: 'neutral',
    },
    xrp: {
        summary: 'XRP terkoreksi ke $2.06 karena isu regulasi. Namun, Ripple Ledger akan menambah fitur Permissioned DEX yang menjadi nilai tambah.',
        potential: 'Target AI memproyeksikan rata-rata $2.12 di Jan 2026, dengan potensi target jangka panjang di $3.90.',
        sentiment: 'neutral',
    },
    doge: {
        summary: 'Doge (DOGE) menunjukkan momentum recovery dengan target $0.15 - $0.18 di akhir bulan, dipicu oleh sentimen meme-coin yang positif.',
        potential: 'Ada potensi kenaikan 15-20% menuju area $0.185 jika support $0.132 bertahan.',
        sentiment: 'neutral',
    },
    sui: {
        summary: 'Sui (SUI) menunjukkan pola bullish engulfing mingguan di harga $1.79. Momentum pembeli sangat kuat menurut indikator teknikal.',
        potential: 'Proyeksi breakout di $2.07 - $2.42. Target jangka panjang optimis bisa kembali mengunjungi ATH di area $5.',
        sentiment: 'bullish',
    },
    hype: {
        summary: 'Hyperliquid (HYPE) mendominasi >60% volume volume DEX Perpetual. Model buy-back & burn (91% revenue) menciptakan tekanan deflasi kuat.',
        potential: 'Target harga Jan 2026 berkisar di $30.80 - $33.46, didorong oleh upgrade HIP-3 dan ekosistem HyperEVM.',
        sentiment: 'bullish',
    },
    overview: {
        summary: 'Pasar crypto awal 2026 didominasi oleh institusi melalui ETF dan adopsi Layer-1 high-performance seperti Sui dan HyperEVM.',
        potential: 'Portfolio diversifikasi di sektor L1 (ETH/SUI) dan Perp DEX (HYPE) diprediksi akan outperform pasar secara umum.',
        sentiment: 'bullish',
    }
};


export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const coin = searchParams.get('coin')?.toLowerCase() || 'btc';

    try {
        // Fetch news from a public API (CryptoCompare free tier doesn't strictly require key for small loads)
        const newsResponse = await fetch(
            `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${coin === 'overview' ? 'Crypto' : coin.toUpperCase()}`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        const newsData = await newsResponse.json();
        const news = (newsData.Data || []).slice(0, 5).map((item: any) => ({
            id: item.id,
            title: item.title,
            source: item.source_info.name,
            url: item.url,
            summary: item.body.substring(0, 150) + '...',
            timestamp: item.published_on * 1000,
            image: item.imageurl
        }));

        // Get analysis
        const analysis = CURATED_ANALYSIS[coin] || CURATED_ANALYSIS['btc'];

        return NextResponse.json({
            news,
            analysis,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json(
            { error: 'Failed to fetch news', analysis: CURATED_ANALYSIS[coin] || CURATED_ANALYSIS['btc'] },
            { status: 200 } // Return curated analysis even if news API fails
        );
    }
}
