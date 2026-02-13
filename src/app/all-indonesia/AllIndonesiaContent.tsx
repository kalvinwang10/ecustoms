'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Language } from '@/lib/translations';
import { trackPageView, trackButtonClick } from '@/lib/mixpanel';
import { regions, getStats } from '@/data/indonesia-entry-points';

type FilterType = 'all' | 'airports' | 'seaports';

interface FaqItem {
  question: string;
  answer: string;
}

interface AllIndonesiaContentProps {
  faqData: FaqItem[];
}

export default function AllIndonesiaContent({ faqData }: AllIndonesiaContentProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [filter, setFilter] = useState<FilterType>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = getStats();

  useEffect(() => {
    trackPageView('All Indonesia Entry Points');
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const handleCtaClick = (location: string) => {
    trackButtonClick('Start Declaration', location);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Disclaimer Bar */}
      <div className="bg-gray-200 text-black text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>
            <strong>Legal Disclaimer:</strong> Independent service assisting with Indonesian customs declarations. Not affiliated with Indonesian Customs and Excise Directorate General.
          </p>
        </div>
      </div>

      <Header language={language} onLanguageChange={handleLanguageChange} />

      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                All Indonesia Customs Declaration
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Complete your All Indonesia Arrival Form for any airport or seaport across Indonesia. One form, every destination.
              </p>

              {/* Stats Row */}
              <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-12 mb-10">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white">{stats.totalAirports}+</div>
                  <div className="text-sm text-gray-400 mt-1">Airports</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white">{stats.totalSeaports}+</div>
                  <div className="text-sm text-gray-400 mt-1">Seaports</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white">34</div>
                  <div className="text-sm text-gray-400 mt-1">Provinces</div>
                </div>
              </div>

              <Link
                href="/form"
                onClick={() => handleCtaClick('Hero Section')}
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-base"
              >
                Start Your Declaration
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Customs Declarations at Every Indonesian Entry Point
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Indonesia requires all international travelers to submit an All Indonesia Arrival Form upon arrival — whether you&apos;re landing at a major international airport like Jakarta&apos;s Soekarno-Hatta or arriving by ferry in Batam from Singapore.
                </p>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  The arrival form covers goods declaration, currency reporting, and personal information. With our service, you can complete the form digitally before your trip and receive a QR code for fast processing at customs.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Whether you&apos;re traveling to Bali for a vacation, to Surabaya for business, or transiting through Medan, the same customs declaration form applies at all entry points listed below.
                </p>
              </div>

              {/* Key Facts Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Facts</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Form Name', value: 'All Indonesia Arrival Form' },
                    { label: 'Required For', value: 'All international arrivals' },
                    { label: 'Submission', value: 'Online (before or on arrival)' },
                    { label: 'Duty-Free Limit', value: 'USD $500 per person' },
                    { label: 'Currency Limit', value: 'IDR 100 million (or equivalent)' },
                    { label: 'Processing', value: 'QR code scanned at customs' },
                  ].map((fact) => (
                    <div key={fact.label} className="flex justify-between items-start p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-sm font-medium text-gray-500">{fact.label}</span>
                      <span className="text-sm font-semibold text-gray-900 text-right ml-4">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Entry Points by Region */}
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Entry Points by Region
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Browse all Indonesian airports and seaports where customs declarations are processed.
              </p>

              {/* Filter Toggle */}
              <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
                {(['all', 'airports', 'seaports'] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === type
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {type === 'all' ? 'All' : type === 'airports' ? 'Airports' : 'Seaports'}
                  </button>
                ))}
              </div>
            </div>

            {/* Regions */}
            <div className="space-y-16">
              {regions.map((region) => {
                const showAirports = filter === 'all' || filter === 'airports';
                const showSeaports = filter === 'all' || filter === 'seaports';
                const hasContent =
                  (showAirports && region.airports.length > 0) ||
                  (showSeaports && region.seaports.length > 0);

                if (!hasContent) return null;

                return (
                  <div key={region.id}>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{region.name}</h3>
                      <p className="text-gray-600 max-w-3xl">{region.description}</p>
                    </div>

                    {/* Airports */}
                    {showAirports && region.airports.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Airports
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {region.airports.map((point) => (
                            <div
                              key={`${region.id}-${point.code}-${point.name}`}
                              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-gray-900 text-sm">{point.name}</div>
                                  {point.city && (
                                    <div className="text-sm text-gray-500 mt-1">{point.city}</div>
                                  )}
                                </div>
                                <span className="ml-2 flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {point.code}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Seaports */}
                    {showSeaports && region.seaports.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                          Seaports
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {region.seaports.map((point) => (
                            <div
                              key={`${region.id}-${point.code}-${point.name}`}
                              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-gray-900 text-sm">{point.name}</div>
                                  {point.city && (
                                    <div className="text-sm text-gray-500 mt-1">{point.city}</div>
                                  )}
                                </div>
                                <span className="ml-2 flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                  {point.code}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Complete your customs declaration in three simple steps — works for any Indonesian entry point.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-blue-600 mb-2">Step 1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Fill Out the Form</h3>
                <p className="text-gray-600">Enter your personal details, travel information, and items to declare using our intuitive multi-language form.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-blue-600 mb-2">Step 2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Get Your QR Code</h3>
                <p className="text-gray-600">After submission, you&apos;ll receive a QR code containing your customs declaration data for quick processing.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-blue-600 mb-2">Step 3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Show at Customs</h3>
                <p className="text-gray-600">Present your QR code to customs officers at any Indonesian airport or seaport for fast, paperless clearance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Common questions about customs declarations at Indonesian entry points.
              </p>
            </div>

            <div className="space-y-3">
              {faqData.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Complete Your Declaration?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              One form for all Indonesian entry points. Save time at customs by completing your arrival form online now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/form"
                onClick={() => handleCtaClick('CTA Section')}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg text-base"
              >
                Start Your Declaration
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white text-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No account required</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure & encrypted</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Works for all entry points</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer language={language} />
    </div>
  );
}
