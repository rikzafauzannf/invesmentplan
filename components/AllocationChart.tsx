'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AllocationChartProps {
  totalInvested?: number;
  currentValue?: number;
  profitLoss?: number;
  coinSymbol?: string;
  portfolioData?: { symbol: string; value: number }[];
}

export default function AllocationChart({
  totalInvested = 0,
  currentValue = 0,
  profitLoss = 0,
  coinSymbol = 'btc',
  portfolioData,
}: AllocationChartProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const symbol = coinSymbol.toUpperCase();

  // Trigger animation when values change
  useEffect(() => {
    if (currentValue > 0 || (portfolioData && portfolioData.length > 0)) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentValue, profitLoss, portfolioData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isPortfolio = !!portfolioData;
  const profitPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  const chartData = isPortfolio
    ? portfolioData.map(d => ({ name: d.symbol.toUpperCase(), value: d.value }))
    : [
      { name: 'Total Investasi', value: totalInvested },
      { name: 'Profit/Loss', value: Math.abs(profitLoss) },
    ].filter(item => item.value > 0);

  const COIN_COLORS = ['#fbbf24', '#6366f1', '#3b82f6', '#10b981', '#f43f5e', '#a855f7'];
  const COLORS = isPortfolio
    ? COIN_COLORS
    : ['#3b82f6', profitLoss >= 0 ? '#10b981' : '#ef4444'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-primary font-medium">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };


  if (totalInvested === 0 && !isPortfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overview Portfolio {isPortfolio ? '' : symbol}</CardTitle>
          <CardDescription>Visualisasi portofolio investasi {isPortfolio ? 'seluruh koin' : symbol} Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Mulai investasi untuk melihat visualisasi portofolio {isPortfolio ? 'Anda' : symbol}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview Portfolio {isPortfolio ? '' : symbol}</CardTitle>
        <CardDescription>Visualisasi portofolio investasi {isPortfolio ? 'seluruh koin' : symbol} Anda</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className={`h-[300px] transition-opacity duration-500 ${isAnimating ? 'opacity-70' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(1)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Investasi</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatCurrency(totalInvested)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nilai Saat Ini</p>
              <p className="text-2xl font-bold text-orange-400">
                {formatCurrency(currentValue)}
              </p>
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {profitLoss >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  )}
                  <span className="text-sm text-muted-foreground">Profit/Loss</span>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(profitLoss)}
                  </p>
                  <p className={`text-sm ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profitLoss >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

