'use client';

import { useEffect, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CoinTechnicalAnalysisProps {
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
    sol: 'BINANCE:SOLUSDT',
    link: 'BINANCE:LINKUSDT',
    near: 'BINANCE:NEARUSDT',
    fet: 'BINANCE:FETUSDT',
    pepe: 'BINANCE:PEPEUSDT',
};

const CoinTechnicalAnalysis = ({ coinSymbol }: CoinTechnicalAnalysisProps) => {
    const container = useRef<HTMLDivElement>(null);
    const symbol = SYMBOL_MAP[coinSymbol.toLowerCase()] || 'BINANCE:BTCUSDT';

    useEffect(() => {
        if (!container.current) return;
        container.current.innerHTML = '';
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            interval: "1D",
            width: "100%",
            isTransparent: false,
            height: 450,
            symbol: symbol,
            showIntervalTabs: true,
            displayMode: "single",
            locale: "en",
            colorTheme: "dark"
        });
        container.current.appendChild(script);
    }, [symbol]);

    return (
        <Card className="glass border-border/50">
            <CardHeader>
                <CardTitle className="text-lg">Analisis Teknis {coinSymbol.toUpperCase()}</CardTitle>
                <CardDescription>Osilator & Moving Averages (1D)</CardDescription>
            </CardHeader>
            <CardContent>
                <div ref={container} className="tradingview-widget-container min-h-[450px]"></div>
            </CardContent>
        </Card>
    );
};

export default memo(CoinTechnicalAnalysis);
