import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';

import type { Stock } from '../types/market';

interface PsychologyDashboardProps {
    activeStocks?: Stock[];
}

export const PsychologyDashboard: React.FC<PsychologyDashboardProps> = ({ activeStocks = [] }) => {
    const { balance, holdings, transactions, resetPortfolio } = usePortfolio();

    // Calculate Total Realized P&L from ALL transactions (ignoring theme filters)
    const totalRealizedPnL = transactions
        .filter(t => t.type === 'SELL')
        .reduce((acc, t) => acc + (t.pnl || 0), 0);

    // Calculate Unrealized (Floating) P&L
    // Note: This requires average buy price. For simplicity, we can estimate or strictly track if we had history.
    // Since we only store holdings count, we'll calculate Market Value vs Cost Basis if we can derive it.
    // A simpler approach for "Floating P&L" in this MVP: 
    // Market Value of Holdings - (Total Buys - Total Sells) for those holdings? 
    // Better: We can track "Average Cost" in PortfolioContext, but for now let's just show "Current Market Value of Holdings".
    // Wait, user wants "floating margin".
    // We can calculate Cost Basis from transaction history for current holdings.

    // Helper to get current price
    const getPrice = (symbol: string) => activeStocks.find(s => s.symbol === symbol)?.price || 0;

    const holdingsValue = Object.entries(holdings).reduce((acc, [symbol, qty]) => {
        return acc + (qty * getPrice(symbol));
    }, 0);

    // Estimate Cost Basis for Unrealized P&L
    // This is complex without explicit cost tracking in 'holdings', but we can try summing net investment.
    // Net Flow = Buys(Cost) - Sells(Returns). 
    // Equity = Cash + HoldingsValue. 
    // Start Balance = 10000. 
    // Total P&L = Equity - 10000.
    // Unrealized P&L = Total P&L - Realized P&L.

    const totalEquity = balance + holdingsValue;
    const initialBalance = 10000; // Should be constant or fetched
    const totalPnL = totalEquity - initialBalance;
    const unrealizedPnL = totalPnL - totalRealizedPnL;

    const calculateStats = (themeFilter: string | null) => {

        const relevant = transactions.filter(t => t.type === 'SELL' && (themeFilter ? t.theme === themeFilter : true));
        const totalTrades = relevant.length;
        if (totalTrades === 0) return { winRate: 0, pnl: 0, count: 0 };

        const wins = relevant.filter(t => (t.pnl || 0) > 0).length;
        const totalPnl = relevant.reduce((sum, t) => sum + (t.pnl || 0), 0);

        return {
            winRate: (wins / totalTrades) * 100,
            pnl: totalPnl,
            count: totalTrades
        };
    };

    const westernStats = calculateStats('western');
    const easternStats = calculateStats('east_asian'); // Assuming this is the theme key used
    // Note: If using 'deuteranopia' or others, logic can be expanded.

    const styles = {
        container: {
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto',
            fontFamily: "'Montserrat', sans-serif",
        },
        card: {
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
        },
        statTitle: {
            fontSize: '1rem',
            color: 'var(--color-neutral-500)',
            marginBottom: '0.5rem',
        },
        statValue: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'var(--color-neutral-900)',
        },
        sectionTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: 'var(--color-text-primary)',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
        },
        th: {
            textAlign: 'left' as const,
            padding: '1rem',
            borderBottom: '2px solid var(--color-neutral-200)',
            color: 'var(--color-neutral-600)',
        },
        td: {
            padding: '1rem',
            borderBottom: '1px solid var(--color-neutral-100)',
        },
        progressBarBg: {
            height: '10px',
            width: '100%',
            backgroundColor: '#e5e7eb',
            borderRadius: '5px',
            overflow: 'hidden',
            marginTop: '0.5rem',
        },
        progressBarFill: (percentage: number, color: string) => ({
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: color,
            transition: 'width 0.5s ease-out',
        })
    };

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>🧠 Psychology Dashboard</h1>
                <button
                    onClick={resetPortfolio}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--color-functional-error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    Reset Portfolio
                </button>
            </div>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <div style={styles.statTitle}>Cash Balance</div>
                    <div style={styles.statValue}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={styles.card}>
                    <div style={styles.statTitle}>Current Holdings</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {Object.entries(holdings).filter(([_, qty]) => qty > 0).map(([symbol, qty]) => (
                            <div key={symbol} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 'bold' }}>{symbol}</span>
                                <span>{qty.toFixed(4)}</span>
                            </div>
                        ))}
                        {Object.keys(holdings).length === 0 && <span style={{ color: '#999' }}>No assets held</span>}
                    </div>
                </div>
                <div style={styles.card}>
                    <div style={styles.statTitle}>Total P&L (Realized)</div>
                    <div style={{
                        ...styles.statValue,
                        color: (westernStats.pnl + easternStats.pnl) >= 0 ? 'var(--color-functional-success)' : 'var(--color-functional-error)'
                    }}>
                        ${(westernStats.pnl + easternStats.pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            <h2 style={styles.sectionTitle}>Cultural Theme Analysis</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                Does the color of "Profit" affect your trading? Compare your win rate when Profit is Green (Western) vs red (East Asian).
            </p>

            <div style={styles.grid}>
                {/* Western Stats */}
                <div style={styles.card}>
                    <h3>Western Context (Green = Gain)</h3>
                    <div>Trades: {westernStats.count}</div>
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Win Rate</span>
                            <span>{westernStats.winRate.toFixed(1)}%</span>
                        </div>
                        <div style={styles.progressBarBg}>
                            <div style={styles.progressBarFill(westernStats.winRate, '#16a34a')} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', fontWeight: 'bold', color: westernStats.pnl >= 0 ? '#16a34a' : '#dc2626' }}>
                        P&L: ${westernStats.pnl.toFixed(2)}
                    </div>
                </div>

                {/* Eastern Stats */}
                <div style={styles.card}>
                    <h3>East Asian Context (Red = Gain)</h3>
                    <div>Trades: {easternStats.count}</div>
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Win Rate</span>
                            <span>{easternStats.winRate.toFixed(1)}%</span>
                        </div>
                        <div style={styles.progressBarBg}>
                            <div style={styles.progressBarFill(easternStats.winRate, '#dc2626')} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', fontWeight: 'bold', color: easternStats.pnl >= 0 ? '#dc2626' : '#0d9488' }}>
                        P&L: ${easternStats.pnl.toFixed(2)}
                    </div>
                </div>
            </div>

            <h2 style={styles.sectionTitle}>Transaction History</h2>
            <div style={{ ...styles.card, overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Time</th>
                            <th style={styles.th}>Symbol</th>
                            <th style={styles.th}>Type</th>
                            <th style={styles.th}>Price</th>
                            <th style={styles.th}>Total</th>
                            <th style={styles.th}>Theme</th>
                            <th style={styles.th}>P&L</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id}>
                                <td style={styles.td}>{new Date(t.timestamp).toLocaleString()}</td>
                                <td style={styles.td}>{t.symbol}</td>
                                <td style={{
                                    ...styles.td,
                                    fontWeight: 'bold',
                                    color: t.type === 'BUY' ? 'var(--color-functional-success)' : 'var(--color-text-primary)'
                                }}>{t.type}</td>
                                <td style={styles.td}>${t.price.toFixed(2)}</td>
                                <td style={styles.td}>${t.totalValue.toFixed(2)}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        background: '#f3f4f6',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        {t.theme}
                                    </span>
                                </td>
                                <td style={{
                                    ...styles.td,
                                    fontWeight: 'bold',
                                    color: t.pnl ? (t.pnl >= 0 ? 'var(--color-functional-success)' : 'var(--color-functional-error)') : 'inherit'
                                }}>
                                    {t.pnl ? `$${t.pnl.toFixed(2)}` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transactions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-neutral-500)' }}>
                        No transactions yet. Start trading to see analytics!
                    </div>
                )}
            </div>
        </div>
    );
};
