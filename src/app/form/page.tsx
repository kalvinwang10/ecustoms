'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import FormCheckbox from '@/components/ui/FormCheckbox';
import FamilyMemberManager from '@/components/ui/FamilyMemberManager';
import DateOfBirthSelect from '@/components/ui/DateOfBirthSelect';
import ArrivalDateSelect from '@/components/ui/ArrivalDateSelect';
import GoodsDeclarationTable from '@/components/ui/GoodsDeclarationTable';
import QRCodeModal from '@/components/QRCodeModal';
import { Language, getTranslation } from '@/lib/translations';
import { FormData, initialFormData } from '@/lib/formData';
import { trackFormSubmission } from '@/lib/gtag';
import { 
  trackFormStart, 
  trackFormFieldUpdate, 
  trackFormValidationError, 
  trackFormSubmission as trackMixpanelFormSubmission,
  trackButtonClick,
  trackLanguageChange,
  trackUserJourney 
} from '@/lib/mixpanel';

const countries = [
  { value: 'AD', label: 'AD - ANDORRA' },
  { value: 'AE', label: 'AE - UNITED ARAB EMIRATES' },
  { value: 'AF', label: 'AF - AFGHANISTAN' },
  { value: 'AG', label: 'AG - ANTIGUA AND BARBUDA' },
  { value: 'AI', label: 'AI - ANGUILLA' },
  { value: 'AL', label: 'AL - ALBANIA' },
  { value: 'AM', label: 'AM - ARMENIA' },
  { value: 'AO', label: 'AO - ANGOLA' },
  { value: 'AQ', label: 'AQ - ANTARCTICA' },
  { value: 'AR', label: 'AR - ARGENTINA' },
  { value: 'AS', label: 'AS - AMERICAN SAMOA' },
  { value: 'AT', label: 'AT - AUSTRIA' },
  { value: 'AU', label: 'AU - AUSTRALIA' },
  { value: 'AW', label: 'AW - ARUBA' },
  { value: 'AX', label: 'AX - ALAND ISLANDS' },
  { value: 'AZ', label: 'AZ - AZERBAIJAN' },
  { value: 'BA', label: 'BA - BOSNIA AND HERZEGOVINA' },
  { value: 'BB', label: 'BB - BARBADOS' },
  { value: 'BD', label: 'BD - BANGLADESH' },
  { value: 'BE', label: 'BE - BELGIUM' },
  { value: 'BF', label: 'BF - BURKINA FASO' },
  { value: 'BG', label: 'BG - BULGARIA' },
  { value: 'BH', label: 'BH - BAHRAIN' },
  { value: 'BI', label: 'BI - BURUNDI' },
  { value: 'BJ', label: 'BJ - BENIN' },
  { value: 'BL', label: 'BL - SAINT BARTHELEMY' },
  { value: 'BM', label: 'BM - BERMUDA' },
  { value: 'BN', label: 'BN - BRUNEI DARUSSALAM' },
  { value: 'BO', label: 'BO - BOLIVIA' },
  { value: 'BQ', label: 'BQ - BONAIRE, SINT EUSTATIUS AND SABA' },
  { value: 'BR', label: 'BR - BRAZIL' },
  { value: 'BS', label: 'BS - BAHAMAS' },
  { value: 'BT', label: 'BT - BHUTAN' },
  { value: 'BV', label: 'BV - BOUVET ISLAND' },
  { value: 'BW', label: 'BW - BOTSWANA' },
  { value: 'BY', label: 'BY - BELARUS' },
  { value: 'BZ', label: 'BZ - BELIZE' },
  { value: 'CA', label: 'CA - CANADA' },
  { value: 'CC', label: 'CC - COCOS (KEELING) ISLANDS' },
  { value: 'CD', label: 'CD - CONGO, DEMOCRATIC REPUBLIC' },
  { value: 'CF', label: 'CF - CENTRAL AFRICAN REPUBLIC' },
  { value: 'CG', label: 'CG - CONGO' },
  { value: 'CH', label: 'CH - SWITZERLAND' },
  { value: 'CI', label: 'CI - COTE D\'IVOIRE' },
  { value: 'CK', label: 'CK - COOK ISLANDS' },
  { value: 'CL', label: 'CL - CHILE' },
  { value: 'CM', label: 'CM - CAMEROON' },
  { value: 'CN', label: 'CN - CHINA' },
  { value: 'CO', label: 'CO - COLOMBIA' },
  { value: 'CR', label: 'CR - COSTA RICA' },
  { value: 'CU', label: 'CU - CUBA' },
  { value: 'CV', label: 'CV - CAPE VERDE' },
  { value: 'CW', label: 'CW - CURACAO' },
  { value: 'CX', label: 'CX - CHRISTMAS ISLAND' },
  { value: 'CY', label: 'CY - CYPRUS' },
  { value: 'CZ', label: 'CZ - CZECH REPUBLIC' },
  { value: 'DE', label: 'DE - GERMANY' },
  { value: 'DJ', label: 'DJ - DJIBOUTI' },
  { value: 'DK', label: 'DK - DENMARK' },
  { value: 'DM', label: 'DM - DOMINICA' },
  { value: 'DO', label: 'DO - DOMINICAN REPUBLIC' },
  { value: 'DZ', label: 'DZ - ALGERIA' },
  { value: 'EC', label: 'EC - ECUADOR' },
  { value: 'EE', label: 'EE - ESTONIA' },
  { value: 'EG', label: 'EG - EGYPT' },
  { value: 'EH', label: 'EH - WESTERN SAHARA' },
  { value: 'ER', label: 'ER - ERITREA' },
  { value: 'ES', label: 'ES - SPAIN' },
  { value: 'ET', label: 'ET - ETHIOPIA' },
  { value: 'FI', label: 'FI - FINLAND' },
  { value: 'FJ', label: 'FJ - FIJI' },
  { value: 'FK', label: 'FK - FALKLAND ISLANDS' },
  { value: 'FM', label: 'FM - MICRONESIA' },
  { value: 'FO', label: 'FO - FAROE ISLANDS' },
  { value: 'FR', label: 'FR - FRANCE' },
  { value: 'GA', label: 'GA - GABON' },
  { value: 'GB', label: 'GB - UNITED KINGDOM' },
  { value: 'GD', label: 'GD - GRENADA' },
  { value: 'GE', label: 'GE - GEORGIA' },
  { value: 'GF', label: 'GF - FRENCH GUIANA' },
  { value: 'GG', label: 'GG - GUERNSEY' },
  { value: 'GH', label: 'GH - GHANA' },
  { value: 'GI', label: 'GI - GIBRALTAR' },
  { value: 'GL', label: 'GL - GREENLAND' },
  { value: 'GM', label: 'GM - GAMBIA' },
  { value: 'GN', label: 'GN - GUINEA' },
  { value: 'GP', label: 'GP - GUADELOUPE' },
  { value: 'GQ', label: 'GQ - EQUATORIAL GUINEA' },
  { value: 'GR', label: 'GR - GREECE' },
  { value: 'GS', label: 'GS - SOUTH GEORGIA AND SOUTH SANDWICH ISLANDS' },
  { value: 'GT', label: 'GT - GUATEMALA' },
  { value: 'GU', label: 'GU - GUAM' },
  { value: 'GW', label: 'GW - GUINEA-BISSAU' },
  { value: 'GY', label: 'GY - GUYANA' },
  { value: 'HK', label: 'HK - HONG KONG' },
  { value: 'HM', label: 'HM - HEARD ISLAND AND MCDONALD ISLANDS' },
  { value: 'HN', label: 'HN - HONDURAS' },
  { value: 'HR', label: 'HR - CROATIA' },
  { value: 'HT', label: 'HT - HAITI' },
  { value: 'HU', label: 'HU - HUNGARY' },
  { value: 'ID', label: 'ID - INDONESIA' },
  { value: 'IE', label: 'IE - IRELAND' },
  { value: 'IL', label: 'IL - ISRAEL' },
  { value: 'IM', label: 'IM - ISLE OF MAN' },
  { value: 'IN', label: 'IN - INDIA' },
  { value: 'IO', label: 'IO - BRITISH INDIAN OCEAN TERRITORY' },
  { value: 'IQ', label: 'IQ - IRAQ' },
  { value: 'IR', label: 'IR - IRAN' },
  { value: 'IS', label: 'IS - ICELAND' },
  { value: 'IT', label: 'IT - ITALY' },
  { value: 'JE', label: 'JE - JERSEY' },
  { value: 'JM', label: 'JM - JAMAICA' },
  { value: 'JO', label: 'JO - JORDAN' },
  { value: 'JP', label: 'JP - JAPAN' },
  { value: 'KE', label: 'KE - KENYA' },
  { value: 'KG', label: 'KG - KYRGYZSTAN' },
  { value: 'KH', label: 'KH - CAMBODIA' },
  { value: 'KI', label: 'KI - KIRIBATI' },
  { value: 'KM', label: 'KM - COMOROS' },
  { value: 'KN', label: 'KN - SAINT KITTS AND NEVIS' },
  { value: 'KP', label: 'KP - KOREA, NORTH' },
  { value: 'KR', label: 'KR - KOREA, SOUTH' },
  { value: 'KW', label: 'KW - KUWAIT' },
  { value: 'KY', label: 'KY - CAYMAN ISLANDS' },
  { value: 'KZ', label: 'KZ - KAZAKHSTAN' },
  { value: 'LA', label: 'LA - LAOS' },
  { value: 'LB', label: 'LB - LEBANON' },
  { value: 'LC', label: 'LC - SAINT LUCIA' },
  { value: 'LI', label: 'LI - LIECHTENSTEIN' },
  { value: 'LK', label: 'LK - SRI LANKA' },
  { value: 'LR', label: 'LR - LIBERIA' },
  { value: 'LS', label: 'LS - LESOTHO' },
  { value: 'LT', label: 'LT - LITHUANIA' },
  { value: 'LU', label: 'LU - LUXEMBOURG' },
  { value: 'LV', label: 'LV - LATVIA' },
  { value: 'LY', label: 'LY - LIBYA' },
  { value: 'MA', label: 'MA - MOROCCO' },
  { value: 'MC', label: 'MC - MONACO' },
  { value: 'MD', label: 'MD - MOLDOVA' },
  { value: 'ME', label: 'ME - MONTENEGRO' },
  { value: 'MF', label: 'MF - SAINT MARTIN' },
  { value: 'MG', label: 'MG - MADAGASCAR' },
  { value: 'MH', label: 'MH - MARSHALL ISLANDS' },
  { value: 'MK', label: 'MK - MACEDONIA' },
  { value: 'ML', label: 'ML - MALI' },
  { value: 'MM', label: 'MM - MYANMAR' },
  { value: 'MN', label: 'MN - MONGOLIA' },
  { value: 'MO', label: 'MO - MACAO' },
  { value: 'MP', label: 'MP - NORTHERN MARIANA ISLANDS' },
  { value: 'MQ', label: 'MQ - MARTINIQUE' },
  { value: 'MR', label: 'MR - MAURITANIA' },
  { value: 'MS', label: 'MS - MONTSERRAT' },
  { value: 'MT', label: 'MT - MALTA' },
  { value: 'MU', label: 'MU - MAURITIUS' },
  { value: 'MV', label: 'MV - MALDIVES' },
  { value: 'MW', label: 'MW - MALAWI' },
  { value: 'MX', label: 'MX - MEXICO' },
  { value: 'MY', label: 'MY - MALAYSIA' },
  { value: 'MZ', label: 'MZ - MOZAMBIQUE' },
  { value: 'NA', label: 'NA - NAMIBIA' },
  { value: 'NC', label: 'NC - NEW CALEDONIA' },
  { value: 'NE', label: 'NE - NIGER' },
  { value: 'NF', label: 'NF - NORFOLK ISLAND' },
  { value: 'NG', label: 'NG - NIGERIA' },
  { value: 'NI', label: 'NI - NICARAGUA' },
  { value: 'NL', label: 'NL - NETHERLANDS' },
  { value: 'NO', label: 'NO - NORWAY' },
  { value: 'NP', label: 'NP - NEPAL' },
  { value: 'NR', label: 'NR - NAURU' },
  { value: 'NU', label: 'NU - NIUE' },
  { value: 'NZ', label: 'NZ - NEW ZEALAND' },
  { value: 'OM', label: 'OM - OMAN' },
  { value: 'PA', label: 'PA - PANAMA' },
  { value: 'PE', label: 'PE - PERU' },
  { value: 'PF', label: 'PF - FRENCH POLYNESIA' },
  { value: 'PG', label: 'PG - PAPUA NEW GUINEA' },
  { value: 'PH', label: 'PH - PHILIPPINES' },
  { value: 'PK', label: 'PK - PAKISTAN' },
  { value: 'PL', label: 'PL - POLAND' },
  { value: 'PM', label: 'PM - SAINT PIERRE AND MIQUELON' },
  { value: 'PN', label: 'PN - PITCAIRN' },
  { value: 'PR', label: 'PR - PUERTO RICO' },
  { value: 'PS', label: 'PS - PALESTINE' },
  { value: 'PT', label: 'PT - PORTUGAL' },
  { value: 'PW', label: 'PW - PALAU' },
  { value: 'PY', label: 'PY - PARAGUAY' },
  { value: 'QA', label: 'QA - QATAR' },
  { value: 'RE', label: 'RE - REUNION' },
  { value: 'RO', label: 'RO - ROMANIA' },
  { value: 'RS', label: 'RS - SERBIA' },
  { value: 'RU', label: 'RU - RUSSIA' },
  { value: 'RW', label: 'RW - RWANDA' },
  { value: 'SA', label: 'SA - SAUDI ARABIA' },
  { value: 'SB', label: 'SB - SOLOMON ISLANDS' },
  { value: 'SC', label: 'SC - SEYCHELLES' },
  { value: 'SD', label: 'SD - SUDAN' },
  { value: 'SE', label: 'SE - SWEDEN' },
  { value: 'SG', label: 'SG - SINGAPORE' },
  { value: 'SH', label: 'SH - SAINT HELENA' },
  { value: 'SI', label: 'SI - SLOVENIA' },
  { value: 'SJ', label: 'SJ - SVALBARD AND JAN MAYEN' },
  { value: 'SK', label: 'SK - SLOVAKIA' },
  { value: 'SL', label: 'SL - SIERRA LEONE' },
  { value: 'SM', label: 'SM - SAN MARINO' },
  { value: 'SN', label: 'SN - SENEGAL' },
  { value: 'SO', label: 'SO - SOMALIA' },
  { value: 'SR', label: 'SR - SURINAME' },
  { value: 'SS', label: 'SS - SOUTH SUDAN' },
  { value: 'ST', label: 'ST - SAO TOME AND PRINCIPE' },
  { value: 'SV', label: 'SV - EL SALVADOR' },
  { value: 'SX', label: 'SX - SINT MAARTEN' },
  { value: 'SY', label: 'SY - SYRIA' },
  { value: 'SZ', label: 'SZ - SWAZILAND' },
  { value: 'TC', label: 'TC - TURKS AND CAICOS ISLANDS' },
  { value: 'TD', label: 'TD - CHAD' },
  { value: 'TF', label: 'TF - FRENCH SOUTHERN TERRITORIES' },
  { value: 'TG', label: 'TG - TOGO' },
  { value: 'TH', label: 'TH - THAILAND' },
  { value: 'TJ', label: 'TJ - TAJIKISTAN' },
  { value: 'TK', label: 'TK - TOKELAU' },
  { value: 'TL', label: 'TL - TIMOR-LESTE' },
  { value: 'TM', label: 'TM - TURKMENISTAN' },
  { value: 'TN', label: 'TN - TUNISIA' },
  { value: 'TO', label: 'TO - TONGA' },
  { value: 'TR', label: 'TR - TURKEY' },
  { value: 'TT', label: 'TT - TRINIDAD AND TOBAGO' },
  { value: 'TV', label: 'TV - TUVALU' },
  { value: 'TW', label: 'TW - TAIWAN' },
  { value: 'TZ', label: 'TZ - TANZANIA' },
  { value: 'UA', label: 'UA - UKRAINE' },
  { value: 'UG', label: 'UG - UGANDA' },
  { value: 'UM', label: 'UM - UNITED STATES MINOR OUTLYING ISLANDS' },
  { value: 'US', label: 'US - UNITED STATES' },
  { value: 'UY', label: 'UY - URUGUAY' },
  { value: 'UZ', label: 'UZ - UZBEKISTAN' },
  { value: 'VA', label: 'VA - VATICAN CITY' },
  { value: 'VC', label: 'VC - SAINT VINCENT AND THE GRENADINES' },
  { value: 'VE', label: 'VE - VENEZUELA' },
  { value: 'VG', label: 'VG - BRITISH VIRGIN ISLANDS' },
  { value: 'VI', label: 'VI - US VIRGIN ISLANDS' },
  { value: 'VN', label: 'VN - VIETNAM' },
  { value: 'VU', label: 'VU - VANUATU' },
  { value: 'WF', label: 'WF - WALLIS AND FUTUNA' },
  { value: 'WS', label: 'WS - SAMOA' },
  { value: 'YE', label: 'YE - YEMEN' },
  { value: 'YT', label: 'YT - MAYOTTE' },
  { value: 'ZA', label: 'ZA - SOUTH AFRICA' },
  { value: 'ZM', label: 'ZM - ZAMBIA' },
  { value: 'ZW', label: 'ZW - ZIMBABWE' },
];

