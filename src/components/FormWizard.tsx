'use client';

import { ReactNode } from 'react';
import { Language } from '@/lib/translations';

interface Step {
  id: string;
  title: string;
  completed: boolean;
}

interface FormWizardProps {
  currentStep: number;
  steps: Step[];
  children: ReactNode;
  language: Language;
}

export default function FormWizard({ currentStep, steps, children, language }: FormWizardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <nav aria-label="Progress" className="flex items-center justify-center overflow-x-auto">
              <ol className="flex items-center space-x-4 sm:space-x-8 min-w-max">
                {steps.map((step, index) => (
                  <li key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                          index < currentStep
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : index === currentStep
                            ? 'border-blue-600 text-blue-600 bg-white'
                            : 'border-gray-300 text-gray-400 bg-white'
                        }`}
                      >
                        {index < currentStep ? (
                          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-xs sm:text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="mt-1 sm:mt-2 text-center">
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`ml-4 sm:ml-8 w-8 sm:w-16 h-0.5 ${
                          index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </div>
    </div>
  );
}