export interface FormData {
  // Wizard state
  currentStep: number;
  
  // Page 1: Declaration & Disclaimer
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
  
  // Page 2: Arrival Information & Passenger Information (Data Perjalanan)
  passportNumber: string;
  portOfArrival: string;
  arrivalDate: string;
  fullPassportName: string;
  dateOfBirth: string; // Birth year
  flightVesselNumber: string; // Nomor Penerbangan/Pelayaran/Kendaraan
  nationality: string; // Negara/Wilayah Paspor
  addressInIndonesia: string; // Alamat di Indonesia (textarea)
  numberOfLuggage: string;
  familyMembers: Array<{
    id: string;
    passportNumber: string;
    name: string;
    nationality: string;
  }>;
  
  // Page 3: Customs Declaration (Official Indonesian Form)
  hasGoodsToDeclarate: boolean | null; // Main goods declaration Yes/No
  declaredGoods: Array<{
    id: string;
    description: string;    // Uraian Barang
    quantity: string;       // Jumlah
    value: string;         // Nilai
    currency: string;      // Jenis Mata Uang
  }>;
  hasTechnologyDevices: boolean | null; // Technology devices checkbox
  consentAccurate: boolean;             // Final consent checkbox
}

export const initialFormData: FormData = {
  // Wizard state
  currentStep: 1,
  
  // Page 1: Declaration & Disclaimer
  acceptedTerms: false,
  acceptedPrivacyPolicy: false,
  
  // Page 2: Arrival Information & Passenger Information (Data Perjalanan)
  passportNumber: '',
  portOfArrival: '',
  arrivalDate: '',
  fullPassportName: '',
  dateOfBirth: '', // Birth year
  flightVesselNumber: '', // Nomor Penerbangan/Pelayaran/Kendaraan
  nationality: '', // Negara/Wilayah Paspor
  addressInIndonesia: '', // Alamat di Indonesia (textarea)
  numberOfLuggage: '',
  familyMembers: [],
  
  // Page 3: Customs Declaration (Official Indonesian Form)
  hasGoodsToDeclarate: null as any,
  declaredGoods: [],
  hasTechnologyDevices: null as any,
  consentAccurate: false,
};