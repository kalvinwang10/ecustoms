'use client';

import { forwardRef } from 'react';

interface DateOfBirthSelectProps {
  label: string;
  error?: string;
  required?: boolean;
  value?: string; // Format: YYYY-MM-DD
  onChange?: (value: string) => void;
  className?: string;
}

const DateOfBirthSelect = forwardRef<HTMLDivElement, DateOfBirthSelectProps>(
  ({ label, error, required, value = '', onChange, className = '' }, ref) => {
    // Parse existing value
    const [year, month, day] = value.split('-');
    
    // Generate years from 1920 to current year
    const currentYear = new Date().getFullYear();
    const startYear = 1920;
    const years = [];
    for (let y = currentYear; y >= startYear; y--) {
      years.push(y);
    }

    // Generate months
    const months = [
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];

    // Generate days based on selected month and year
    const getDaysInMonth = (monthVal: string, yearVal: string) => {
      if (!monthVal || !yearVal) return 31;
      const daysInMonth = new Date(parseInt(yearVal), parseInt(monthVal), 0).getDate();
      return daysInMonth;
    };

    const maxDays = getDaysInMonth(month, year);
    const days = [];
    for (let d = 1; d <= maxDays; d++) {
      days.push(d.toString().padStart(2, '0'));
    }

    const isValidDate = (yearVal: string, monthVal: string, dayVal: string) => {
      if (!yearVal || !monthVal || !dayVal) return true; // Allow partial dates during input
      
      const inputDate = new Date(parseInt(yearVal), parseInt(monthVal) - 1, parseInt(dayVal));
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      // Check if the date is valid (handles invalid dates like Feb 30)
      const isValidCalendarDate = 
        inputDate.getFullYear() === parseInt(yearVal) &&
        inputDate.getMonth() === parseInt(monthVal) - 1 &&
        inputDate.getDate() === parseInt(dayVal);
      
      // Check if the date is not in the future
      const isNotFuture = inputDate <= today;
      
      return isValidCalendarDate && isNotFuture;
    };

    const handleChange = (field: string, newValue: string) => {
      let newYear = year || '';
      let newMonth = month || '';
      let newDay = day || '';

      if (field === 'year') newYear = newValue;
      if (field === 'month') newMonth = newValue;
      if (field === 'day') newDay = newValue;

      // Adjust day if it's invalid for the new month/year combination
      if (field === 'month' || field === 'year') {
        const maxDaysForNewMonth = getDaysInMonth(newMonth, newYear);
        if (parseInt(newDay) > maxDaysForNewMonth) {
          newDay = maxDaysForNewMonth.toString().padStart(2, '0');
        }
      }

      // Validate the complete date
      const isValid = isValidDate(newYear, newMonth, newDay);
      
      const dateString = `${newYear}-${newMonth}-${newDay}`;
      onChange?.(dateString);
      
      // If validation fails and we have a complete date, trigger error through parent validation
      if (newYear && newMonth && newDay && !isValid) {
        // The parent form validation should handle this through the error prop
      }
    };

    return (
      <div ref={ref} className={`space-y-1 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="grid grid-cols-3 gap-2">
          {/* Day */}
          <div>
            <select
              value={day || ''}
              onChange={(e) => handleChange('day', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                error ? 'border-red-500' : ''
              }`}
            >
              <option value="" disabled>Day</option>
              {days.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <select
              value={month || ''}
              onChange={(e) => handleChange('month', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                error ? 'border-red-500' : ''
              }`}
            >
              <option value="" disabled>Month</option>
              {months.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <select
              value={year || ''}
              onChange={(e) => handleChange('year', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                error ? 'border-red-500' : ''
              }`}
            >
              <option value="" disabled>Year</option>
              {years.map(y => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

DateOfBirthSelect.displayName = 'DateOfBirthSelect';

export default DateOfBirthSelect;