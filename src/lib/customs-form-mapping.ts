import { FormData } from '@/lib/formData';
import { FormSection, FieldMapping } from '@/types/customs-api';

// Indonesian customs form field mappings
export const indonesianFieldMappings = {
  // Passport number
  passportNumber: {
    selector: '#paspor',
    type: 'input' as const,
    action: 'type' as const,
    validation: { required: true }
  },
  
  // Port/Location of Arrival
  portOfArrival: {
    selector: '#lokasiKedatangan',
    type: 'select' as const,
    action: 'select' as const,
    waitFor: '.ant-select-dropdown',
    validation: { required: true }
  },
  
  // Arrival Date
  arrivalDate: {
    selector: '#tanggalKedatangan',
    type: 'select' as const,
    action: 'select' as const,
    waitFor: '.ant-select-dropdown',
    validation: { required: true }
  },
  
  // Full Name
  fullPassportName: {
    selector: '#nama',
    type: 'input' as const,
    action: 'type' as const,
    validation: { required: true }
  },
  
  // Date of Birth - Day
  dateOfBirthDay: {
    selector: '#tanggalLahirTgl',
    type: 'select' as const,
    action: 'select' as const,
    waitFor: '.ant-select-dropdown',
    validation: { required: true }
  },
  
  // Date of Birth - Month
  dateOfBirthMonth: {
    selector: '#tanggalLahirBln',
    type: 'select' as const,
    action: 'select' as const,
    waitFor: '.ant-select-dropdown',
    validation: { required: true }
  },
  
  // Date of Birth - Year
  dateOfBirthYear: {
    selector: '#tanggalLahirThn',
    type: 'select' as const,
    action: 'select' as const,
    waitFor: '.ant-select-dropdown',
    validation: { required: true }
  },
  
  // Flight/Vessel Number
  flightVesselNumber: {
    selector: '#nomorPengangkut',
    type: 'input' as const,
    action: 'type' as const,
    validation: { required: true }
  },
  
  // Country Code (Nationality)
  nationality: {
    selector: '#kodeNegara',
    type: 'select' as const,
    action: 'select' as const,
    waitFor: '.ant-select-dropdown',
    validation: { required: true }
  },
  
  // Number of Luggage
  numberOfLuggage: {
    selector: '#bagasiDibawa',
    type: 'input' as const,
    action: 'type' as const,
    validation: { required: true }
  },
  
  // Accept/Consent checkbox
  consentAccurate: {
    selector: '#accept',
    type: 'checkbox' as const,
    action: 'check' as const,
    validation: { required: true }
  }
};

// Convert our form data to Indonesian format
export function mapFormDataToIndonesianForm(formData: FormData): Record<string, unknown> {
  // Parse date of birth from YYYY-MM-DD format
  const [birthYear, birthMonth, birthDay] = formData.dateOfBirth.split('-');
  
  return {
    paspor: formData.passportNumber,
    lokasiKedatangan: mapPortOfArrival(formData.portOfArrival),
    tanggalKedatangan: formatArrivalDate(formData.arrivalDate),
    nama: formData.fullPassportName.toUpperCase(),
    tanggalLahirTgl: birthDay,
    tanggalLahirBln: birthMonth,
    tanggalLahirThn: birthYear,
    nomorPengangkut: formData.flightVesselNumber,
    kodeNegara: mapNationalityCode(formData.nationality),
    bagasiDibawa: formData.numberOfLuggage,
    accept: formData.consentAccurate
  };
}

// Helper functions for data transformation
function mapPortOfArrival(portCode: string): string {
  const portMap: Record<string, string> = {
    'CGK': 'Soekarno-Hatta International Airport (CGK)',
    'DPS': 'Ngurah Rai International Airport (DPS)', 
    'JOG': 'Yogyakarta International Airport (YIA)',
    'MLG': 'Abdul Rachman Saleh Airport (MLG)',
    'SOC': 'Adisumarmo International Airport (SOC)',
    'BDO': 'Husein Sastranegara International Airport (BDO)',
    'PKU': 'Sultan Syarif Kasim II International Airport (PKU)',
    'BPN': 'Sultan Aji Muhammad Sulaiman Airport (BPN)',
    'MDC': 'Sam Ratulangi International Airport (MDC)',
    'UPG': 'Sultan Hasanuddin International Airport (UPG)'
  };
  
  return portMap[portCode] || portCode;
}

