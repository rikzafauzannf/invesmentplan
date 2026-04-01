'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, MinusCircle, Wallet } from 'lucide-react';
import { getCoinIcon } from '@/lib/coin-data';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface InvestmentFormProps {
  onSubmit: (amount: number, coinSymbol: string, type: 'buy' | 'sell') => void;
  loading: boolean;
  selectedCoin?: string;
  prices: Record<string, number>;
}

const SUPPORTED_COINS = [
  { symbol: 'btc', name: 'Bitcoin' },
  { symbol: 'eth', name: 'Ethereum' },
  { symbol: 'xrp', name: 'XRP' },
  { symbol: 'doge', name: 'Dogecoin' },
  { symbol: 'sui', name: 'SUI' },
  { symbol: 'hype', name: 'Hyperliquid' },
  { symbol: 'ondo', name: 'Ondo Finance' },
  { symbol: 'ada', name: 'Cardano' },
];

export default function InvestmentForm({ onSubmit, loading, selectedCoin, prices }: InvestmentFormProps) {
  const [amount, setAmount] = useState('');
  const [coinSymbol, setCoinSymbol] = useState(selectedCoin && selectedCoin !== 'overview' ? selectedCoin.toLowerCase() : 'btc');
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [submitting, setSubmitting] = useState(false);

  // Sync with global selection
  useEffect(() => {
    if (selectedCoin && selectedCoin !== 'overview') {
      setCoinSymbol(selectedCoin.toLowerCase());
    }
  }, [selectedCoin]);


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
    <Card className="border-none glass">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
              <div className={cn(
                "p-2 rounded-lg",
                transactionType === 'buy' ? "bg-green-500/20" : "bg-red-500/20"
              )}>
                {transactionType === 'buy' ? <Plus className="h-5 w-5 text-green-400" /> : <MinusCircle className="h-5 w-5 text-red-400" />}
              </div>
              {transactionType === 'buy' ? 'TAMBAH ASSET' : 'JUAL / WITHDRAW'}
            </CardTitle>
            <CardDescription className="mt-1">
              {transactionType === 'buy'
                ? 'Input pembelian DCA atau penambahan stok koin Anda.'
                : 'Catat penarikan atau penjualan koin ke Rupiah.'}
            </CardDescription>
          </div>
          <Tabs value={transactionType} onValueChange={(v) => setTransactionType(v as 'buy' | 'sell')} className="w-full sm:w-[160px]">
            <TabsList className="grid grid-cols-2 w-full bg-background/50 border border-border/50">
              <TabsTrigger value="buy" className="text-xs data-[state=active]:bg-green-600 data-[state=active]:text-white">BELI</TabsTrigger>
              <TabsTrigger value="sell" className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white">JUAL</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {(selectedCoin === 'overview' || !selectedCoin) && (
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Target Asset</Label>
              <div className="grid grid-cols-4 gap-2">
                {SUPPORTED_COINS.map((coin) => (
                  <Button
                    key={coin.symbol}
                    type="button"
                    variant="ghost"
                    onClick={() => setCoinSymbol(coin.symbol)}
                    className={cn(
                      "h-auto py-2 px-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 border border-transparent",
                      coinSymbol === coin.symbol
                        ? "bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                        : "hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <img
                      src={getCoinIcon(coin.symbol)}
                      alt={coin.symbol}
                      className={cn(
                        "w-6 h-6 rounded-full transition-transform duration-300",
                        coinSymbol === coin.symbol ? "scale-110" : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
                      )}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{coin.symbol}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Nominal Transaksi
            </Label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-sm">IDR</span>
              <Input
                type="text"
                id="amount"
                value={formatDisplay(amount)}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                disabled={submitting || loading}
                className="pl-12 h-14 text-xl font-black bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-tighter">Auto-Sync</span>
              </div>
            </div>

            {/* Price Preview / Estimated Quantity */}
            {amount && parseFloat(amount) > 0 && prices[coinSymbol] > 0 && (
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background/50 rounded-full border border-primary/20">
                      <img
                        src={getCoinIcon(coinSymbol)}
                        alt={coinSymbol}
                        className="w-5 h-5"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Estimasi {transactionType === 'buy' ? 'Diterima' : 'Dilepas'}</p>
                      <p className="text-lg font-black tracking-tight text-primary">
                        {(parseFloat(amount) / prices[coinSymbol]).toLocaleString('id-ID', { maximumFractionDigits: 8 })} {coinSymbol.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Harga Kurs</p>
                    <p className="text-xs font-bold text-muted-foreground">
                      1 {coinSymbol.toUpperCase()} ≈ Rp {prices[coinSymbol].toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting || loading}
            variant={transactionType === 'buy' ? 'default' : 'destructive'}
            className={cn(
              "w-full h-14 font-black text-sm tracking-widest transition-all duration-300 shadow-lg",
              transactionType === 'buy'
                ? "bg-primary hover:bg-primary/90 shadow-primary/20"
                : "bg-red-600 hover:bg-red-700 shadow-red-900/20"
            )}
          >
            {submitting ? 'PROCESSING...' : (
              <span className="flex items-center gap-2">
                {transactionType === 'buy' ? <Wallet className="h-5 w-5" /> : <MinusCircle className="h-5 w-5" />}
                {transactionType === 'buy' ? `EXECUTE PURCHASE ${coinSymbol.toUpperCase()}` : `CONFIRM SALE ${coinSymbol.toUpperCase()}`}
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


