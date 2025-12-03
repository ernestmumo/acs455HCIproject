import React, { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createChart, ColorType, type IChartApi, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { fetchKlines } from '../services/binance';
import { calculateSMA, calculateEMA, calculateMACD } from '../utils/indicators';
import { useBinanceKlineWebSocket } from '../hooks/useBinanceKlineWebSocket';


interface CandleChartProps {
    symbol: string;
    interval: string;
    indicators: {
        sma20: boolean;
        ema50: boolean;
        macd: boolean;
    };
}

export const CandleChart: React.FC<CandleChartProps> = ({ symbol, interval, indicators }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const macdContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const macdChartRef = useRef<IChartApi | null>(null);

    // Keep track of series to update them with live data
    const candlestickSeriesRef = useRef<any>(null);
    const smaSeriesRef = useRef<any>(null);
    const emaSeriesRef = useRef<any>(null);
    const macdHistogramSeriesRef = useRef<any>(null);
    const macdLineSeriesRef = useRef<any>(null);
    const signalLineSeriesRef = useRef<any>(null);
    const hasFittedContent = useRef(false);

    // --- Live Data Stream ---
    const { liveCandle, isConnected } = useBinanceKlineWebSocket(symbol, interval);

    // --- Data Fetching with React Query ---
    const queryClient = useQueryClient();
    const { data: klinesData } = useQuery({
        queryKey: ['klines', symbol, interval],
        queryFn: () => fetchKlines(symbol, interval),
        staleTime: 1000 * 60, // 1 minute
        // Hybrid Mode: Poll only if WebSocket is NOT connected
        refetchInterval: isConnected ? false : 2000,
    });

    // --- Effect 1: Initialize Main Chart (Runs only on mount or symbol/interval change) ---
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Get colors from CSS variables
        const style = getComputedStyle(document.body);
        const profitColor = style.getPropertyValue('--color-finance-profit').trim();
        const lossColor = style.getPropertyValue('--color-finance-loss').trim();
        const textColor = style.getPropertyValue('--color-neutral-900').trim();
        const gridColor = style.getPropertyValue('--color-neutral-200').trim();
        const bgColor = '#ffffff';

        // --- Main Chart ---
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: bgColor },
                textColor: textColor,
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            width: chartContainerRef.current.clientWidth,
            height: 600, // Default height, will be adjusted by Layout effect
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: profitColor,
            downColor: lossColor,
            borderUpColor: profitColor,
            borderDownColor: lossColor,
            wickUpColor: profitColor,
            wickDownColor: lossColor,
        });
        candlestickSeriesRef.current = candlestickSeries;
        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
            hasFittedContent.current = false;
        };
    }, [symbol, interval]);

    // --- Effect 1.5: Handle MACD Chart & Layout (Runs when MACD toggles) ---
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart || !chartContainerRef.current) return;

        // 1. Adjust Main Chart Height
        const mainHeight = indicators.macd ? 450 : 600;
        chart.applyOptions({ height: mainHeight });
        chart.resize(chartContainerRef.current.clientWidth, mainHeight);

        // 2. Handle MACD Chart Creation/Destruction
        let macdChart: IChartApi | null = null;

        if (indicators.macd && macdContainerRef.current) {
            // Get colors again
            const style = getComputedStyle(document.body);
            const textColor = style.getPropertyValue('--color-neutral-900').trim();
            const gridColor = style.getPropertyValue('--color-neutral-200').trim();
            const profitColor = style.getPropertyValue('--color-finance-profit').trim();
            const bgColor = '#ffffff';

            macdChart = createChart(macdContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: bgColor },
                    textColor: textColor,
                },
                grid: {
                    vertLines: { color: gridColor },
                    horzLines: { color: gridColor },
                },
                width: macdContainerRef.current.clientWidth,
                height: 150,
                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,
                },
            });

            const macdHistogramSeries = macdChart.addSeries(HistogramSeries, { color: profitColor });
            const macdLineSeries = macdChart.addSeries(LineSeries, { color: '#2962FF', lineWidth: 1 });
            const signalLineSeries = macdChart.addSeries(LineSeries, { color: '#FF6D00', lineWidth: 1 });

            macdHistogramSeriesRef.current = macdHistogramSeries;
            macdLineSeriesRef.current = macdLineSeries;
            signalLineSeriesRef.current = signalLineSeries;
            macdChartRef.current = macdChart;

            // Sync TimeScales
            const isMacdDataReady = { current: false };
            const ignoreMacdEvents = { current: true }; // Start by ignoring MACD events to prevent zoom reset
            (macdChart as any)._isReady = isMacdDataReady;
            (macdChart as any)._ignoreEvents = ignoreMacdEvents;

            const syncToMacd = (range: any) => {
                if (range && macdChart && isMacdDataReady.current) {
                    try { macdChart.timeScale().setVisibleRange(range); } catch (e) { console.warn(e); }
                }
            };
            const syncToMain = (range: any) => {
                if (range && !ignoreMacdEvents.current) { // Only sync if not ignoring
                    try { chart.timeScale().setVisibleRange(range); } catch (e) { console.warn(e); }
                }
            };

            chart.timeScale().subscribeVisibleTimeRangeChange(syncToMacd);
            macdChart.timeScale().subscribeVisibleTimeRangeChange(syncToMain);

            // Handle Resize for MACD
            const handleMacdResize = () => {
                if (macdContainerRef.current && macdChart) {
                    macdChart.applyOptions({ width: macdContainerRef.current.clientWidth });
                }
            };
            window.addEventListener('resize', handleMacdResize);

            // Cleanup for MACD
            return () => {
                window.removeEventListener('resize', handleMacdResize);
                chart.timeScale().unsubscribeVisibleTimeRangeChange(syncToMacd);
                if (macdChart) {
                    macdChart.timeScale().unsubscribeVisibleTimeRangeChange(syncToMain);
                    macdChart.remove();
                }
                macdChartRef.current = null;
                macdHistogramSeriesRef.current = null;
                macdLineSeriesRef.current = null;
                signalLineSeriesRef.current = null;
            };
        }
    }, [indicators.macd]); // Only runs when MACD toggles

    // --- Effect 2: Update Data (Runs when data changes) ---
    useEffect(() => {
        if (!klinesData || !chartRef.current || !candlestickSeriesRef.current) return;

        const chart = chartRef.current;
        const macdChart = macdChartRef.current;

        // Update Main Series
        candlestickSeriesRef.current.setData(klinesData as any);

        // --- Indicators Calculation & Rendering ---
        try {
            // Get colors again for indicators (could be optimized, but fine for now)
            const style = getComputedStyle(document.body);
            const profitColor = style.getPropertyValue('--color-finance-profit').trim();
            const lossColor = style.getPropertyValue('--color-finance-loss').trim();

            // Clear previous overlays if needed (for simplicity, we just add new ones, 
            // but in a real app we should remove old series. 
            // Since we re-create chart on indicator toggle, this is okay for now.)

            if (indicators.sma20) {
                const smaData = calculateSMA(klinesData, 20);
                console.log('SMA20 Data:', smaData); // Debug log
                if (!smaSeriesRef.current) {
                    smaSeriesRef.current = chart.addSeries(LineSeries, { color: '#2962FF', lineWidth: 2 });
                }
                smaSeriesRef.current.setData(smaData as any);
            } else {
                if (smaSeriesRef.current) {
                    chart.removeSeries(smaSeriesRef.current);
                    smaSeriesRef.current = null;
                }
            }

            if (indicators.ema50) {
                const emaData = calculateEMA(klinesData, 50);
                console.log('EMA50 Data:', emaData); // Debug log
                if (!emaSeriesRef.current) {
                    emaSeriesRef.current = chart.addSeries(LineSeries, { color: '#FF6D00', lineWidth: 2 });
                }
                emaSeriesRef.current.setData(emaData as any);
            } else {
                if (emaSeriesRef.current) {
                    chart.removeSeries(emaSeriesRef.current);
                    emaSeriesRef.current = null;
                }
            }

            if (indicators.macd && macdChart && macdHistogramSeriesRef.current) {
                const macdData = calculateMACD(klinesData);

                const histogramData = macdData.map(d => ({
                    time: d.time,
                    value: d.histogram,
                    color: (d.histogram || 0) >= 0 ? profitColor : lossColor,
                }));
                const macdLineData = macdData.map(d => ({ time: d.time, value: d.value }));
                const signalLineData = macdData.map(d => ({ time: d.time, value: d.signal }));

                macdHistogramSeriesRef.current.setData(histogramData as any);
                macdLineSeriesRef.current.setData(macdLineData as any);
                signalLineSeriesRef.current.setData(signalLineData as any);

                // Mark MACD chart as ready for syncing
                if ((macdChart as any)._isReady) {
                    (macdChart as any)._isReady.current = true;
                }

                // Initial Sync: Force MACD to match Main Chart's current range
                // This prevents the MACD chart (which defaults to full range) from resetting the Main Chart via sync
                if ((macdChart as any)._ignoreEvents?.current) {
                    const currentRange = chart.timeScale().getVisibleRange();
                    if (currentRange) {
                        try { macdChart.timeScale().setVisibleRange(currentRange); } catch (e) { console.warn(e); }
                    }
                    // Now allow events to flow
                    (macdChart as any)._ignoreEvents.current = false;
                }
            }
        } catch (error) {
            console.error("Error rendering indicators:", error);
        }

        // Only fit content on first load
        if (!hasFittedContent.current) {
            chart.timeScale().fitContent();
            if (macdChartRef.current) {
                macdChartRef.current.timeScale().fitContent();
            }
            hasFittedContent.current = true;
        }

    }, [klinesData, indicators]); // Re-run when data or indicators change

    // --- Effect to Update Chart with Live Data ---
    useEffect(() => {
        if (liveCandle && candlestickSeriesRef.current) {
            candlestickSeriesRef.current.update(liveCandle);

            // Update React Query Cache to persist the live candle
            // This ensures that if we toggle indicators (re-render), we have the latest data
            queryClient.setQueryData(['klines', symbol, interval], (oldData: any) => {
                if (!oldData) return oldData;
                const newData = [...oldData];
                const lastCandle = newData[newData.length - 1];

                // If live candle is same time as last candle, update it. Otherwise push new.
                if (lastCandle.time === liveCandle.time) {
                    newData[newData.length - 1] = liveCandle;
                } else if (liveCandle.time > lastCandle.time) {
                    newData.push(liveCandle);
                }
                return newData;
            });
        }
    }, [liveCandle, symbol, interval, queryClient]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
            <div ref={chartContainerRef} style={{ position: 'relative', width: '100%', flex: 1, minHeight: indicators.macd ? '450px' : '600px' }} />
            {indicators.macd && (
                <div ref={macdContainerRef} style={{ position: 'relative', width: '100%', height: '150px', marginTop: '5px' }} />
            )}
        </div>
    );
};
