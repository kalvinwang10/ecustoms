export interface FormData {
  // Wizard state
  currentStep: number;
  
  // Step 1: Citizenship Type Selection
  citizenshipType: 'indonesian' | 'foreign' | null;
  
  // Step 2: Personal Information
  passportNumber: string;
  fullPassportName: string;
  nationality: string; // Passport/Country/Region
  dateOfBirth: string; // DD/MM/YYYY format
  countryOfBirth: string; // Country/Place of Birth
  gender: 'male' | 'female' | null;
  passportExpiryDate: string; // DD/MM/YYYY format
  mobileNumber: string;
  email: string;
  
  // Step 3: Travel Details
  arrivalDate: string; // Arrival Date to Indonesia
  departureDate: string; // Departure Date from Indonesia
  hasVisaOrKitas: boolean | null; // Do you already have a Visa or KITAS/KITAP?
  visaOrKitasNumber: string; // Visa or KITAS/KITAP Number
  
  // Step 4: Mode of Transportation and Address
  modeOfTransport: string; // Mode of Transport (AIR/SEA)
  purposeOfTravel: string; // Purpose of Travel
  residenceType: string; // Residence Type
  addressInIndonesia: string; // Address where staying in Indonesia
  // Conditional Air Transport fields
  placeOfArrival: string; // Place of Arrival (if AIR or SEA selected)
  typeOfAirTransport: string; // Type of Air Transport (if AIR selected)
  flightName: string; // Flight Name (if AIR selected)
  flightNumber: string; // Flight Number (if AIR selected)
  // Conditional Sea Transport fields
  typeOfVessel: string; // Type of Vessel (if SEA selected)
  vesselName: string; // Vessel Name (if SEA selected)
  
  // Step 5: Declaration
  familyMembers: Array<{
    id: string;
    passportNumber: string;
    fullPassportName: string;
    nationality: string;
    dateOfBirth: string;
    countryOfBirth: string;
    gender: 'male' | 'female' | null;
    passportExpiryDate: string;
    mobileNumber: string;
    email: string;
    // Visa information for each family member
    hasVisaOrKitas: boolean | null;
    visaOrKitasNumber: string;
  }>;
  
  // Health Declaration
  hasSymptoms: boolean | null; // Fever, cough, runny nose, shortness of breath, sore throat, skin lesions/rashes
  selectedSymptoms: string[]; // Selected symptoms when hasSymptoms is true
  countriesVisited: string[]; // Countries of origin/transit within 21 days
  
  // Quarantine Declaration  
  hasQuarantineItems: boolean | null; // Animals, fish, plants, and/or their processed products
  
  // Customs Declaration
  hasGoodsToDeclarate: boolean | null; // Main goods declaration Yes/No
  declaredGoods: Array<{
    id: string;
    description: string;    // Uraian Barang
    quantity: string;       // Jumlah
    value: string;         // Nilai
    currency: string;      // Jenis Mata Uang
  }>;
  
  // Additional Information
  hasTechnologyDevices: boolean | null; // Mobile phones, handheld computers, tablets
  baggageCount: string; // Number of baggage arriving
  consentAccurate: boolean;             // Final consent checkbox
}

export const initialFormData: FormData = {
  // Wizard state
  currentStep: 1,
  
  // Step 1: Citizenship Type Selection
  citizenshipType: null,
  
  // Step 2: Personal Information
  passportNumber: '',
  fullPassportName: '',
  nationality: '', // Passport/Country/Region
  dateOfBirth: '', // DD/MM/YYYY format
  countryOfBirth: '', // Country/Place of Birth
  gender: null,
  passportExpiryDate: '', // DD/MM/YYYY format
  mobileNumber: '',
  email: '',
  
  // Step 3: Travel Details
  arrivalDate: '', // Arrival Date to Indonesia
  departureDate: '', // Departure Date from Indonesia
  hasVisaOrKitas: null, // Do you already have a Visa or KITAS/KITAP?
  visaOrKitasNumber: '', // Visa or KITAS/KITAP Number
  
  // Step 4: Mode of Transportation and Address
  modeOfTransport: '', // Mode of Transport (AIR/SEA)
  purposeOfTravel: '', // Purpose of Travel
  residenceType: '', // Residence Type
  addressInIndonesia: '', // Address where staying in Indonesia
  // Conditional Air Transport fields
  placeOfArrival: '', // Place of Arrival (if AIR or SEA selected)
  typeOfAirTransport: '', // Type of Air Transport (if AIR selected)
  flightName: '', // Flight Name (if AIR selected)
  flightNumber: '', // Flight Number (if AIR selected)
  // Conditional Sea Transport fields
  typeOfVessel: '', // Type of Vessel (if SEA selected)
  vesselName: '', // Vessel Name (if SEA selected)
  
  // Step 5: Declaration
  familyMembers: [],
  
  // Health Declaration
  hasSymptoms: null,
  selectedSymptoms: [],
  countriesVisited: [],
  
  // Quarantine Declaration
  hasQuarantineItems: null,
  
  // Customs Declaration
  hasGoodsToDeclarate: null,
  declaredGoods: [],
  
  // Additional Information
  hasTechnologyDevices: null,
  baggageCount: '',
  consentAccurate: false,
};