const ports = [
  { value: 'CGK', label: 'JAKARTA (CGK) / SOEKARNO HATTA' },
  { value: 'DPS', label: 'BALI (DPS) / NGURAH RAI' },
  { value: 'SUB', label: 'SURABAYA (SUB) / JUANDA' },
  { value: 'KNO', label: 'MEDAN (KNO) / KUALANAMU' },
  { value: 'YIA', label: 'YOGYAKARTA (YIA) / YOGYAKARTA INTL. AIRPORT' },
  { value: 'LOP', label: 'LOMBOK (LOP) / BIZAM' },
  { value: 'KJT', label: 'MAJALENGKA (KJT) / KERTAJATI INTL AIRPORT' },
  { value: 'UPG', label: 'MAKASSAR (UPG) / SULTAN HASANUDDIN' },
  { value: 'MDC', label: 'MANADO (MDC) / SAM RATULANGI' },
  { value: 'PKU', label: 'PEKANBARU (PKU) / SULTAN SYARIF KASIM II' },
  { value: 'BTJ', label: 'ACEH (BTJ) / SULTAN ISKANDAR MUDA' },
  { value: 'BPN', label: 'BALIKPAPAN (BPN) / SEPINGGAN' },
  { value: 'PDG', label: 'PADANG (PDG) / MINANGKABAU' },
  { value: 'WII', label: 'ATAMBUA (WII) / WINI' },
  { value: 'MTA', label: 'ATAMBUA (MTA) / MOTAAIN' },
  { value: 'MTS', label: 'ATAMBUA (MTS) / MOTAMASIN' },
  { value: 'HLP', label: 'JAKARTA (HLP) / HALIM PERDANAKUSUMA' },
  { value: 'LBJ', label: 'LABUAN BAJO (LBJ) / KOMODO' },
  { value: 'BTH', label: 'BATAM (BTH) / HANG NADIM INTL. AIRPORT' },
  { value: 'NPN', label: 'ATAMBUA (NPN) / NAPAN' },
  { value: 'PLM', label: 'PALEMBANG (PLM) / SULTAN MAHMUD BADARUDDIN II' },
];

