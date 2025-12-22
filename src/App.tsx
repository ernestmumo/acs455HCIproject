import { useState, useEffect } from 'react';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { MarketOverview } from './components/MarketOverview';
import { TokenSelector } from './components/TokenSelector';
import { StockDetailModal } from './components/StockDetailModal';
import { fetchBinanceData } from './services/binance';
import { useBinanceWebSocket } from './hooks/useBinanceWebSocket';
import type { Stock } from './types/market';

import { LanguageSwitcher } from './components/LanguageSwitcher';

import { CurrencyProvider } from './context/CurrencyContext';
import { CurrencySelector } from './components/CurrencySelector';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { PsychologyDashboard } from './components/PsychologyDashboard';

// Wrapper component to provide context
const AppContent = () => {
  const [allTokens, setAllTokens] = useState<Stock[]>([]);
  const [activeSymbols, setActiveSymbols] = useState<string[]>([
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT'
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [themeKey, setThemeKey] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false); // Psychology Mode Dashboard

  const { balance } = usePortfolio(); // Display balance in header

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

  // Listen for theme changes
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

  const activeStocks = allTokens
    .filter(token => activeSymbols.includes(token.symbol))
    .map(token => {
      const update = liveUpdates[token.symbol];
      if (update) {
        return { ...token, ...update };
      }
      return token;
    });

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
              <div style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.4)',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                marginRight: '1rem',
                cursor: 'pointer',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }} onClick={() => setShowDashboard(true)}>
                <span>🧠</span>
                <span>${balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <CurrencySelector />
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

      {showDashboard && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 2000,
          padding: '2rem', overflowY: 'auto'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', background: '#f9fafb', borderRadius: '1rem', position: 'relative' }}>
            <button
              onClick={() => setShowDashboard(false)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer',
                color: 'var(--color-neutral-600)'
              }}
            >
              ×
            </button>
            <PsychologyDashboard activeStocks={activeStocks} />
          </div>
        </div>
      )}

    </div>
  );
};

function App() {
  return (
    <CurrencyProvider>
      <PortfolioProvider>
        <AppContent />
      </PortfolioProvider>
    </CurrencyProvider>
  );
}

export default App;
