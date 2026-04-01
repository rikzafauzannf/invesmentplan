'use client';

import { useState, useEffect } from 'react';
import { createInvestment, fetchInvestments } from '@/lib/pocketbase';
import InvestmentForm from '@/components/InvestmentForm';
import InvestmentTable from '@/components/InvestmentTable';
import StatsCards from '@/components/StatsCards';
import AllocationChart from '@/components/AllocationChart';
import ProfitTrendChart from '@/components/ProfitTrendChart';
import PortfolioSummary from '@/components/PortfolioSummary';
import CryptoNews from '@/components/CryptoNews';
import CoinPriceChart from '@/components/CoinPriceChart';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import DecryptedText from '@/components/reactbits/DecryptedText';
import { getCoinIcon } from '@/lib/coin-data';
import { toast } from 'sonner';

interface Investment {
  id?: string;
  date: string;
  coinSymbol: string;
  amount: number;
  price: number;
  quantity: number;
  type?: 'buy' | 'sell';
}

export default function Home() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [selectedCoin, setSelectedCoin] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Fetch current prices - Update every 5 minutes
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/prices');
        const data = await response.json();
        if (data.prices) {
          setPrices(data.prices);
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch investments from PocketBase
  useEffect(() => {
    const loadInvestments = async () => {
      try {
        const data = await fetchInvestments();
        setInvestments(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading investments:', error);
        setLoading(false);
      }
    };

    loadInvestments();
    const interval = setInterval(loadInvestments, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddInvestment = async (amount: number, coinSymbol: string, type: 'buy' | 'sell' = 'buy') => {
    try {
      const response = await fetch('/api/prices');
      const data = await response.json();
      const currentPrices = data.prices;

      const price = currentPrices[coinSymbol];
      if (!price) {
        toast.error('Harga koin tidak ditemukan. Silakan coba lagi nanti.');
        return;
      }

      const quantity = amount / price;

      // Validate balance for withdrawals (Sell)
      if (type === 'sell') {
        const currentBalance = (investments || [])
          .filter(inv => inv.coinSymbol.toLowerCase() === coinSymbol.toLowerCase())
          .reduce((sum, inv) => {
            const isSell = inv.type === 'sell' || (Number(inv.amount) < 0 && inv.type !== 'buy');
            const absQty = Math.abs(Number(inv.quantity || 0));
            return sum + (isSell ? -absQty : absQty);
          }, 0);

        if (quantity > currentBalance + 0.00000001) {
          toast.error(`Saldo tidak mencukupi. Anda hanya memiliki ${currentBalance.toLocaleString('id-ID', { maximumFractionDigits: 8 })} ${coinSymbol.toUpperCase()}.`);
          return;
        }
      }

      await createInvestment({
        date: new Date().toISOString(),
        coinSymbol,
        amount,
        price,
        quantity,
        type,
      });

      setSelectedCoin(coinSymbol);
      const updatedData = await fetchInvestments();
      setInvestments(updatedData);

      if (type === 'buy') {
        toast.success(`Investasi ${coinSymbol.toUpperCase()} senilai Rp ${amount.toLocaleString('id-ID')} berhasil disimpan!`);
      } else {
        toast.success(`Penarikan ${coinSymbol.toUpperCase()} senilai Rp ${amount.toLocaleString('id-ID')} berhasil dicatat!`);
      }
    } catch (error) {
      console.error('Error adding investment:', error);
      toast.error('Error memproses transaksi. Silakan coba lagi.');
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    try {
      const response = await fetch(`/api/investments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Gagal menghapus');

      setInvestments(prev => prev.filter(inv => inv.id !== id));
      toast.success('Transaksi berhasil dihapus.');
    } catch (error) {
      console.error('Error deleting investment:', error);
      toast.error('Gagal menghapus investasi.');
    }
  };

  const isOverview = selectedCoin === 'overview';

  // Filter and Calculate totals for selected coin
  const filteredInvestments = isOverview
    ? investments
    : investments.filter(inv => inv.coinSymbol.toLowerCase() === selectedCoin.toLowerCase());

  const currentPrice = isOverview ? 0 : (prices[selectedCoin.toLowerCase()] || 0);

  // Portfolio Totals
  const totalInvested = filteredInvestments.reduce((sum, inv) => {
    const isSell = inv.type === 'sell' || (inv.amount < 0 && inv.type !== 'buy');
    return sum + (isSell ? -Math.abs(inv.amount) : inv.amount);
  }, 0);

  const portfolioValue = isOverview
    ? Object.keys(prices).reduce((sum, symbol) => {
      const coinQuantity = (investments || [])
        .filter(inv => inv.coinSymbol.toLowerCase() === symbol.toLowerCase())
        .reduce((q, inv) => {
          const isSell = inv.type === 'sell' || (inv.amount < 0 && inv.type !== 'buy');
          return q + (isSell ? -Math.abs(inv.quantity) : inv.quantity);
        }, 0);
      return sum + (Math.max(0, coinQuantity) * (prices[symbol] || 0));
    }, 0)
    : Math.max(0, filteredInvestments.reduce((sum, inv) => {
      const isSell = inv.type === 'sell' || (inv.amount < 0 && inv.type !== 'buy');
      return sum + (isSell ? -Math.abs(inv.quantity) : inv.quantity);
    }, 0)) * currentPrice;

  const profitLoss = portfolioValue - totalInvested;
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  const portfolioData = isOverview
    ? Array.from(new Set(investments.map(inv => inv.coinSymbol.toLowerCase()))).map(symbol => {
      const coinQuantity = (investments || [])
        .filter(inv => inv.coinSymbol.toLowerCase() === symbol.toLowerCase())
        .reduce((q, inv) => {
          const isSell = inv.type === 'sell' || (inv.amount < 0 && inv.type !== 'buy');
          return q + (isSell ? -Math.abs(inv.quantity) : inv.quantity);
        }, 0);
      const coinValue = Math.max(0, coinQuantity) * (prices[symbol] || 0);
      return { symbol: symbol.toUpperCase(), value: coinValue };
    }).filter(d => d.value > 0)
    : undefined;

  const totalQuantity = isOverview
    ? 0
    : Math.max(0, filteredInvestments.reduce((sum, inv) => {
      const isSell = inv.type === 'sell' || (inv.amount < 0 && inv.type !== 'buy');
      return sum + (isSell ? -Math.abs(inv.quantity) : inv.quantity);
    }, 0));

  // --- Background Profit Tracking Logic ---
  useEffect(() => {
    if (Object.keys(prices).length === 0 || investments.length === 0) return;

    const coinsToTrack = Array.from(new Set(investments.map(inv => inv.coinSymbol.toLowerCase())));
    const now = new Date().toISOString();
    const snapshotsToSave: Record<string, any> = {};

    let hasUpdate = false;

    coinsToTrack.forEach(symbol => {
      const coinQuantity = (investments || [])
        .filter(inv => inv.coinSymbol.toLowerCase() === symbol.toLowerCase())
        .reduce((q, inv) => {
          const isSell = inv.type === 'sell' || (inv.amount < 0 && inv.type !== 'buy');
          return q + (isSell ? -Math.abs(inv.quantity) : inv.quantity);
        }, 0);

      if (coinQuantity > 0) {
        const coinPrice = prices[symbol] || 0;
        const coinInvested = (investments || [])
          .filter(inv => inv.coinSymbol.toLowerCase() === symbol.toLowerCase())
          .reduce((sum, inv) => {
            const isSell = inv.type === 'sell' || (inv.amount < 0 && inv.type !== 'buy');
            return sum + (isSell ? -Math.abs(inv.amount) : inv.amount);
          }, 0);

        const currentValue = coinQuantity * coinPrice;
        const profitLoss = currentValue - coinInvested;
        const profitPercent = coinInvested > 0 ? (profitLoss / coinInvested) * 100 : 0;

        snapshotsToSave[symbol] = {
          timestamp: now,
          profitLoss,
          profitPercent,
          currentValue
        };
        hasUpdate = true;
      }
    });

    if (!hasUpdate) return;

    const saved = localStorage.getItem('profit_snapshots');
    let currentData: Record<string, any[]> = {};
    if (saved) {
      try {
        currentData = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing profit snapshots:', e);
      }
    }

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    let modified = false;

    Object.keys(snapshotsToSave).forEach(symbol => {
      const history = currentData[symbol] || [];
      const newSnap = snapshotsToSave[symbol];

      const lastSnap = history[history.length - 1];
      if (lastSnap) {
        const lastTime = new Date(lastSnap.timestamp).getTime();
        const timeDiff = Date.now() - lastTime;
        if (timeDiff < 60000 && Math.abs(lastSnap.profitLoss - newSnap.profitLoss) < 0.1) {
          return;
        }
      }

      const updated = [...history, newSnap].filter(
        snap => new Date(snap.timestamp).getTime() > oneDayAgo
      );

      currentData[symbol] = updated;
      modified = true;
    });

    if (modified) {
      try {
        localStorage.setItem('profit_snapshots', JSON.stringify(currentData));
        window.dispatchEvent(new Event('profit_snapshots_updated'));
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          Object.keys(currentData).forEach(s => {
            if (currentData[s].length > 20) {
              currentData[s] = currentData[s].slice(Math.floor(currentData[s].length / 2));
            }
          });
          localStorage.setItem('profit_snapshots', JSON.stringify(currentData));
        }
      }
    }
  }, [prices, investments]);

  const supportedCoins = ['overview', 'btc', 'eth', 'xrp', 'doge', 'sui', 'hype', 'ondo', 'ada'];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebar
          selectedCoin={selectedCoin}
          onSelectCoin={setSelectedCoin}
          supportedCoins={supportedCoins}
        />

        <SidebarInset className="flex-1 transition-all duration-300">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/50 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-[1px] bg-border/50" />
              <h1 className="text-xl font-black tracking-tighter uppercase text-glow">
                <DecryptedText
                  text={selectedCoin === 'overview' ? 'Global Portfolio' : `${selectedCoin} Terminal`}
                  animateOn="view"
                  revealDirection="center"
                  speed={80}
                />
              </h1>
            </div>

            <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/30 rounded-full border border-border/50 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Optimal</span>
            </div>
          </header>

          <main className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <StatsCards
                totalInvested={totalInvested}
                totalCurrentValue={portfolioValue}
                profitLoss={profitLoss}
                profitLossPercent={profitLossPercent}
                btcPrice={currentPrice}
                btcQuantity={totalQuantity}
                coinSymbol={selectedCoin}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass rounded-xl p-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <InvestmentForm
                    onSubmit={handleAddInvestment}
                    loading={loading}
                    selectedCoin={selectedCoin}
                    prices={prices}
                  />
                </div>
                <div className="glass rounded-xl p-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <AllocationChart
                    totalInvested={totalInvested}
                    currentValue={portfolioValue}
                    profitLoss={profitLoss}
                    coinSymbol={selectedCoin}
                    portfolioData={portfolioData}
                  />
                </div>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <CryptoNews coinSymbol={selectedCoin} />
              </div>

              <div className="space-y-8">
                {isOverview ? (
                  <>
                    <PortfolioSummary
                      investments={investments}
                      prices={prices}
                      onSelectCoin={setSelectedCoin}
                    />
                    <InvestmentTable
                      investments={filteredInvestments}
                      currentBtcPrice={currentPrice}
                      coinSymbol={selectedCoin}
                      prices={prices}
                      onDelete={handleDeleteInvestment}
                    />
                  </>
                ) : (
                  <>
                    <div className="glass rounded-xl overflow-hidden border border-border/50">
                      <CoinPriceChart coinSymbol={selectedCoin} />
                    </div>
                    <InvestmentTable
                      investments={filteredInvestments}
                      currentBtcPrice={currentPrice}
                      coinSymbol={selectedCoin}
                      prices={prices}
                      onDelete={handleDeleteInvestment}
                    />
                  </>
                )}

                <div className="glass rounded-xl p-1">
                  <ProfitTrendChart
                    currentProfitLoss={profitLoss}
                    currentProfitPercent={profitLossPercent}
                    currentValue={portfolioValue}
                    coinSymbol={selectedCoin}
                  />
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
