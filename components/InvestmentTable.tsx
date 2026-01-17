'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { getCoinIcon } from '@/lib/coin-data';
import { Button } from '@/components/ui/button';
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

  const calculateRowStats = (investment: Investment) => {
    const coinPrice = isOverview ? (prices[investment.coinSymbol] || 0) : currentBtcPrice;
    const currentValue = investment.quantity * coinPrice;
    const invested = investment.amount;
    const profit = currentValue - invested;
    return { currentValue, profit };
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
                {isOverview && <TableHead>Koin</TableHead>}
                <TableHead>Investasi</TableHead>
                <TableHead>Harga Beli</TableHead>
                <TableHead>Jumlah Koin</TableHead>
                <TableHead className="text-right">Nilai Saat Ini</TableHead>
                <TableHead className="text-right">Profit/Loss</TableHead>
                {onDelete && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((investment) => {
                const { currentValue, profit } = calculateRowStats(investment);
                return (
                  <TableRow key={investment.id}>
                    <TableCell className="font-medium">
                      {formatDate(investment.date)}
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
                    <TableCell>{formatCurrency(investment.amount)}</TableCell>
                    <TableCell>{formatCurrency(investment.price)}</TableCell>
                    <TableCell>
                      {investment.quantity.toLocaleString('id-ID', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 8
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(currentValue)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {profit >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {formatCurrency(profit)}
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


