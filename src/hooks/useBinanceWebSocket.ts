import { useEffect, useState, useRef } from 'react';
import type { Stock } from '../types/market';

interface BinanceStreamTicker {
    s: string; // Symbol
    c: string; // Last Price
    P: string; // Price Change Percent
    p: string; // Price Change
}

interface BinanceStreamMessage {
    stream: string;
    data: BinanceStreamTicker;
}

export const useBinanceWebSocket = (activeSymbols: string[]) => {
    const [liveData, setLiveData] = useState<Record<string, Partial<Stock>>>({});
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (activeSymbols.length === 0) return;

        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close();
        }

        // Construct stream names (lowercase symbol + @ticker)
        const streams = activeSymbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
        const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            try {
                const message: BinanceStreamMessage = JSON.parse(event.data);
                const ticker = message.data;

                setLiveData(prev => ({
                    ...prev,
                    [ticker.s]: {
                        price: parseFloat(ticker.c),
                        change: parseFloat(ticker.p),
                        changePercent: parseFloat(ticker.P)
                    }
                }));
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [activeSymbols]); // Re-connect when active symbols list changes

    return liveData;
};
