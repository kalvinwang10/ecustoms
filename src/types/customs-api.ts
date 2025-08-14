import { FormData } from '@/lib/formData';

// Request interfaces
export interface SubmitCustomsRequest {
  formData: FormData;
  options?: {
    headless?: boolean;
    timeout?: number;
    retries?: number;
  };
}

// Response interfaces
export interface SubmitCustomsSuccess {
  success: true;
  qrCode: {
    imageData: string; // Base64 encoded image
    format: 'png' | 'jpg' | 'jpeg';
    size: {
      width: number;
      height: number;
    };
  };
  submissionDetails: {
    submissionId?: string;
    submissionTime: string;
    status: string;
    referenceNumber?: string;
  };
  message: string;
}

export interface SubmitCustomsError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    step?: 'validation' | 'navigation' | 'form_fill' | 'submission' | 'qr_extraction';
  };
  fallbackUrl?: string; // URL for manual completion
}

export type SubmitCustomsResponse = SubmitCustomsSuccess | SubmitCustomsError;

// Internal automation interfaces
export interface AutomationStep {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message?: string;
  timestamp: number;
}

export interface AutomationProgress {
  steps: AutomationStep[];
  currentStep: string;
  overallStatus: 'initializing' | 'running' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
}

// Form field mapping interfaces
export interface FieldMapping {
  selector: string;
  value: unknown;
  type: 'input' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date';
  waitFor?: string; // Additional selector to wait for before interacting
  action?: 'click' | 'type' | 'select' | 'check' | 'clear';
  validation?: {
    required: boolean;
    pattern?: string;
    maxLength?: number;
  };
}

export interface FormSection {
  name: string;
  url?: string; // If section has its own URL/page
  fields: FieldMapping[];
  navigation?: {
    nextButton?: string; // Selector for next/continue button
    waitForLoad?: string; // Selector to wait for after navigation
  };
}