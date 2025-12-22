import React from 'react';
import { useCurrency, type CurrencyCode } from '../context/CurrencyContext';

export const CurrencySelector: React.FC = () => {
    const { currency, setCurrency } = useCurrency();

    const currencies: CurrencyCode[] = ['USD', 'EUR', 'JPY', 'GBP', 'CNY'];

    const styles = {
        container: {
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            padding: '0.5rem',
            backgroundColor: 'var(--color-neutral-100)',
            borderRadius: '0.5rem',
        },
        label: {
            fontSize: '0.875rem',
            fontWeight: 600,
            marginRight: '0.25rem',
            color: 'var(--color-text-secondary)',
        },
        button: (isActive: boolean) => ({
            padding: '0.25rem 0.75rem',
            borderRadius: '0.25rem',
            border: isActive ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-neutral-300)',
            backgroundColor: isActive ? 'var(--color-brand-primary)' : 'white',
            color: isActive ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: isActive ? 600 : 400,
            transition: 'all 0.2s ease',
        })
    };

    return (
        <div style={styles.container}>
            <span style={styles.label}>Currency:</span>
            {currencies.map((code) => (
                <button
                    key={code}
                    style={styles.button(currency === code)}
                    onClick={() => setCurrency(code)}
                >
                    {code}
                </button>
            ))}
        </div>
    );
};
