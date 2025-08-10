'use client';

import { forwardRef } from 'react';

interface ArrivalDateSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  label?: string;
  error?: string;
  required?: boolean;
  value?: string; // YYYY-MM-DD format
  onChange?: (e: { target: { value: string } }) => void; // Returns YYYY-MM-DD format
  placeholder?: string;
}

const ArrivalDateSelect = forwardRef<HTMLSelectElement, ArrivalDateSelectProps>(
  ({ label, error, required, className = '', value = '', onChange, placeholder, ...props }, ref) => {
    
    // Generate the three allowed dates: today, +1 day, +2 days
    const generateDateOptions = () => {
      const options = [];
      const today = new Date();
      
      for (let i = 0; i <= 2; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Format for display: DD/MM/YYYY
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const displayDate = `${day}/${month}/${year}`;
        
        // Format for value: YYYY-MM-DD
        const valueDate = date.toISOString().split('T')[0];
        
        // Just show the date in DD/MM/YYYY format
        const label = displayDate;
        
        options.push({
          value: valueDate,
          label: label,
          displayDate: displayDate
        });
      }
      
      return options;
    };

    const dateOptions = generateDateOptions();

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange({ target: { value: e.target.value } });
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
        <select
          ref={ref}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
            error ? 'border-red-500' : ''
          } ${className}`}
          value={value}
          onChange={handleSelectChange}
          {...props}
        >
          <option value="" disabled>
            {placeholder || 'Select arrival date'}
          </option>
          {dateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

ArrivalDateSelect.displayName = 'ArrivalDateSelect';

export default ArrivalDateSelect;