'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsCardsProps {
  totalInvested: number;
  totalCurrentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  btcPrice: number;
  btcQuantity: number;
}

export default function StatsCards({
  totalInvested,
  totalCurrentValue,
  profitLoss,
  profitLossPercent,
  btcPrice,
  btcQuantity,
}: StatsCardsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Show updating indicator when price changes
  useEffect(() => {
    if (btcPrice > 0) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [btcPrice]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatBtc = (value: number) => {
    return value.toFixed(8);
  };

  const stats = [
    {
      title: 'Total Investasi',
      value: formatCurrency(totalInvested),
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Nilai Saat Ini',
      value: formatCurrency(totalCurrentValue),
      icon: Bitcoin,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Profit/Loss',
      value: `${formatCurrency(profitLoss)} (${profitLossPercent >= 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%)`,
      icon: profitLoss >= 0 ? TrendingUp : TrendingDown,
      color: profitLoss >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: profitLoss >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
    },
    {
      title: 'Harga BTC Saat Ini',
      value: formatCurrency(btcPrice),
      icon: isUpdating ? RefreshCw : Bitcoin,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      isUpdating,
    },
    {
      title: 'Total BTC',
      value: `${formatBtc(btcQuantity)} BTC`,
      icon: Bitcoin,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon 
                    className={`h-5 w-5 ${stat.color} ${(stat as any).isUpdating ? 'animate-spin' : ''}`} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
