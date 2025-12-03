import { useEffect, useRef, useState } from 'react';
import type { Candle } from '../services/binance';

export const useBinanceKlineWebSocket = (symbol: string, interval: string) => {
    const [liveCandle, setLiveCandle] = useState<Candle | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const wsSymbol = symbol.toLowerCase();
        const wsUrl = `wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${interval}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            setIsConnected(false);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.e === 'kline') {
                const k = message.k;
                const candle: Candle = {
                    time: k.t / 1000, // lightweight-charts expects seconds
                    open: parseFloat(k.o),
                    high: parseFloat(k.h),
                    low: parseFloat(k.l),
                    close: parseFloat(k.c),
                };
                setLiveCandle(candle);
            }
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [symbol, interval]);

    return { liveCandle, isConnected };
};
