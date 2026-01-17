'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
}

export default function InvestmentTable({
  investments,
  currentBtcPrice,
  coinSymbol = 'btc',
  prices = {},
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
                        {investment.coinSymbol.toUpperCase()}
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


