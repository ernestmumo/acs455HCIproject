import React, { useState, useEffect } from 'react';
import type { Stock } from '../types/market';
import { usePortfolio } from '../context/PortfolioContext';

interface TradeModalProps {
    stock: Stock;
    onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ stock, onClose }) => {
    const { balance, holdings, buy, sell } = usePortfolio();
    const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
    const [amount, setAmount] = useState<string>(''); // Quantity

    // Auto-detect current theme for logging
    const [currentTheme, setCurrentTheme] = useState<string>('western');

    useEffect(() => {
        const theme = document.documentElement.getAttribute('data-theme') || 'western';
        setCurrentTheme(theme);
    }, []);

    const quantity = parseFloat(amount) || 0;
    const total = quantity * stock.price;
    const currentHolding = holdings[stock.symbol] || 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // DEBUG: Alert to confirm submission
        // alert(`Submitting trade: ${type} ${quantity} of ${stock.symbol}`);

        if (quantity <= 0) {
            alert("Quantity must be greater than 0");
            return;
        }

        if (type === 'BUY') {
            if (confirm(`Confirm BUY: ${quantity} ${stock.symbol} @ $${stock.price.toFixed(2)}?\nTotal: $${total.toFixed(2)}`)) {
                buy(stock.symbol, quantity, stock.price, currentTheme);
            }
        } else {
            if (confirm(`Confirm SELL: ${quantity} ${stock.symbol} @ $${stock.price.toFixed(2)}?\nTotal: $${total.toFixed(2)}`)) {
                sell(stock.symbol, quantity, stock.price, currentTheme);
            }
        }
        onClose();
    };

    const styles = {
        overlay: {
            position: 'fixed' as const,
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100, // Above StockDetailModal
        },
        card: {
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
        header: {
            marginBottom: '1.5rem',
            textAlign: 'center' as const,
        },
        typeSelector: {
            display: 'flex',
            marginBottom: '1.5rem',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            border: '1px solid var(--color-neutral-200)',
        },
        typeButton: (isActive: boolean, isBuy: boolean) => ({
            flex: 1,
            padding: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold' as const,
            backgroundColor: isActive
                ? (isBuy ? 'var(--color-functional-success)' : 'var(--color-functional-error)')
                : '#f3f4f6',
            color: isActive ? 'white' : 'var(--color-neutral-500)',
            transition: 'all 0.2s',
        }),
        inputGroup: {
            marginBottom: '1rem',
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--color-neutral-700)',
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-neutral-300)',
            fontSize: '1.125rem',
            marginBottom: '0.5rem',
        },
        summary: {
            fontSize: '0.875rem',
            color: 'var(--color-neutral-600)',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
        },
        submitButton: {
            width: '100%',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: type === 'BUY' ? 'var(--color-functional-success)' : 'var(--color-functional-error)',
            color: 'white',
            fontWeight: 'bold' as const,
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '1rem',
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.card} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={{ margin: 0 }}>{type} {stock.symbol}</h2>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>Current Price: ${stock.price.toFixed(2)}</div>
                </div>

                <div style={styles.typeSelector}>
                    <button style={styles.typeButton(type === 'BUY', true)} onClick={() => setType('BUY')}>BUY</button>
                    <button style={styles.typeButton(type === 'SELL', false)} onClick={() => setType('SELL')}>SELL</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Quantity</label>
                        <input
                            type="number"
                            style={styles.input}
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                            step="any"
                            min="0"
                            autoFocus
                        />
                        <div style={styles.summary}>
                            <span>Available: {type === 'BUY' ? `$${balance.toFixed(2)}` : `${currentHolding} ${stock.symbol}`}</span>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-neutral-200)', paddingTop: '1rem' }}>
                        <div style={styles.summary}>
                            <span>Total Value:</span>
                            <span style={{ fontWeight: 'bold' }}>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <button style={styles.submitButton} type="submit" disabled={quantity <= 0}>
                        CONFIRM {type}
                    </button>
                </form>
            </div>
        </div>
    );
};
