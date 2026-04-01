'use client';

import { LayoutDashboard, TrendingUp, Wallet, PieChart, Newspaper, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCoinIcon } from '@/lib/coin-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SidebarProps {
    selectedCoin: string;
    onSelectCoin: (coin: string) => void;
    supportedCoins: string[];
}

export default function Sidebar({ selectedCoin, onSelectCoin, supportedCoins }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const mainLinks = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    ];

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r glass",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <div className="flex h-full flex-col gap-2 px-3 py-4">
                {/* Header */}
                <div className="flex items-center justify-between px-2 mb-6">
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-glow">
                            <TrendingUp className="h-6 w-6 text-primary" />
                            <span>DCA TRACKER</span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hover:bg-primary/10 text-primary"
                    >
                        {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {!isCollapsed ? 'Main Menu' : '•••'}
                    </div>
                    {mainLinks.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => onSelectCoin(link.id)}
                            className={cn(
                                "flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-all group",
                                selectedCoin === link.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <link.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span className="font-medium">{link.label}</span>}
                        </button>
                    ))}

                    <div className="px-2 mt-6 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {!isCollapsed ? 'Assets' : '•••'}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[50vh] pr-1 scrollbar-hide">
                        {supportedCoins.filter(c => c !== 'overview').map((coin) => (
                            <button
                                key={coin}
                                onClick={() => onSelectCoin(coin)}
                                className={cn(
                                    "flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-all group",
                                    selectedCoin === coin
                                        ? "bg-primary/20 text-primary border border-primary/30"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <img
                                    src={getCoinIcon(coin)}
                                    alt={coin}
                                    className="w-5 h-5 rounded-full shrink-0"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                {!isCollapsed && (
                                    <div className="flex items-center justify-between w-full">
                                        <span className="font-medium">{coin.toUpperCase()}</span>
                                        {selectedCoin === coin && (
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Footer */}
                <div className="mt-auto px-2 pt-4 border-t border-border/50">
                    <button className="flex items-center w-full gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                        <Settings className="h-5 w-5" />
                        {!isCollapsed && <span className="font-medium">Settings</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
