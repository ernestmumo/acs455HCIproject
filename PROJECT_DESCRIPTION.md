# TradeFlow Global Investment Dashboard - Project Overview

## 1. Introduction

**TradeFlow** is a React-based frontend application built with Vite and TypeScript. Its primary focus is investigating and solving Human-Computer Interaction (HCI) challenges in global financial interfaces—specifically, how color symbolism (e.g., Red vs. Green for profit and loss) varies across different cultures (Western vs. East Asian models).

The project demonstrates an adaptive, accessible UI that dynamically re-contextualizes financial data visualization based on user cultural themes and regions, preventing cognitive dissonance and potential misinterpretation of market trends.

## 2. Technology Stack

- **Core**: React 19, TypeScript, Vite
- **State & Data Fetching**: `@tanstack/react-query` (with persist client for caching), React Context API
- **Real-Time Data**: Native WebSockets connected to Binance Streams
- **Charting**: `lightweight-charts` by TradingView for high-performance financial charting
- **Internationalization (i18n)**: `i18next`, `react-i18next`
- **Financial Calculations**: `technicalindicators` (for calculating moving averages, RSI, etc.)
- **Styling**: Vanilla CSS with comprehensive CSS variables (Theming at the Edge)

## 3. Detailed Directory Layout & Architecture

The application is structured logically by feature and responsibility under the `src/` directory.

### Root Configuration
- `vite.config.ts`: Vite bundler configuration.
- `tsconfig.*.json`: TypeScript configurations for both Node and the App.
- `eslint.config.js`: Strict type-aware ESLint configuration.
- `package.json`: Project dependencies and scripts (`dev`, `build`, `lint`).

### `/src` Directory Breakdown

#### `/src/components`
Contains all the modular UI components for the application.
- **`App.tsx` / `main.tsx`**: Application entry points, wrapping the app with context providers (Currency, Portfolio).
- **`MarketOverview.tsx`**: The main dashboard view that lists all active stock tokens.
- **`CandleChart.tsx`**: Integrates `lightweight-charts` to display real-time candlestick data for a selected asset.
- **`StockDetailModal.tsx`**: A detailed view modal for individual assets, showing the chart, order book, and trading controls.
- **`TradeModal.tsx`**: The interface for executing Buy/Sell orders (paper trading).
- **`PsychologyDashboard.tsx`**: A dedicated analytics dashboard tracking paper trading performance, comparing win rates and P&L across different active cultural themes (e.g., Western vs. East Asian).
- **`ThemeSwitcher.tsx` & `LanguageSwitcher.tsx` & `CurrencySelector.tsx`**: Global controls for dynamically swapping the cultural color paradigm, UI language, and base currency.
- **`StockTrend.tsx` & `TokenSelector.tsx`**: Micro-components for displaying individual trends and managing watched assets.
- **`Alert.tsx` & `ErrorBoundary.tsx`**: Feedback and stability components.

#### `/src/context`
Global state management using React Context.
- **`PortfolioContext.tsx`**: Manages the user's paper trading state, including "Cash Balance", "Holdings", "Transaction History", and calculates derived P&L metrics.
- **`CurrencyContext.tsx`**: Manages the globally selected currency and handles exchange rate conversions.

#### `/src/hooks`
Custom React hooks, primarily for WebSocket management.
- **`useBinanceWebSocket.ts`**: Connects to the Binance 24hr mini-ticker stream to provide real-time updates for the market overview list.
- **`useBinanceKlineWebSocket.ts`**: Connects to the Binance kline (candlestick) stream to update the `CandleChart` in real-time with 1-second interval ticks.

#### `/src/services`
External API and data layer integrations.
- **`binance.ts`**: REST API calls to Binance for fetching historical kline data and initial 24hr ticker snapshots.
- **`coingecko.ts`**: Integrates with CoinGecko for auxiliary coin data or extended history.
- **`exchangeRates.ts`**: Fetches global fiat exchange rates to support the Currency Context.
- **`alternative.ts`**: Fetches the Crypto Fear & Greed Index or similar alternative data.

#### `/src/styles`
- **`index.css`**: Global resets and base layout styling.
- **`tokens.css`**: The core of the HCI experiment. Defines CSS variables for semantic financial tokens (e.g., `--color-finance-profit`, `--color-finance-loss`). These variables change their native hex values globally when the `data-theme` attribute on the wrapper changes (e.g., from `western` to `east_asian`).

#### `/src/types`
- **`market.ts`**: Centralized TypeScript interfaces for `Stock`, `Transaction`, `Holdings`, and WebSocket payloads, ensuring strict typing across the app.

#### `/src/utils`
- **`indicators.ts`**: Wrappers around `technicalindicators` to compute SMA/EMA purely on the frontend for the charts.
- **`regionMapping.ts`**: Maps geographic regions/languages to default themes.
- **`i18n.ts`**: The `i18next` initialization and translation dictionaries.

## 4. Core Workflows & Data Flow

1. **Initialization**: The app boots (`main.tsx` -> `App.tsx`), initializing Contexts and establishing the baseline theme and language.
2. **Data Fetching**: `App.tsx` triggers `fetchBinanceData()` to get the initial snapshot of requested tokens via REST.
3. **Real-time Sync**: `useBinanceWebSocket` subscribes to the streams of the active symbols, mutating the local state with sub-second price and volume updates.
4. **Cultural Adaptation**: When a user selects a different region via `ThemeSwitcher`, the DOM's `data-theme` attribute is updated. `tokens.css` instantly repaints the app, turning previously green (+%) numbers red, and red (-%) numbers green, matching the new cultural expectation.
5. **Paper Trading & Psychology**: Users can open the `StockDetailModal`, buy assets using simulated funds (`PortfolioContext`), and track how the *color* of the profit/loss affects their trading behavior via the `PsychologyDashboard`.

## 5. Conclusion

TradeFlow represents a robust, real-time React architecture built deliberately to research and solve cross-cultural UI/UX challenges. By separating semantic intent (Profit/Loss) from visual representation (Green/Red) through CSS variables, it achieves true global accessibility.