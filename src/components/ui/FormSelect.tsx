'use client';

import { useState, useRef, useEffect } from 'react';

interface FormSelectProps {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  placeholder?: string;
}

const FormSelect = ({ 
  label, 
  error, 
  required, 
  options, 
  value = '', 
  onChange, 
  className = '', 
  placeholder = 'Select an option',
  ...props 
}: FormSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find selected option
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      const event = {
        target: { value: optionValue }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(event);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          className={`w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-left flex items-center justify-between ${
            error ? 'border-red-500' : ''
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`truncate pr-2 ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-full sm:w-96 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-w-[calc(100vw-2rem)]">
            {/* Search input for long lists */}
            {options.length > 5 && (
              <div className="p-3 border-b">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 text-base text-gray-900 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div className="max-h-60 sm:max-h-80 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <button
                    key={`${option.value}-${index}`}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-base text-gray-900 border-b border-gray-100 last:border-b-0 min-h-[44px] flex items-center"
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-base text-gray-500 min-h-[44px] flex items-center">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormSelect;