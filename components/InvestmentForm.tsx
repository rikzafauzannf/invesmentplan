'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, MinusCircle, Wallet } from 'lucide-react';
import { getCoinIcon } from '@/lib/coin-data';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InvestmentFormProps {
  onSubmit: (amount: number, coinSymbol: string, type: 'buy' | 'sell') => void;
  loading: boolean;
}

const SUPPORTED_COINS = [
  { symbol: 'btc', name: 'Bitcoin' },
  { symbol: 'eth', name: 'Ethereum' },
  { symbol: 'xrp', name: 'XRP' },
  { symbol: 'doge', name: 'Dogecoin' },
  { symbol: 'sui', name: 'SUI' },
  { symbol: 'hype', name: 'Hyperliquid' },
  { symbol: 'ondo', name: 'Ondo Finance' },
];

export default function InvestmentForm({ onSubmit, loading }: InvestmentFormProps) {
  const [amount, setAmount] = useState('');
  const [coinSymbol, setCoinSymbol] = useState('btc');
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [submitting, setSubmitting] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const val = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;

    if (val <= 0) {
      toast.error('Masukkan jumlah yang valid');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(val, coinSymbol, transactionType);
      setAmount('');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Gagal memproses transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDisplay = (value: string) => {
    if (!value) return '';
    const num = value.replace(/\D/g, '');
    if (!num) return '';
    return parseInt(num).toLocaleString('id-ID');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {transactionType === 'buy' ? <Plus className="h-5 w-5 text-green-400" /> : <MinusCircle className="h-5 w-5 text-red-400" />}
            {transactionType === 'buy' ? 'Tambah Investasi' : 'Withdraw / Jual'}
          </CardTitle>
          <Tabs value={transactionType} onValueChange={(v) => setTransactionType(v as 'buy' | 'sell')} className="w-[180px]">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="buy">Beli</TabsTrigger>
              <TabsTrigger value="sell">Jual</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardDescription>
          {transactionType === 'buy'
            ? 'Masukkan jumlah investasi baru Anda'
            : 'Masukkan jumlah yang Anda tarik/jual (dalam Rupiah)'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coinSymbol">Pilih Koin</Label>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_COINS.map((coin) => (
                <Button
                  key={coin.symbol}
                  type="button"
                  variant={coinSymbol === coin.symbol ? 'default' : 'outline'}
                  onClick={() => setCoinSymbol(coin.symbol)}
                  className="w-full text-xs flex items-center justify-center gap-2"
                  size="sm"
                >
                  <img
                    src={getCoinIcon(coin.symbol)}
                    alt={coin.symbol}
                    className="w-4 h-4 rounded-full"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  {coin.symbol.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah {transactionType === 'buy' ? 'Investasi' : 'Penarikan'} (Rupiah)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">Rp</span>
              <Input
                type="text"
                id="amount"
                value={formatDisplay(amount)}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                disabled={submitting || loading}
                className="pl-10 text-lg font-bold"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={submitting || loading}
            variant={transactionType === 'buy' ? 'default' : 'destructive'}
            className="w-full font-bold"
            size="lg"
          >
            {submitting ? 'Memproses...' : (
              <span className="flex items-center gap-2">
                {transactionType === 'buy' ? <Wallet className="h-5 w-5" /> : <MinusCircle className="h-5 w-5" />}
                {transactionType === 'buy' ? `Simpan Investasi ${coinSymbol.toUpperCase()}` : `Konfirmasi Jual ${coinSymbol.toUpperCase()}`}
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


