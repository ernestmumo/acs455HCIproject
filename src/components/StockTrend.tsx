import React from 'react';

interface StockTrendProps {
    change: number;
    changePercent: number;
}

export const StockTrend: React.FC<StockTrendProps> = ({ change, changePercent }) => {
    const isProfit = change >= 0;
    const colorVar = isProfit ? 'var(--color-finance-profit)' : 'var(--color-finance-loss)';
    const bgVar = isProfit ? 'var(--color-finance-profit-bg)' : 'var(--color-finance-loss-bg)';

    const styles = {
        container: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            backgroundColor: bgVar,
            color: colorVar,
            fontWeight: 'bold' as const,
            fontSize: '0.875rem',
        }
    };

    return (
        <span style={styles.container}>
            {isProfit ? '▲' : '▼'}
            {Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)
        </span>
    );
};
