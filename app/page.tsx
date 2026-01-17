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
import { getCoinIcon } from '@/lib/coin-data';
import { TrendingUp, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  // Fetch current prices - Update every 15 minutes
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
    const interval = setInterval(fetchPrices, 15 * 60 * 1000);
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

        // Debug: console.log(`Attempting to sell ${quantity} ${coinSymbol}. Available: ${currentBalance}`);

        if (quantity > currentBalance + 0.00000001) { // Add tiny epsilon for floating point
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

  // For overview, we need to calculate current value per coin and sum them up
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

  // Coin distribution for chart
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


  const supportedCoins = ['overview', 'btc', 'eth', 'xrp', 'doge', 'sui', 'hype'];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={selectedCoin} onValueChange={setSelectedCoin} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Crypto DCA Tracker</h1>
                <p className="text-muted-foreground">
                  Track your Dollar Cost Averaging investment
                  <span className="ml-2 text-xs">(Harga update setiap 15 menit)</span>
                </p>
              </div>
            </div>

            <TabsList className="h-auto p-1 flex-wrap gap-1 bg-muted/50 border border-border">
              {supportedCoins.map(coin => (
                <TabsTrigger
                  key={coin}
                  value={coin}
                  className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 transition-all hover:bg-muted"
                >
                  {coin === 'overview' ? (
                    <>
                      <LayoutDashboard className="h-4 w-4" />
                      OVERVIEW
                    </>
                  ) : (
                    <>
                      <img
                        src={getCoinIcon(coin)}
                        alt={coin}
                        className="w-4 h-4 rounded-full"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      {coin.toUpperCase()}
                    </>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>


        <StatsCards
          totalInvested={totalInvested}
          totalCurrentValue={portfolioValue}
          profitLoss={profitLoss}
          profitLossPercent={profitLossPercent}
          btcPrice={currentPrice}
          btcQuantity={totalQuantity}
          coinSymbol={selectedCoin}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <InvestmentForm onSubmit={handleAddInvestment} loading={loading} />
          <AllocationChart
            totalInvested={totalInvested}
            currentValue={portfolioValue}
            profitLoss={profitLoss}
            coinSymbol={selectedCoin}
            portfolioData={portfolioData}
          />
        </div>

        <CryptoNews coinSymbol={selectedCoin} />

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
          <InvestmentTable
            investments={filteredInvestments}
            currentBtcPrice={currentPrice}
            coinSymbol={selectedCoin}
            prices={prices}
            onDelete={handleDeleteInvestment}
          />
        )}


        <ProfitTrendChart
          currentProfitLoss={profitLoss}
          currentProfitPercent={profitLossPercent}
          currentValue={portfolioValue}
          coinSymbol={selectedCoin}
        />


      </div>
    </div>
  );
}

