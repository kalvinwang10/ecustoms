'use client';

/*
 * PAYMENT STEP TEMPORARILY DISABLED
 * 
 * This checkout page is currently not in use - payment flow has been 
 * temporarily disabled to show QR codes directly after automation.
 * 
 * To re-enable payment flow:
 * 1. Uncomment payment redirect in /src/app/form/page.tsx (lines ~1456-1457)
 * 2. Comment out direct QR display in /src/app/form/page.tsx (lines ~1451-1453)
 * 3. Restore paymentStatus requirement in /src/lib/qr-storage.ts
 * 
 * This file has been migrated from Stripe to Square with USD pricing.
 */

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { payments } from '@square/web-sdk';
import { Language } from '@/lib/translations';
import { trackPageView, trackButtonClick, trackEvent } from '@/lib/mixpanel';
import { trackPurchaseSuccess } from '@/lib/gtag';
import QRCodeModal from '@/components/QRCodeModal';
import { saveCompletedQR } from '@/lib/qr-storage';

interface CheckoutFormProps {
  onSuccess: (payment: Record<string, unknown>) => void;
}

function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const [card, setCard] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initializeSquare() {
      try {
        if (!process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || !process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID) {
          setErrorMessage('Payment system not configured');
          return;
        }

        const paymentsInstance = await payments(
          process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
        );
        
        if (paymentsInstance) {
          const cardInstance = await paymentsInstance.card();
          await cardInstance.attach('#card-container');
          setCard(cardInstance);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize Square:', error);
        setErrorMessage('Failed to load payment form');
      }
    }
    
    initializeSquare();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!card) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    trackButtonClick('Complete Payment', 'Checkout Page');

    try {
      const tokenResult = await card.tokenize();
      
      if (tokenResult.status === 'OK') {
        const response = await fetch('/api/create-square-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: tokenResult.token,
            amount: 2800, // $28.00 in cents
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          trackEvent('Payment Succeeded', { amount: 2800, currency: 'USD' });
          onSuccess(result.payment);
        } else {
          setErrorMessage(result.error || 'Payment failed');
          trackEvent('Payment Failed', { error: result.error });
        }
      } else {
        const errors = tokenResult.errors?.map((e: any) => e.message).join(', ');
        setErrorMessage(errors || 'Card tokenization failed');
        trackEvent('Payment Failed', { error: 'Tokenization failed' });
      }
    } catch (error) {
      setErrorMessage('Payment failed. Please try again.');
      trackEvent('Payment Failed', { error: 'Network error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Square Card Form */}
      <div 
        id="card-container" 
        className="min-h-[200px] border border-gray-300 rounded-lg p-4"
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isInitialized || isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
          isProcessing || !isInitialized
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Pay $28.00'}
      </button>

      {/* Security Badge */}
      <div className="text-center text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure payment powered by Square
        </span>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    qrCode?: { imageData?: string };
    submissionDetails?: { 
      submissionId?: string; 
      submissionTime?: string; 
      status?: string;
      portInfo?: string;
      customsOffice?: string;
    };
  } | null>(null);

  useEffect(() => {
    // Track page view
    trackPageView('Checkout Page');

    // Get language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Check if we have pending QR data
    const pendingQR = sessionStorage.getItem('pendingQR');
    if (!pendingQR) {
      // No pending QR data, redirect back to form
      router.push('/form');
      return;
    }

    setIsLoading(false);
  }, [router]);

  const handlePaymentSuccess = async (payment?: Record<string, unknown>) => {
    // Track conversion for Google Ads when QR code is about to be shown
    trackPurchaseSuccess(payment?.id as string);

    // Scroll modal container to top for mobile visibility
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Retrieve stored QR data
    const pendingQR = sessionStorage.getItem('pendingQR');
    if (pendingQR) {
      const qrData = JSON.parse(pendingQR);
      setSubmissionResult(qrData);
      
      // Save QR code to persistent storage for 2 days
      saveCompletedQR(qrData);
      
      // Small delay to ensure scroll completes before showing QR modal
      setTimeout(() => {
        setShowQRModal(true);
      }, 300);
      
      // Clear pending data
      sessionStorage.removeItem('pendingQR');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div 
      ref={modalContainerRef}
      className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
    >
      <div className="relative flex items-center justify-center min-h-full p-4">
        <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-900">
            Electronic Customs Declaration Processing Fee
          </h1>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Customs Declaration Processing Fee</span>
              <span className="font-medium">$28.00</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">includes service fees</span>
            </div>
            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>$28.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CheckoutForm 
            onSuccess={handlePaymentSuccess}
          />
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded text-center">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Important Notice</h3>
          <p className="text-xs text-gray-600 mb-2">
            This is an independent service to assist with Indonesian customs declaration preparation. 
            For manual submission, please visit the{' '}
            <a 
              href="https://allindonesia.imigrasi.go.id/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 underline"
            >
              All Indonesia immigration website
            </a>.
          </p>
          <p className="text-xs text-gray-500">
            By completing this purchase, you agree to our{' '}
            <a href="#" className="text-gray-600 hover:text-gray-800 underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-gray-600 hover:text-gray-800 underline">Privacy Policy</a>.
          </p>
        </div>
        </div>
      </div>

      {/* QR Code Modal - shown after successful payment */}
      {submissionResult && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            router.push('/');
          }}
          submissionResult={submissionResult}
          formData={undefined}
          language={language}
        />
      )}
    </div>
  );
}
