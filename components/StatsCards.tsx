'use client';

import { TrendingUp, TrendingDown, DollarSign, Bitcoin, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import DecryptedText from '@/components/reactbits/DecryptedText';

interface StatsCardsProps {
  totalInvested: number;
  totalCurrentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  btcPrice: number;
  btcQuantity: number;
  coinSymbol?: string;
}

export default function StatsCards({
  totalInvested,
  totalCurrentValue,
  profitLoss,
  profitLossPercent,
  btcPrice,
  btcQuantity,
  coinSymbol = 'btc',
}: StatsCardsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isOverview = coinSymbol === 'overview';
  const symbol = isOverview ? 'Portfolio' : coinSymbol.toUpperCase();

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

  const formatQuantity = (value: number) => {
    return value.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    });
  };

  const stats = [
    {
      title: isOverview ? 'Total Portfolio (Net)' : 'Investasi Bersih (Net)',
      value: formatCurrency(totalInvested),
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: isOverview ? 'Total Portfolio Value' : 'Nilai Saat Ini',
      value: formatCurrency(totalCurrentValue),
      icon: Bitcoin,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Total Profit (Cum.)',
      value: `${formatCurrency(profitLoss)} (${profitLossPercent >= 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%)`,
      icon: profitLoss >= 0 ? TrendingUp : TrendingDown,
      color: profitLoss >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: profitLoss >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
    },

  ];

  if (!isOverview) {
    stats.push(
      {
        title: `Harga ${symbol} Saat Ini`,
        value: formatCurrency(btcPrice),
        icon: isUpdating ? RefreshCw : Bitcoin,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
      },
      {
        title: `Total ${symbol}`,
        value: `${formatQuantity(btcQuantity)} ${symbol}`,
        icon: Bitcoin,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
      }
    );
  }

  return (
    <div className={`grid grid-cols-1 ${isOverview ? 'md:grid-cols-3' : 'lg:grid-cols-3 md:grid-cols-2'} gap-6`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const shouldAnimate = !isOverview && index >= 3 && isUpdating;
        return (
          <SpotlightCard
            key={index}
            className="border-none glass glass-hover relative overflow-hidden group p-0"
            spotlightColor={stat.color.includes('green') ? 'rgba(34, 197, 94, 0.1)' : stat.color.includes('red') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 rounded-full blur-2xl ${stat.bgColor}`} />
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest h-4">
                    <DecryptedText
                      text={stat.title}
                      animateOn="view"
                      speed={100}
                      maxIterations={15}
                      sequential={true}
                    />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className={cn(
                      "text-2xl font-black tracking-tight",
                      stat.color
                    )}>
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "p-3 rounded-2xl transition-all duration-300 group-hover:scale-110",
                  stat.bgColor
                )}>
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      stat.color,
                      shouldAnimate && "animate-spin"
                    )}
                  />
                </div>
              </div>
            </div>
          </SpotlightCard>
        );
      })}
    </div>
  );
}
