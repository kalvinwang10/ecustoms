'use client';

import { forwardRef } from 'react';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, description, error, required, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div className="flex items-start space-x-3">
          <input
            ref={ref}
            type="checkbox"
            className={`mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
              error ? 'border-red-500' : ''
            } ${className}`}
            {...props}
          />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 cursor-pointer">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
        {error && <p className="text-sm text-red-600 ml-7">{error}</p>}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox;