'use client';

import { useEffect } from 'react';
import { Language, getTranslation } from '@/lib/translations';
import { FormData } from '@/lib/formData';

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
  formData?: FormData;
  language: Language;
}

export default function QRCodeModal({ isOpen, onClose, submissionResult, formData, language }: QRCodeModalProps) {
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

  // Helper function to determine submission type
  const getSubmissionType = () => {
    if (!formData) return 'Individual'; // Default fallback
    return formData.familyMembers && formData.familyMembers.length > 0 ? 'Family' : 'Individual';
  };

  // Helper function to format date
  const formatArrivalDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      let day, month, year;
      
      // Check if date is in ISO format (YYYY-MM-DD)
      if (dateString.includes('-')) {
        [year, month, day] = dateString.split('-');
      }
      // Check if date is in DD/MM/YYYY format
      else if (dateString.includes('/')) {
        [day, month, year] = dateString.split('/');
      }
      else {
        return dateString; // Return as-is if format unknown
      }
      
      const months = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
      ];
      
      // Ensure day has no leading zero
      const dayNum = parseInt(day);
      const monthName = months[parseInt(month) - 1];
      
      if (!monthName) {
        return dateString; // Return original if month is invalid
      }
      
      return `${dayNum} ${monthName} ${year}`;
    } catch {
      return dateString;
    }
  };

  const handleDownload = async () => {
    try {
      const svgDataUrl = submissionResult.qrCode?.imageData || '';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const submissionId = submissionResult.submissionDetails?.submissionId || 'unknown';
      
      // Convert SVG to PNG using canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      // Set canvas size for high quality output
      canvas.width = 512;
      canvas.height = 512;
      
      // Fill with white background (QR codes need white background)
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Load SVG and convert to PNG
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            // Draw the SVG image onto canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to PNG blob
            canvas.toBlob((blob) => {
              if (blob) {
                // Create download link with PNG blob
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `customs-qr-${submissionId}-${timestamp}.png`;
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up blob URL
                URL.revokeObjectURL(url);
                resolve();
              } else {
                reject(new Error('Failed to create PNG blob'));
              }
            }, 'image/png', 0.95); // High quality PNG
            
          } catch (drawError) {
            reject(drawError);
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load SVG image'));
        };
        
        // Load the SVG data URL
        img.src = svgDataUrl;
      });
      
    } catch (error) {
      console.error('PNG conversion failed:', error);
      
      // Fallback: try original method but with .svg extension
      try {
        const link = document.createElement('a');
        link.href = submissionResult.qrCode?.imageData || '';
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const submissionId = submissionResult.submissionDetails?.submissionId || 'unknown';
        link.download = `customs-qr-${submissionId}-${timestamp}.svg`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('Downloaded as SVG format. PNG conversion failed - please convert manually if needed.');
      } catch (fallbackError) {
        console.error('Fallback download failed:', fallbackError);
        alert('Failed to download QR code. Please try again or take a screenshot.');
      }
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
      <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-8 border w-full sm:w-11/12 max-w-md sm:max-w-2xl shadow-lg rounded-lg bg-white m-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Individual/Family Badge */}
        <div className="text-center mb-6">
          <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
            {getSubmissionType()}
          </span>
        </div>

        {/* User Name Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {formData?.fullPassportName || 'PASSENGER NAME'}
          </h1>
        </div>

        {/* Passport Number */}
        <div className="text-center mb-4">
          <p className="text-gray-600 text-sm">Passport Number:</p>
          <p className="text-lg font-semibold text-gray-900">
            {formData?.passportNumber || submissionResult.submissionDetails?.submissionId || 'N/A'}
          </p>
        </div>

        {/* Date of Arrival */}
        <div className="text-center mb-4">
          <p className="text-gray-600 text-sm">Date of Arrival:</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatArrivalDate(formData?.arrivalDate) || 'Date Not Available'}
          </p>
        </div>

        {/* Country */}
        <div className="text-center mb-6">
          <p className="text-xl font-bold text-gray-900">INDONESIA</p>
        </div>

        {/* QR Code */}
        <div className="text-center mb-6">
          {submissionResult.qrCode?.imageData ? (
            <img
              src={submissionResult.qrCode?.imageData}
              alt="Customs Declaration QR Code"
              className="mx-auto block"
              style={{ 
                maxWidth: '200px',
                maxHeight: '200px',
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

        {/* Arrival Card Number */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-sm">Arrival Card Number</p>
          <p className="text-xl font-bold text-gray-900">
            {submissionResult.submissionDetails?.submissionId || '25102000188896'}
          </p>
        </div>

        {/* Download Button */}
        <div className="text-center mb-4">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {getTranslation('qrModal.download', language)}
          </button>
        </div>

        {/* Submitted Status */}
        <div className="text-center">
          <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            Submitted
          </span>
        </div>
      </div>
    </div>
  );
}