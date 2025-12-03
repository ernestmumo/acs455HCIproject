import React, { useState, useEffect } from 'react';
import type { Stock } from '../types/market';

interface TokenSelectorProps {
    allTokens: Stock[];
    activeSymbols: string[];
    onAddToken: (symbol: string) => void;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({ allTokens, activeSymbols, onAddToken }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Stock[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (searchTerm.length > 1) {
            const results = allTokens
                .filter(token =>
                    !activeSymbols.includes(token.symbol) &&
                    (token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        token.name.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .slice(0, 10); // Limit to 10 results
            setSearchResults(results);
            setIsOpen(true);
        } else {
            setSearchResults([]);
            setIsOpen(false);
        }
    }, [searchTerm, allTokens, activeSymbols]);

    const styles = {
        container: {
            position: 'relative' as const,
            marginBottom: '1.5rem',
            maxWidth: '400px',
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-neutral-200)',
            fontSize: '1rem',
            outline: 'none',
        },
        dropdown: {
            position: 'absolute' as const,
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: '0.5rem',
            marginTop: '0.25rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
            maxHeight: '300px',
            overflowY: 'auto' as const,
        },
        item: {
            padding: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-neutral-50)',
        },
        symbol: {
            fontWeight: 'bold',
        },
        price: {
            color: 'var(--color-neutral-800)',
            fontSize: '0.875rem',
        }
    };

    return (
        <div style={styles.container}>
            <input
                type="text"
                placeholder="Search crypto (e.g. DOGE, SHIB)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.input}
            />

            {isOpen && searchResults.length > 0 && (
                <div style={styles.dropdown}>
                    {searchResults.map(token => (
                        <div
                            key={token.symbol}
                            style={styles.item}
                            onClick={() => {
                                onAddToken(token.symbol);
                                setSearchTerm('');
                                setIsOpen(false);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            <div>
                                <span style={styles.symbol}>{token.name}</span>
                                <span style={{ marginLeft: '0.5rem', color: 'var(--color-neutral-500)', fontSize: '0.8rem' }}>{token.symbol}</span>
                            </div>
                            <span style={styles.price}>${token.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
