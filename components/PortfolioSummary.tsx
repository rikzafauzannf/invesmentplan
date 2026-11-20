'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, BrainCircuit } from 'lucide-react';
import { getCoinIcon } from '@/lib/coin-data';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface AIAnalysis {
    summary: string;
    sentiment_score: number;
    recommendations: string[];
}

interface Investment {
    id?: string;
    date: string;
    coinSymbol: string;
    amount: number;
    price: number;
    quantity: number;
}

interface PortfolioSummaryProps {
    investments: Investment[];
    prices: Record<string, number>;
    onSelectCoin: (coin: string) => void;
}

export default function PortfolioSummary({
    investments,
    prices,
    onSelectCoin,
}: PortfolioSummaryProps) {
    const [aiReport, setAiReport] = useState<AIAnalysis | null>(null);
    const [loading, setLoading] = useState(false);

    const coinsWithData = Array.from(new Set(investments.map((inv) => inv.coinSymbol)));

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/analyze-portfolio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ portfolio: coinStats }),
            });
            const data = await response.json();
            if (data.summary) {
                // If it's already an object, just use it.
                // If it's a string, try to parse it, handle potential junk.
                let parsed = data.summary;
                if (typeof data.summary === 'string') {
                    try {
                        const jsonMatch = data.summary.match(/\{[\s\S]*\}/);
                        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : data.summary);
                    } catch (e) {
                        console.error('Frontend parsing error:', e);
                        parsed = { 
                            summary: data.summary, 
                            sentiment_score: 0, 
                            recommendations: [] 
                        };
                    }
                }
                setAiReport(parsed);
            }
        } catch (e) {
            console.error('Failed to parse AI response', e);
        }
        setLoading(false);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const coinStats = coinsWithData.map((symbol) => {
        const coinInvestments = investments.filter((inv) => inv.coinSymbol === symbol);
        const totalInvested = coinInvestments.reduce((sum, inv) => {
            const isSell = (inv as any).type === 'sell' || (inv.amount < 0 && (inv as any).type !== 'buy');
            return sum + (isSell ? -Math.abs(inv.amount) : inv.amount);
        }, 0);
        const totalQuantity = coinInvestments.reduce((sum, inv) => {
            const isSell = (inv as any).type === 'sell' || (inv.amount < 0 && (inv as any).type !== 'buy');
            return sum + (isSell ? -Math.abs(inv.quantity) : inv.quantity);
        }, 0);

        const currentPrice = prices[symbol] || 0;
        const currentValue = Math.max(0, totalQuantity) * currentPrice;
        const profitLoss = currentValue - totalInvested;
        const profitPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
        const avgPrice = totalQuantity > 0 ? totalInvested / totalQuantity : 0;

        return {
            symbol,
            totalInvested,
            totalQuantity: Math.max(0, totalQuantity),
            avgPrice,
            currentPrice,
            currentValue,
            profitLoss,
            profitPercent,
        };
    }).sort((a, b) => b.currentValue - a.currentValue);


    if (coinStats.length === 0) return null;

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Ringkasan Portfolio Berdasarkan Koin</CardTitle>
                    <CardDescription>
                        Performa investasi untuk setiap koin yang Anda miliki
                    </CardDescription>
                </div>
                <Button onClick={handleAnalyze} disabled={loading}>
                    {loading ? 'Menganalisis...' : <><BrainCircuit className="mr-2 h-4 w-4" /> Analisis AI</>}
                </Button>
            </CardHeader>
            <CardContent>
                {aiReport && (
                    <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg space-y-6">
                        {/* Market Sentiment Gauge Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-background rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Sentimen Pasar AI</p>
                                <div className="text-3xl font-bold mt-1">
                                    {aiReport.sentiment_score > 2 ? 'Bullish' : aiReport.sentiment_score < -2 ? 'Bearish' : 'Neutral'}
                                </div>
                                <div className="h-4 mt-3 bg-muted rounded-full overflow-hidden flex">
                                    <div style={{ width: `${(Math.min(Math.max(aiReport.sentiment_score, -10), 10) + 10) * 5}%` }} 
                                         className={`h-full ${aiReport.sentiment_score >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                </div>
                            </div>
                            <div className="p-4 bg-background rounded-lg border border-border flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Skor</p>
                                    <div className="text-4xl font-bold text-primary">{aiReport.sentiment_score}/10</div>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Summary */}
                        <div>
                            <h4 className="font-semibold text-primary flex items-center gap-2 mb-2">
                                <BrainCircuit className="h-5 w-5" /> Analisis Ringkas
                            </h4>
                            <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                {aiReport.summary}
                            </div>
                        </div>

                        {/* Recommendations */}
                        {aiReport.recommendations?.length > 0 && (
                            <div className="pt-4 border-t border-border">
                                <span className="font-semibold text-xs text-foreground uppercase tracking-wider">Rekomendasi Strategis:</span>
                                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                                    {aiReport.recommendations.map((rec, i) => (
                                        <li key={i}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                <div className="rounded-md border border-border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Koin</TableHead>
                                <TableHead>Total Investasi</TableHead>
                                <TableHead>Avg. Buy Price</TableHead>
                                <TableHead>Jumlah Koin</TableHead>
                                <TableHead className="text-right">Nilai Saat Ini</TableHead>
                                <TableHead className="text-right">Profit/Loss</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coinStats.map((stat) => (
                                <TableRow
                                    key={stat.symbol}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => onSelectCoin(stat.symbol)}
                                >
                                    <TableCell className="font-bold text-primary">
                                        <div className="flex items-center gap-2">
                                            {getCoinIcon(stat.symbol) && (
                                                <img
                                                    src={getCoinIcon(stat.symbol)!}
                                                    alt={stat.symbol}
                                                    className="w-6 h-6 rounded-full"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            )}
                                            {stat.symbol.toUpperCase()}
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatCurrency(stat.totalInvested)}</TableCell>
                                    <TableCell>{stat.totalQuantity > 0 ? formatCurrency(stat.avgPrice) : '-'}</TableCell>

                                    <TableCell>
                                        {stat.totalQuantity.toLocaleString('id-ID', {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 8,
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(stat.currentValue)}
                                    </TableCell>
                                    <TableCell className={`text-right font-semibold ${stat.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        <div className="flex items-center justify-end gap-1">
                                            {stat.profitLoss >= 0 ? (
                                                <TrendingUp className="h-4 w-4" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4" />
                                            )}
                                            <span>
                                                {stat.profitPercent >= 0 ? '+' : ''}
                                                {stat.profitPercent.toFixed(2)}%
                                            </span>
                                        </div>
                                        <div className="text-xs opacity-70">
                                            {formatCurrency(stat.profitLoss)}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
