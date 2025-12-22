import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Transaction {
    id: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    amount: number; // Quantity of asset
    price: number; // Price per unit at execution
    totalValue: number; // price * amount
    timestamp: number;
    theme: string; // The Cultural Theme active during the trade (e.g., 'western', 'east_asian')
    pnl?: number; // Realized P&L for Sell transactions
}

export interface PortfolioState {
    balance: number; // Available Cash (USD)
    holdings: Record<string, number>; // Symbol -> Quantity
    transactions: Transaction[];
}

interface PortfolioContextType {
    balance: number;
    holdings: Record<string, number>;
    transactions: Transaction[];
    buy: (symbol: string, quantity: number, price: number, theme: string) => void;
    sell: (symbol: string, quantity: number, price: number, theme: string) => void;
    resetPortfolio: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
    const context = useContext(PortfolioContext);
    if (!context) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return context;
};

const INITIAL_BALANCE = 10000;

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Lazy initialization to prevent overwriting localStorage on initial render
    const [balance, setBalance] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('tradeflow_portfolio');
            if (!saved) return INITIAL_BALANCE;
            const parsed = JSON.parse(saved);
            // Validation: Ensure balance is a valid number
            return typeof parsed.balance === 'number' && !isNaN(parsed.balance) ? parsed.balance : INITIAL_BALANCE;
        } catch (e) {
            return INITIAL_BALANCE;
        }
    });

    const [holdings, setHoldings] = useState<Record<string, number>>(() => {
        try {
            const saved = localStorage.getItem('tradeflow_portfolio');
            const parsed = saved ? JSON.parse(saved) : {};
            return parsed.holdings || {};
        } catch (e) {
            return {};
        }
    });

    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        try {
            const saved = localStorage.getItem('tradeflow_portfolio');
            const parsed = saved ? JSON.parse(saved) : {};
            return Array.isArray(parsed.transactions) ? parsed.transactions : [];
        } catch (e) {
            return [];
        }
    });

    // Save to LocalStorage on change
    useEffect(() => {
        const state: PortfolioState = { balance, holdings, transactions };
        localStorage.setItem('tradeflow_portfolio', JSON.stringify(state));
    }, [balance, holdings, transactions]);

    // Save to LocalStorage on change
    useEffect(() => {
        const state: PortfolioState = { balance, holdings, transactions };
        localStorage.setItem('tradeflow_portfolio', JSON.stringify(state));
    }, [balance, holdings, transactions]);

    const buy = (symbol: string, quantity: number, price: number, theme: string) => {
        console.log(`[Portfolio] BUY Request: ${symbol} x ${quantity} @ ${price} (Theme: ${theme})`);

        if (isNaN(price) || price <= 0) {
            alert(`Error: Invalid price detected (${price})`);
            return;
        }

        const totalCost = quantity * price;
        if (totalCost > balance) {
            alert(`Insufficient funds! Cost: $${totalCost.toFixed(2)}, Balance: $${balance.toFixed(2)}`);
            return;
        }

        // alert(`Executing BUY: ${symbol} for $${totalCost.toFixed(2)}`); // Debug alert

        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            symbol,
            type: 'BUY',
            amount: quantity,
            price,
            totalValue: totalCost,
            timestamp: Date.now(),
            theme
        };

        setBalance(prev => {
            console.log(`[Portfolio] Updating Balance: ${prev} -> ${prev - totalCost}`);
            return prev - totalCost;
        });
        setHoldings(prev => ({
            ...prev,
            [symbol]: (prev[symbol] || 0) + quantity
        }));
        setTransactions(prev => {
            const updated = [newTransaction, ...prev];
            console.log(`[Portfolio] Transactions updated, count: ${updated.length}`);
            return updated;
        });
    };

    const sell = (symbol: string, quantity: number, price: number, theme: string) => {
        const currentHolding = holdings[symbol] || 0;
        if (quantity > currentHolding) {
            alert("Insufficient holdings!");
            return;
        }

        const totalValue = quantity * price;

        // Calculate Realized P&L (FIFO or Average Cost Basis? Let's implement Average Cost for simplicity)
        // 1. Find average buy price
        const relevantBuys = transactions.filter(t => t.symbol === symbol && t.type === 'BUY');
        const totalBought = relevantBuys.reduce((sum, t) => sum + t.amount, 0);
        const totalCost = relevantBuys.reduce((sum, t) => sum + t.totalValue, 0);
        const avgBuyPrice = totalBought > 0 ? totalCost / totalBought : 0; // Simple approximation, assumes no prior sells cleared history

        const pnl = (price - avgBuyPrice) * quantity;

        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            symbol,
            type: 'SELL',
            amount: quantity,
            price,
            totalValue,
            timestamp: Date.now(),
            theme,
            pnl
        };

        setBalance(prev => prev + totalValue);
        setHoldings(prev => {
            const newQty = prev[symbol] - quantity;
            if (newQty <= 0.000001) { // Floating point cleanup
                const { [symbol]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [symbol]: newQty };
        });
        setTransactions(prev => [newTransaction, ...prev]);
    };

    const resetPortfolio = () => {
        if (confirm("Reset portfolio to $10,000 and clear all stats?")) {
            setBalance(INITIAL_BALANCE);
            setHoldings({});
            setTransactions([]);
        }
    };

    return (
        <PortfolioContext.Provider value={{ balance, holdings, transactions, buy, sell, resetPortfolio }}>
            {children}
        </PortfolioContext.Provider>
    );
};
