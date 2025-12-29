import { logger } from './logger';
import { FormData } from './formData';

interface AirtableRecord {
  fields: Record<string, any>;
}

interface AirtableCreateResponse {
  records: Array<{
    id: string;
    fields: Record<string, any>;
    createdTime: string;
  }>;
}

interface TravellerData {
  // Submission Info
  submissionId: string;
  paymentId: string;
  submissionTimestamp: string;
  documentType: string;
  
  
  // Personal Information
  passportNumber: string;
  fullPassportName: string;
  nationality: string;
  dateOfBirth: string;
  countryOfBirth: string;
  gender: string;
  passportExpiryDate: string;
  mobileNumber: string;
  email: string;
  citizenshipType: string;
  
  // Travel Details
  arrivalDate: string;
  departureDate: string;
  hasVisaOrKitas: boolean;
  visaOrKitasNumber: string;
  province: string;
  
  // Transportation
  modeOfTransport: string;
  purposeOfTravel: string;
  placeOfArrival: string;
  typeOfAirTransport?: string;
  flightName?: string;
  flightNumber?: string;
  typeOfVessel?: string;
  vesselName?: string;
  
  // Address
  residenceType: string;
  addressInIndonesia: string;
  
  // Health Declaration (only for primary traveller)
  hasSymptoms?: boolean;
  selectedSymptoms?: string;
  countriesVisited?: string;
  
  // Customs Declaration (only for primary traveller)
  hasQuarantineItems?: boolean;
  hasGoodsToDeclarate?: boolean;
  declaredGoodsJson?: string;
  hasTechnologyDevices?: boolean;
  baggageCount?: string;
  
  // Family Members (JSON string)
  familyMembersJson?: string;
}

class AirtableIntegration {
  private apiToken: string | undefined;
  private baseId: string | undefined;
  private tableName: string | undefined;
  private tableId: string | undefined;
  private viewId: string | undefined;

  constructor() {
    this.apiToken = process.env.AIRTABLE_API_TOKEN;
    this.baseId = process.env.AIRTABLE_BASE_ID;
    this.tableName = process.env.AIRTABLE_TABLE_NAME || 'Travellers';
    this.tableId = process.env.AIRTABLE_TABLE_ID;
    this.viewId = process.env.AIRTABLE_VIEW_ID;
  }

  private formatDateToDDMMYYYY(dateStr: string): string {
    if (!dateStr) return '';
    
    // If already in DD/MM/YYYY format, return as is
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateStr;
    }
    
