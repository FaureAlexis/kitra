'use client';

import React from 'react';
import styles from '../../builder.module.css';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GlassButton = React.memo(function GlassButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'secondary',
  size = 'md',
  className = ''
}: GlassButtonProps) {
  const variantClass = variant === 'primary' ? styles.primary : '';
  const sizeClass = styles[`glassBtnSize${size.charAt(0).toUpperCase() + size.slice(1)}`];
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.glassButton} ${variantClass} ${sizeClass} ${className}`}
    >
      {children}
    </button>
  );
}); 