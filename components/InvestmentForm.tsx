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
  { symbol: 'sol', name: 'Solana' },
  { symbol: 'sui', name: 'SUI' },
  { symbol: 'hype', name: 'Hyperliquid' },
  { symbol: 'ondo', name: 'Ondo Finance' },
  { symbol: 'link', name: 'Chainlink' },
  { symbol: 'near', name: 'NEAR' },
  { symbol: 'fet', name: 'ASI (FET)' },
  { symbol: 'pepe', name: 'Pepe' },
  { symbol: 'xrp', name: 'XRP' },
  { symbol: 'ada', name: 'Cardano' },
  { symbol: 'doge', name: 'Dogecoin' },
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
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(val, coinSymbol, transactionType);
      setAmount('');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to process transaction.');
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
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black tracking-tight">
              <div className={cn(
                "p-1.5 sm:p-2 rounded-lg",
                transactionType === 'buy' ? "bg-green-500/20" : "bg-red-500/20"
              )}>
                {transactionType === 'buy' ? <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" /> : <MinusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />}
              </div>
              {transactionType === 'buy' ? 'ADD ASSET' : 'SELL / WITHDRAW'}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              {transactionType === 'buy'
                ? 'Log your DCA purchases or asset additions.'
                : 'Record asset liquidations or sales to IDR.'}
            </CardDescription>
          </div>
          <Tabs value={transactionType} onValueChange={(v) => setTransactionType(v as 'buy' | 'sell')} className="w-full sm:w-[140px]">
            <TabsList className="grid grid-cols-2 w-full bg-background/50 border border-border/50 h-9">
              <TabsTrigger value="buy" className="text-[10px] data-[state=active]:bg-green-600 data-[state=active]:text-white h-7 uppercase">BUY</TabsTrigger>
              <TabsTrigger value="sell" className="text-[10px] data-[state=active]:bg-red-600 data-[state=active]:text-white h-7 uppercase">SELL</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(selectedCoin === 'overview' || !selectedCoin) && (
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Asset</Label>
              <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-9 gap-1.5">
                {SUPPORTED_COINS.map((coin) => (
                  <Button
                    key={coin.symbol}
                    type="button"
                    variant="ghost"
                    onClick={() => setCoinSymbol(coin.symbol)}
                    className={cn(
                      "h-10 sm:h-11 flex flex-col items-center justify-center gap-1 transition-all border border-transparent rounded-lg",
                      coinSymbol === coin.symbol
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter">{coin.symbol}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Amount (IDR)
            </Label>
            <div className="relative">
              <Input
                type="text"
                value={formatDisplay(amount)}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="h-11 sm:h-12 text-base sm:text-lg font-black bg-background/50 border-border/50"
              />
            </div>
            {/* Price Preview / Estimated Quantity */}
            {amount && parseFloat(amount) > 0 && prices[coinSymbol] > 0 && (
              <div className="p-2.5 sm:p-3 rounded-lg border border-primary/20 bg-primary/5 flex flex-wrap justify-between items-center gap-1 text-xs">
                <span className="font-bold text-primary">{(parseFloat(amount) / prices[coinSymbol]).toFixed(6)} {coinSymbol.toUpperCase()}</span>
                <span className="text-[10px] text-muted-foreground">@Rp {prices[coinSymbol].toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting || loading}
            variant={transactionType === 'buy' ? 'default' : 'destructive'}
            className="w-full h-10 sm:h-11 font-black text-xs tracking-widest uppercase"
          >
            {submitting ? '...' : (transactionType === 'buy' ? 'BUY ASSET' : 'SELL ASSET')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


