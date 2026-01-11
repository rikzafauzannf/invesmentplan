'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

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
}

export default function ProfitTrendChart({
  currentProfitLoss,
  currentProfitPercent,
  currentValue,
}: ProfitTrendChartProps) {
  const [snapshots, setSnapshots] = useState<ProfitSnapshot[]>([]);

  // Save snapshot every 15 minutes (when price updates)
  useEffect(() => {
    if (currentValue > 0) {
      const newSnapshot: ProfitSnapshot = {
        timestamp: new Date().toISOString(),
        profitLoss: currentProfitLoss,
        profitPercent: currentProfitPercent,
        currentValue,
      };

      setSnapshots((prev) => {
        const updated = [...prev, newSnapshot];
        // Keep only last 24 hours (96 snapshots if every 15 min)
        // Or last 7 days if you want longer history
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return updated.filter(
          (snap) => new Date(snap.timestamp).getTime() > oneDayAgo
        );
      });
    }
  }, [currentProfitLoss, currentProfitPercent, currentValue]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return timestamp;
    }
  };

  const chartData = snapshots.map((snap) => ({
    time: formatTime(snap.timestamp),
    profit: snap.profitLoss,
    percent: snap.profitPercent,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const profitValue = payload[0]?.value || 0;
      const percentValue = payload[0]?.payload?.percent || 0;
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground mb-2">
            {payload[0]?.payload?.time || 'N/A'}
          </p>
          <p className={`font-semibold ${profitValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            Profit: {formatCurrency(profitValue)}
          </p>
          <p className={`text-sm ${percentValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {percentValue >= 0 ? '+' : ''}
            {percentValue.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (snapshots.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Profit/Loss Trend (24 Jam)</CardTitle>
          <CardDescription>
            Grafik perubahan profit/loss dari waktu ke waktu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Data akan muncul setelah harga BTC terupdate (setiap 15 menit)
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Profit/Loss Trend (24 Jam)</CardTitle>
        <CardDescription>
          Grafik perubahan profit/loss dari waktu ke waktu
          <span className="ml-2 text-xs">
            (Update setiap 15 menit - {snapshots.length} data points)
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => {
                  if (Math.abs(value) >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`;
                  }
                  if (Math.abs(value) >= 1000) {
                    return `${(value / 1000).toFixed(0)}K`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Profit/Loss (Rp)"
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Profit Saat Ini</p>
              <p
                className={`text-lg font-bold ${
                  currentProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatCurrency(currentProfitLoss)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Persentase</p>
              <p
                className={`text-lg font-bold ${
                  currentProfitPercent >= 0 ? 'text-green-400' : 'text-red-400'
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

