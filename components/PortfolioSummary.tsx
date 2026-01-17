'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getCoinIcon } from '@/lib/coin-data';

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
    const coinsWithData = Array.from(new Set(investments.map((inv) => inv.coinSymbol)));

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
            <CardHeader>
                <CardTitle>Ringkasan Portfolio Berdasarkan Koin</CardTitle>
                <CardDescription>
                    Performa investasi untuk setiap koin yang Anda miliki
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                                            <img
                                                src={getCoinIcon(stat.symbol)}
                                                alt={stat.symbol}
                                                className="w-6 h-6 rounded-full"
                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                            />
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
