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
  const [showModal, setShowModal] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const cardInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function initializeSquare() {
      try {
        if (!process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || !process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID) {
          setErrorMessage('Payment system not configured');
          return;
        }

        // Clear any existing card instance
        if (cardInstanceRef.current) {
          try {
            await cardInstanceRef.current.destroy();
          } catch (e) {
            // Ignore errors during cleanup
          }
          cardInstanceRef.current = null;
        }

        const paymentsInstance = await payments(
          process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
        );
        
        if (paymentsInstance && isMounted) {
          const cardInstance = await paymentsInstance.card({
            style: {
              '.input-container': {
                borderColor: '#D1D5DB',
                borderWidth: '1px',
                borderRadius: '8px',
              },
              '.input-container.is-focus': {
                borderColor: '#3B82F6',
              },
              '.input-container.is-error': {
                borderColor: '#EF4444',
              },
              '.message-text': {
                color: '#374151',
              },
              '.message-icon': {
                color: '#6B7280',
              },
              '.message-text.is-error': {
                color: '#DC2626',
              },
              '.message-icon.is-error': {
                color: '#DC2626',
              },
              input: {
                fontSize: '16px',
                color: '#111827',
              },
              'input::placeholder': {
                color: '#6B7280',
              },
            },
          });
          
          await cardInstance.attach('#card-container');
          cardInstanceRef.current = cardInstance;
          
          if (isMounted) {
            setCard(cardInstance);
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error('Failed to initialize Square:', error);
        if (isMounted) {
          setErrorMessage('Failed to load payment form');
        }
      }
    }
    
    initializeSquare();
    
    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (cardInstanceRef.current) {
        cardInstanceRef.current.destroy().catch(() => {
          // Ignore errors during cleanup
        });
        cardInstanceRef.current = null;
      }
    };
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
        // Get form data from sessionStorage to pass to API
        const pendingFormData = sessionStorage.getItem('pendingFormData');
        const pendingQR = sessionStorage.getItem('pendingQR');
        
        let parsedFormData = null;
        let parsedSubmissionDetails = null;
        
        if (pendingFormData) {
          try {
            parsedFormData = JSON.parse(pendingFormData);
          } catch (e) {
            console.error('Failed to parse pendingFormData:', e);
          }
        }
        
        if (pendingQR) {
          try {
            const qrData = JSON.parse(pendingQR);
            parsedSubmissionDetails = qrData.submissionDetails;
          } catch (e) {
            console.error('Failed to parse pendingQR:', e);
          }
        }
        
        const response = await fetch('/api/create-square-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: tokenResult.token,
            amount: 2800, // $28.00 in cents
            formData: parsedFormData,
            submissionDetails: parsedSubmissionDetails,
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Show modal instead of processing payment
          setPaymentResult(result.payment);
          setShowModal(true);
          setIsProcessing(false);
          trackEvent('Payment Bypassed - Temp Mode', { amount: 2800, currency: 'USD' });
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    setShowModal(false);
    if (paymentResult) {
      onSuccess(paymentResult);
    }
  };

  return (
    <>
      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex items-start space-x-3 mb-4">
              <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Payment Processing Unavailable
                </h3>
                <p className="text-gray-700 mb-3">
                  Payment processing is currently unavailable. Your card has not been charged.
                </p>
                <p className="text-gray-600 text-sm">
                  Please proceed to complete your submission. You will receive further instructions via email.
                </p>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Submission
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Square Card Form */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div 
          id="card-container" 
          className="bg-white"
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
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
    </>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    qrCode?: { imageData?: string };
    submissionDetails?: { 
      submissionId?: string; 
      submissionTime?: string; 
      status?: string;
      portInfo?: string;
      customsOffice?: string;
      passengerName?: string;
      passportNumber?: string;
      nationality?: string;
      arrivalDate?: string;
      departureDate?: string;
      arrivalCardNumber?: string;
      submissionStatus?: string;
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
    const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
    
    if (!pendingQR) {
      // No pending QR data, redirect back to form
      router.push('/form');
      return;
    }

    // Parse and store form data if available
    if (pendingFormDataStr) {
      try {
        const parsedFormData = JSON.parse(pendingFormDataStr);
        setFormData(parsedFormData);
      } catch (error) {
        console.error('Failed to parse form data:', error);
      }
    }

    setIsLoading(false);
  }, [router]);

  const handlePaymentSuccess = async (payment?: Record<string, unknown>) => {
    // Extract payment ID from nested structure
    let paymentId: string | undefined;
    if (payment?.payment && typeof payment.payment === 'object' && 'id' in payment.payment) {
      const paymentData = payment.payment as any;
      paymentId = paymentData.id;
    } else if (payment?.result && typeof payment.result === 'object' && 'payment' in payment.result) {
      const paymentResult = payment.result as any;
      paymentId = paymentResult.payment?.id;
    } else if (payment?.id) {
      paymentId = payment.id as string;
    } else {
      console.warn('Could not extract payment ID from payment data');
      paymentId = `UNKNOWN-${Date.now()}`;
    }

    // Track conversion for Google Ads
    trackPurchaseSuccess(paymentId);

    // Scroll modal container to top for mobile visibility
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Retrieve stored data
    const pendingQR = sessionStorage.getItem('pendingQR');
    
    if (pendingQR) {
      const qrData = JSON.parse(pendingQR);
      
      // Since we're skipping automation, there's no QR code
      // Create a success result without QR
      const successResult = {
        ...qrData,
        paymentSuccess: true,
        paymentId: paymentId,
        message: 'Payment successful! Your Indonesian Arrival Card is being processed.'
      };
      
      setSubmissionResult(successResult);
      
      // Save the successful payment record
      saveCompletedQR(successResult);
      
      // Show success modal (modified to not require QR)
      setTimeout(() => {
        setShowQRModal(true);
      }, 300);
      
      // Clear pending data
      sessionStorage.removeItem('pendingQR');
      sessionStorage.removeItem('pendingFormData');
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
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Customs Declaration Processing Fee</span>
              <span className="font-medium text-gray-900">$28.00</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">includes service fees</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-4">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">$28.00</span>
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
          formData={formData}
          language={language}
        />
      )}
    </div>
  );
}
