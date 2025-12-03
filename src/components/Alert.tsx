import React from 'react';

type AlertType = 'success' | 'error' | 'warning';

interface AlertProps {
    type: AlertType;
    title: string;
    children: React.ReactNode;
}

const Icons = {
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
    ),
    warning: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    ),
};

export const Alert: React.FC<AlertProps> = ({ type, title, children }) => {
    const styles = {
        container: {
            display: 'flex',
            gap: '1rem',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid transparent',
            marginBottom: '1rem',
            backgroundColor: `var(--color-functional-${type}-bg)`,
            borderColor: `var(--color-functional-${type})`,
            color: 'var(--color-neutral-900)',
        },
        iconContainer: {
            color: `var(--color-functional-${type})`,
            flexShrink: 0,
        },
        content: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '0.25rem',
        },
        title: {
            fontWeight: 'bold',
            fontSize: '1rem',
        },
        message: {
            fontSize: '0.875rem',
        }
    };

    return (
        <div style={styles.container} role="alert">
            <div style={styles.iconContainer}>
                {Icons[type]}
            </div>
            <div style={styles.content}>
                <div style={styles.title}>{title}</div>
                <div style={styles.message}>{children}</div>
            </div>
        </div>
    );
};
