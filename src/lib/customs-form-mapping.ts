import { FormData } from '@/lib/formData';
import { FormSection, FieldMapping } from '@/types/customs-api';

// All Indonesia immigration form field mappings
export const indonesianFieldMappings = {
  // Passport/Country/Region (Nationality)
  nationality: {
    selector: '[id^="spi_nationality_"]',
    type: 'select' as const,
    action: 'select' as const,
    validation: { required: true }
  },
  
  // Full Name
  fullPassportName: {
    selector: '[id^="spi_full_name_"]',
    type: 'input' as const,
    action: 'type' as const,
    validation: { required: true }
  },
  
  // Date of Birth (single field)
  dateOfBirth: {
    selector: '[id^="spi_dob_"]',
    type: 'input' as const,
    action: 'type' as const,
    validation: { required: true }
  },
  
  // Country/Place of Birth
  countryOfBirth: {
    selector: '[id^="spi_country_or_place_of_birth_"]',
    type: 'select' as const,
    action: 'select' as const,
    validation: { required: true }
  },
  
  // Gender (radio button group)
  gender: {
    selector: '[id^="spi_gender_"]',
    type: 'radio' as const,
    action: 'select' as const,
    validation: { required: true }
  },
  
  // Passport Number
  passportNumber: {
    selector: '[id^="spi_passport_no_"]',
    type: 'input' as const,
    action: 'type' as const,
    validation: { required: true }
  },
  
  // Date of Passport Expiry
  passportExpiryDate: {
    selector: '[id^="spi_date_of_passport_expiry_"]',
    type: 'input' as const,
    action: 'type' as const,
    validation: { required: true }
  },
  
  // Mobile Number
  mobileNumber: {
    selector: '[id^="spi_mobile_no_"]',
    type: 'input' as const,
    action: 'type' as const,
    validation: { required: true }
  },
  
  // Email
  email: {
    selector: '[id^="spi_email_"]',
    type: 'input' as const,
    action: 'type' as const,
    validation: { required: true }
  }
};

// Convert our form data to All Indonesia format
export function mapFormDataToIndonesianForm(formData: FormData): Record<string, unknown> {
  return {
    nationality: formData.nationality,
    fullName: formData.fullPassportName,
    dateOfBirth: formatDateForAllIndonesia(formData.dateOfBirth),
    countryOfBirth: formData.countryOfBirth,
    gender: formData.gender,
    passportNumber: formData.passportNumber,
    passportExpiryDate: formatDateForAllIndonesia(formData.passportExpiryDate),
    mobileNumber: formData.mobileNumber,
    email: formData.email
  };
}

// Helper functions for data transformation
function formatDateForAllIndonesia(dateStr: string): string {
  // Convert from YYYY-MM-DD to DD/MM/YYYY format for All Indonesia form
  if (dateStr.includes('/')) {
    // Already in DD/MM/YYYY format
    return dateStr;
  }
  
  // Convert from YYYY-MM-DD to DD/MM/YYYY
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

// Navigation helpers for All Indonesia site
export const navigationSelectors = {
  // Foreign Visitor button
  foreignVisitorButton: 'div[onclick*="services"] .services-content',
  
  // Form container
  formContainer: 'form, .form-container',
  
  // Submit/Next buttons
  submitButton: 'button[type="submit"], input[type="submit"]',
  nextButton: 'button:contains("Next"), button:contains("Lanjut")',
  
  // Success indicators
  successPage: '.success, .berhasil, .submission-success',
  
  // Error indicators  
  errorMessage: '.error, .alert-danger',
  validationError: '.has-error, .is-invalid'
};

export default {
  indonesianFieldMappings,
  mapFormDataToIndonesianForm,
  navigationSelectors
};