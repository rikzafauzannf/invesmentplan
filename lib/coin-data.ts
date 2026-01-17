export const COIN_METADATA: Record<string, { name: string; icon: string; color: string }> = {
    btc: {
        name: 'Bitcoin',
        icon: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400',
        color: '#F7931A',
    },
    eth: {
        name: 'Ethereum',
        icon: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628',
        color: '#627EEA',
    },
    xrp: {
        name: 'XRP',
        icon: 'https://assets.coingecko.com/coins/images/44/standard/xrp-symbol-white-128.png?1696501442',
        color: '#23292F',
    },
    doge: {
        name: 'Dogecoin',
        icon: 'https://assets.coingecko.com/coins/images/5/standard/dogecoin.png?1696501409',
        color: '#C2A633',
    },
    sui: {
        name: 'Sui',
        icon: 'https://assets.coingecko.com/coins/images/26375/standard/sui-ocean-square.png?1727791290',
        color: '#6FBCF0',
    },
    hype: {
        name: 'Hyperliquid',
        icon: 'https://assets.coingecko.com/coins/images/50882/standard/hyperliquid.jpg?1729431300',
        color: '#00FFA3',
    },
    ondo: {
        name: 'Ondo Finance',
        icon: 'https://assets.coingecko.com/coins/images/26580/standard/ONDO.png?1696525656',
        color: '#000000',
    }
};



export const getCoinIcon = (symbol: string) => {
    return COIN_METADATA[symbol.toLowerCase()]?.icon || '';
};

export const getCoinName = (symbol: string) => {
    return COIN_METADATA[symbol.toLowerCase()]?.name || symbol.toUpperCase();
};
