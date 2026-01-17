'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface InvestmentFormProps {
  onSubmit: (amount: number, coinSymbol: string) => void;
  loading: boolean;
}

const SUPPORTED_COINS = [
  { symbol: 'btc', name: 'Bitcoin' },
  { symbol: 'eth', name: 'Ethereum' },
  { symbol: 'xrp', name: 'XRP' },
  { symbol: 'doge', name: 'Dogecoin' },
  { symbol: 'sui', name: 'SUI' },
  { symbol: 'hype', name: 'Hyperliquid' },
];

export default function InvestmentForm({ onSubmit, loading }: InvestmentFormProps) {
  const [amount, setAmount] = useState('');
  const [coinSymbol, setCoinSymbol] = useState('btc');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const val = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;

    if (val <= 0) {
      alert('Masukkan jumlah investasi yang valid');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(val, coinSymbol);
      setAmount('');
    } catch (error) {
      console.error('Error submitting form:', error);
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
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Tambah Investasi Bulanan
        </CardTitle>
        <CardDescription>
          Pilih koin dan masukkan jumlah investasi dalam Rupiah
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
                  className="w-full text-xs"
                  size="sm"
                >
                  {coin.symbol.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Investasi {coinSymbol.toUpperCase()} (Rupiah)</Label>
            <Input
              type="text"
              id="amount"
              value={formatDisplay(amount)}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="Contoh: 1.500.000"
              disabled={submitting || loading}
              className="text-lg"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting || loading}
            className="w-full"
            size="lg"
          >
            {submitting ? 'Menyimpan...' : `Simpan Investasi ${coinSymbol.toUpperCase()}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

