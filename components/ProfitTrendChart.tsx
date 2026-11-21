'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Dynamically import ReactApexChart to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ProfitSnapshot {
  timestamp: string;
  profitLoss: number;
  profitPercent: number;
  currentValue: number;
}

interface ProfitTrendChartProps {
  currentProfitLoss: number;
  currentProfitPercent: number;
  currentValue: number;
  coinSymbol?: string;
}

export default function ProfitTrendChart({
  currentProfitLoss,
  currentProfitPercent,
  currentValue,
  coinSymbol = 'btc',
}: ProfitTrendChartProps) {
  const [snapshotsByCoin, setSnapshotsByCoin] = useState<Record<string, ProfitSnapshot[]>>({});
  const [interval, setIntervalMinutes] = useState<number>(15); // Default to 15 minutes
  const symbol = coinSymbol.toUpperCase();

  // 1. Load snapshots from localStorage
  const loadSnapshots = () => {
    const saved = localStorage.getItem('profit_snapshots');
    if (saved) {
      try {
        setSnapshotsByCoin(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading profit snapshots:', e);
      }
    }
  };

  useEffect(() => {
    loadSnapshots();

    const savedInterval = localStorage.getItem('profit_chart_interval');
    if (savedInterval) {
      setIntervalMinutes(Number(savedInterval));
    }

    // Listen for global updates from page.tsx background service
    window.addEventListener('profit_snapshots_updated', loadSnapshots);
    return () => window.removeEventListener('profit_snapshots_updated', loadSnapshots);
  }, []);

  // Save interval preference
  useEffect(() => {
    localStorage.setItem('profit_chart_interval', interval.toString());
  }, [interval]);

  const snapshots = snapshotsByCoin[coinSymbol] || [];

  const formatCurrency = (value: number, decimals = 0) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  // Aggregate data into Area chart points
  const areaData = useMemo(() => {
    if (snapshots.length === 0) return [];

    const sortedSnapshots = [...snapshots].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const intervalMs = interval * 60 * 1000;
    const buckets: Record<number, ProfitSnapshot[]> = {};

    sortedSnapshots.forEach((snap) => {
      const time = new Date(snap.timestamp).getTime();
      const bucketKey = Math.floor(time / intervalMs) * intervalMs;
      if (!buckets[bucketKey]) buckets[bucketKey] = [];
      buckets[bucketKey].push(snap);
    });

    return Object.keys(buckets)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => {
        const bucketSnapshots = buckets[Number(key)];
        const close = bucketSnapshots[bucketSnapshots.length - 1].profitLoss;

        return {
          x: new Date(Number(key)),
          y: close,
        };
      });
  }, [snapshots, interval]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false, // Cleaner UI by default
      },
      background: 'transparent',
      foreColor: 'hsl(var(--muted-foreground))',
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2.5,
      colors: [currentProfitLoss >= 0 ? '#10b981' : '#f43f5e'],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.02,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: currentProfitLoss >= 0 ? '#10b981' : '#f43f5e',
            opacity: 0.25
          },
          {
            offset: 100,
            color: currentProfitLoss >= 0 ? '#10b981' : '#f43f5e',
            opacity: 0.02
          }
        ]
      }
    },
    markers: {
      size: 0,
      hover: {
        size: 4
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        style: {
          fontSize: '10px',
        },
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => {
          if (Math.abs(value) >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
          }
          if (Math.abs(value) >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
          }
          return Math.floor(value).toString();
        },
        style: {
          fontSize: '10px',
        },
      },
    },
    colors: [currentProfitLoss >= 0 ? '#10b981' : '#f43f5e'],
    grid: {
      borderColor: 'hsl(var(--border))',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'HH:mm'
      },
      y: {
        formatter: (value) => formatCurrency(value, 2)
      },
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const val = series[seriesIndex][dataPointIndex];
        const date = format(new Date(w.globals.seriesX[seriesIndex][dataPointIndex]), 'HH:mm');
        const color = val >= 0 ? '#10b981' : '#f43f5e';

        return `
          <div style="padding: 10px; background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">
            <div style="font-size: 9px; color: hsl(var(--muted-foreground)); margin-bottom: 2px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">${date}</div>
            <div style="font-size: 12px; font-weight: 800; color: ${color};">
                ${formatCurrency(val, 2)}
            </div>
          </div>
        `;
      }
    },
  };

  const series = [
    {
      name: 'Profit/Loss',
      data: areaData,
    },
  ];

  if (snapshots.length === 0) {
    return (
      <Card className="border-none glass">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl font-black tracking-tight uppercase">PROFIT/LOSS TREND (24H)</CardTitle>
          <CardDescription className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Real-time tracking for {symbol} performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-xs font-medium text-muted-foreground py-10 uppercase tracking-widest">
            Awaiting price snapshot updates (Every 5 mins)
          </p>
        </CardContent>
      </Card>
    );
  }

// ... inside the return statement of ProfitTrendChart.tsx ...
  return (
    <Card className="border-none glass group hover:shadow-[0_0_30px_-10px_rgba(var(--primary-rgb),0.3)] transition-all duration-500">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg sm:text-xl font-black tracking-tight uppercase flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            PROFIT/LOSS TREND ({symbol})
          </CardTitle>
          <CardDescription className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-muted-foreground/60 mt-1">
            24H Movement • {interval >= 60 ? `${interval / 60}H` : `${interval}M`} Interval
          </CardDescription>
        </div>
        <div className="flex bg-muted/40 border border-border/50 rounded-lg p-1 self-start sm:self-auto">
          {[5, 15, 60].map((m) => (
            <button
              key={m}
              onClick={() => setIntervalMinutes(m)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all duration-300 ${
                interval === m
                  ? 'bg-primary/20 text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m >= 60 ? `${m / 60}H` : `${m}M`}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[300px] w-full relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none z-10" />
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="area"
            height="100%"
          />
        </div>
        {/* ... stats footer ... */}
        <div className="p-3 sm:p-4 rounded-xl bg-muted/20 border border-border/40">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Current P/L</p>
              <p
                className={`text-sm sm:text-base font-black tracking-tight mt-0.5 ${
                  currentProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatCurrency(currentProfitLoss)}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Percentage</p>
              <p
                className={`text-sm sm:text-base font-black tracking-tight mt-0.5 ${
                  currentProfitPercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {currentProfitPercent >= 0 ? '+' : ''}
                {currentProfitPercent.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Snapshots</p>
              <p className="text-sm sm:text-base font-black tracking-tight text-foreground mt-0.5 font-mono">
                {snapshots.length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

}


