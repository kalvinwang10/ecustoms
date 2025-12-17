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
      
      // Personal Information
      passportNumber: formData.passportNumber,
      fullPassportName: formData.fullPassportName,
      nationality: formData.nationality,
      dateOfBirth: formData.dateOfBirth,
      countryOfBirth: formData.countryOfBirth,
      gender: formData.gender || '',
      passportExpiryDate: formData.passportExpiryDate,
      mobileNumber: formData.mobileNumber,
      email: formData.email,
      citizenshipType: formData.citizenshipType || '',
      
      // Travel Details
      arrivalDate: formData.arrivalDate,
      departureDate: formData.departureDate,
      hasVisaOrKitas: formData.hasVisaOrKitas || false,
      visaOrKitasNumber: formData.visaOrKitasNumber,
      
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
      residenceType: formData.residenceType,
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
            dateOfBirth: member.dateOfBirth,
            countryOfBirth: member.countryOfBirth,
            gender: member.gender || '',
            passportExpiryDate: member.passportExpiryDate,
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
          'Has Visa or KITAS': record.hasVisaOrKitas,
          'Visa or KITAS Number': record.visaOrKitasNumber,
          
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
          'Has Symptoms': record.hasSymptoms || false,
          'Selected Symptoms': record.selectedSymptoms || '',
          'Countries Visited': record.countriesVisited || '',
          
          // Customs Declaration (only for primary)
          'Has Quarantine Items': record.hasQuarantineItems || false,
          'Has Goods to Declare': record.hasGoodsToDeclarate || false,
          'Declared Goods (JSON)': record.declaredGoodsJson || '',
          'Has Technology Devices': record.hasTechnologyDevices || false,
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