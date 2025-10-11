'use client';

import { forwardRef, useState, useEffect, useRef } from 'react';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string;
  error?: string;
  required?: boolean;
  value?: string; // YYYY-MM-DD format
  onChange?: (e: { target: { value: string } }) => void; // Returns YYYY-MM-DD format
  min?: string; // YYYY-MM-DD format
  max?: string; // YYYY-MM-DD format
  allowFutureDate?: boolean; // Allow future dates (for passport expiry)
  allowedDaysFromToday?: number; // Limit to specific number of days from today (for arrival dates)
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, error, required, className = '', value = '', onChange, min, max, placeholder, allowFutureDate = false, allowedDaysFromToday, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const calendarRef = useRef<HTMLDivElement>(null);

    // Convert YYYY-MM-DD to DD/MM/YYYY for display
    const formatDisplayDate = (dateStr: string) => {
      if (!dateStr || typeof dateStr !== 'string') return '';
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        if (year && month && day) {
          return `${day}/${month}/${year}`;
        }
      }
      return dateStr;
    };

    // Convert DD/MM/YYYY to YYYY-MM-DD for internal use
    const parseDisplayDate = (displayStr: string) => {
      if (!displayStr || typeof displayStr !== 'string') return '';
      
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
      
      if (monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
        return '';
      }
      
      // Validate day based on month and year
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
      if (dayNum < 1 || dayNum > daysInMonth) {
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

    // Close calendar when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
          setShowCalendar(false);
        }
      };

      if (showCalendar) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showCalendar]);

    // Generate calendar days
    const generateCalendarDays = (year: number, month: number) => {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
        
        // Parse date string as local date to avoid timezone issues
        const [yearStr, monthStr, dayStr] = dateStr.split('-');
        const currentDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
        
        let isValidDate: boolean;
        if (allowedDaysFromToday !== undefined) {
          // For arrival dates: only allow today and next X days
          const maxAllowedDate = new Date(today);
          maxAllowedDate.setDate(today.getDate() + allowedDaysFromToday);
          isValidDate = currentDate >= today && currentDate <= maxAllowedDate;
        } else if (allowFutureDate) {
          // For passport expiry: only allow future dates
          isValidDate = currentDate > today;
        } else {
          // For birth date: only allow past dates
          isValidDate = currentDate <= today;
        }
        
        days.push({ day, dateStr, isValidDate });
      }
      
      return days;
    };

    const handleDateSelect = (dateStr: string) => {
      if (onChange) {
        onChange({ target: { value: dateStr } });
      }
      setShowCalendar(false);
    };

    const handleYearChange = (direction: 'prev' | 'next') => {
      if (direction === 'prev') {
        setSelectedYear(prev => Math.max(1900, prev - 1));
      } else {
        const maxYear = allowFutureDate ? new Date().getFullYear() + 20 : new Date().getFullYear();
        setSelectedYear(prev => Math.min(maxYear, prev + 1));
      }
    };

    const handleMonthChange = (direction: 'prev' | 'next') => {
      if (direction === 'prev') {
        if (selectedMonth === 0) {
          setSelectedMonth(11);
          handleYearChange('prev');
        } else {
          setSelectedMonth(prev => prev - 1);
        }
      } else {
        if (selectedMonth === 11) {
          setSelectedMonth(0);
          handleYearChange('next');
        } else {
          setSelectedMonth(prev => prev + 1);
        }
      }
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
      // Validate the date on blur but don't clear user input
      if (displayValue.length === 10) {
        const isoDate = parseDisplayDate(displayValue);
        if (isoDate) {
          // Check against min/max constraints
          if (min && isoDate < min) {
            // Keep the user's input but don't update the value
            console.warn('Date is before minimum allowed:', displayValue);
            return;
          }
          if (max && isoDate > max) {
            // Keep the user's input but don't update the value
            console.warn('Date is after maximum allowed:', displayValue);
            return;
          }
          
          // Validate the actual date
          const [year, month, day] = isoDate.split('-');
          const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          
          // Check if the date components match what was entered
          if (dateObj.getFullYear() === parseInt(year) && 
              dateObj.getMonth() === parseInt(month) - 1 && 
              dateObj.getDate() === parseInt(day)) {
            // Valid date - update the value if needed
            if (onChange) {
              onChange({ target: { value: isoDate } });
            }
          } else {
            // Invalid date, but keep the display value to avoid frustrating the user
            // Just don't update the underlying value
            console.warn('Invalid date entered:', displayValue);
          }
        }
      } else if (displayValue.length > 0 && displayValue.length < 10) {
        // Partial date entered - keep it as is, don't clear
        console.warn('Partial date entered:', displayValue);
      }
      
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    const calendarDays = generateCalendarDays(selectedYear, selectedMonth);

    return (
      <div className="space-y-1 relative">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="text"
            className={`block w-full h-[42px] px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
              error ? 'border-red-500' : ''
            } ${className}`}
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={() => setShowCalendar(true)}
            placeholder={placeholder || 'DD/MM/YYYY'}
            maxLength={10}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <div 
              ref={calendarRef}
              className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-80"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleYearChange('prev')}
                    className="p-1 hover:bg-gray-100 rounded text-gray-700"
                    disabled={selectedYear <= 1900}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-medium text-sm min-w-[60px] text-center text-gray-900">{selectedYear}</span>
                  <button
                    type="button"
                    onClick={() => handleYearChange('next')}
                    className="p-1 hover:bg-gray-100 rounded text-gray-700"
                    disabled={selectedYear >= (allowFutureDate ? new Date().getFullYear() + 20 : new Date().getFullYear())}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMonthChange('prev')}
                    className="p-1 hover:bg-gray-100 rounded text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-medium text-sm min-w-[80px] text-center text-gray-900">{monthNames[selectedMonth]}</span>
                  <button
                    type="button"
                    onClick={() => handleMonthChange('next')}
                    className="p-1 hover:bg-gray-100 rounded text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {dayNames.map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div key={index} className="text-center">
                    {day ? (
                      <button
                        type="button"
                        onClick={() => day.isValidDate ? handleDateSelect(day.dateStr) : undefined}
                        disabled={!day.isValidDate}
                        className={`w-8 h-8 text-sm rounded transition-colors ${
                          day.isValidDate
                            ? value === day.dateStr
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-blue-100 text-gray-900'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {day.day}
                      </button>
                    ) : (
                      <div className="w-8 h-8"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';

export default DateInput;