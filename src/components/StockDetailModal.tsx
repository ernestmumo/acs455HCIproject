import React, { useState } from 'react';
import type { Stock } from '../types/market';
import { useCurrency } from '../context/CurrencyContext'; // Import context
import { CandleChart } from './CandleChart';
import { StockTrend } from './StockTrend';
import { TradeModal } from './TradeModal';

interface StockDetailModalProps {
    stock: Stock | null;
    onClose: () => void;
    themeKey: number;
}

const TIMEFRAMES = ['1m', '15m', '1h', '4h', '1d'];

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose, themeKey }) => {
    const { currency, rate, symbol } = useCurrency(); // Use context
    // State to control the Trade Modal visibility
    const [showTradeModal, setShowTradeModal] = useState(false);

    const [interval, setInterval] = useState('1h');
    const [indicators, setIndicators] = useState({
        sma20: false,
        ema50: false,
        macd: false,
    });

    if (!stock) return null;

    const styles = {
        overlay: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        },
        modal: {
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            width: '95%',
            maxWidth: '1400px', // Increased width for better chart view
            maxHeight: '95vh',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column' as const,
        },
        header: {
            padding: '1.5rem',
            borderBottom: '1px solid var(--color-neutral-200)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        title: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'var(--color-neutral-900)',
        },
        closeButton: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--color-neutral-500)',
        },
        body: {
            padding: '1.5rem',
            flex: 1,
            overflowY: 'auto' as const,
        },
        controlsRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap' as const,
            gap: '1rem',
        },
        timeframes: {
            display: 'flex',
            gap: '0.5rem',
        },
        indicators: {
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
        },
        button: (isActive: boolean) => ({
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--color-neutral-300)',
            backgroundColor: isActive ? 'var(--color-brand-primary)' : 'white',
            color: isActive ? 'white' : 'var(--color-neutral-700)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500' as const,
        }),
        checkboxLabel: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--color-neutral-800)',
            cursor: 'pointer',
        }
    };

    const toggleIndicator = (key: keyof typeof indicators) => {
        setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <div>
                        <div style={styles.title}>{stock.name} ({stock.symbol})</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                {symbol}{(stock.price * rate).toFixed(stock.price * rate < 1 ? 4 : 2)}
                            </span>
                            <StockTrend change={stock.change} changePercent={stock.changePercent} />
                            <button
                                onClick={() => setShowTradeModal(true)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    backgroundColor: 'var(--color-brand-primary)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginLeft: '1rem'
                                }}
                            >
                                TRADE
                            </button>
                        </div>
                    </div>
                    <button style={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div style={styles.body}>
                    <div style={styles.controlsRow}>
                        <div style={styles.timeframes}>
                            {TIMEFRAMES.map(tf => (
                                <button
                                    key={tf}
                                    style={styles.button(interval === tf)}
                                    onClick={() => setInterval(tf)}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>

                        <div style={styles.indicators}>
                            <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Indicators:</span>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={indicators.sma20}
                                    onChange={() => toggleIndicator('sma20')}
                                /> SMA 20
                            </label>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={indicators.ema50}
                                    onChange={() => toggleIndicator('ema50')}
                                /> EMA 50
                            </label>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={indicators.macd}
                                    onChange={() => toggleIndicator('macd')}
                                /> MACD
                            </label>
                        </div>
                    </div>

                    {/* Key forces re-mount on theme or interval change, BUT NOT on indicators change to preserve zoom */}
                    <CandleChart
                        key={`${stock.symbol}-${interval}-${themeKey}-${currency}`}
                        symbol={stock.symbol}
                        interval={interval}
                        indicators={indicators}
                        currency={{ code: currency, rate, symbol }}
                    />
                </div>
            </div>
            {showTradeModal && stock && (
                <TradeModal
                    stock={stock}
                    onClose={() => setShowTradeModal(false)}
                />
            )}
        </div>
    );
};
