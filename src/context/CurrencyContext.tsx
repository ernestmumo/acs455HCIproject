import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchExchangeRates, type ExchangeRates } from '../services/exchangeRates';

export type CurrencyCode = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CNY';

interface CurrencyContextType {
    currency: CurrencyCode;
    rate: number;
    symbol: string;
    setCurrency: (code: CurrencyCode) => void;
    isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

const SYMBOLS: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    JPY: '¥',
    GBP: '£',
    CNY: '¥'
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<CurrencyCode>('USD');
    const [rates, setRates] = useState<ExchangeRates>({ USD: 1 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRates = async () => {
            const fetchedRates = await fetchExchangeRates();
            setRates(fetchedRates);
            setIsLoading(false);
        };
        loadRates();
    }, []);

    // Get current rate, default to 1 if not found
    const currentRate = rates[currency] || 1;

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                rate: currentRate,
                symbol: SYMBOLS[currency],
                setCurrency,
                isLoading
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
};
