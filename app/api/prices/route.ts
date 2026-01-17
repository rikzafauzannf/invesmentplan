import { NextResponse } from 'next/server';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    const coins = [
      { id: 'bitcoin', symbol: 'btc' },
      { id: 'ethereum', symbol: 'eth' },
      { id: 'ripple', symbol: 'xrp' },
      { id: 'dogecoin', symbol: 'doge' },
      { id: 'sui', symbol: 'sui' },
      { id: 'hyperliquid', symbol: 'hype' },
      { id: 'ondo-finance', symbol: 'ondo' },
      { id: 'cardano', symbol: 'ada' }
    ];

    const ids = coins.map(c => c.id).join(',');

    // Fetch prices from CoinGecko API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=idr`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();

    const prices: Record<string, number> = {};
    coins.forEach(coin => {
      prices[coin.symbol] = data[coin.id]?.idr || 0;
    });

    return NextResponse.json({
      prices,
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

