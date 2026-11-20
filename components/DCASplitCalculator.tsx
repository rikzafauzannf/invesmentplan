'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PieChart, Coins, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

interface DCASplitCalculatorProps {
    prices: Record<string, number>;
    supportedCoins: string[];
    onExecuteSplit?: (allocations: Record<string, number>) => void;
}

const COIN_NAMES: Record<string, string> = {
    btc: 'Bitcoin',
    eth: 'Ethereum',
    xrp: 'Ripple',
    doge: 'Dogecoin',
    sui: 'Sui',
    hype: 'Hyperliquid',
    ondo: 'Ondo Finance',
    ada: 'Cardano',
    sol: 'Solana',
};

export default function DCASplitCalculator({ prices, supportedCoins, onExecuteSplit }: DCASplitCalculatorProps) {
    const coinList = supportedCoins.filter(c => c !== 'overview');
    const [budget, setBudget] = useState<number>(1000000);
    const [selectedCoins, setSelectedCoins] = useState<string[]>(['btc', 'eth', 'sol']);
    const [weights, setWeights] = useState<Record<string, number>>({
        btc: 50,
        eth: 30,
        sol: 20,
    });

    const formatRupiah = (val: number) => {
        return val.toLocaleString('id-ID');
    };

    const handleInputBudget = (val: string) => {
        const num = val.replace(/\D/g, '');
        setBudget(num ? parseInt(num) : 0);
    };

    const toggleCoin = (coin: string) => {
        if (selectedCoins.includes(coin)) {
            if (selectedCoins.length === 1) {
                toast.error('Pilih minimal 1 koin.');
                return;
            }
            const next = selectedCoins.filter(c => c !== coin);
            setSelectedCoins(next);
            // Re-balance equally among remaining
            const equalWeight = Math.floor(100 / next.length);
            const newWeights: Record<string, number> = {};
            next.forEach((c, idx) => {
                newWeights[c] = idx === 0 ? 100 - equalWeight * (next.length - 1) : equalWeight;
            });
            setWeights(newWeights);
        } else {
            const next = [...selectedCoins, coin];
            setSelectedCoins(next);
            const equalWeight = Math.floor(100 / next.length);
            const newWeights: Record<string, number> = {};
            next.forEach((c, idx) => {
                newWeights[c] = idx === 0 ? 100 - equalWeight * (next.length - 1) : equalWeight;
            });
            setWeights(newWeights);
        }
    };

    const handleWeightChange = (coin: string, val: number) => {
        setWeights(prev => ({ ...prev, [coin]: val }));
    };

    const totalWeight = selectedCoins.reduce((sum, c) => sum + (weights[c] || 0), 0);

    const handleAutoEqual = () => {
        const equalWeight = Math.floor(100 / selectedCoins.length);
        const newWeights: Record<string, number> = {};
        selectedCoins.forEach((c, idx) => {
            newWeights[c] = idx === 0 ? 100 - equalWeight * (selectedCoins.length - 1) : equalWeight;
        });
        setWeights(newWeights);
    };

    const applyRiskProfile = (profile: 'safe' | 'balanced' | 'risky') => {
        const profiles: Record<string, Record<string, number>> = {
            safe: { btc: 60, eth: 30, sol: 10 },
            balanced: { btc: 40, eth: 20, sol: 20, sui: 10, doge: 10 },
            risky: { btc: 20, eth: 10, sol: 20, hype: 20, sui: 10, ondo: 10, doge: 10 }
        };
        
        const target = profiles[profile];
        const newSelected = Object.keys(target).filter(c => coinList.includes(c));
        setSelectedCoins(newSelected);
        setWeights(target);
        toast.info(`Profil ${profile.toUpperCase()} diterapkan.`);
    };

    return (
        <Card className="glass border-border/50">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    <CardTitle>DCA Budget Splitter</CardTitle>
                </div>
                <CardDescription>Bagi modal belanja rutin Anda ke beberapa koin secara otomatis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Total Modal / Budget DCA (Rp)</Label>
                    <Input 
                        type="text" 
                        value={formatRupiah(budget)} 
                        onChange={(e) => handleInputBudget(e.target.value)}
                        className="bg-background/50 text-lg font-bold"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Saran Strategi Porsi</Label>
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" onClick={() => applyRiskProfile('safe')} className="text-[10px] h-8 border-green-500/30 hover:bg-green-500/10">Konservatif</Button>
                        <Button variant="outline" size="sm" onClick={() => applyRiskProfile('balanced')} className="text-[10px] h-8 border-blue-500/30 hover:bg-blue-500/10">Moderat</Button>
                        <Button variant="outline" size="sm" onClick={() => applyRiskProfile('risky')} className="text-[10px] h-8 border-red-500/30 hover:bg-red-500/10">Agresif</Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-black">Pilih Koin Target</Label>
                    <div className="flex flex-wrap gap-2">
                        {coinList.map(coin => {
                            const isSelected = selectedCoins.includes(coin);
                            return (
                                <button
                                    key={coin}
                                    type="button"
                                    onClick={() => toggleCoin(coin)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                        isSelected 
                                            ? 'bg-primary/20 border-primary text-primary' 
                                            : 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                    {coin.toUpperCase()}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-black">Atur Porsi Alokasi (%)</Label>
                        <Button variant="outline" size="sm" onClick={handleAutoEqual} className="text-xs h-7">
                            Rata (Equal)
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedCoins.map(coin => {
                            const porsi = weights[coin] || 0;
                            const nominal = (budget * porsi) / 100;
                            return (
                                <div key={coin} className="p-3 rounded-lg bg-muted/20 border border-border/40 space-y-2">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span>{COIN_NAMES[coin] || coin.toUpperCase()} ({coin.toUpperCase()})</span>
                                        <span className="text-primary">Rp {nominal.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="100" 
                                            value={porsi}
                                            onChange={(e) => handleWeightChange(coin, Number(e.target.value))}
                                            className="w-full accent-primary cursor-pointer"
                                        />
                                        <span className="text-xs font-mono w-10 text-right">{porsi}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalWeight !== 100 && (
                        <p className="text-xs text-amber-500 font-medium">
                            ⚠️ Total porsi saat ini {totalWeight}%. Disarankan pas di angka 100%.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
