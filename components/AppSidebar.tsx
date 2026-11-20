'use client';

import * as React from 'react';
import {
    LayoutDashboard,
    TrendingUp,
} from 'lucide-react';
import { getCoinIcon } from '@/lib/coin-data';
import { cn } from '@/lib/utils';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarRail,
    useSidebar
} from '@/components/ui/sidebar';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    selectedCoin: string;
    onSelectCoin: (coin: string) => void;
    supportedCoins: string[];
    prices?: Record<string, number>;
    changes?: Record<string, number>;
}

export function AppSidebar({ selectedCoin, onSelectCoin, supportedCoins, prices, changes, ...props }: AppSidebarProps) {
    const { setOpenMobile } = useSidebar();

    const handleCoinSelect = (coin: string) => {
        onSelectCoin(coin);
        setOpenMobile(false);
    };

    const sortedList = React.useMemo(() => {
        return supportedCoins; 
    }, [supportedCoins]);

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/50 px-6">
                <div className="flex items-center gap-3 font-black tracking-tighter text-glow group">
                    <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl group-data-[collapsible=icon]:hidden">DCA TERMINAL</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest px-4 mb-2">Main System</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    size="lg"
                                    isActive={selectedCoin === 'overview'}
                                    onClick={() => handleCoinSelect('overview')}
                                    tooltip="Portfolio Overview"
                                    className={cn(
                                        "transition-all duration-300",
                                        selectedCoin === 'overview' ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                    )}
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    <span className="font-bold tracking-tight">DASHBOARD</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest px-4 mb-2">Digital Assets</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sortedList.filter(c => c !== 'overview').map((coin) => {
                                const change = changes?.[coin.toLowerCase()] || 0;
                                const isPositive = change > 0;
                                const isNegative = change < 0;
                                
                                return (
                                    <SidebarMenuItem key={coin}>
                                        <SidebarMenuButton
                                            size="lg"
                                            isActive={selectedCoin === coin}
                                            onClick={() => handleCoinSelect(coin)}
                                            tooltip={`${coin.toUpperCase()} Terminal`}
                                            className={cn(
                                                "transition-all duration-300 relative",
                                                selectedCoin === coin ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted"
                                            )}
                                        >
                                            <div className="relative">
                                                {getCoinIcon(coin) ? (
                                                    <img
                                                        src={getCoinIcon(coin) || undefined}
                                                        alt={coin}
                                                        className={cn(
                                                            "w-5 h-5 rounded-full transition-transform duration-300",
                                                            selectedCoin === coin ? "scale-110" : "grayscale opacity-50"
                                                        )}
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold">
                                                        {coin.slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                
                                                <div className={cn(
                                                    "absolute -top-1 -right-1 w-2 h-2 rounded-full border border-background",
                                                    isPositive && "bg-green-500 animate-pulse",
                                                    isNegative && "bg-red-500 animate-pulse",
                                                    !isPositive && !isNegative && "hidden"
                                                )} />
                                            </div>
                                            
                                            <div className="flex flex-col items-start gap-0 ml-1">
                                                <span className="font-bold tracking-tight uppercase text-xs">{coin}</span>
                                                <span className={cn(
                                                    "text-[9px] font-mono leading-none",
                                                    isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-muted-foreground"
                                                )}>
                                                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                                                </span>
                                            </div>
                                            
                                            {selectedCoin === coin && (
                                                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    );
}
