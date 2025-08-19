'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  ExpressCheckoutElement
} from '@stripe/react-stripe-js';
import { Language } from '@/lib/translations';
import { trackPageView, trackButtonClick, trackEvent } from '@/lib/mixpanel';
import { trackPurchaseSuccess } from '@/lib/gtag';
import QRCodeModal from '@/components/QRCodeModal';
import { saveCompletedQR } from '@/lib/qr-storage';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  onSuccess: (paymentIntent: Record<string, unknown>) => void;
}

function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    trackButtonClick('Complete Payment', 'Checkout Page');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?payment_success=true`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
      trackEvent('Payment Failed', { error: error.message });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      trackEvent('Payment Succeeded', { amount: paymentIntent.amount });
      onSuccess({ ...paymentIntent });
    }
  };

  const handleExpressCheckout = async () => {
    if (!stripe || !elements) return;
    
    trackEvent('Express Checkout Initiated', { method: 'express' });
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?payment_success=true`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Express checkout failed');
      trackEvent('Express Checkout Failed', { error: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Express Checkout (Apple Pay / Google Pay) */}
      <div className="border-b pb-6">
        <ExpressCheckoutElement 
          onConfirm={handleExpressCheckout}
        />
      </div>

      {/* Or divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or pay with card</span>
        </div>
      </div>

      {/* Standard Payment Form */}
      <PaymentElement 
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card']
        }}
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="text-red-600 text-sm">{errorMessage}</div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
          isProcessing || !stripe
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isProcessing ? 'Processing...' : `Pay IDR 485,000`}
      </button>

      {/* Security Badge */}
      <div className="text-center text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure payment powered by Stripe
        </span>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
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

    // Create payment intent
    createPaymentIntent();
  }, [router]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 48500000, // IDR 485,000 (Stripe needs x100)
          currency: 'idr',
        }),
      });

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent?: Record<string, unknown>) => {
    // Track conversion for Google Ads when QR code is about to be shown
    trackPurchaseSuccess(paymentIntent?.id as string);

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
              <span className="font-medium">IDR 485,000</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">includes service fees</span>
            </div>
            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>IDR 485,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded text-center">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Important Notice</h3>
          <p className="text-xs text-gray-600 mb-2">
            This is an independent service to assist with Indonesian customs declaration preparation. 
            For manual submission, please visit the{' '}
            <a 
              href="https://ecd.beacukai.go.id/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 underline"
            >
              Indonesian e-CD website
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
          language={language}
        />
      )}
    </div>
  );
}