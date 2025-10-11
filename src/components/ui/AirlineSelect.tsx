'use client';

import { useState, useRef, useEffect } from 'react';

interface AirlineOption {
  value: string;
  label: string;
}

interface AirlineSelectProps {
  options: AirlineOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const AirlineSelect = ({ options, value, onChange, className = '', placeholder }: AirlineSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-left flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate pr-2">{value || placeholder}</span>
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full sm:w-96 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-w-[calc(100vw-2rem)]">
          <div className="p-3 border-b">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search airline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 text-base text-gray-900 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-60 sm:max-h-80 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={`${option.value}-${index}`}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-base text-gray-900 border-b border-gray-100 last:border-b-0 min-h-[44px] flex items-center"
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-base text-gray-500 min-h-[44px] flex items-center">
                No airlines found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AirlineSelect;