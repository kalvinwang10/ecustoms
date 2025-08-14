'use client';

import { useEffect } from 'react';
import { Language, getTranslation } from '@/lib/translations';

interface ProcessingModalProps {
  isOpen: boolean;
  language: Language;
}

export default function ProcessingModal({ isOpen, language }: ProcessingModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative flex items-center justify-center min-h-full p-4">
        <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-auto">
          {/* Processing Content */}
          <div className="text-center">
            {/* Large Spinner */}
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
            
            {/* Main Message */}
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {getTranslation('processingTitle', language)}
            </h3>
            
            {/* Subtitle */}
            <p className="text-gray-600 mb-4">
              {getTranslation('processingMessage', language)}
            </p>
            
            {/* Additional Info */}
            <p className="text-sm text-gray-500">
              {getTranslation('processingWait', language)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}