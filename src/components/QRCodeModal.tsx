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
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="text-lg font-semibold text-green-600">
            🎉 Submission Successful!
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="pt-4">
          {/* Success Message */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              Your customs declaration has been submitted successfully!
            </h4>
            <p className="text-gray-600">
              Please save your QR code and registration number for customs clearance at the airport.
            </p>
          </div>

          {/* Registration Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-gray-900 mb-3">Submission Details</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Registration Number:</span>
                <span className="font-semibold text-gray-900">{submissionResult.submissionDetails?.submissionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submission Time:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(submissionResult.submissionDetails?.submissionTime || new Date()).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {submissionResult.submissionDetails?.status}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="text-center mb-6">
            <h5 className="font-semibold text-gray-900 mb-3">Your QR Code</h5>
            <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              {submissionResult.qrCode?.imageData ? (
                <img
                  src={submissionResult.qrCode?.imageData}
                  alt="Customs Declaration QR Code"
                  className="mx-auto max-w-64 max-h-64"
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
            <p className="text-sm text-gray-500 mt-2">
              Show this QR code to customs officials at the airport
            </p>
          </div>

          {/* Important Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-blue-900 mb-2">📋 Important Instructions</h5>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Save or print this QR code before closing this window</li>
              <li>Present this QR code to customs officials upon arrival in Indonesia</li>
              <li>Keep your registration number: <strong>{submissionResult.submissionDetails?.submissionId}</strong></li>
              <li>Ensure your passport and other documents are ready for inspection</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download QR Code
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}