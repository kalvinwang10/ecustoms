'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Language, getTranslation } from '@/lib/translations';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header language={language} onLanguageChange={setLanguage} />
      
      <main>
        <section className="py-12 sm:py-16 min-h-[50vh] sm:min-h-0 flex items-center" style={{backgroundColor: '#153854'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
                {getTranslation('heroTitle', language)}
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto">
                {getTranslation('heroSubtitle', language)}
              </p>
              <Link
                href="/form"
                className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-sm sm:text-base"
              >
                {getTranslation('continueOnline', language)}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {getTranslation('whatIsCustomsForm', language)}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                  {getTranslation('customsFormExplanation', language)}
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700">{getTranslation('requiredForAllTravelers', language)}</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700">{getTranslation('mustBeDeclared', language)}</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700">{getTranslation('helpsPeventDelays', language)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-xl p-4 sm:p-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">{getTranslation('submitDeclaration', language)}</h3>
                      <p className="text-sm text-blue-700">{getTranslation('submitDeclarationDesc', language)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">{getTranslation('multiLanguageSupport', language)}</h3>
                      <p className="text-sm text-green-700">{getTranslation('multiLanguageSupportDesc', language)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900">{getTranslation('printablePdf', language)}</h3>
                      <p className="text-sm text-purple-700">{getTranslation('printablePdfDesc', language)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 py-8 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {getTranslation('readyToComplete', language)}
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8">
              {getTranslation('getStartedNow', language)}
            </p>
            <Link
              href="/form"
              className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-sm sm:text-base"
            >
              {getTranslation('continueOnline', language)}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer language={language} />
    </div>
  );
}
