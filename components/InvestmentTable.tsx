'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { getCoinIcon } from '@/lib/coin-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
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
    <Card className="border-none glass overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black tracking-tight uppercase">TRANSACTION LOGS</CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
              {isOverview ? 'Global portfolio activity history' : `DCA transaction history for ${symbol}`}
            </CardDescription>
          </div>
          <div className="px-3 py-1 bg-muted/50 rounded-full border border-border/50">
            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
              {investments.length} RECORDS
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Action</TableHead>
                {isOverview && <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Asset</TableHead>}
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Volume (IDR)</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Unit Price</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Quantity</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest h-10">Market Value</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest h-10">P/L Impact</TableHead>
                {onDelete && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((investment) => {
                const { currentValue, profit, isSell } = calculateRowStats(investment);

                return (
                  <TableRow key={investment.id} className={cn(
                    "border-border/50 transition-colors",
                    isSell ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-muted/30"
                  )}>
                    <TableCell className="font-bold whitespace-nowrap text-[11px] text-muted-foreground uppercase">
                      {formatDate(investment.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isSell ? 'destructive' : 'default'} className={cn(
                        "text-[9px] py-0 px-2 h-5 font-black tracking-tighter rounded-sm",
                        !isSell && "bg-green-600 hover:bg-green-700"
                      )}>
                        {isSell ? 'SELL' : 'BUY'}
                      </Badge>
                    </TableCell>

                    {isOverview && (
                      <TableCell className="font-black text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={getCoinIcon(investment.coinSymbol)}
                            alt={investment.coinSymbol}
                            className="w-5 h-5 rounded-full"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                          <span className="tracking-tighter">{investment.coinSymbol.toUpperCase()}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className={cn(
                      "text-xs font-bold",
                      isSell ? "text-red-400" : "text-foreground"
                    )}>
                      {isSell ? '-' : ''}{formatCurrency(Math.abs(investment.amount))}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatCurrency(investment.price)}</TableCell>
                    <TableCell className={cn(
                      "text-xs font-bold font-mono",
                      isSell ? "text-red-400" : "text-foreground"
                    )}>
                      {isSell ? '-' : ''}{Math.abs(investment.quantity).toLocaleString('id-ID', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 8
                      })}
                    </TableCell>

                    <TableCell className="text-right text-xs font-medium">
                      {isSell ? <span className="text-muted-foreground/30">—</span> : formatCurrency(currentValue)}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-black text-xs",
                      profit >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          {profit >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatCurrency(profit)}
                        </div>
                        {isSell && <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Realized</span>}
                      </div>
                    </TableCell>

                    {onDelete && (
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass border-border/50">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-black tracking-tight">TERMINATE RECORD?</AlertDialogTitle>
                              <AlertDialogDescription className="text-xs uppercase tracking-wide font-medium">
                                This action is irreversible. The transaction data will be permanently wiped from the ledger.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-muted/50 border-border/50 text-[10px] font-black uppercase tracking-widest">ABORT</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(investment.id || '')}
                                className="bg-destructive hover:bg-destructive/90 text-[10px] font-black uppercase tracking-widest"
                              >
                                EXECUTE DELETE
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


