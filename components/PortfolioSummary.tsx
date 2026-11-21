"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, BrainCircuit } from "lucide-react";
import { getCoinIcon } from "@/lib/coin-data";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface AIAnalysis {
  summary: string;
  sentiment_score: number;
  recommendations: string[];
}

interface Investment {
  id?: string;
  date: string;
  coinSymbol: string;
  amount: number;
  price: number;
  quantity: number;
}

interface PortfolioSummaryProps {
  investments: Investment[];
  prices: Record<string, number>;
  onSelectCoin: (coin: string) => void;
}

export default function PortfolioSummary({
  investments,
  prices,
  onSelectCoin,
}: PortfolioSummaryProps) {
  const [aiReport, setAiReport] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const coinsWithData = Array.from(
    new Set(investments.map((inv) => inv.coinSymbol)),
  );

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/analyze-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio: coinStats }),
      });
      const data = await response.json();
      if (data.summary) {
        // If it's already an object, just use it.
        // If it's a string, try to parse it, handle potential junk.
        let parsed = data.summary;
        if (typeof data.summary === "string") {
          try {
            const jsonMatch = data.summary.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(jsonMatch ? jsonMatch[0] : data.summary);
          } catch (e) {
            console.error("Frontend parsing error:", e);
            parsed = {
              summary: data.summary,
              sentiment_score: 0,
              recommendations: [],
            };
          }
        }
        setAiReport(parsed);
      }
    } catch (e) {
      console.error("Failed to parse AI response", e);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const coinStats = coinsWithData
    .map((symbol) => {
      const coinInvestments = investments.filter(
        (inv) => inv.coinSymbol === symbol,
      );
      const totalInvested = coinInvestments.reduce((sum, inv) => {
        const isSell =
          (inv as any).type === "sell" ||
          (inv.amount < 0 && (inv as any).type !== "buy");
        return sum + (isSell ? -Math.abs(inv.amount) : inv.amount);
      }, 0);
      const totalQuantity = coinInvestments.reduce((sum, inv) => {
        const isSell =
          (inv as any).type === "sell" ||
          (inv.amount < 0 && (inv as any).type !== "buy");
        return sum + (isSell ? -Math.abs(inv.quantity) : inv.quantity);
      }, 0);

      const currentPrice = prices[symbol] || 0;
      const currentValue = Math.max(0, totalQuantity) * currentPrice;
      const profitLoss = currentValue - totalInvested;
      const profitPercent =
        totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
      const avgPrice = totalQuantity > 0 ? totalInvested / totalQuantity : 0;

      return {
        symbol,
        totalInvested,
        totalQuantity: Math.max(0, totalQuantity),
        avgPrice,
        currentPrice,
        currentValue,
        profitLoss,
        profitPercent,
      };
    })
    .sort((a, b) => b.currentValue - a.currentValue);

  if (coinStats.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl font-black tracking-tight uppercase">
              ASSET PERFORMANCE
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-muted-foreground/60 mt-1">
              Individual performance metrics for your holdings
            </CardDescription>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            size="sm"
            className="h-8 text-[10px] sm:text-xs font-bold uppercase tracking-widest"
          >
            {loading ?
              "Analyzing..."
            : <>
                <BrainCircuit className="mr-2 h-3.5 w-3.5" /> AI Insight
              </>
            }
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {aiReport && (
          <div className="mb-6 p-4 bg-muted/30 border border-border/50 rounded-lg space-y-4 mx-0 sm:mx-6">
            {/* Market Sentiment Gauge Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">
                  AI Market Sentiment
                </p>
                <div className="text-xl font-black mt-1">
                  {aiReport.sentiment_score > 2 ?
                    "Bullish"
                  : aiReport.sentiment_score < -2 ?
                    "Bearish"
                  : "Neutral"}
                </div>
                <div className="h-2 mt-2 bg-muted rounded-full overflow-hidden flex">
                  <div
                    style={{
                      width: `${(Math.min(Math.max(aiReport.sentiment_score, -10), 10) + 10) * 5}%`,
                    }}
                    className={`h-full ${aiReport.sentiment_score >= 0 ? "bg-green-500" : "bg-red-500"}`}
                  />
                </div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border/50 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">
                    AI Score
                  </p>
                  <div className="text-2xl font-black text-primary">
                    {aiReport.sentiment_score}/10
                  </div>
                </div>
                <BrainCircuit className="h-8 w-8 text-primary/20" />
              </div>
            </div>

            {/* Analysis Summary */}
            <div>
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-2">
                <BrainCircuit className="h-3 w-3" /> Market Analysis
              </h4>
              <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {aiReport.summary}
              </div>
            </div>

            {/* Recommendations */}
            {aiReport.recommendations?.length > 0 && (
              <div className="pt-3 border-t border-border/50">
                <span className="font-black text-[9px] text-foreground uppercase tracking-widest">
                  Strategic Recommendations:
                </span>
                <ul className="list-disc list-inside text-xs mt-2 space-y-1 text-muted-foreground">
                  {aiReport.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 px-2 sm:px-4">
                  Asset
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 px-2 sm:px-4 hidden sm:table-cell">
                  Invested
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 px-2 sm:px-4 hidden lg:table-cell">
                  Avg. Price
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 px-2 sm:px-4">
                  Holdings
                </TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest h-10 px-2 sm:px-4">
                  Value
                </TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest h-10 px-2 sm:px-4">
                  P/L
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coinStats.map((stat) => (
                <TableRow
                  key={stat.symbol}
                  className="border-border/50 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => onSelectCoin(stat.symbol)}
                >
                  <TableCell className="font-black text-[10px] sm:text-xs text-primary px-2 sm:px-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {getCoinIcon(stat.symbol) && (
                        <img
                          src={getCoinIcon(stat.symbol)!}
                          alt={stat.symbol}
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      )}
                      {stat.symbol.toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] sm:text-xs px-2 sm:px-4 hidden sm:table-cell">
                    {formatCurrency(stat.totalInvested)}
                  </TableCell>
                  <TableCell className="text-[10px] sm:text-xs px-2 sm:px-4 hidden lg:table-cell">
                    {stat.totalQuantity > 0 ?
                      formatCurrency(stat.avgPrice)
                    : "-"}
                  </TableCell>

                  <TableCell className="text-[10px] sm:text-xs px-2 sm:px-4 font-mono">
                    {stat.totalQuantity.toLocaleString("id-ID", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 4,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-black text-[10px] sm:text-xs px-2 sm:px-4">
                    {formatCurrency(stat.currentValue)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-black text-[10px] sm:text-xs px-2 sm:px-4",
                      stat.profitLoss >= 0 ? "text-green-400" : "text-red-400",
                    )}
                  >
                    <div className="flex flex-col items-end leading-none gap-1">
                      <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                        {stat.profitLoss >= 0 ?
                          <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        : <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                        <span>{stat.profitPercent.toFixed(2)}%</span>
                      </div>
                      <div className="text-[8px] sm:text-[9px] opacity-70 font-bold">
                        {stat.profitLoss >= 0 ? "+" : ""}
                        {formatCurrency(stat.profitLoss)}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
