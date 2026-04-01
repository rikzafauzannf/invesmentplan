'use client';

import * as React from 'react';
import {
    LayoutDashboard,
    TrendingUp,
    Wallet,
    PieChart,
    Search,
    ChevronRight,
    Monitor
} from 'lucide-react';
import { getCoinIcon } from '@/lib/coin-data';
import { cn } from '@/lib/utils';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
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
}

export function AppSidebar({ selectedCoin, onSelectCoin, supportedCoins, ...props }: AppSidebarProps) {
    const { setOpenMobile } = useSidebar();

    const handleCoinSelect = (coin: string) => {
        onSelectCoin(coin);
        setOpenMobile(false);
    };

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
                {/* Main Section */}
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

                {/* Assets Section */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest px-4 mb-2">Digital Assets</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {supportedCoins.filter(c => c !== 'overview').map((coin) => (
                                <SidebarMenuItem key={coin}>
                                    <SidebarMenuButton
                                        size="lg"
                                        isActive={selectedCoin === coin}
                                        onClick={() => handleCoinSelect(coin)}
                                        tooltip={`${coin.toUpperCase()} Terminal`}
                                        className={cn(
                                            "transition-all duration-300",
                                            selectedCoin === coin ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted"
                                        )}
                                    >
                                        <img
                                            src={getCoinIcon(coin)}
                                            alt={coin}
                                            className={cn(
                                                "w-5 h-5 rounded-full transition-transform duration-300",
                                                selectedCoin === coin ? "scale-110" : "grayscale opacity-50"
                                            )}
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                        <span className="font-bold tracking-tight uppercase">{coin}</span>
                                        {selectedCoin === coin && (
                                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    );
}
