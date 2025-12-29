'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Language, getTranslation } from '@/lib/translations';
import { trackButtonClick, trackLanguageChange, trackUserJourney } from '@/lib/mixpanel';
import { hasValidStoredQR, getStoredQR, StoredQRData } from '@/lib/qr-storage';
import QRCodeModal from '@/components/QRCodeModal';
import QRNotificationBanner from '@/components/QRNotificationBanner';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [hasStoredQR, setHasStoredQR] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [storedQRData, setStoredQRData] = useState<StoredQRData | null>(null);

  useEffect(() => {
    trackUserJourney('Home Page Loaded', 1);
    
    // Check for stored QR code
    if (hasValidStoredQR()) {
      setHasStoredQR(true);
    }
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    // trackLanguageChange(newLanguage, language);
    setLanguage(newLanguage);
  };

  const handleStartFormClick = (location: string) => {
    // trackButtonClick('Start Form', location);
    trackUserJourney('Form Start Clicked', 2);
  };

  const handleViewQRClick = () => {
    const stored = getStoredQR();
    if (stored) {
      setStoredQRData(stored);
      setShowQRModal(true);
      // trackButtonClick('View Stored QR', 'Homepage');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Disclaimer Bar */}
      <div className="bg-gray-200 text-black text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>
            Independent service assisting with Indonesian customs declarations. Not affiliated with Indonesian Customs and Excise Directorate General.
          </p>
        </div>
      </div>
      
      <Header language={language} onLanguageChange={handleLanguageChange} />
      
      {/* QR Notification Banner */}
      {hasStoredQR && (
        <QRNotificationBanner
          language={language}
          onViewQR={handleViewQRClick}
          onDismiss={() => setHasStoredQR(false)}
        />
      )}
      
      <main>
        <section className="py-16 sm:py-24 flex items-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
                Complete All Indonesia{' '}
                <br className="sm:hidden" />
                Customs Declaration
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Fill out your customs form easily with an intuitive interface and multi-language support.
              </p>
              <Link
                href="/form"
                onClick={() => handleStartFormClick('Hero Section')}
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-base"
              >
                Continue
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  What is the Indonesian Customs Declaration?
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  The Indonesian Customs Declaration (e-CD) is a mandatory document required by all travelers entering Indonesia. It streamlines the customs process and ensures compliance with import regulations.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Required for All Travelers</h3>
                      <p className="text-gray-600">Every passenger entering Indonesia must complete this declaration</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Declare Your Items</h3>
                      <p className="text-gray-600">Accurately declare all goods to avoid penalties and delays</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Save Time at Arrival</h3>
                      <p className="text-gray-600">Complete online to expedite your airport customs clearance</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Service Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">Digital Submission</h4>
                      <p className="text-sm text-gray-600 mt-1">Complete your customs declaration digitally before arrival</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">Multi-Language Support</h4>
                      <p className="text-sm text-gray-600 mt-1">Available in multiple languages for international travelers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">QR Code Generation</h4>
                      <p className="text-sm text-gray-600 mt-1">Receive a QR code for quick scanning at customs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Complete Your Declaration?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Save time at the airport by preparing your customs declaration online now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/form"
                onClick={() => handleStartFormClick('CTA Section')}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg text-base"
              >
                Start Your Declaration
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-6 text-white text-sm">
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
                <span>Fast processing</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer language={language} />
      
      {/* QR Code Modal for stored QR */}
      {storedQRData && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          submissionResult={storedQRData}
          formData={undefined}
          language={language}
        />
      )}
    </div>
  );
}
