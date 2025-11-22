import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import './Button.css';

export default function Button({
    children,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    icon = null,
    onClick,
    type = 'button',
    className = '',
    ...props
}) {
    const buttonClass = `
    btn
    btn-${variant}
    btn-${size}
    ${loading ? 'btn-loading' : ''}
    ${disabled ? 'btn-disabled' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <button
            type={type}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <LoadingSpinner size="small" color="white" />}
            {!loading && icon && <span className="btn-icon">{icon}</span>}
            <span className="btn-text">{children}</span>
        </button>
    );
}
