import { SMA, EMA, RSI, MACD } from 'technicalindicators';
import type { Candle } from '../services/binance';

export const calculateSMA = (candles: Candle[], period: number) => {
    const prices = candles.map(c => c.close);
    const sma = SMA.calculate({ period, values: prices });

    // SMA result is shorter than input by (period - 1). 
    // We need to align it with the end of the candles array.
    return sma.map((val, index) => ({
        time: candles[index + (period - 1)].time,
        value: val,
    }));
};

export const calculateEMA = (candles: Candle[], period: number) => {
    const prices = candles.map(c => c.close);
    const ema = EMA.calculate({ period, values: prices });

    return ema.map((val, index) => ({
        time: candles[index + (period - 1)].time,
        value: val,
    }));
};

export const calculateRSI = (candles: Candle[], period: number = 14) => {
    const prices = candles.map(c => c.close);
    const rsi = RSI.calculate({ period, values: prices });

    return rsi.map((val, index) => ({
        time: candles[index + period].time, // RSI calculation consumes 'period' + 1 usually? Check alignment.
        // technicalindicators RSI usually needs period + 1 data points to produce first result?
        // Actually for RSI(14), the first result appears at index 14 (15th candle).
        // Let's align safely.
        value: val,
    }));
};

export const calculateMACD = (candles: Candle[]) => {
    const prices = candles.map(c => c.close);
    const macdInput = {
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
    };

    const macd = MACD.calculate(macdInput);

    // MACD result length depends on slowPeriod (26).
    // Alignment offset is usually slowPeriod - 1 = 25.
    const offset = 25;

    return macd.map((val, index) => {
        const candleIndex = index + offset;
        // Safety check: ensure we don't access out of bounds
        if (candleIndex < 0 || candleIndex >= candles.length) return null;

        // Safety check: ensure all values are valid numbers
        if (
            typeof val.MACD !== 'number' || isNaN(val.MACD) ||
            typeof val.signal !== 'number' || isNaN(val.signal) ||
            typeof val.histogram !== 'number' || isNaN(val.histogram)
        ) {
            return null;
        }

        return {
            time: candles[candleIndex].time,
            // MACD returns { MACD, signal, histogram }
            value: val.MACD,
            signal: val.signal,
            histogram: val.histogram,
        };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
};
