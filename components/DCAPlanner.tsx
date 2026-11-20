'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp } from 'lucide-react';

export default function DCAPlanner() {
    const [monthly, setMonthly] = useState(1000000);
    const [years, setYears] = useState(2);
    const [annualReturn, setAnnualReturn] = useState(20);

    const totalInvested = monthly * 12 * years;
    // Simple compound interest for monthly contributions
    // FV = P * [((1 + r)^n - 1) / r]
    const r = (annualReturn / 100) / 12;
    const n = years * 12;
    const projectedValue = r > 0 
        ? monthly * ((Math.pow(1 + r, n) - 1) / r) 
        : totalInvested;
    
    const profit = projectedValue - totalInvested;

    const formatRupiah = (val: number) => {
        return val.toLocaleString('id-ID');
    };

    const handleInputAmount = (setter: (v: number) => void, val: string) => {
        const num = val.replace(/\D/g, '');
        setter(num ? parseInt(num) : 0);
    };

    return (
        <Card className="glass border-border/50">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    <CardTitle>DCA Projection Planner</CardTitle>
                </div>
                <CardDescription>Simulasi potensi hasil investasi DCA Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Investasi Per Bulan (Rp)</Label>
                        <Input 
                            type="text" 
                            value={formatRupiah(monthly)} 
                            onChange={(e) => handleInputAmount(setMonthly, e.target.value)}
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Durasi (Tahun)</Label>
                        <Input 
                            type="number" 
                            value={years} 
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Estimasi Return (%)</Label>
                        <Input 
                            type="number" 
                            value={annualReturn} 
                            onChange={(e) => setAnnualReturn(Number(e.target.value))}
                            className="bg-background/50"
                        />
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total Modal:</span>
                        <span className="font-bold">Rp {totalInvested.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Estimasi Profit:</span>
                        <span className="font-bold text-green-500">+Rp {profit.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="pt-2 border-t border-border/50 flex justify-between items-end">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Estimasi Total Akhir</p>
                            <p className="text-2xl font-black text-glow">Rp {projectedValue.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                            <TrendingUp className="w-3 h-3" />
                            {((profit / totalInvested) * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
