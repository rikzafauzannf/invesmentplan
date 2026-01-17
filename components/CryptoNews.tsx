'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, TrendingDown, Info, Newspaper } from 'lucide-react';

interface NewsItem {
    id: string;
    title: string;
    source: string;
    url: string;
    summary: string;
    timestamp: number;
    image: string;
}

interface Analysis {
    summary: string;
    potential: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
}

interface CryptoNewsProps {
    coinSymbol: string;
}

export default function CryptoNews({ coinSymbol }: CryptoNewsProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [loading, setLoading] = useState(true);

    const symbol = coinSymbol.toUpperCase();

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/news?coin=${coinSymbol}`);
                const data = await response.json();
                setNews(data.news || []);
                setAnalysis(data.analysis || null);
            } catch (error) {
                console.error('Error loading news:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [coinSymbol]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 animate-pulse">
                <div className="lg:col-span-1 h-[400px] bg-muted/50 rounded-xl" />
                <div className="lg:col-span-2 h-[400px] bg-muted/50 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Analysis Section */}
            <Card className="lg:col-span-1 border-primary/20 shadow-lg shadow-primary/5">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            Market Analysis {symbol === 'OVERVIEW' ? '' : symbol}
                        </CardTitle>
                        {analysis && (
                            <Badge variant={
                                analysis.sentiment === 'bullish' ? 'default' :
                                    analysis.sentiment === 'bearish' ? 'destructive' : 'secondary'
                            } className="capitalize">
                                {analysis.sentiment}
                            </Badge>
                        )}
                    </div>
                    <CardDescription>Potensi dan analisis teknikal singkat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {analysis && (
                        <>
                            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-400" />
                                    Rangkuman Pasar
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {analysis.summary}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Potensi Kenaikan
                                </h4>
                                <p className="text-sm text-primary font-medium">
                                    {analysis.potential}
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* News Section */}
            <Card className="lg:col-span-2 border-border gap-4">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Newspaper className="h-5 w-5 text-primary" />
                        Berita Terkait {symbol === 'OVERVIEW' ? 'Crypto' : symbol}
                    </CardTitle>
                    <CardDescription>Berita terbaru dari sumber global terpercaya</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                        {news.length > 0 ? (
                            news.map((item) => (
                                <a
                                    key={item.id}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block group p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                <span className="font-bold text-primary/80">{item.source}</span>
                                                <span>•</span>
                                                <span>{new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {item.summary}
                                            </p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                    </div>
                                </a>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                Tidak ada berita terbaru untuk koin ini.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
