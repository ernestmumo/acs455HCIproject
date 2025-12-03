import type { Stock } from '../types/market';

interface BinanceTicker {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    lastPrice: string;
    volume: string;
    quoteVolume: string;
}

export const fetchBinanceData = async (): Promise<Stock[]> => {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) {
            throw new Error('Failed to fetch Binance data');
        }
        const data: BinanceTicker[] = await response.json();

        // Transform Binance data to our Stock interface
        // Filter for USDT pairs to keep it relevant for a general dashboard
        return data
            .filter(ticker => ticker.symbol.endsWith('USDT'))
            .map(ticker => ({
                symbol: ticker.symbol,
                name: ticker.symbol.replace('USDT', ''), // Simplified name
                price: parseFloat(ticker.lastPrice),
                change: parseFloat(ticker.priceChange),
                changePercent: parseFloat(ticker.priceChangePercent),
                volume: formatVolume(parseFloat(ticker.quoteVolume))
            }))
            .sort((a, b) => b.price - a.price); // Sort by price desc initially
    } catch (error) {
        console.error('Binance API Error:', error);
        return [];
    }
};

const formatVolume = (vol: number): string => {
    if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B';
    if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
    if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K';
    return vol.toFixed(2);
};

export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export const fetchKlines = async (symbol: string, interval: string = '1h'): Promise<Candle[]> => {
    try {
        let allCandles: Candle[] = [];
        let endTime: number | undefined = undefined;
        const TOTAL_LIMIT = 5000; // Fetch up to 5000 candles to cover significant history

        while (allCandles.length < TOTAL_LIMIT) {
            const fetchLimit = Math.min(1000, TOTAL_LIMIT - allCandles.length);
            const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${fetchLimit}${endTime ? `&endTime=${endTime}` : ''}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch klines');
            }
            const data: any[][] = await response.json();

            if (data.length === 0) break;

            const parsedBatch = data.map(k => ({
                time: k[0] / 1000, // lightweight-charts expects seconds
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
            }));

            // Prepend older data to maintain ascending order
            allCandles = [...parsedBatch, ...allCandles];

            // Prepare for next batch (older than the oldest we just got)
            // data[0][0] is the oldest timestamp in ms in this batch
            endTime = data[0][0] - 1;

            // If we got fewer than requested, we reached the beginning of history
            if (data.length < fetchLimit) break;
        }

        return allCandles;
    } catch (error) {
        console.error('Binance Klines Error:', error);
        return [];
    }
};
