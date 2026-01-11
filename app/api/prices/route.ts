import { NextResponse } from 'next/server';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    // Fetch BTC price from CoinGecko API
    const btcResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=idr',
      { cache: 'no-store' }
    );
    const btcData = await btcResponse.json();
    const btcPrice = btcData.bitcoin?.idr || 0;

    return NextResponse.json({
      btc: btcPrice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
