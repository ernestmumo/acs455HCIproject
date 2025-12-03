import { useState, useEffect } from 'react';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { MarketOverview } from './components/MarketOverview';
import { TokenSelector } from './components/TokenSelector';
import { StockDetailModal } from './components/StockDetailModal';
import { fetchBinanceData } from './services/binance';
import { useBinanceWebSocket } from './hooks/useBinanceWebSocket';
import type { Stock } from './types/market';

import { LanguageSwitcher } from './components/LanguageSwitcher';

function App() {
  const [allTokens, setAllTokens] = useState<Stock[]>([]);
  const [activeSymbols, setActiveSymbols] = useState<string[]>([
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT'
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [themeKey, setThemeKey] = useState(0); // Used to force chart re-render

  // Hook for real-time updates
  const liveUpdates = useBinanceWebSocket(activeSymbols);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchBinanceData();
      setAllTokens(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Listen for theme changes to update chart colors
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeKey(prev => prev + 1);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const handleAddToken = (symbol: string) => {
    if (!activeSymbols.includes(symbol)) {
      setActiveSymbols([...activeSymbols, symbol]);
    }
  };

  // Merge static data with live WebSocket updates
  const activeStocks = allTokens
    .filter(token => activeSymbols.includes(token.symbol))
    .map(token => {
      const update = liveUpdates[token.symbol];
      if (update) {
        return { ...token, ...update };
      }
      return token;
    });

  // Keep the selected stock updated with live data too
  const liveSelectedStock = selectedStock
    ? activeStocks.find(s => s.symbol === selectedStock.symbol) || selectedStock
    : null;

  const styles = {
    container: {
      width: '100%',
      minHeight: '100vh',
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'column' as const,
      overflowX: 'hidden' as const,
    },
    header: {
      width: '96%',
      maxWidth: '100%',
      margin: '0 auto',
      marginTop: '1rem',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '1.25rem',
      border: `1px solid var(--color-border-subtle)`,
      color: 'var(--color-text-primary)',
      padding: '1.5rem 2rem',
      boxShadow: '0 8px 32px rgba(123, 91, 74, 0.1)',
      flexShrink: 0,
    },
    headerContent: {
      width: '100%',
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
      gap: '1.5rem',
      marginBottom: '1rem',
    },
    logo: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
      fontWeight: 700,
      color: 'var(--color-text-primary)',
      margin: 0,
      textShadow: '2px 2px 4px rgba(123, 91, 74, 0.1)',
      letterSpacing: '-0.02em',
    },
    headerControls: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
    },
    subtitle: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 'clamp(0.8125rem, 1.5vw, 0.9375rem)',
      color: 'var(--color-text-secondary)',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    description: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 'clamp(0.8125rem, 1.5vw, 0.9375rem)',
      color: 'var(--color-text-secondary)',
      lineHeight: 1.6,
      margin: 0,
    },
    mainContent: {
      flex: 1,
      width: '96%',
      maxWidth: '100%',
      margin: '0 auto',
      padding: '2rem 0',
      overflowX: 'hidden' as const,
    },
    controlsSection: {
      display: 'flex',
      gap: '2rem',
      marginBottom: '2rem',
      flexWrap: 'wrap' as const,
      alignItems: 'flex-start',
    },
    themeSwitcherWrapper: {
      flex: '1 1 auto',
      minWidth: '280px',
      maxWidth: '100%',
    },
    tokenSelectorWrapper: {
      flex: '2 1 auto',
      minWidth: '320px',
      maxWidth: '100%',
    },
    footer: {
      width: '96%',
      maxWidth: '100%',
      margin: '0 auto 1rem auto',
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '1.25rem',
      border: `1px solid var(--color-border-subtle)`,
      padding: '1.5rem 2rem',
      flexShrink: 0,
    },
    footerContent: {
      width: '100%',
      fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
      color: 'var(--color-text-secondary)',
      lineHeight: 1.6,
      fontFamily: "'Montserrat', sans-serif",
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerTop}>
            <h1 style={styles.logo}>
              TradeFlow
            </h1>
            <div style={styles.headerControls}>
              <LanguageSwitcher />
              <div style={styles.subtitle}>
                Global Investment Dashboard
              </div>
            </div>
          </div>
          <p style={styles.description}>
            Demonstrating <strong>Financial Color Reversal</strong> with Live Binance Data.
            Switch themes to see how "Profit" changes from <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Green</span> (West) to <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Red</span> (East Asia).
          </p>
        </div>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.controlsSection}>
          <div style={styles.themeSwitcherWrapper}>
            <ThemeSwitcher />
          </div>
          <div style={styles.tokenSelectorWrapper}>
            <TokenSelector
              allTokens={allTokens}
              activeSymbols={activeSymbols}
              onAddToken={handleAddToken}
            />
          </div>
        </div>

        <MarketOverview
          stocks={activeStocks}
          isLoading={isLoading}
          onStockClick={setSelectedStock}
        />
      </main>

      {liveSelectedStock && (
        <StockDetailModal
          stock={liveSelectedStock}
          onClose={() => setSelectedStock(null)}
          themeKey={themeKey}
        />
      )}

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p>
            <strong>Architecture Note:</strong> The <code>StockTrend</code> component doesn't know about "Red" or "Green".
            It only knows <code>finance-profit</code> and <code>finance-loss</code>. The <strong>Design Tokens</strong> handle the cultural translation automatically.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
