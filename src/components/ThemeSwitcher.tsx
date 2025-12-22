import React, { useEffect, useState } from 'react';
import { getRegionFromCountryCode, type CulturalRegion } from '../utils/regionMapping';

type Theme = CulturalRegion | 'deuteranopia' | 'tritanopia' | 'auto';

export const ThemeSwitcher: React.FC = () => {
    const [currentTheme, setCurrentTheme] = useState<Theme>('auto');
    const [detectedRegion, setDetectedRegion] = useState<CulturalRegion | null>(null);
    const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

    useEffect(() => {
        // Auto-detect location on mount
        const fetchLocation = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data && data.country_code) {
                    const region = getRegionFromCountryCode(data.country_code);
                    setDetectedRegion(region);
                    setDetectedCountry(data.country_name);
                }
            } catch (error) {
                console.error('Failed to detect location:', error);
                // Fallback to Western if detection fails
                setDetectedRegion('western');
            }
        };

        fetchLocation();
    }, []);

    useEffect(() => {
        if (currentTheme === 'auto') {
            if (detectedRegion) {
                document.documentElement.setAttribute('data-theme', detectedRegion);
            }
        } else {
            document.documentElement.setAttribute('data-theme', currentTheme);
        }
    }, [currentTheme, detectedRegion]);

    const styles = {
        container: {
            display: 'flex',
            gap: '0.5rem',
            padding: '1rem',
            backgroundColor: 'var(--color-neutral-100)',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            alignItems: 'center',
            flexWrap: 'wrap' as const,
        },
        label: {
            fontWeight: 'bold',
            marginRight: '0.5rem',
        },
        button: (theme: Theme) => ({
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            border: '1px solid var(--color-neutral-200)',
            cursor: 'pointer',
            backgroundColor: currentTheme === theme ? 'var(--color-brand-primary)' : 'white',
            color: currentTheme === theme ? 'white' : 'var(--color-neutral-900)',
            fontWeight: currentTheme === theme ? 'bold' : 'normal',
        }),
        autoInfo: {
            marginLeft: 'auto',
            fontSize: '0.875rem',
            color: 'var(--color-neutral-800)',
            fontStyle: 'italic',
        }
    };

    return (
        <div style={styles.container}>
            <span style={styles.label}>Select Cultural Context:</span>
            <button
                style={styles.button('auto')}
                onClick={() => setCurrentTheme('auto')}
            >
                Auto (Detected)
            </button>
            <button
                style={styles.button('western')}
                onClick={() => setCurrentTheme('western')}
            >
                Western
            </button>
            <button
                style={styles.button('east-asian')}
                onClick={() => setCurrentTheme('east-asian')}
            >
                East Asian
            </button>
            <button
                style={styles.button('middle-eastern')}
                onClick={() => setCurrentTheme('middle-eastern')}
            >
                Middle Eastern
            </button>
            <button
                style={styles.button('south-asian')}
                onClick={() => setCurrentTheme('south-asian')}
            >
                South Asian
            </button>

            <span style={{ marginLeft: '0.5rem', marginRight: '0.5rem', borderLeft: '1px solid var(--color-neutral-300)', height: '20px' }}></span>

            <button
                style={styles.button('deuteranopia')}
                onClick={() => setCurrentTheme('deuteranopia')}
                title="Red-Green Color Blindness"
            >
                ♿ Deuteranopia Mode (Red-Green Blindness)
            </button>
            <button
                style={styles.button('tritanopia')}
                onClick={() => setCurrentTheme('tritanopia')}
                title="Blue-Yellow Color Blindness"
            >
                ♿ Tritanopia Mode (Blue-Yellow Blindness)
            </button>

            {
                currentTheme === 'auto' && detectedCountry && (
                    <span style={styles.autoInfo}>
                        Detected: {detectedCountry} → {detectedRegion?.replace('-', ' ')} Theme
                    </span>
                )
            }
        </div >
    );
};