export default function FormPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStarted, setFormStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Track form start when component mounts
  useEffect(() => {
    trackUserJourney('Form Page Loaded', 3);
  }, []);

  // Handle language changes
  const handleLanguageChange = (newLanguage: Language) => {
    trackLanguageChange(newLanguage, language);
    setLanguage(newLanguage);
  };

  const updateFormData = (field: keyof FormData, value: string | boolean | number | unknown[] | null) => {
    // Track form start on first field interaction
    if (!formStarted) {
      trackFormStart();
      setFormStarted(true);
    }

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Track field update in Mixpanel (only for simple values, not arrays)
    if (typeof value !== 'object') {
      trackFormFieldUpdate(field, typeof value === 'string' ? value : value?.toString() || '');
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (formData.currentStep < 3) {
        updateFormData('currentStep', formData.currentStep + 1);
        trackUserJourney(`Step ${formData.currentStep + 1} Started`, formData.currentStep + 3);
      }
    }
  };

  const previousStep = () => {
    if (formData.currentStep > 1) {
      updateFormData('currentStep', formData.currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    if (formData.currentStep === 1) {
      // Page 1: Declaration & Disclaimer validation - no validation required, just informational
    } else if (formData.currentStep === 2) {
      // Page 2: Arrival Information & Passenger Information validation
      if (!formData.fullPassportName.trim()) {
        const errorMsg = getTranslation('fullPassportNameRequired', language);
        newErrors.fullPassportName = errorMsg;
        trackFormValidationError('fullPassportName', errorMsg);
      }
      if (!formData.passportNumber.trim()) {
        const errorMsg = getTranslation('passportNumberRequired', language);
        newErrors.passportNumber = errorMsg;
        trackFormValidationError('passportNumber', errorMsg);
      }
      if (!formData.dateOfBirth.trim()) {
        const errorMsg = getTranslation('dateOfBirthRequired', language);
        newErrors.dateOfBirth = errorMsg;
        trackFormValidationError('dateOfBirth', errorMsg);
      } else {
        // Validate date of birth
        const [year, month, day] = formData.dateOfBirth.split('-');
        if (year && month && day) {
          const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const today = new Date();
          today.setHours(23, 59, 59, 999); // End of today
          
          // Check if the date is valid (handles invalid dates like Feb 30)
          const isValidCalendarDate = 
            birthDate.getFullYear() === parseInt(year) &&
            birthDate.getMonth() === parseInt(month) - 1 &&
            birthDate.getDate() === parseInt(day);
          
          // Check if the date is not in the future
          const isNotFuture = birthDate <= today;
          
          if (!isValidCalendarDate) {
            const errorMsg = getTranslation('dateOfBirthInvalid', language);
            newErrors.dateOfBirth = errorMsg;
            trackFormValidationError('dateOfBirth', errorMsg);
          } else if (!isNotFuture) {
            const errorMsg = getTranslation('dateOfBirthFuture', language);
            newErrors.dateOfBirth = errorMsg;
            trackFormValidationError('dateOfBirth', errorMsg);
          }
        }
      }
      if (!formData.flightVesselNumber.trim()) {
        const errorMsg = getTranslation('flightVesselNumberRequired', language);
        newErrors.flightVesselNumber = errorMsg;
        trackFormValidationError('flightVesselNumber', errorMsg);
      }
      if (!formData.nationality) {
        const errorMsg = getTranslation('nationalityRequired', language);
        newErrors.nationality = errorMsg;
        trackFormValidationError('nationality', errorMsg);
      }
      if (!formData.numberOfLuggage.trim()) {
        const errorMsg = getTranslation('numberOfLuggageRequired', language);
        newErrors.numberOfLuggage = errorMsg;
        trackFormValidationError('numberOfLuggage', errorMsg);
      } else if (parseInt(formData.numberOfLuggage) < 0) {
        const errorMsg = getTranslation('numberOfLuggageInvalid', language);
        newErrors.numberOfLuggage = errorMsg;
        trackFormValidationError('numberOfLuggage', errorMsg);
      }
      if (!formData.addressInIndonesia.trim()) {
        const errorMsg = getTranslation('addressInIndonesiaRequired', language);
        newErrors.addressInIndonesia = errorMsg;
        trackFormValidationError('addressInIndonesia', errorMsg);
      }
      if (!formData.arrivalDate) {
        const errorMsg = getTranslation('arrivalDateRequired', language);
        newErrors.arrivalDate = errorMsg;
        trackFormValidationError('arrivalDate', errorMsg);
      } else {
        // Validate date is one of the allowed options (today, +1 day, +2 days)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const allowedDates = [];
        for (let i = 0; i <= 2; i++) {
          const allowedDate = new Date(today);
          allowedDate.setDate(today.getDate() + i);
          allowedDates.push(allowedDate.toISOString().split('T')[0]);
        }
        
        if (!allowedDates.includes(formData.arrivalDate)) {
          const errorMsg = getTranslation('arrivalDateInvalid', language);
          newErrors.arrivalDate = errorMsg;
          trackFormValidationError('arrivalDate', errorMsg);
        }
      }
      if (!formData.portOfArrival) {
        const errorMsg = getTranslation('portOfArrivalRequired', language);
        newErrors.portOfArrival = errorMsg;
        trackFormValidationError('portOfArrival', errorMsg);
      }
    } else if (formData.currentStep === 3) {
      // Page 3: Customs Declaration validation
      
      // Check if goods declaration is selected
      if (formData.hasGoodsToDeclarate === null || formData.hasGoodsToDeclarate === undefined) {
        const errorMsg = getTranslation('goodsDeclarationRequired', language);
        newErrors.hasGoodsToDeclarate = errorMsg;
        trackFormValidationError('hasGoodsToDeclarate', errorMsg);
      }
      
      // If declaring goods, validate at least one item is added
      if (formData.hasGoodsToDeclarate && formData.declaredGoods.length === 0) {
        const errorMsg = getTranslation('declaredGoodsRequired', language);
        newErrors.declaredGoods = errorMsg;
        trackFormValidationError('declaredGoods', errorMsg);
      }
      
      // Validate each declared good
      if (formData.hasGoodsToDeclarate && formData.declaredGoods.length > 0) {
        formData.declaredGoods.forEach((good) => {
          if (!good.description.trim()) {
            const errorMsg = getTranslation('goodDescriptionRequired', language);
            newErrors[`good-${good.id}-description`] = errorMsg;
            trackFormValidationError(`good-${good.id}-description`, errorMsg);
          }
          
          if (!good.quantity.trim()) {
            const errorMsg = getTranslation('quantityRequired', language);
            newErrors[`good-${good.id}-quantity`] = errorMsg;
            trackFormValidationError(`good-${good.id}-quantity`, errorMsg);
          } else if (parseInt(good.quantity) <= 0) {
            const errorMsg = getTranslation('quantityInvalid', language);
            newErrors[`good-${good.id}-quantity`] = errorMsg;
            trackFormValidationError(`good-${good.id}-quantity`, errorMsg);
          }
          
          if (!good.value.trim()) {
            const errorMsg = getTranslation('valueRequired', language);
            newErrors[`good-${good.id}-value`] = errorMsg;
            trackFormValidationError(`good-${good.id}-value`, errorMsg);
          } else if (parseFloat(good.value) <= 0) {
            const errorMsg = getTranslation('valueInvalid', language);
            newErrors[`good-${good.id}-value`] = errorMsg;
            trackFormValidationError(`good-${good.id}-value`, errorMsg);
          }
          
          if (!good.currency) {
            const errorMsg = getTranslation('currencyRequired', language);
            newErrors[`good-${good.id}-currency`] = errorMsg;
            trackFormValidationError(`good-${good.id}-currency`, errorMsg);
          }
        });
      }
      
      // Check if technology devices selection is made
      if (formData.hasTechnologyDevices === null || formData.hasTechnologyDevices === undefined) {
        const errorMsg = getTranslation('technologyDevicesRequired', language);
        newErrors.hasTechnologyDevices = errorMsg;
        trackFormValidationError('hasTechnologyDevices', errorMsg);
      }
      
      // Check final consent
      if (!formData.consentAccurate) {
        const errorMsg = getTranslation('consentRequired', language);
        newErrors.consentAccurate = errorMsg;
        trackFormValidationError('consentAccurate', errorMsg);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    trackButtonClick('Continue to E-Customs', 'Form Page');
    trackUserJourney('Form Submit Attempted', 4);
    
    if (validateCurrentStep()) {
      setIsSubmitting(true);
      setErrors({});
      
      try {
        // Call our API to automate the submission
        const response = await fetch('/api/submit-customs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData: formData,
            options: {
              headless: true,
              timeout: 60000,
              retries: 3
            }
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Track successful form submission
          trackMixpanelFormSubmission();
          trackFormSubmission(); // Remove URL parameter to prevent unwanted redirect
          trackUserJourney('Form Submitted Successfully', 5);
          
          // Store the result and show QR modal
          setSubmissionResult(result);
          setShowQRModal(true);
        } else {
          // Show error message
          setErrors({
            submission: result.error?.message || 'Submission failed. Please try again.'
          });
          
          // Track error
          trackFormValidationError('submission', result.error?.message || 'Unknown error');
          
          // Offer fallback option
          if (result.fallbackUrl) {
            const useFallback = window.confirm(
              'Automated submission failed. Would you like to complete the form manually on the official website?'
            );
            if (useFallback) {
              window.open(result.fallbackUrl, '_blank');
            }
          }
        }
      } catch (error) {
        console.error('Submission error:', error);
        setErrors({
          submission: 'Network error. Please check your connection and try again.'
        });
        trackFormValidationError('submission', 'Network error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };



  // Render Page 1: Declaration & Disclaimer (Complete Official BC 2.2 Content)
  const renderPage1 = () => (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {getTranslation('declarationTitle', language)}
        </h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          {getTranslation('welcomeToIndonesia', language)}
        </h2>
        
        {/* Display submission error */}
        {errors.submission && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Submission Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {errors.submission}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-base text-gray-700 mb-6">
          {getTranslation('pleaseReadInformation', language)}
        </p>
      </div>

      {/* Main Information Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          {getTranslation('cooperationMessage', language)}
        </p>

        <div className="space-y-4 text-sm text-gray-700">
          <p className="leading-relaxed">
            {getTranslation('declarationRuleA', language)}
          </p>
          
          <p className="leading-relaxed">
            {getTranslation('declarationRuleB', language)}
          </p>
          
          <p className="leading-relaxed">
            {getTranslation('declarationRuleC', language)}
          </p>

          {/* Section D: Duty-Free Exemption Table */}
          <div className="mt-4">
            <p className="font-medium leading-relaxed mb-3">
              {getTranslation('declarationRuleD', language)}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left">
                      {getTranslation('subjectObject', language)}
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-left">
                      {getTranslation('dutyFreeExemption', language)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">
                      {getTranslation('generalPassengers', language)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {getTranslation('upToUSD500', language)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">
                      {getTranslation('hajjPassengers', language)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {getTranslation('accordingToRegulations', language)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">
                      {getTranslation('competitionGifts', language)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {getTranslation('accordingToRegulations', language)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">
                      {getTranslation('transportationCrew', language)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {getTranslation('upToUSD50', language)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section E: BKC Exemption Table */}
          <div className="mt-4">
            <p className="font-medium leading-relaxed mb-3">
              {getTranslation('declarationRuleE', language)}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left">
                      {getTranslation('bkcType', language)}
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-left">
                      {getTranslation('perPassenger', language)}
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-left">
                      {getTranslation('perCrewMember', language)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">
                      {getTranslation('alcoholicBeverages', language)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">1 Liter</td>
                    <td className="border border-gray-300 px-2 py-1">350 ml</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 font-medium" colSpan={3}>
                      {getTranslation('tobaccoProducts', language)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 pl-4">
                      {getTranslation('cigarettes', language)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">200 batang</td>
                    <td className="border border-gray-300 px-2 py-1">40 batang</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 pl-4">
                      {getTranslation('cigars', language)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">25 batang</td>
                    <td className="border border-gray-300 px-2 py-1">10 batang</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 pl-4">
                      {getTranslation('cutTobacco', language)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">100 gr</td>
                    <td className="border border-gray-300 px-2 py-1">40 gr</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 pl-4">
                      {getTranslation('otherTobaccoProducts', language)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">100 gr atau setara</td>
                    <td className="border border-gray-300 px-2 py-1">40 gr atau setara</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 pl-4">
                      {getTranslation('solidElectronicCigarettes', language)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">140 batang atau 40 kapsul</td>
                    <td className="border border-gray-300 px-2 py-1">20 batang atau 5 kapsul</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 pl-4">
                      {getTranslation('openSystemElectronicCigarettes', language)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">30 ml</td>
                    <td className="border border-gray-300 px-2 py-1">15 ml</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 pl-4">
                      {getTranslation('closedSystemElectronicCigarettes', language)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">12 ml</td>
                    <td className="border border-gray-300 px-2 py-1">6 ml</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>{getTranslation('bkcNote1', language)}</p>
              <p>{getTranslation('bkcNote2', language)}</p>
            </div>
          </div>

          {/* Sections F-J */}
          <div className="space-y-3 mt-4">
            <p className="leading-relaxed">
              {getTranslation('declarationRuleF', language)}
            </p>
            
            <p className="leading-relaxed">
              {getTranslation('declarationRuleG', language)}
            </p>
            
            <p className="leading-relaxed">
              {getTranslation('declarationRuleH', language)}
            </p>
            
            <p className="leading-relaxed">
              {getTranslation('declarationRuleI', language)}
            </p>
            
            <p className="leading-relaxed font-medium">
              {getTranslation('declarationRuleJ', language)}
            </p>
          </div>
        </div>
      </div>

    </div>
  );

  // Render Page 2: Arrival Information & Passenger Information
  const renderPage2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
        {getTranslation('travelDataTitle', language)}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <FormInput
          label={getTranslation('passportNumber', language)}
          required
          placeholder={getTranslation('passportNumberPlaceholder', language)}
          value={formData.passportNumber}
          onChange={(e) => updateFormData('passportNumber', e.target.value.toUpperCase())}
          error={errors.passportNumber}
        />
        
        <FormSelect
          label={getTranslation('portOfArrival', language)}
          required
          options={ports}
          value={formData.portOfArrival}
          onChange={(e) => updateFormData('portOfArrival', e.target.value)}
          error={errors.portOfArrival}
        />
        
        <ArrivalDateSelect
          label={getTranslation('arrivalDate', language)}
          required
          value={formData.arrivalDate}
          onChange={(e) => updateFormData('arrivalDate', e.target.value)}
          error={errors.arrivalDate}
        />
        
        <div className="sm:col-span-2">
          <FormInput
            label={getTranslation('fullPassportName', language)}
            required
            placeholder={getTranslation('fullPassportNamePlaceholder', language)}
            value={formData.fullPassportName}
            onChange={(e) => updateFormData('fullPassportName', e.target.value.toUpperCase())}
            error={errors.fullPassportName}
          />
        </div>
        
        <DateOfBirthSelect
          label={getTranslation('dateOfBirth', language)}
          required
          value={formData.dateOfBirth}
          onChange={(value) => updateFormData('dateOfBirth', value)}
          error={errors.dateOfBirth}
        />
        
        <FormInput
          label={getTranslation('flightVesselNumber', language)}
          required
          placeholder={getTranslation('flightVesselNumberPlaceholder', language)}
          value={formData.flightVesselNumber}
          onChange={(e) => updateFormData('flightVesselNumber', e.target.value.toUpperCase())}
          error={errors.flightVesselNumber}
        />
        
        <FormSelect
          label={getTranslation('nationality', language)}
          required
          options={countries}
          value={formData.nationality}
          onChange={(e) => updateFormData('nationality', e.target.value)}
          error={errors.nationality}
        />
        
        <FormInput
          label={getTranslation('numberOfLuggage', language)}
          type="number"
          min="0"
          max="99"
          required
          placeholder={getTranslation('numberOfLuggagePlaceholder', language)}
          value={formData.numberOfLuggage}
          onChange={(e) => {
            // Only allow numbers
            const value = e.target.value.replace(/[^0-9]/g, '');
            updateFormData('numberOfLuggage', value);
          }}
          onKeyPress={(e) => {
            // Prevent non-numeric characters from being entered
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          error={errors.numberOfLuggage}
        />
        
        <FormInput
          label={getTranslation('addressInIndonesia', language)}
          required
          placeholder={getTranslation('addressInIndonesiaPlaceholder', language)}
          value={formData.addressInIndonesia}
          onChange={(e) => updateFormData('addressInIndonesia', e.target.value)}
          error={errors.addressInIndonesia}
        />
        
        <div className="sm:col-span-2">
          <FamilyMemberManager
            familyMembers={formData.familyMembers}
            onChange={(familyMembers) => updateFormData('familyMembers', familyMembers)}
            countries={countries}
            labels={{
              title: getTranslation('familyMembers', language),
              passportNumber: getTranslation('passportNumber', language),
              name: getTranslation('fullPassportName', language),
              nationality: getTranslation('nationality', language),
              addMember: getTranslation('addFamilyMember', language),
              removeMember: getTranslation('removeFamilyMember', language),
              maxMembersReached: getTranslation('maxFamilyMembers', language)
            }}
          />
        </div>
      </div>
    </div>
  );

  // Render Page 3: Customs Declaration (Official Indonesian Form)
  const renderPage3 = () => (
    <div className="space-y-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
        {getTranslation('customsDeclarationTitle', language)}
      </h2>
      
      {/* Section 1: Main Goods Declaration */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">
          {getTranslation('goodsDeclarationQuestion', language)}
        </h3>
        
        {/* 8 Categories of Goods */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
            <div key={num} className="flex gap-3">
              <span className="text-sm font-medium text-gray-700 mt-1 min-w-[20px]">
                {num}.
              </span>
              <p className="text-sm text-gray-700 leading-tight">
                {getTranslation(`goodsCategory${num}`, language)}
              </p>
            </div>
          ))}
        </div>
        
        {/* Selection Instructions */}
        <p className="text-sm text-gray-600 italic">
          {getTranslation('selectYesIfBringing', language)}
        </p>
        
        {/* Yes/No Radio Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasGoodsToDeclarate"
              value="true"
              checked={formData.hasGoodsToDeclarate === true}
              onChange={() => updateFormData('hasGoodsToDeclarate', true)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {getTranslation('yes', language)}
            </span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasGoodsToDeclarate"
              value="false"
              checked={formData.hasGoodsToDeclarate === false}
              onChange={() => updateFormData('hasGoodsToDeclarate', false)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {getTranslation('no', language)}
            </span>
          </label>
        </div>
        
        {errors.hasGoodsToDeclarate && (
          <p className="text-sm text-red-600">{errors.hasGoodsToDeclarate}</p>
        )}
      </div>

      {/* Section 2: Goods Declaration Table (conditional) */}
      {formData.hasGoodsToDeclarate && (
        <div className="space-y-4">
          <GoodsDeclarationTable
            goods={formData.declaredGoods}
            onChange={(goods) => updateFormData('declaredGoods', goods)}
            labels={{
              title: getTranslation('goodsDeclarationTableTitle', language),
              description: getTranslation('goodsDescription', language),
              quantity: getTranslation('quantity', language),
              value: getTranslation('value', language),
              currency: getTranslation('currencyType', language),
              addItem: getTranslation('addItem', language),
              removeItem: getTranslation('removeItem', language),
              noData: getTranslation('noData', language)
            }}
          />
          
          {errors.declaredGoods && (
            <p className="text-sm text-red-600">{errors.declaredGoods}</p>
          )}
        </div>
      )}

      {/* Section 3: Technology Devices Question */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex gap-3">
          <span className="text-sm font-medium text-gray-700 mt-1 min-w-[20px]">
            9.
          </span>
          <p className="text-sm text-gray-700 leading-tight">
            {getTranslation('technologyDevicesQuestion', language)}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg ml-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasTechnologyDevices"
              value="true"
              checked={formData.hasTechnologyDevices === true}
              onChange={() => updateFormData('hasTechnologyDevices', true)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {getTranslation('yes', language)}
            </span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasTechnologyDevices"
              value="false"
              checked={formData.hasTechnologyDevices === false}
              onChange={() => updateFormData('hasTechnologyDevices', false)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {getTranslation('no', language)}
            </span>
          </label>
        </div>
        
        {errors.hasTechnologyDevices && (
          <p className="text-sm text-red-600">{errors.hasTechnologyDevices}</p>
        )}
      </div>

      {/* Section 4: Final Consent */}
      <div className="space-y-4 border-t pt-6">
        <FormCheckbox
          label={getTranslation('finalConsentStatement', language)}
          checked={formData.consentAccurate}
          onChange={(e) => updateFormData('consentAccurate', e.target.checked)}
          error={errors.consentAccurate}
          required
        />
      </div>
    </div>
  );

  return (
    <div>
      <Header language={language} onLanguageChange={handleLanguageChange} />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
            {/* Render current step */}
            {formData.currentStep === 1 && renderPage1()}
            {formData.currentStep === 2 && renderPage2()}
            {formData.currentStep === 3 && renderPage3()}

            {/* Navigation buttons */}
            <div className="mt-8">
              <div className="flex justify-between gap-4">
                <div>
                  {formData.currentStep > 1 && (
                    <button
                      type="button"
                      onClick={previousStep}
                      className="px-4 sm:px-6 py-3 sm:py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 text-base"
                    >
                      {getTranslation('previousStep', language)}
                    </button>
                  )}
                </div>
                
                <div>
                  {formData.currentStep < 3 ? (
                    <button
                      onClick={nextStep}
                      className="px-8 sm:px-8 py-4 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-base"
                    >
                      {getTranslation('nextStep', language)}
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={`px-8 sm:px-8 py-4 sm:py-3 rounded-lg font-medium text-base transition-colors ${
                        isSubmitting 
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        getTranslation('submitDeclaration', language)
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* QR Code Success Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        submissionResult={submissionResult}
        language={language}
      />
    </div>
  );
};