function formatArrivalDate(dateStr: string): string {
  // Convert from YYYY-MM-DD to Indonesian format if needed
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  return `${day}/${month}/${year}`;
}

function mapNationalityCode(nationalityCode: string): string {
  // Map our nationality codes to Indonesian system codes
  const nationalityMap: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom', 
    'AU': 'Australia',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'PH': 'Philippines',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'IN': 'India',
    'DE': 'Germany',
    'FR': 'France',
    'NL': 'Netherlands',
    'CA': 'Canada',
    'NZ': 'New Zealand'
  };
  
  return nationalityMap[nationalityCode] || nationalityCode;
}

// Form navigation flow - updated based on analysis
export const formNavigation = {
  // Step 1: Initial entry - click Next to access form
  entryPoint: {
    action: 'click_next_to_enter_form',
    buttonSelector: 'button:contains("Next"), button:contains("Lanjut")',
    waitAfter: 2000
  },
  
  // Step 2: All form fields are now accessible on single page
  mainForm: {
    name: 'customs_declaration',
    fields: [
      { 
        selector: '#paspor', 
        value: '', 
        type: 'input', 
        action: 'type',
        validation: { required: true }
      },
      { 
        selector: '#lokasiKedatangan', 
        value: '', 
        type: 'select', 
        action: 'select',
        waitFor: '.ant-select-dropdown',
        validation: { required: true }
      },
      { 
        selector: '#tanggalKedatangan', 
        value: '', 
        type: 'select', 
        action: 'select',
        waitFor: '.ant-select-dropdown',
        validation: { required: true }
      },
      { 
        selector: '#nama', 
        value: '', 
        type: 'input', 
        action: 'type',
        validation: { required: true }
      },
      { 
        selector: '#tanggalLahirTgl', 
        value: '', 
        type: 'select', 
        action: 'select',
        waitFor: '.ant-select-dropdown',
        validation: { required: true }
      },
      { 
        selector: '#tanggalLahirBln', 
        value: '', 
        type: 'select', 
        action: 'select',
        waitFor: '.ant-select-dropdown',
        validation: { required: true }
      },
      { 
        selector: '#tanggalLahirThn', 
        value: '', 
        type: 'select', 
        action: 'select',
        waitFor: '.ant-select-dropdown',
        validation: { required: true }
      },
      { 
        selector: '#nomorPengangkut', 
        value: '', 
        type: 'input', 
        action: 'type',
        validation: { required: true }
      },
      { 
        selector: '#kodeNegara', 
        value: '', 
        type: 'select', 
        action: 'select',
        waitFor: '.ant-select-dropdown',
        validation: { required: true }
      },
      { 
        selector: '#bagasiDibawa', 
        value: '', 
        type: 'input', 
        action: 'type',
        validation: { required: true }
      },
      { 
        selector: '#accept', 
        value: '', 
        type: 'checkbox', 
        action: 'check',
        validation: { required: true }
      }
    ],
    navigation: {
      submitButton: 'button[type="submit"], .ant-btn-primary, button:contains("Submit"), button:contains("Kirim")',
      waitForLoad: '.ant-form, #paspor'
    }
  }
};

// Legacy form sections for backward compatibility
export const formSections: FormSection[] = [
  {
    name: 'customs_declaration',
    fields: formNavigation.mainForm.fields,
    navigation: formNavigation.mainForm.navigation
  }
];

// Navigation helpers
export const navigationSelectors = {
  // Form container
  formContainer: '.ant-form',
  
  // Loading indicators
  loadingSpinner: '.ant-spin',
  
  // Submit/Next buttons
  submitButton: 'button[type="submit"]',
  nextButton: '.ant-btn-primary',
  continueButton: 'button:contains("Lanjut")',
  
  // Success indicators
  successPage: '.success, .berhasil',
  qrCodeContainer: '.qr-code, [class*="qr"], img[src*="qr"]',
  
  // Error indicators  
  errorMessage: '.ant-message-error, .error',
  validationError: '.ant-form-item-has-error'
};

export default {
  indonesianFieldMappings,
  mapFormDataToIndonesianForm,
  formNavigation,
  formSections,
  navigationSelectors
};