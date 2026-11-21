'use client';

import { TrendingUp, TrendingDown, DollarSign, RefreshCw, Circle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getCoinIcon } from '@/lib/coin-data';
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
      title: isOverview ? 'Total Portfolio (Net)' : 'Net Investment',
      value: formatCurrency(totalInvested),
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      isCustomIcon: false,
    },
    {
      title: isOverview ? 'Total Portfolio Value' : 'Current Value',
      value: formatCurrency(totalCurrentValue),
      icon: DollarSign,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      isCustomIcon: false,
    },
    {
      title: 'Total Profit (Cum.)',
      value: `${formatCurrency(profitLoss)} (${profitLossPercent >= 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%)`,
      icon: profitLoss >= 0 ? TrendingUp : TrendingDown,
      color: profitLoss >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: profitLoss >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      isCustomIcon: false,
    },
  ];

  if (!isOverview) {
    stats.push(
      {
        title: `${symbol} Current Price`,
        value: formatCurrency(btcPrice),
        icon: isUpdating ? RefreshCw : Circle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        isCustomIcon: true,
      },
      {
        title: `Total ${symbol} Holdings`,
        value: `${formatQuantity(btcQuantity)} ${symbol}`,
        icon: Circle,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        isCustomIcon: true,
      }
    );
  }

  return (
    <div className={`grid grid-cols-1 ${isOverview ? 'md:grid-cols-3' : 'lg:grid-cols-3 md:grid-cols-2'} gap-3 sm:gap-6`}>
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
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider sm:tracking-widest h-4 truncate">
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
                      "text-lg sm:text-xl md:text-2xl font-black tracking-tight break-words",
                      stat.color
                    )}>
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "p-2.5 sm:p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 shrink-0",
                  stat.bgColor
                )}>
                  {stat.isCustomIcon ? (
                    getCoinIcon(coinSymbol || 'btc') ? (
                      <img 
                        src={getCoinIcon(coinSymbol || 'btc') || undefined} 
                        className={cn("h-5 w-5 sm:h-6 sm:w-6 rounded-full", shouldAnimate && "animate-spin")} 
                        alt={coinSymbol}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-muted flex items-center justify-center text-[8px] sm:text-[9px] font-bold">
                        {(coinSymbol || 'btc').slice(0, 2).toUpperCase()}
                      </div>
                    )
                  ) : (
                    <Icon
                      className={cn(
                        "h-5 w-5 sm:h-6 sm:w-6",
                        stat.color,
                        shouldAnimate && "animate-spin"
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
          </SpotlightCard>
        );
      })}
    </div>
  );
}
