'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FormWizard from '@/components/FormWizard';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import { Language, getTranslation } from '@/lib/translations';
import { FormData, initialFormData } from '@/lib/formData';

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
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('en');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullPassportName.trim()) {
      newErrors.fullPassportName = getTranslation('fullPassportNameRequired', language);
    }
    if (!formData.nationality) {
      newErrors.nationality = getTranslation('nationalityRequired', language);
    }
    if (!formData.flightNumber.trim()) {
      newErrors.flightNumber = getTranslation('flightNumberRequired', language);
    }
    if (!formData.arrivalDate) {
      newErrors.arrivalDate = getTranslation('arrivalDateRequired', language);
    } else {
      // Validate date is within allowed range (today to 3 days from today)
      const selectedDate = new Date(formData.arrivalDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 3);
      
      if (selectedDate < today) {
        newErrors.arrivalDate = getTranslation('arrivalDatePast', language);
      } else if (selectedDate > maxDate) {
        newErrors.arrivalDate = getTranslation('arrivalDateTooFar', language);
      }
    }
    if (!formData.portOfArrival) {
      newErrors.portOfArrival = getTranslation('portOfArrivalRequired', language);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Redirect to official Indonesian e-CD system
      window.open('https://ecd.beacukai.go.id/', '_blank');
    }
  };

  // Get today's date and max date (3 days from today) in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div>
      <Header language={language} onLanguageChange={setLanguage} />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              {getTranslation('formTitle', language)}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="sm:col-span-2">
                <FormInput
                  label={getTranslation('fullPassportName', language)}
                  required
                  placeholder={getTranslation('fullPassportNamePlaceholder', language)}
                  value={formData.fullPassportName}
                  onChange={(e) => updateFormData('fullPassportName', e.target.value)}
                  error={errors.fullPassportName}
                />
              </div>
              
              <FormSelect
                label={getTranslation('nationality', language)}
                required
                options={countries}
                value={formData.nationality}
                onChange={(e) => updateFormData('nationality', e.target.value)}
                error={errors.nationality}
              />
              
              <FormInput
                label={getTranslation('flightNumber', language)}
                required
                placeholder={getTranslation('flightNumberPlaceholder', language)}
                value={formData.flightNumber}
                onChange={(e) => updateFormData('flightNumber', e.target.value)}
                error={errors.flightNumber}
              />
              
              <FormInput
                label={getTranslation('arrivalDate', language)}
                type="date"
                required
                min={getTodayDate()}
                max={getMaxDate()}
                value={formData.arrivalDate}
                onChange={(e) => updateFormData('arrivalDate', e.target.value)}
                error={errors.arrivalDate}
              />
              
              <FormSelect
                label={getTranslation('portOfArrival', language)}
                required
                options={ports}
                value={formData.portOfArrival}
                onChange={(e) => updateFormData('portOfArrival', e.target.value)}
                error={errors.portOfArrival}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">{getTranslation('importantNotice', language)}</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {getTranslation('importantNoticeText', language)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                >
                  {getTranslation('backToHome', language)}
                </button>
                
                <button
                  onClick={handleSubmit}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm sm:text-base"
                >
                  {getTranslation('continueToECustoms', language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};