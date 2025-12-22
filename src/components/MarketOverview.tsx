import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { Stock } from '../types/market';
import { useCurrency } from '../context/CurrencyContext';
import { StockTrend } from './StockTrend';
import { fetchGlobalMetrics, fetchTrendingCoins } from '../services/coingecko';
import { fetchFearAndGreedIndex } from '../services/alternative';

interface MarketOverviewProps {
    stocks: Stock[];
    isLoading: boolean;
    onStockClick: (stock: Stock) => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ stocks, isLoading, onStockClick }) => {
    const { t } = useTranslation();

    // --- Data Fetching ---
    const { data: globalMetrics } = useQuery({
        queryKey: ['globalMetrics'],
        queryFn: fetchGlobalMetrics,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const { data: fearAndGreed } = useQuery({
        queryKey: ['fearAndGreed'],
        queryFn: fetchFearAndGreedIndex,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const { data: trendingCoins } = useQuery({
        queryKey: ['trendingCoins'],
        queryFn: fetchTrendingCoins,
        staleTime: 1000 * 60 * 15, // 15 minutes
    });

    // --- Currency Conversion ---
    const { rate, symbol } = useCurrency();

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '2.5rem',
            width: '100%',
            maxWidth: '100%',
        },
        sectionTitle: {
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            marginBottom: '1.5rem',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
        },
        // --- Global Header ---
        globalHeader: {
            display: 'flex',
            gap: 'clamp(1rem, 3vw, 2rem)',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '1rem',
            border: `1px solid var(--color-border-subtle)`,
            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            color: 'var(--color-text-secondary)',
            overflowX: 'auto' as const,
            boxShadow: '0 8px 24px rgba(123, 91, 74, 0.08)',
            width: '100%',
            maxWidth: '100%',
        },
        metricItem: {
            display: 'flex',
            gap: '0.75rem',
            whiteSpace: 'nowrap' as const,
            padding: '0.5rem 0',
            alignItems: 'baseline',
        },
        metricValue: {
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            fontFamily: "'Montserrat', sans-serif",
        },
        // --- Dashboard Grid ---
        dashboardGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '2rem',
            width: '100%',
        },
        widgetCard: {
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            borderRadius: '1.25rem',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid var(--color-border-subtle)`,
            boxShadow: '0 12px 32px rgba(123, 91, 74, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
        },
        // --- Fear & Greed ---
        gaugeContainer: {
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '220px',
            padding: '1rem',
        },
        gaugeValue: {
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 'clamp(3rem, 10vw, 5rem)',
            fontWeight: 700,
            color: fearAndGreed ? getFearGreedColor(parseInt(fearAndGreed.value)) : 'gray',
            textShadow: '2px 2px 8px rgba(0,0,0,0.05)',
        },
        gaugeLabel: {
            fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
            color: 'var(--color-text-secondary)',
            marginTop: '0.75rem',
            fontWeight: 500,
            fontFamily: "'Montserrat', sans-serif",
        },
        // --- Trending ---
        trendingList: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
            width: '100%',
        },
        trendingItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'clamp(0.75rem, 2.5vw, 1rem) 0',
            borderBottom: `1px solid var(--color-border-subtle)`,
            transition: 'all 0.2s ease',
            width: '100%',
        },
        coinInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(0.75rem, 2vw, 1rem)',
            flex: 1,
            minWidth: 0,
        },
        coinIcon: {
            width: 'clamp(24px, 5vw, 32px)',
            height: 'clamp(24px, 5vw, 32px)',
            borderRadius: '50%',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        // --- Stock Grid ---
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: '2rem',
            width: '100%',
        },
        card: {
            padding: 'clamp(1.5rem, 4vw, 2.25rem)',
            borderRadius: '1.25rem',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid var(--color-border-subtle)`,
            boxShadow: '0 8px 24px rgba(123, 91, 74, 0.08)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            gap: '0.75rem',
        },
        symbol: {
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
        },
        name: {
            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            color: 'var(--color-text-tertiary)',
            marginBottom: '1.25rem',
            fontWeight: 500,
            fontFamily: "'Montserrat', sans-serif",
        },
        priceRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '0.75rem',
            flexWrap: 'wrap' as const,
        },
        price: {
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
        },
        loading: {
            padding: 'clamp(3rem, 6vw, 5rem)',
            textAlign: 'center' as const,
            color: 'var(--color-neutral-500)',
        }
    };

    function getFearGreedColor(value: number) {
        if (value >= 75) return 'var(--color-green-600)'; // Extreme Greed
        if (value >= 55) return 'var(--color-green-500)'; // Greed
        if (value >= 45) return 'var(--color-neutral-500)'; // Neutral
        if (value >= 25) return 'var(--color-red-500)'; // Fear
        return 'var(--color-red-600)'; // Extreme Fear
    }

    if (isLoading) {
        return <div style={styles.loading}>{t('loading_live_data')}</div>;
    }

    return (
        <div style={styles.container}>
            {/* Global Metrics Header */}
            {globalMetrics && (
                <div style={styles.globalHeader}>
                    <div style={styles.metricItem}>
                        <span>{t('market_cap')}:</span>
                        <span style={styles.metricValue}>
                            {symbol}{(globalMetrics.total_market_cap.usd * rate / 1e12).toFixed(2)}T
                        </span>
                    </div>
                    <div style={styles.metricItem}>
                        <span>{t('btc_dominance')}:</span>
                        <span style={styles.metricValue}>
                            {globalMetrics.market_cap_percentage.btc.toFixed(1)}%
                        </span>
                    </div>
                    <div style={styles.metricItem}>
                        <span>{t('eth_dominance')}:</span>
                        <span style={styles.metricValue}>
                            {globalMetrics.market_cap_percentage.eth.toFixed(1)}%
                        </span>
                    </div>
                </div>
            )}

            {/* Advanced Widgets */}
            <div style={styles.dashboardGrid}>
                {/* Fear & Greed Index */}
                <div style={styles.widgetCard}>
                    <h3 style={styles.sectionTitle}>{t('market_sentiment')}</h3>
                    {fearAndGreed ? (
                        <div style={styles.gaugeContainer}>
                            <div style={styles.gaugeValue}>{fearAndGreed.value}</div>
                            <div style={styles.gaugeLabel}>{fearAndGreed.value_classification}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginTop: '0.5rem' }}>
                                {t('next_update')}: {new Date(parseInt(fearAndGreed.time_until_update) * 1000 + Date.now()).toLocaleTimeString()}
                            </div>
                        </div>
                    ) : (
                        <div>{t('loading_sentiment')}</div>
                    )}
                </div>

                {/* Trending Coins */}
                <div style={styles.widgetCard}>
                    <h3 style={styles.sectionTitle}>{t('trending_now')}</h3>
                    {trendingCoins ? (
                        <ul style={styles.trendingList}>
                            {trendingCoins.slice(0, 5).map((coin) => (
                                <li key={coin.item.id} style={styles.trendingItem}>
                                    <div style={styles.coinInfo}>
                                        <img src={coin.item.small} alt={coin.item.name} style={styles.coinIcon} />
                                        <span style={{ fontWeight: 'bold' }}>{coin.item.symbol}</span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>{coin.item.name}</span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                                        #{coin.item.market_cap_rank}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>{t('loading_trending')}</div>
                    )}
                </div>
            </div>

            {/* Main Stock Grid */}
            <div>
                <h2 style={styles.sectionTitle}>{t('your_watchlist')}</h2>
                <div style={styles.grid}>
                    {stocks.map((stock) => (
                        <div
                            key={stock.symbol}
                            style={styles.card}
                            onClick={() => onStockClick(stock)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 16px 48px rgba(123, 91, 74, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(123, 91, 74, 0.08)';
                            }}
                        >
                            <div style={styles.header}>
                                <span style={styles.symbol}>{stock.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-800)' }}>{t('vol')}: {stock.volume}</span>
                            </div>
                            <div style={styles.name}>{stock.symbol}</div>
                            <div style={styles.priceRow}>
                                <span style={styles.price}>
                                    {symbol}{(stock.price * rate).toFixed(stock.price * rate < 1 ? 4 : 2)}
                                </span>
                                <StockTrend change={stock.change} changePercent={stock.changePercent} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
