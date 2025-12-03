import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    useEffect(() => {
        document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const styles = {
        select: {
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--color-neutral-300)',
            backgroundColor: 'white',
            color: 'var(--color-neutral-900)',
            cursor: 'pointer',
            fontSize: '0.875rem',
        }
    };

    return (
        <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            style={styles.select}
        >
            <option value="en">🇺🇸 English</option>
            <option value="zh">🇨🇳 中文 (Chinese)</option>
            <option value="ar">🇸🇦 العربية (Arabic)</option>
            <option value="es">🇪🇸 Español (Spanish)</option>
        </select>
    );
};
