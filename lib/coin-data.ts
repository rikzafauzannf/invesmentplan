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
    },
    ada: {
        name: 'Cardano',
        icon: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png?1696502090',
        color: '#0033AD',
    },
    sol: {
        name: 'Solana',
        icon: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png?1696504756',
        color: '#14F195',
    },
    link: {
        name: 'Chainlink',
        icon: 'https://assets.coingecko.com/coins/images/877/standard/chainlink-new-logo.png?1696501625',
        color: '#2A5ADA',
    },
    near: {
        name: 'NEAR',
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/near/info/logo.png',
        color: '#00C08B',
    },
    fet: {
        name: 'ASI (FET)',
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85/logo.png',
        color: '#1D2D6E',
    },
    pepe: {
        name: 'Pepe',
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6982508145454Ce325dDbE47a25d4ec3d2311933/logo.png',
        color: '#558235',
    },
};

export const getCoinIcon = (symbol: string) => {
    return COIN_METADATA[symbol.toLowerCase()]?.icon || null;
};

export const getCoinName = (symbol: string) => {
    return COIN_METADATA[symbol.toLowerCase()]?.name || symbol.toUpperCase();
};
