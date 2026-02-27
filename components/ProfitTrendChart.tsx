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

  // 1. Load from localStorage on initial mount
  useEffect(() => {
    const saved = localStorage.getItem('profit_snapshots');
    if (saved) {
      try {
        setSnapshotsByCoin(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading profit snapshots:', e);
      }
    }

    const savedInterval = localStorage.getItem('profit_chart_interval');
    if (savedInterval) {
      setIntervalMinutes(Number(savedInterval));
    }
  }, []);

  // Save interval preference
  useEffect(() => {
    localStorage.setItem('profit_chart_interval', interval.toString());
  }, [interval]);

  // 2. Save snapshot every 5 minutes (when price updates)
  useEffect(() => {
    if (currentValue > 0) {
      const newSnapshot: ProfitSnapshot = {
        timestamp: new Date().toISOString(),
        profitLoss: currentProfitLoss,
        profitPercent: currentProfitPercent,
        currentValue,
      };

      setSnapshotsByCoin((prev) => {
        const coinHistory = prev[coinSymbol] || [];

        // Avoid duplicate timestamps if updates happen faster than 1 minute
        const lastSnapshot = coinHistory[coinHistory.length - 1];
        if (lastSnapshot &&
          new Date(lastSnapshot.timestamp).getTime() > Date.now() - 60000 &&
          Math.abs(lastSnapshot.profitLoss - currentProfitLoss) < 1) {
          return prev;
        }

        const updated = [...coinHistory, newSnapshot];

        // Keep only last 24 hours
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const filtered = updated.filter(
          (snap) => new Date(snap.timestamp).getTime() > oneDayAgo
        );

        return {
          ...prev,
          [coinSymbol]: filtered,
        };
      });
    }
  }, [currentProfitLoss, currentProfitPercent, currentValue, coinSymbol]);

  // 3. Persist state to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(snapshotsByCoin).length === 0) return;

    const saveData = (data: Record<string, ProfitSnapshot[]>) => {
      try {
        localStorage.setItem('profit_snapshots', JSON.stringify(data));
      } catch (e) {
        if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          console.warn('LocalStorage Quota Exceeded. Pruning snapshots...');

          // Pruning logic: Remove the oldest 50% of data for each coin
          const prunedData: Record<string, ProfitSnapshot[]> = {};
          Object.keys(data).forEach(coin => {
            const history = data[coin];
            if (history.length > 10) {
              prunedData[coin] = history.slice(Math.floor(history.length / 2));
            } else {
              prunedData[coin] = history;
            }
          });

          // Try saving again with pruned data
          try {
            localStorage.setItem('profit_snapshots', JSON.stringify(prunedData));
            setSnapshotsByCoin(prunedData);
          } catch (secondError) {
            console.error('Still failing after pruning. Clearing snapshots.');
            localStorage.removeItem('profit_snapshots');
            setSnapshotsByCoin({});
          }
        }
      }
    };

    saveData(snapshotsByCoin);
  }, [snapshotsByCoin]);

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
      height: 450,
      toolbar: {
        show: true,
        tools: {
          download: false,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      background: 'transparent',
      foreColor: 'hsl(var(--muted-foreground))',
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: [currentProfitLoss >= 0 ? '#10b981' : '#ef4444'],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100],
        colorStops: [
          {
            offset: 0,
            color: currentProfitLoss >= 0 ? '#10b981' : '#ef4444',
            opacity: 0.4
          },
          {
            offset: 100,
            color: currentProfitLoss >= 0 ? '#10b981' : '#ef4444',
            opacity: 0.05
          }
        ]
      }
    },
    markers: {
      size: 0,
      hover: {
        size: 5
      }
    },
    title: {
      text: undefined,
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        style: {
          fontSize: '12px',
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
      tooltip: {
        enabled: true,
      },
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
          fontSize: '12px',
        },
      },
    },
    colors: [currentProfitLoss >= 0 ? '#10b981' : '#ef4444'],
    grid: {
      borderColor: 'hsl(var(--border))',
      strokeDashArray: 4,
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

        return `
          <div style="padding: 12px; background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <div style="font-size: 11px; color: hsl(var(--muted-foreground)); margin-bottom: 4px; font-weight: 500;">${date}</div>
            <div style="font-size: 14px; font-weight: 700; color: ${val >= 0 ? '#10b981' : '#ef4444'};">
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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Profit/Loss Trend {symbol} (24 Jam)</CardTitle>
          <CardDescription>
            Grafik perubahan profit/loss {symbol} dari waktu ke waktu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Data akan muncul setelah harga {symbol} terupdate (setiap 5 menit)
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Profit/Loss Trend {symbol} (24 Jam)</CardTitle>
          <CardDescription>
            Grafik perubahan profit/loss {symbol} ({interval >= 60 ? `${interval / 60}h` : `${interval}m`} interval)
            <span className="ml-2 text-xs">
              (Update setiap 5 menit - {snapshots.length} data points)
            </span>
          </CardDescription>
        </div>
        <div className="flex bg-muted rounded-lg p-1">
          {[5, 15, 60].map((m) => (
            <button
              key={m}
              onClick={() => setIntervalMinutes(m)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${interval === m
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {m >= 60 ? `${m / 60}h` : `${m}m`}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[450px]">
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="area"
            height={450}
          />
        </div>
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Profit Saat Ini</p>
              <p
                className={`text-lg font-bold ${currentProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
              >
                {formatCurrency(currentProfitLoss)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Persentase</p>
              <p
                className={`text-lg font-bold ${currentProfitPercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
              >
                {currentProfitPercent >= 0 ? '+' : ''}
                {currentProfitPercent.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data Points</p>
              <p className="text-lg font-bold text-foreground">
                {snapshots.length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


