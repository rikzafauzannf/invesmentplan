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

interface Investment {
  id?: string;
  date: string;
  coinSymbol: string;
  amount: number;
  price: number;
  quantity: number;
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

  const handleAddInvestment = async (amount: number, coinSymbol: string) => {
    try {
      const response = await fetch('/api/prices');
      const data = await response.json();
      const currentPrices = data.prices;

      const price = currentPrices[coinSymbol];
      if (!price) {
        alert('Harga koin tidak ditemukan. Silakan coba lagi nanti.');
        return;
      }

      const quantity = amount / price;

      await createInvestment({
        date: new Date().toISOString(),
        coinSymbol,
        amount,
        price,
        quantity,
      });

      setSelectedCoin(coinSymbol);
      const updatedData = await fetchInvestments();
      setInvestments(updatedData);
    } catch (error) {
      console.error('Error adding investment:', error);
      alert('Error menambahkan investasi. Silakan coba lagi.');
    }
  };

  const isOverview = selectedCoin === 'overview';

  // Filter and Calculate totals for selected coin
  const filteredInvestments = isOverview
    ? investments
    : investments.filter(inv => inv.coinSymbol === selectedCoin);

  const currentPrice = isOverview ? 0 : (prices[selectedCoin] || 0);

  // Portfolio Totals
  const totalInvested = filteredInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  // For overview, we need to calculate current value per coin and sum them up
  const portfolioValue = isOverview
    ? Object.keys(prices).reduce((sum, symbol) => {
      const coinQuantity = investments
        .filter(inv => inv.coinSymbol === symbol)
        .reduce((q, inv) => q + inv.quantity, 0);
      return sum + (coinQuantity * (prices[symbol] || 0));
    }, 0)
    : filteredInvestments.reduce((sum, inv) => sum + inv.quantity, 0) * currentPrice;

  const profitLoss = portfolioValue - totalInvested;
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  // Coin distribution for chart
  const portfolioData = isOverview
    ? Array.from(new Set(investments.map(inv => inv.coinSymbol))).map(symbol => {
      const coinValue = investments
        .filter(inv => inv.coinSymbol === symbol)
        .reduce((sum, inv) => sum + inv.quantity, 0) * (prices[symbol] || 0);
      return { symbol: symbol.toUpperCase(), value: coinValue };
    }).filter(d => d.value > 0)
    : undefined;

  const totalQuantity = isOverview
    ? 0
    : filteredInvestments.reduce((sum, inv) => sum + inv.quantity, 0);

  const supportedCoins = ['overview', 'btc', 'eth', 'xrp', 'doge', 'sui', 'hype'];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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

          <div className="flex flex-wrap gap-2">
            {supportedCoins.map(coin => (
              <button
                key={coin}
                onClick={() => setSelectedCoin(coin)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${selectedCoin === coin
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
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
              </button>
            ))}
          </div>
        </div>

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
            />
          </>
        ) : (
          <InvestmentTable
            investments={filteredInvestments}
            currentBtcPrice={currentPrice}
            coinSymbol={selectedCoin}
            prices={prices}
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

