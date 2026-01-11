'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Investment {
  id?: string;
  date: string;
  btcAmount: number;
  btcPrice: number;
  btcQuantity: number;
}

interface InvestmentTableProps {
  investments: Investment[];
  currentBtcPrice: number;
}

export default function InvestmentTable({
  investments,
  currentBtcPrice,
}: InvestmentTableProps) {
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

  const calculateRowProfit = (investment: Investment) => {
    const currentValue = investment.btcQuantity * currentBtcPrice;
    const invested = investment.btcAmount;
    return currentValue - invested;
  };

  if (investments.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>History Investasi</CardTitle>
          <CardDescription>Riwayat investasi DCA Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Belum ada data investasi. Tambahkan investasi pertama Anda!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>History Investasi</CardTitle>
        <CardDescription>Riwayat investasi DCA Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Investasi</TableHead>
                <TableHead>Harga BTC</TableHead>
                <TableHead>Jumlah BTC</TableHead>
                <TableHead className="text-right">Nilai Saat Ini</TableHead>
                <TableHead className="text-right">Profit/Loss</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((investment) => {
                const profit = calculateRowProfit(investment);
                const currentValue = investment.btcQuantity * currentBtcPrice;
                return (
                  <TableRow key={investment.id}>
                    <TableCell className="font-medium">
                      {formatDate(investment.date)}
                    </TableCell>
                    <TableCell>{formatCurrency(investment.btcAmount)}</TableCell>
                    <TableCell>{formatCurrency(investment.btcPrice)}</TableCell>
                    <TableCell>{investment.btcQuantity.toFixed(8)}</TableCell>
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
