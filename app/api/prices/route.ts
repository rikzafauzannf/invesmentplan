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
      { id: 'cardano', symbol: 'ada' },
      { id: 'solana', symbol: 'sol' },
      { id: 'chainlink', symbol: 'link' },
      { id: 'near', symbol: 'near' },
      { id: 'fetch-ai', symbol: 'fet' },
      { id: 'pepe', symbol: 'pepe' }
    ];

    const ids = coins.map(c => c.id).join(',');

    // Fetch dari CoinGecko dengan order market_cap_desc
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&ids=${ids}&order=market_cap_desc`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();

    const prices: Record<string, number> = {};
    const changes: Record<string, number> = {};
    const sortedSymbols: string[] = [];
    
    // API CoinGecko sudah mengurutkan berdasarkan market_cap_desc secara default
    data.forEach((coin: any) => {
        const symbol = coins.find(c => c.id === coin.id)?.symbol;
        if (symbol) {
            prices[symbol] = coin.current_price;
            changes[symbol] = coin.price_change_percentage_24h;
            sortedSymbols.push(symbol);
        }
    });

    return NextResponse.json({
      prices,
      changes,
      sortedSymbols,
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
