'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { getCoinIcon } from '@/lib/coin-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Investment {
  id?: string;
  date: string;
  coinSymbol: string;
  amount: number;
  price: number;
  quantity: number;
  type?: 'buy' | 'sell';
}


interface InvestmentTableProps {
  investments: Investment[];
  currentBtcPrice: number;
  coinSymbol?: string;
  prices?: Record<string, number>;
  onDelete?: (id: string) => void;
}

export default function InvestmentTable({
  investments,
  currentBtcPrice,
  coinSymbol = 'btc',
  prices = {},
  onDelete,
}: InvestmentTableProps) {
  const isOverview = coinSymbol === 'overview';
  const symbol = isOverview ? 'Portfolio' : coinSymbol.toUpperCase();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  // Calculate running stats (average buy price) to determine realized profit
  const enrichedStats = useMemo(() => {
    const sorted = [...investments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const coinTotals: Record<string, { qty: number; cost: number }> = {};
    const stats: Record<string, { avgBuyPrice: number; realizedProfit?: number }> = {};

    sorted.forEach((inv) => {
      const symbol = inv.coinSymbol.toLowerCase();
      if (!coinTotals[symbol]) coinTotals[symbol] = { qty: 0, cost: 0 };

      const isSell = inv.type === 'sell' || (inv.amount < 0 && inv.type !== 'buy');
      const absQty = Math.abs(inv.quantity);
      const absAmount = Math.abs(inv.amount);

      if (!isSell) {
        // Buy transaction
        coinTotals[symbol].qty += absQty;
        coinTotals[symbol].cost += absAmount;
        const avgBuyPrice = coinTotals[symbol].qty > 0 ? coinTotals[symbol].cost / coinTotals[symbol].qty : inv.price;
        if (inv.id) {
          stats[inv.id] = { avgBuyPrice };
        }
      } else {
        // Sell transaction
        const avgBuyPriceBefore = coinTotals[symbol].qty > 0 ? coinTotals[symbol].cost / coinTotals[symbol].qty : inv.price;
        const realizedProfit = (inv.price - avgBuyPriceBefore) * absQty;

        // Update running totals (FIFO-ish / weighted average reduction)
        coinTotals[symbol].qty = Math.max(0, coinTotals[symbol].qty - absQty);
        coinTotals[symbol].cost = Math.max(0, coinTotals[symbol].cost - (avgBuyPriceBefore * absQty));

        if (inv.id) {
          stats[inv.id] = { avgBuyPrice: avgBuyPriceBefore, realizedProfit };
        }
      }
    });

    return stats;
  }, [investments]);

  const calculateRowStats = (investment: Investment) => {
    const coinPrice = isOverview ? (prices[investment.coinSymbol.toLowerCase()] || 0) : currentBtcPrice;
    const isSell = investment.type === 'sell' || (investment.amount < 0 && investment.type !== 'buy');

    const stats = investment.id ? enrichedStats[investment.id] : null;

    const absQty = Math.abs(investment.quantity);
    const absAmount = Math.abs(investment.amount);

    if (isSell) {
      return {
        currentValue: 0,
        profit: stats?.realizedProfit || 0,
        isSell: true,
        realized: true
      };
    }

    // For Buy, profit is Unrealized (Difference from current market price)
    const currentValue = absQty * coinPrice;
    const profit = currentValue - absAmount;

    return { currentValue, profit, isSell: false, realized: false };
  };


  if (investments.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>History Investasi {symbol}</CardTitle>
          <CardDescription>Riwayat investasi DCA {symbol} Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Belum ada data investasi untuk {symbol}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>History Investasi {symbol}</CardTitle>
        <CardDescription>
          {isOverview
            ? 'Riwayat seluruh transaksi investasi Anda'
            : `Riwayat investasi DCA ${symbol} Anda`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Tipe</TableHead>
                {isOverview && <TableHead>Koin</TableHead>}
                <TableHead>Investasi</TableHead>
                <TableHead>Harga Aset</TableHead>
                <TableHead>Jumlah Koin</TableHead>
                <TableHead className="text-right">Nilai Saat Ini</TableHead>
                <TableHead className="text-right">Profit/Loss</TableHead>
                {onDelete && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((investment) => {
                const { currentValue, profit, isSell } = calculateRowStats(investment);

                return (
                  <TableRow key={investment.id} className={isSell ? 'bg-red-500/5' : ''}>
                    <TableCell className="font-medium whitespace-nowrap text-xs md:text-sm text-muted-foreground">
                      {formatDate(investment.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isSell ? 'destructive' : 'default'} className="text-[10px] py-0 px-1.5 h-5 font-bold">
                        {isSell ? 'JUAL' : 'BELI'}
                      </Badge>
                    </TableCell>


                    {isOverview && (
                      <TableCell className="font-semibold text-primary">
                        <div className="flex items-center gap-2">
                          <img
                            src={getCoinIcon(investment.coinSymbol)}
                            alt={investment.coinSymbol}
                            className="w-5 h-5 rounded-full"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                          {investment.coinSymbol.toUpperCase()}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className={isSell ? 'text-red-400 font-medium' : ''}>
                      {isSell ? '-' : ''}{formatCurrency(Math.abs(investment.amount))}
                    </TableCell>
                    <TableCell>{formatCurrency(investment.price)}</TableCell>
                    <TableCell className={isSell ? 'text-red-400 font-medium' : ''}>
                      {isSell ? '-' : ''}{Math.abs(investment.quantity).toLocaleString('id-ID', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 8
                      })}
                    </TableCell>

                    <TableCell className="text-right">
                      {isSell ? '-' : formatCurrency(currentValue)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          {profit >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {formatCurrency(profit)}
                        </div>
                        {isSell && <span className="text-[10px] text-muted-foreground font-normal">Realized</span>}
                      </div>
                    </TableCell>

                    {onDelete && (
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Transaksi ini akan dihapus secara permanen dari riwayat investasi Anda.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(investment.id || '')}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    )}

                  </TableRow>

                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}


