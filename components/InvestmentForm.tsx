'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface InvestmentFormProps {
  onSubmit: (btcAmount: number) => void;
  loading: boolean;
}

export default function InvestmentForm({ onSubmit, loading }: InvestmentFormProps) {
  const [btcAmount, setBtcAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const btc = parseFloat(btcAmount.replace(/\./g, '').replace(',', '.')) || 0;

    if (btc <= 0) {
      alert('Masukkan jumlah investasi yang valid');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(btc);
      setBtcAmount('');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDisplay = (value: string) => {
    if (!value) return '';
    const num = value.replace(/\D/g, '');
    if (!num) return '';
    return parseInt(num).toLocaleString('id-ID');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Tambah Investasi Bulanan
        </CardTitle>
        <CardDescription>
          Masukkan jumlah investasi BTC untuk bulan ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="btcAmount">Investasi BTC (Rupiah)</Label>
            <Input
              type="text"
              id="btcAmount"
              value={formatDisplay(btcAmount)}
              onChange={(e) => setBtcAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="Contoh: 1.500.000"
              disabled={submitting || loading}
              className="text-lg"
            />
          </div>
          <Button 
            type="submit" 
            disabled={submitting || loading}
            className="w-full"
            size="lg"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Investasi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
