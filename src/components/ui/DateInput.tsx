'use client';

import { forwardRef, useState, useEffect } from 'react';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string;
  error?: string;
  required?: boolean;
  value?: string; // YYYY-MM-DD format
  onChange?: (e: { target: { value: string } }) => void; // Returns YYYY-MM-DD format
  min?: string; // YYYY-MM-DD format
  max?: string; // YYYY-MM-DD format
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, error, required, className = '', value = '', onChange, min, max, placeholder, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    // Convert YYYY-MM-DD to DD/MM/YYYY for display
    const formatDisplayDate = (dateStr: string) => {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
      return dateStr;
    };

    // Convert DD/MM/YYYY to YYYY-MM-DD for internal use
    const parseDisplayDate = (displayStr: string) => {
      if (!displayStr) return '';
      
      // Handle partial input during typing
      const cleanStr = displayStr.replace(/[^\d]/g, '');
      if (cleanStr.length < 8) return '';
      
      const day = cleanStr.substring(0, 2);
      const month = cleanStr.substring(2, 4);
      const year = cleanStr.substring(4, 8);
      
      // Basic validation
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900) {
        return '';
      }
      
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    // Format input as user types
    const formatInput = (input: string) => {
      const cleanInput = input.replace(/[^\d]/g, '');
      let formatted = '';
      
      if (cleanInput.length > 0) {
        formatted = cleanInput.substring(0, 2);
      }
      if (cleanInput.length > 2) {
        formatted += '/' + cleanInput.substring(2, 4);
      }
      if (cleanInput.length > 4) {
        formatted += '/' + cleanInput.substring(4, 8);
      }
      
      return formatted;
    };

    // Update display value when prop value changes
    useEffect(() => {
      setDisplayValue(formatDisplayDate(value));
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatInput(inputValue);
      setDisplayValue(formatted);
      
      // Only call onChange when we have a complete date
      if (formatted.length === 10) {
        const isoDate = parseDisplayDate(formatted);
        if (isoDate && onChange) {
          onChange({ target: { value: isoDate } });
        }
      } else if (formatted.length === 0 && onChange) {
        onChange({ target: { value: '' } });
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Validate and correct the date on blur
      if (displayValue.length === 10) {
        const isoDate = parseDisplayDate(displayValue);
        if (isoDate) {
          // Check against min/max constraints
          if (min && isoDate < min) {
            setDisplayValue(formatDisplayDate(min));
            if (onChange) {
              onChange({ target: { value: min } });
            }
            return;
          }
          if (max && isoDate > max) {
            setDisplayValue(formatDisplayDate(max));
            if (onChange) {
              onChange({ target: { value: max } });
            }
            return;
          }
          
          // Validate the actual date
          const dateObj = new Date(isoDate);
          const [year, month, day] = isoDate.split('-');
          if (dateObj.getFullYear() == parseInt(year) && 
              dateObj.getMonth() == parseInt(month) - 1 && 
              dateObj.getDate() == parseInt(day)) {
            if (onChange) {
              onChange({ target: { value: isoDate } });
            }
          } else {
            // Invalid date, clear it
            setDisplayValue('');
            if (onChange) {
              onChange({ target: { value: '' } });
            }
          }
        }
      }
      
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type="text"
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            error ? 'border-red-500' : ''
          } ${className}`}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder || 'DD/MM/YYYY'}
          maxLength={10}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';

export default DateInput;