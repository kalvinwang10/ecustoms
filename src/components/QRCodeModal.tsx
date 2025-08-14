'use client';

import { useEffect } from 'react';
import { Language, getTranslation } from '@/lib/translations';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionResult: {
    qrCode?: {
      imageData?: string;
    };
    submissionDetails?: {
      submissionId?: string;
      submissionTime?: string;
      status?: string;
      portInfo?: string;
      customsOffice?: string;
    };
  };
  language: Language;
}

export default function QRCodeModal({ isOpen, onClose, submissionResult, language }: QRCodeModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !submissionResult) return null;

  const handleDownload = () => {
    try {
      // Create download link for QR code
      const link = document.createElement('a');
      link.href = submissionResult.qrCode?.imageData || '';
      
      // Set proper filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const submissionId = submissionResult.submissionDetails?.submissionId || 'unknown';
      link.download = `customs-qr-${submissionId}-${timestamp}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download QR code. Please try again or take a screenshot.');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Indonesian Customs Declaration - ${submissionResult.submissionDetails?.submissionId}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
              }
              .qr-container { 
                margin: 20px 0; 
              }
              .details { 
                margin: 20px 0; 
                line-height: 1.6; 
              }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Indonesian Customs Declaration</h1>
            <div class="details">
              <p><strong>Registration Number:</strong> ${submissionResult.submissionDetails?.submissionId}</p>
              <p><strong>Submission Time:</strong> ${new Date(submissionResult.submissionDetails?.submissionTime || new Date()).toLocaleString()}</p>
              <p><strong>Status:</strong> ${submissionResult.submissionDetails?.status}</p>
            </div>
            <div class="qr-container">
              <img src="${submissionResult.qrCode?.imageData}" alt="QR Code" style="max-width: 300px;" />
            </div>
            <p><em>Please keep this QR code for your customs clearance at the airport.</em></p>
            <script>
              window.onload = function() { 
                window.print(); 
                window.onafterprint = function() { window.close(); }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-8 border w-full sm:w-11/12 max-w-md sm:max-w-3xl shadow-lg rounded-lg bg-white m-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-sm sm:text-base text-center mb-4 sm:mb-8 text-gray-800 pr-8">
          {getTranslation('qrModal.thankYou', language)}
        </h2>

        {/* Port and Registration Info */}
        <div className="text-center mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            {submissionResult.submissionDetails?.portInfo || 'Port Information'}
          </h3>
          <h4 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {submissionResult.submissionDetails?.submissionId || 'Registration Number'}
          </h4>
        </div>

        {/* QR Code */}
        <div className="text-center mb-4 sm:mb-6">
          {submissionResult.qrCode?.imageData ? (
            <img
              src={submissionResult.qrCode?.imageData}
              alt="Customs Declaration QR Code"
              className="mx-auto block"
              style={{ 
                maxWidth: '250px',
                maxHeight: '250px',
                width: 'auto',
                height: 'auto'
              }}
              onError={(e) => {
                console.error('QR code image failed to load');
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.innerHTML = '⚠️ QR code failed to load<br><small>Please take a screenshot or try again</small>';
                errorDiv.className = 'text-red-500 text-sm p-4';
                target.parentNode?.appendChild(errorDiv);
              }}
              onLoad={() => {
                console.log('QR code image loaded successfully');
              }}
            />
          ) : (
            <div className="text-red-500 text-sm p-4">
              ⚠️ QR code not available<br />
              <small>Please try again or contact support</small>
            </div>
          )}
        </div>

        {/* Customs Office */}
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-base sm:text-lg text-gray-700">
            {submissionResult.submissionDetails?.customsOffice || 'Customs Office'}
          </p>
        </div>

        {/* Download Button */}
        <div className="text-center mb-4 sm:mb-6">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
{getTranslation('qrModal.download', language)}
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center">
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
            {getTranslation('qrModal.instructions', language)}
          </p>
        </div>
      </div>
    </div>
  );
}