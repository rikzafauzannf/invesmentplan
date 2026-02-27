'use client';

import { useEffect, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CoinPriceChartProps {
    coinSymbol: string;
}

const SYMBOL_MAP: Record<string, string> = {
    btc: 'BINANCE:BTCUSDT',
    eth: 'BINANCE:ETHUSDT',
    xrp: 'BINANCE:XRPUSDT',
    doge: 'BINANCE:DOGEUSDT',
    sui: 'BINANCE:SUIUSDT',
    hype: 'BYBIT:HYPEUSDT',
    ondo: 'BINANCE:ONDOUSDT',
    ada: 'BINANCE:ADAUSDT',
};

const CoinPriceChart = ({ coinSymbol }: CoinPriceChartProps) => {
    const container = useRef<HTMLDivElement>(null);
    const symbol = SYMBOL_MAP[coinSymbol.toLowerCase()] || 'BINANCE:BTCUSDT';

    useEffect(() => {
        if (!container.current) return;

        // Clear previous widget
        container.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            width: '100%',
            height: 600,
            symbol: symbol,
            interval: 'D',
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1',
            locale: 'en',
            allow_symbol_change: false,
            calendar: false,
            support_host: 'https://www.tradingview.com'
        });

        container.current.appendChild(script);
    }, [symbol]);

    return (
        <Card className="mt-6 overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">Market Chart {coinSymbol.toUpperCase()}</CardTitle>
                <CardDescription>Pergerakan harga real-time via TradingView</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div
                    ref={container}
                    className="tradingview-widget-container"
                    style={{ height: '600px', width: '100%' }}
                >
                    <div className="tradingview-widget-container__widget" style={{ height: '600px', width: '100%' }}></div>
                </div>
            </CardContent>
        </Card>
    );
};

export default memo(CoinPriceChart);
