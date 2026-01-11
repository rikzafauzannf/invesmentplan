'use client';

import { useState, useEffect } from 'react';
import { createInvestment, fetchInvestments } from '@/lib/pocketbase';
import InvestmentForm from '@/components/InvestmentForm';
import InvestmentTable from '@/components/InvestmentTable';
import StatsCards from '@/components/StatsCards';
import AllocationChart from '@/components/AllocationChart';
import ProfitTrendChart from '@/components/ProfitTrendChart';
import { TrendingUp } from 'lucide-react';

interface Investment {
  id?: string;
  date: string;
  btcAmount: number;
  btcPrice: number;
  btcQuantity: number;
}

export default function Home() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [currentBtcPrice, setCurrentBtcPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch current prices - Update every 15 minutes
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/prices');
        const data = await response.json();
        setCurrentBtcPrice(data.btc);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    // Fetch immediately on mount
    fetchPrices();
    
    // Update every 15 minutes (900000 ms)
    // Change to 1800000 (30 minutes) if you prefer
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

    // Load immediately on mount
    loadInvestments();
    
    // Poll for updates every 10 seconds (for new investments)
    // This is separate from price updates
    const interval = setInterval(loadInvestments, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAddInvestment = async (btcAmount: number) => {
    try {
      const response = await fetch('/api/prices');
      const prices = await response.json();

      const btcQuantity = btcAmount / prices.btc;

      await createInvestment({
        date: new Date().toISOString(),
        btcAmount,
        btcPrice: prices.btc,
        btcQuantity,
      });

      // Reload investments after adding
      const data = await fetchInvestments();
      setInvestments(data);
    } catch (error) {
      console.error('Error adding investment:', error);
      alert('Error menambahkan investasi. Silakan coba lagi.');
    }
  };

  // Calculate totals
  const totalBtcInvested = investments.reduce((sum, inv) => sum + inv.btcAmount, 0);
  const totalBtcQuantity = investments.reduce((sum, inv) => sum + inv.btcQuantity, 0);
  const currentBtcValue = totalBtcQuantity * currentBtcPrice;
  const profitLoss = currentBtcValue - totalBtcInvested;
  const profitLossPercent = totalBtcInvested > 0 ? (profitLoss / totalBtcInvested) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">BTC DCA Tracker</h1>
            <p className="text-muted-foreground">
              Track your Bitcoin Dollar Cost Averaging investment
              <span className="ml-2 text-xs">(Harga update setiap 15 menit)</span>
            </p>
          </div>
        </div>

        <StatsCards
          totalInvested={totalBtcInvested}
          totalCurrentValue={currentBtcValue}
          profitLoss={profitLoss}
          profitLossPercent={profitLossPercent}
          btcPrice={currentBtcPrice}
          btcQuantity={totalBtcQuantity}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <InvestmentForm onSubmit={handleAddInvestment} loading={loading} />
          <AllocationChart
            totalInvested={totalBtcInvested}
            currentValue={currentBtcValue}
            profitLoss={profitLoss}
          />
        </div>

        <InvestmentTable
          investments={investments}
          currentBtcPrice={currentBtcPrice}
        />

        <ProfitTrendChart
          currentProfitLoss={profitLoss}
          currentProfitPercent={profitLossPercent}
          currentValue={currentBtcValue}
        />
      </div>
    </div>
  );
}
