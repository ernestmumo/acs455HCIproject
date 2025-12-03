export interface GlobalMetrics {
    total_market_cap: { [key: string]: number };
    market_cap_percentage: { [key: string]: number };
}

export interface TrendingCoin {
    item: {
        id: string;
        coin_id: number;
        name: string;
        symbol: string;
        market_cap_rank: number;
        thumb: string;
        small: string;
        large: string;
        slug: string;
        price_btc: number;
        score: number;
        data: {
            price: number;
            price_change_percentage_24h: {
                [key: string]: number;
            };
            market_cap: string;
            total_volume: string;
            sparkline: string;
        }
    }
}

export const fetchGlobalMetrics = async (): Promise<GlobalMetrics> => {
    const response = await fetch('https://api.coingecko.com/api/v3/global');
    if (!response.ok) {
        throw new Error('Failed to fetch global metrics');
    }
    const data = await response.json();
    return data.data;
};

export const fetchTrendingCoins = async (): Promise<TrendingCoin[]> => {
    const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
    if (!response.ok) {
        throw new Error('Failed to fetch trending coins');
    }
    const data = await response.json();
    return data.coins;
};
