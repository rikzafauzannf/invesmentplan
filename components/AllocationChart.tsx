'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

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
    <Card className="border-none glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-black tracking-tight uppercase">
          {isPortfolio ? 'ASSET ALLOCATION' : `${symbol} PORTFOLIO`}
        </CardTitle>
        <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
          {isPortfolio ? 'Distribution of your digital wealth' : `Visual analysis of your ${symbol} position`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col h-full justify-between gap-6">
          <div className={cn(
            "h-[260px] transition-all duration-700",
            isAnimating ? "scale-95 opacity-50" : "scale-100 opacity-100"
          )}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/30">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 text-blue-400/60">Total Investasi</p>
                <p className="text-xl font-black text-blue-400 tracking-tight">
                  {formatCurrency(totalInvested)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 text-orange-400/60">Nilai Saat Ini</p>
                <p className="text-xl font-black text-orange-400 tracking-tight">
                  {formatCurrency(currentValue)}
                </p>
              </div>
            </div>

            <div className={cn(
              "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
              profitLoss >= 0
                ? "bg-green-500/5 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.05)]"
                : "bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  profitLoss >= 0 ? "bg-green-500/20" : "bg-red-500/20"
                )}>
                  {profitLoss >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Growth Performance</span>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-xl font-black tracking-tight",
                  profitLoss >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {formatCurrency(profitLoss)}
                </p>
                <p className={cn(
                  "text-xs font-black",
                  profitLoss >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {profitLoss >= 0 ? '▲' : '▼'} {Math.abs(profitPercent).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

