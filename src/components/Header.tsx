'use client';

import { Language, getTranslation } from '@/lib/translations';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 48 48" fill="none">
                  <path d="M24 2L6 8v12c0 11.25 7.5 21.75 18 26 10.5-4.25 18-14.75 18-26V8L24 2z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1"/>
                  <path d="M24 4L8 9v11c0 10 6.5 19 16 23 9.5-4 16-13 16-23V9L24 4z" fill="#1e40af"/>
                  <text x="24" y="24" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontFamily="serif" fontSize="10" fontWeight="bold">e-CD</text>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-xl font-bold text-gray-900">
                  <span className="block sm:hidden">
                    <span className="block">Indonesia</span>
                    <span className="block">Electronic Customs Declaration</span>
                  </span>
                  <span className="hidden sm:block">
                    {getTranslation('siteTitle', language)}
                  </span>
                </h1>
                <p className="text-xs text-red-600 font-medium hidden sm:block">
                  {getTranslation('disclaimer', language)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <LanguageSelector 
              currentLanguage={language}
              onLanguageChange={onLanguageChange}
            />
          </div>
        </div>
      </div>

      <div className="bg-red-50 border-t border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start py-2 space-x-2">
            <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs sm:text-sm text-red-800">
              <strong>Important:</strong> {getTranslation('disclaimer', language)}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}