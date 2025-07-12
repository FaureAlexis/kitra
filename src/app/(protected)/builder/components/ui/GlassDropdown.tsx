'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from '../../builder.module.css';

interface GlassDropdownOption {
  value: string;
  label: string;
}

interface GlassDropdownProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: GlassDropdownOption[];
  label?: string;
  placeholder?: string;
  className?: string;
}

export const GlassDropdown = React.memo(function GlassDropdown({
  id,
  value,
  onChange,
  options,
  label,
  placeholder = 'Select an option',
  className = ''
}: GlassDropdownProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={styles.glassLabel}>
          {label}
        </label>
      )}
      <div className={styles.glassDropdownContainer}>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.glassSelect}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className={styles.glassSelectIcon}>
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}); 