    // Convert from YYYY-MM-DD to DD/MM/YYYY
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Convert from MM/DD/YYYY to DD/MM/YYYY (if needed)
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [month, day, year] = dateStr.split('/');
      // Check if it might already be DD/MM/YYYY
      if (parseInt(month) > 12) {
        // Already DD/MM/YYYY
        return dateStr;
      }
      return `${day}/${month}/${year}`;
    }
    
    // Return original if format unknown
    return dateStr;
  }

  private booleanToYesNo(value: boolean | null | undefined): string {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return 'No'; // Default to 'No' for null/undefined
  }

  private getProvinceFromAirport(placeOfArrival: string): string {
    // Normalize the airport name for matching
    const airport = placeOfArrival.toUpperCase();
    
    // Major Indonesian airports to province mapping
    const airportToProvince: Record<string, string> = {
      // DKI JAKARTA
      'SOEKARNO-HATTA': 'DKI JAKARTA',
      'SOEKARNO HATTA': 'DKI JAKARTA',
      'CGK': 'DKI JAKARTA',
      'HALIM PERDANAKUSUMA': 'DKI JAKARTA',
      'HALIM': 'DKI JAKARTA',
      'HLP': 'DKI JAKARTA',
      
      // BALI
      'NGURAH RAI': 'BALI',
      'DENPASAR': 'BALI',
      'DPS': 'BALI',
      
      // JAWA TIMUR
      'JUANDA': 'JAWA TIMUR',
      'SURABAYA': 'JAWA TIMUR',
      'SUB': 'JAWA TIMUR',
      
      // JAWA TENGAH
      'ADI SUTJIPTO': 'DAERAH ISTIMEWA YOGYAKARTA',
      'ADISUCIPTO': 'DAERAH ISTIMEWA YOGYAKARTA',
      'YOGYAKARTA': 'DAERAH ISTIMEWA YOGYAKARTA',
      'JOGJA': 'DAERAH ISTIMEWA YOGYAKARTA',
      'JOG': 'DAERAH ISTIMEWA YOGYAKARTA',
      'YIA': 'DAERAH ISTIMEWA YOGYAKARTA',
      'AHMAD YANI': 'JAWA TENGAH',
      'SEMARANG': 'JAWA TENGAH',
      'SRG': 'JAWA TENGAH',
      'ADI SOEMARMO': 'JAWA TENGAH',
      'SOLO': 'JAWA TENGAH',
      'SOC': 'JAWA TENGAH',
      
      // JAWA BARAT
      'HUSEIN SASTRANEGARA': 'JAWA BARAT',
      'BANDUNG': 'JAWA BARAT',
      'BDO': 'JAWA BARAT',
      'KERTAJATI': 'JAWA BARAT',
      'KJT': 'JAWA BARAT',
      
      // SUMATERA UTARA
      'KUALANAMU': 'SUMATERA UTARA',
      'MEDAN': 'SUMATERA UTARA',
      'KNO': 'SUMATERA UTARA',
      'POLONIA': 'SUMATERA UTARA',
      
      // SUMATERA SELATAN
      'SULTAN MAHMUD BADARUDDIN': 'SUMATERA SELATAN',
      'PALEMBANG': 'SUMATERA SELATAN',
      'PLM': 'SUMATERA SELATAN',
      
      // SUMATERA BARAT
      'MINANGKABAU': 'SUMATERA BARAT',
      'PADANG': 'SUMATERA BARAT',
      'PDG': 'SUMATERA BARAT',
      
      // RIAU
      'SULTAN SYARIF KASIM': 'RIAU',
      'PEKANBARU': 'RIAU',
      'PKU': 'RIAU',
      
      // KEPULAUAN RIAU
      'HANG NADIM': 'KEPULAUAN RIAU',
      'BATAM': 'KEPULAUAN RIAU',
      'BTH': 'KEPULAUAN RIAU',
      'RAJA HAJI FISABILILLAH': 'KEPULAUAN RIAU',
      'TANJUNG PINANG': 'KEPULAUAN RIAU',
      'TNJ': 'KEPULAUAN RIAU',
      
      // ACEH
      'SULTAN ISKANDAR MUDA': 'ACEH',
      'BANDA ACEH': 'ACEH',
      'BTJ': 'ACEH',
      
      // LAMPUNG
      'RADIN INTEN': 'LAMPUNG',
      'BANDAR LAMPUNG': 'LAMPUNG',
      'TKG': 'LAMPUNG',
      
      // BANTEN
      'SOEKARNO-HATTA INTERNATIONAL': 'BANTEN',
      'TANGERANG': 'BANTEN',
      
      // SULAWESI SELATAN
      'SULTAN HASANUDDIN': 'SULAWESI SELATAN',
      'MAKASSAR': 'SULAWESI SELATAN',
      'UPG': 'SULAWESI SELATAN',
      
      // SULAWESI UTARA
      'SAM RATULANGI': 'SULAWESI UTARA',
      'MANADO': 'SULAWESI UTARA',
      'MDC': 'SULAWESI UTARA',
      
      // SULAWESI TENGAH
      'MUTIARA SIS AL JUFRI': 'SULAWESI TENGAH',
      'PALU': 'SULAWESI TENGAH',
      'PLW': 'SULAWESI TENGAH',
      
      // SULAWESI TENGGARA
      'HALUOLEO': 'SULAWESI TENGGARA',
      'KENDARI': 'SULAWESI TENGGARA',
      'KDI': 'SULAWESI TENGGARA',
      
      // KALIMANTAN TIMUR
      'SEPINGGAN': 'KALIMANTAN TIMUR',
      'BALIKPAPAN': 'KALIMANTAN TIMUR',
      'BPN': 'KALIMANTAN TIMUR',
      'APT PRANOTO': 'KALIMANTAN TIMUR',
      'SAMARINDA': 'KALIMANTAN TIMUR',
      'SRI': 'KALIMANTAN TIMUR',
      
      // KALIMANTAN SELATAN
      'SYAMSUDIN NOOR': 'KALIMANTAN SELATAN',
      'BANJARMASIN': 'KALIMANTAN SELATAN',
      'BDJ': 'KALIMANTAN SELATAN',
      
      // KALIMANTAN BARAT
      'SUPADIO': 'KALIMANTAN BARAT',
      'PONTIANAK': 'KALIMANTAN BARAT',
      'PNK': 'KALIMANTAN BARAT',
      
      // KALIMANTAN TENGAH
      'TJILIK RIWUT': 'KALIMANTAN TENGAH',
      'PALANGKARAYA': 'KALIMANTAN TENGAH',
      'PKY': 'KALIMANTAN TENGAH',
      
      // KALIMANTAN UTARA
      'JUWATA': 'KALIMANTAN UTARA',
      'TARAKAN': 'KALIMANTAN UTARA',
      'TRK': 'KALIMANTAN UTARA',
      
      // NUSA TENGGARA BARAT
      'LOMBOK': 'NUSA TENGGARA BARAT',
      'PRAYA': 'NUSA TENGGARA BARAT',
      'LOP': 'NUSA TENGGARA BARAT',
      'SELAPARANG': 'NUSA TENGGARA BARAT',
      'MATARAM': 'NUSA TENGGARA BARAT',
      'AMI': 'NUSA TENGGARA BARAT',
      
      // NUSA TENGGARA TIMUR
      'EL TARI': 'NUSA TENGGARA TIMUR',
      'KUPANG': 'NUSA TENGGARA TIMUR',
      'KOE': 'NUSA TENGGARA TIMUR',
      'KOMODO': 'NUSA TENGGARA TIMUR',
      'LABUAN BAJO': 'NUSA TENGGARA TIMUR',
      'LBJ': 'NUSA TENGGARA TIMUR',
      
      // MALUKU
      'PATTIMURA': 'MALUKU',
      'AMBON': 'MALUKU',
      'AMQ': 'MALUKU',
      
      // MALUKU UTARA
      'SULTAN BABULLAH': 'MALUKU UTARA',
      'TERNATE': 'MALUKU UTARA',
      'TTE': 'MALUKU UTARA',
      
      // PAPUA
      'SENTANI': 'P A P U A',
      'JAYAPURA': 'P A P U A',
      'DJJ': 'P A P U A',
      
      // PAPUA BARAT
      'DOMINE EDUARD OSOK': 'PAPUA BARAT',
      'SORONG': 'PAPUA BARAT',
      'SOQ': 'PAPUA BARAT',
      'RENDANI': 'PAPUA BARAT',
      'MANOKWARI': 'PAPUA BARAT',
      'MKW': 'PAPUA BARAT',
      
      // JAMBI
      'SULTAN THAHA': 'JAMBI',
      'JAMBI': 'JAMBI',
      'DJB': 'JAMBI',
      
      // BENGKULU
      'FATMAWATI SOEKARNO': 'BENGKULU',
      'BENGKULU': 'BENGKULU',
      'BKS': 'BENGKULU',
      
      // KEPULAUAN BANGKA BELITUNG
      'DEPATI AMIR': 'KEPULAUAN BANGKA BELITUNG',
      'PANGKAL PINANG': 'KEPULAUAN BANGKA BELITUNG',
      'PGK': 'KEPULAUAN BANGKA BELITUNG',
      'H.A.S. HANANDJOEDDIN': 'KEPULAUAN BANGKA BELITUNG',
      'TANJUNG PANDAN': 'KEPULAUAN BANGKA BELITUNG',
      'TJQ': 'KEPULAUAN BANGKA BELITUNG',
      
      // GORONTALO
      'JALALUDDIN': 'GORONTALO',
      'GORONTALO': 'GORONTALO',
      'GTO': 'GORONTALO',
      
      // SULAWESI BARAT
      'TAMPA PADANG': 'SULAWESI BARAT',
      'MAMUJU': 'SULAWESI BARAT',
      'MJU': 'SULAWESI BARAT'
    };
    
    // Check each mapping key against the airport string
    for (const [key, province] of Object.entries(airportToProvince)) {
      if (airport.includes(key)) {
        return province;
      }
    }
    
    // If no match found, try to extract city/region keywords
    if (airport.includes('JAKARTA')) return 'DKI JAKARTA';
    if (airport.includes('BALI')) return 'BALI';
    if (airport.includes('YOGYA') || airport.includes('JOGJA')) return 'DAERAH ISTIMEWA YOGYAKARTA';
    if (airport.includes('SURABAYA')) return 'JAWA TIMUR';
    if (airport.includes('BANDUNG')) return 'JAWA BARAT';
    
    // Default to DKI JAKARTA if no match (most common entry point)
    return 'DKI JAKARTA';
  }

  private async sendToAirtable(records: AirtableRecord[]): Promise<{ success: boolean; recordIds: string[] }> {
    if (!this.apiToken || !this.baseId || !this.tableName) {
      logger.debug('AIRTABLE_INTEGRATION', 'Airtable not configured - skipping data storage');
      return { success: false, recordIds: [] };
    }

    try {
      const url = `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(this.tableName)}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: records,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Airtable API error: ${response.status} - ${errorData}`);
      }

      const result: AirtableCreateResponse = await response.json();
      const recordIds = result.records.map(record => record.id);
      logger.info('AIRTABLE_INTEGRATION', `Successfully stored ${result.records.length} traveller records`);
      return { success: true, recordIds };
    } catch (error) {
      console.error('Airtable integration error:', error);
      logger.warn(
        'AIRTABLE_INTEGRATION_ERROR',
        `Failed to store traveller data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return { success: false, recordIds: [] };
    }
  }

  private prepareTravellerData(
    formData: FormData,
    paymentInfo: {
      paymentId: string;
      submissionId: string;
    }
  ): TravellerData[] {
    const timestamp = new Date().toISOString();
    const records: TravellerData[] = [];

    // Primary traveller record
    const primaryTraveller: TravellerData = {
      // Submission Info
      submissionId: paymentInfo.submissionId,
      paymentId: paymentInfo.paymentId,
      submissionTimestamp: timestamp,
      documentType: 'Indonesia Arrival Card',
      
      // Personal Information
      passportNumber: formData.passportNumber,
      fullPassportName: formData.fullPassportName,
      nationality: formData.nationality,
      dateOfBirth: this.formatDateToDDMMYYYY(formData.dateOfBirth),
      countryOfBirth: formData.countryOfBirth,
      gender: formData.gender || '',
      passportExpiryDate: this.formatDateToDDMMYYYY(formData.passportExpiryDate),
      mobileNumber: formData.mobileNumber,
      email: formData.email,
      citizenshipType: formData.citizenshipType || '',
      
      // Travel Details
      arrivalDate: this.formatDateToDDMMYYYY(formData.arrivalDate),
      departureDate: this.formatDateToDDMMYYYY(formData.departureDate),
      hasVisaOrKitas: formData.hasVisaOrKitas || false,
      visaOrKitasNumber: formData.visaOrKitasNumber,
      province: this.getProvinceFromAirport(formData.placeOfArrival),
      
      // Transportation
      modeOfTransport: formData.modeOfTransport,
      purposeOfTravel: formData.purposeOfTravel,
      placeOfArrival: formData.placeOfArrival,
      typeOfAirTransport: formData.typeOfAirTransport,
      flightName: formData.flightName,
      flightNumber: formData.flightNumber,
      typeOfVessel: formData.typeOfVessel,
      vesselName: formData.vesselName,
      
      // Address
      residenceType: formData.residenceType || 'Residential',
      addressInIndonesia: formData.addressInIndonesia,
      
      // Health Declaration
      hasSymptoms: formData.hasSymptoms || false,
      selectedSymptoms: formData.selectedSymptoms?.join(', ') || '',
      countriesVisited: formData.countriesVisited?.join(', ') || '',
      
      // Customs Declaration
      hasQuarantineItems: formData.hasQuarantineItems || false,
      hasGoodsToDeclarate: formData.hasGoodsToDeclarate || false,
      declaredGoodsJson: JSON.stringify(formData.declaredGoods || []),
      hasTechnologyDevices: formData.hasTechnologyDevices || false,
      baggageCount: formData.baggageCount,
      
      // Family Members (as beautified JSON string)
      familyMembersJson: formData.familyMembers && formData.familyMembers.length > 0 
        ? JSON.stringify(formData.familyMembers.map(member => ({
            fullPassportName: member.fullPassportName,
            passportNumber: member.passportNumber,
            nationality: member.nationality,
            dateOfBirth: this.formatDateToDDMMYYYY(member.dateOfBirth),
            countryOfBirth: member.countryOfBirth,
            gender: member.gender || '',
            passportExpiryDate: this.formatDateToDDMMYYYY(member.passportExpiryDate),
            mobileNumber: member.mobileNumber,
            email: member.email,
            hasVisaOrKitas: member.hasVisaOrKitas || false,
            visaOrKitasNumber: member.visaOrKitasNumber || '',
          })), null, 2)
        : '',
    };

    records.push(primaryTraveller);

    // Add family member data to primary traveller record (no separate records needed)
    // Family members will be stored as JSON in the primary record

    return records;
  }

  async storeTravellerData(
    formData: FormData,
    paymentInfo: {
      paymentId: string;
      submissionId?: string;
    }
  ): Promise<{ success: boolean; recordIds: string[]; airtableUrl?: string }> {
    try {
      const submissionId = paymentInfo.submissionId || `PAYMENT-${paymentInfo.paymentId}`;
      
      const travellerRecords = this.prepareTravellerData(formData, {
        ...paymentInfo,
        submissionId,
      });

      // Convert to Airtable records format
      const airtableRecords: AirtableRecord[] = travellerRecords.map(record => ({
        fields: {
          // Submission Info
          'Submission ID': record.submissionId,
          'Payment ID': record.paymentId,
          'Document Type': record.documentType,
          
          // Personal Information
          'Passport Number': record.passportNumber,
          'Full Passport Name': record.fullPassportName,
          'Nationality': record.nationality,
          'Date of Birth': record.dateOfBirth,
          'Country of Birth': record.countryOfBirth,
          'Gender': record.gender,
          'Passport Expiry Date': record.passportExpiryDate,
          'Mobile Number': record.mobileNumber,
          'Email': record.email,
          'Citizenship Type': record.citizenshipType,
          
          // Travel Details
          'Arrival Date': record.arrivalDate,
          'Departure Date': record.departureDate,
          'Has Visa or KITAS': this.booleanToYesNo(record.hasVisaOrKitas),
          'Visa or KITAS Number': record.visaOrKitasNumber,
          'Province': record.province,
          
          // Transportation
          'Mode of Transport': record.modeOfTransport,
          'Purpose of Travel': record.purposeOfTravel,
          'Place of Arrival': record.placeOfArrival,
          'Type of Air Transport': record.typeOfAirTransport || '',
          'Flight Name': record.flightName || '',
          'Flight Number': record.flightNumber || '',
          'Type of Vessel': record.typeOfVessel || '',
          'Vessel Name': record.vesselName || '',
          
          // Address
          'Residence Type': record.residenceType,
          'Address in Indonesia': record.addressInIndonesia,
          
          // Health Declaration (only for primary)
          'Has Symptoms': this.booleanToYesNo(record.hasSymptoms),
          'Selected Symptoms': record.selectedSymptoms || '',
          'Countries Visited': record.countriesVisited || '',
          
          // Customs Declaration (only for primary)
          'Has Quarantine Items': this.booleanToYesNo(record.hasQuarantineItems),
          'Has Goods to Declare': this.booleanToYesNo(record.hasGoodsToDeclarate),
          'Declared Goods (JSON)': record.declaredGoodsJson || '',
          'Has Technology Devices': this.booleanToYesNo(record.hasTechnologyDevices),
          'Baggage Count': record.baggageCount || '',
          
          // Family Members (JSON)
          'Family Members': record.familyMembersJson || '',
        },
      }));

      // Split into batches if needed (Airtable max 10 records per request)
      const batchSize = 10;
      let allSuccessful = true;
      const allRecordIds: string[] = [];

      for (let i = 0; i < airtableRecords.length; i += batchSize) {
        const batch = airtableRecords.slice(i, i + batchSize);
        const result = await this.sendToAirtable(batch);
        if (!result.success) {
          allSuccessful = false;
        } else {
          allRecordIds.push(...result.recordIds);
        }
      }

      // Generate Airtable URL if we have records  
      const airtableUrl = allRecordIds.length > 0 && this.baseId && this.tableId && this.viewId
        ? `https://airtable.com/${this.baseId}/${this.tableId}/${this.viewId}/${allRecordIds[0]}` // Link to primary traveller record
        : undefined;

      return {
        success: allSuccessful,
        recordIds: allRecordIds,
        airtableUrl
      };
    } catch (error) {
      logger.warn(
        'AIRTABLE_INTEGRATION_ERROR',
        `Failed to prepare traveller data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return { success: false, recordIds: [], airtableUrl: undefined };
    }
  }
}

export const airtableIntegration = new AirtableIntegration();