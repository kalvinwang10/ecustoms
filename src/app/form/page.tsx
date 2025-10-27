'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import CountryCodeSelect from '@/components/ui/CountryCodeSelect';
import AirlineSelect from '@/components/ui/AirlineSelect';
import TravellerManager from '@/components/ui/TravellerManager';
import FormCheckbox from '@/components/ui/FormCheckbox';
import FormTextArea from '@/components/ui/FormTextArea';
import FamilyMemberManager from '@/components/ui/FamilyMemberManager';
import DateOfBirthSelect from '@/components/ui/DateOfBirthSelect';
import ArrivalDateSelect from '@/components/ui/ArrivalDateSelect';
import DateInput from '@/components/ui/DateInput';
import GoodsDeclarationTable from '@/components/ui/GoodsDeclarationTable';
import ProcessingModal from '@/components/ProcessingModal';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
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
  trackUserJourney,
  trackAutomationFailure
} from '@/lib/mixpanel';
import { hasValidStoredQR, getStoredQR, StoredQRData, saveCompletedQR } from '@/lib/qr-storage';
import QRCodeModal from '@/components/QRCodeModal';
import QRNotificationBanner from '@/components/QRNotificationBanner';

const countries = [
  { value: 'AFGHANISTAN', label: 'AFGHANISTAN' },
  { value: 'ALBANIA', label: 'ALBANIA' },
  { value: 'ALGERIA', label: 'ALGERIA' },
  { value: 'AMERICAN SAMOA', label: 'AMERICAN SAMOA' },
  { value: 'ANDORRA', label: 'ANDORRA' },
  { value: 'ANGOLA', label: 'ANGOLA' },
  { value: 'ANGUILLA', label: 'ANGUILLA' },
  { value: 'ANTARCTICA', label: 'ANTARCTICA' },
  { value: 'ANTIGUA AND BARBUDA', label: 'ANTIGUA AND BARBUDA' },
  { value: 'ARGENTINA', label: 'ARGENTINA' },
  { value: 'ARMENIA', label: 'ARMENIA' },
  { value: 'ARUBA', label: 'ARUBA' },
  { value: 'AUSTRALIA', label: 'AUSTRALIA' },
  { value: 'AUSTRIA', label: 'AUSTRIA' },
  { value: 'AZERBAIJAN', label: 'AZERBAIJAN' },
  { value: 'BAHAMAS', label: 'BAHAMAS' },
  { value: 'BAHRAIN', label: 'BAHRAIN' },
  { value: 'BANGLADESH', label: 'BANGLADESH' },
  { value: 'BARBADOS', label: 'BARBADOS' },
  { value: 'BELARUS', label: 'BELARUS' },
  { value: 'BELGIUM', label: 'BELGIUM' },
  { value: 'BELIZE', label: 'BELIZE' },
  { value: 'BENIN', label: 'BENIN' },
  { value: 'BERMUDA', label: 'BERMUDA' },
  { value: 'BHUTAN', label: 'BHUTAN' },
  { value: 'BOLIVIA', label: 'BOLIVIA' },
  { value: 'BONAIRE, SINT EUSTATIUS AND SABA', label: 'BONAIRE, SINT EUSTATIUS AND SABA' },
  { value: 'BOSNIA AND HERZEGOVINA', label: 'BOSNIA AND HERZEGOVINA' },
  { value: 'BOTSWANA', label: 'BOTSWANA' },
  { value: 'BOUVET ISLAND', label: 'BOUVET ISLAND' },
  { value: 'BRAZIL', label: 'BRAZIL' },
  { value: 'BRITISH INDIAN OCEAN TERRITORY', label: 'BRITISH INDIAN OCEAN TERRITORY' },
  { value: 'BRITISH VIRGIN ISLANDS', label: 'BRITISH VIRGIN ISLANDS' },
  { value: 'BRUNEI DARUSSALAM', label: 'BRUNEI DARUSSALAM' },
  { value: 'BULGARIA', label: 'BULGARIA' },
  { value: 'BURKINA FASO', label: 'BURKINA FASO' },
  { value: 'BURUNDI', label: 'BURUNDI' },
  { value: 'CAMBODIA', label: 'CAMBODIA' },
  { value: 'CAMEROON', label: 'CAMEROON' },
  { value: 'CANADA', label: 'CANADA' },
  { value: 'CAPE VERDE', label: 'CAPE VERDE' },
  { value: 'CAYMAN ISLANDS', label: 'CAYMAN ISLANDS' },
  { value: 'CENTRAL AFRICAN REPUBLIC', label: 'CENTRAL AFRICAN REPUBLIC' },
  { value: 'CHAD', label: 'CHAD' },
  { value: 'CHILE', label: 'CHILE' },
  { value: 'CHINA', label: 'CHINA' },
  { value: 'CHRISTMAS ISLAND', label: 'CHRISTMAS ISLAND' },
  { value: 'COCOS (KEELING) ISLANDS', label: 'COCOS (KEELING) ISLANDS' },
  { value: 'COLOMBIA', label: 'COLOMBIA' },
  { value: 'COMOROS', label: 'COMOROS' },
  { value: 'CONGO', label: 'CONGO' },
  { value: 'CONGO, DEMOCRATIC REPUBLIC', label: 'CONGO, DEMOCRATIC REPUBLIC' },
  { value: 'COOK ISLANDS', label: 'COOK ISLANDS' },
  { value: 'COSTA RICA', label: 'COSTA RICA' },
  { value: 'COTE D&apos;IVOIRE', label: 'COTE D&apos;IVOIRE' },
  { value: 'CROATIA', label: 'CROATIA' },
  { value: 'CUBA', label: 'CUBA' },
  { value: 'CURACAO', label: 'CURACAO' },
  { value: 'CYPRUS', label: 'CYPRUS' },
  { value: 'CZECH REPUBLIC', label: 'CZECH REPUBLIC' },
  { value: 'DENMARK', label: 'DENMARK' },
  { value: 'DJIBOUTI', label: 'DJIBOUTI' },
  { value: 'DOMINICA', label: 'DOMINICA' },
  { value: 'DOMINICAN REPUBLIC', label: 'DOMINICAN REPUBLIC' },
  { value: 'ECUADOR', label: 'ECUADOR' },
  { value: 'EGYPT', label: 'EGYPT' },
  { value: 'EL SALVADOR', label: 'EL SALVADOR' },
  { value: 'EQUATORIAL GUINEA', label: 'EQUATORIAL GUINEA' },
  { value: 'ERITREA', label: 'ERITREA' },
  { value: 'ESTONIA', label: 'ESTONIA' },
  { value: 'ETHIOPIA', label: 'ETHIOPIA' },
  { value: 'FALKLAND ISLANDS', label: 'FALKLAND ISLANDS' },
  { value: 'FAROE ISLANDS', label: 'FAROE ISLANDS' },
  { value: 'FIJI', label: 'FIJI' },
  { value: 'FINLAND', label: 'FINLAND' },
  { value: 'FRANCE', label: 'FRANCE' },
  { value: 'FRENCH GUIANA', label: 'FRENCH GUIANA' },
  { value: 'FRENCH POLYNESIA', label: 'FRENCH POLYNESIA' },
  { value: 'FRENCH SOUTHERN TERRITORIES', label: 'FRENCH SOUTHERN TERRITORIES' },
  { value: 'GABON', label: 'GABON' },
  { value: 'GAMBIA', label: 'GAMBIA' },
  { value: 'GEORGIA', label: 'GEORGIA' },
  { value: 'GERMANY', label: 'GERMANY' },
  { value: 'GHANA', label: 'GHANA' },
  { value: 'GIBRALTAR', label: 'GIBRALTAR' },
  { value: 'GREECE', label: 'GREECE' },
  { value: 'GREENLAND', label: 'GREENLAND' },
  { value: 'GRENADA', label: 'GRENADA' },
  { value: 'GUADELOUPE', label: 'GUADELOUPE' },
  { value: 'GUAM', label: 'GUAM' },
  { value: 'GUATEMALA', label: 'GUATEMALA' },
  { value: 'GUERNSEY', label: 'GUERNSEY' },
  { value: 'GUINEA', label: 'GUINEA' },
  { value: 'GUINEA-BISSAU', label: 'GUINEA-BISSAU' },
  { value: 'GUYANA', label: 'GUYANA' },
  { value: 'HAITI', label: 'HAITI' },
  { value: 'HEARD ISLAND AND MCDONALD ISLANDS', label: 'HEARD ISLAND AND MCDONALD ISLANDS' },
  { value: 'HONDURAS', label: 'HONDURAS' },
  { value: 'HONG KONG', label: 'HONG KONG' },
  { value: 'HUNGARY', label: 'HUNGARY' },
  { value: 'ICELAND', label: 'ICELAND' },
  { value: 'INDIA', label: 'INDIA' },
  { value: 'INDONESIA', label: 'INDONESIA' },
  { value: 'IRAN', label: 'IRAN' },
  { value: 'IRAQ', label: 'IRAQ' },
  { value: 'IRELAND', label: 'IRELAND' },
  { value: 'ISLE OF MAN', label: 'ISLE OF MAN' },
  { value: 'ISRAEL', label: 'ISRAEL' },
  { value: 'ITALY', label: 'ITALY' },
  { value: 'JAMAICA', label: 'JAMAICA' },
  { value: 'JAPAN', label: 'JAPAN' },
  { value: 'JERSEY', label: 'JERSEY' },
  { value: 'JORDAN', label: 'JORDAN' },
  { value: 'KAZAKHSTAN', label: 'KAZAKHSTAN' },
  { value: 'KENYA', label: 'KENYA' },
  { value: 'KIRIBATI', label: 'KIRIBATI' },
  { value: 'KOREA, NORTH', label: 'KOREA, NORTH' },
  { value: 'KOREA, SOUTH', label: 'KOREA, SOUTH' },
  { value: 'KUWAIT', label: 'KUWAIT' },
  { value: 'KYRGYZSTAN', label: 'KYRGYZSTAN' },
  { value: 'LAOS', label: 'LAOS' },
  { value: 'LATVIA', label: 'LATVIA' },
  { value: 'LEBANON', label: 'LEBANON' },
  { value: 'LESOTHO', label: 'LESOTHO' },
  { value: 'LIBERIA', label: 'LIBERIA' },
  { value: 'LIBYA', label: 'LIBYA' },
  { value: 'LIECHTENSTEIN', label: 'LIECHTENSTEIN' },
  { value: 'LITHUANIA', label: 'LITHUANIA' },
  { value: 'LUXEMBOURG', label: 'LUXEMBOURG' },
  { value: 'MACAO', label: 'MACAO' },
  { value: 'MACEDONIA', label: 'MACEDONIA' },
  { value: 'MADAGASCAR', label: 'MADAGASCAR' },
  { value: 'MALAWI', label: 'MALAWI' },
  { value: 'MALAYSIA', label: 'MALAYSIA' },
  { value: 'MALDIVES', label: 'MALDIVES' },
  { value: 'MALI', label: 'MALI' },
  { value: 'MALTA', label: 'MALTA' },
  { value: 'MARSHALL ISLANDS', label: 'MARSHALL ISLANDS' },
  { value: 'MARTINIQUE', label: 'MARTINIQUE' },
  { value: 'MAURITANIA', label: 'MAURITANIA' },
  { value: 'MAURITIUS', label: 'MAURITIUS' },
  { value: 'MAYOTTE', label: 'MAYOTTE' },
  { value: 'MEXICO', label: 'MEXICO' },
  { value: 'MICRONESIA', label: 'MICRONESIA' },
  { value: 'MOLDOVA', label: 'MOLDOVA' },
  { value: 'MONACO', label: 'MONACO' },
  { value: 'MONGOLIA', label: 'MONGOLIA' },
  { value: 'MONTENEGRO', label: 'MONTENEGRO' },
  { value: 'MONTSERRAT', label: 'MONTSERRAT' },
  { value: 'MOROCCO', label: 'MOROCCO' },
  { value: 'MOZAMBIQUE', label: 'MOZAMBIQUE' },
  { value: 'MYANMAR', label: 'MYANMAR' },
  { value: 'NAMIBIA', label: 'NAMIBIA' },
  { value: 'NAURU', label: 'NAURU' },
  { value: 'NEPAL', label: 'NEPAL' },
  { value: 'NETHERLANDS', label: 'NETHERLANDS' },
  { value: 'NEW CALEDONIA', label: 'NEW CALEDONIA' },
  { value: 'NEW ZEALAND', label: 'NEW ZEALAND' },
  { value: 'NICARAGUA', label: 'NICARAGUA' },
  { value: 'NIGER', label: 'NIGER' },
  { value: 'NIGERIA', label: 'NIGERIA' },
  { value: 'NIUE', label: 'NIUE' },
  { value: 'NORFOLK ISLAND', label: 'NORFOLK ISLAND' },
  { value: 'NORTHERN MARIANA ISLANDS', label: 'NORTHERN MARIANA ISLANDS' },
  { value: 'NORWAY', label: 'NORWAY' },
  { value: 'OMAN', label: 'OMAN' },
  { value: 'PAKISTAN', label: 'PAKISTAN' },
  { value: 'PALAU', label: 'PALAU' },
  { value: 'PALESTINE', label: 'PALESTINE' },
  { value: 'PANAMA', label: 'PANAMA' },
  { value: 'PAPUA NEW GUINEA', label: 'PAPUA NEW GUINEA' },
  { value: 'PARAGUAY', label: 'PARAGUAY' },
  { value: 'PERU', label: 'PERU' },
  { value: 'PHILIPPINES', label: 'PHILIPPINES' },
  { value: 'PITCAIRN', label: 'PITCAIRN' },
  { value: 'POLAND', label: 'POLAND' },
  { value: 'PORTUGAL', label: 'PORTUGAL' },
  { value: 'PUERTO RICO', label: 'PUERTO RICO' },
  { value: 'QATAR', label: 'QATAR' },
  { value: 'REUNION', label: 'REUNION' },
  { value: 'ROMANIA', label: 'ROMANIA' },
  { value: 'RUSSIA', label: 'RUSSIA' },
  { value: 'RWANDA', label: 'RWANDA' },
  { value: 'SAINT HELENA', label: 'SAINT HELENA' },
  { value: 'SAINT KITTS AND NEVIS', label: 'SAINT KITTS AND NEVIS' },
  { value: 'SAINT LUCIA', label: 'SAINT LUCIA' },
  { value: 'SAINT MARTIN', label: 'SAINT MARTIN' },
  { value: 'SAINT PIERRE AND MIQUELON', label: 'SAINT PIERRE AND MIQUELON' },
  { value: 'SAINT VINCENT AND THE GRENADINES', label: 'SAINT VINCENT AND THE GRENADINES' },
  { value: 'SAMOA', label: 'SAMOA' },
  { value: 'SAN MARINO', label: 'SAN MARINO' },
  { value: 'SAO TOME AND PRINCIPE', label: 'SAO TOME AND PRINCIPE' },
  { value: 'SAUDI ARABIA', label: 'SAUDI ARABIA' },
  { value: 'SENEGAL', label: 'SENEGAL' },
  { value: 'SERBIA', label: 'SERBIA' },
  { value: 'SEYCHELLES', label: 'SEYCHELLES' },
  { value: 'SIERRA LEONE', label: 'SIERRA LEONE' },
  { value: 'SINGAPORE', label: 'SINGAPORE' },
  { value: 'SINT MAARTEN', label: 'SINT MAARTEN' },
  { value: 'SLOVAKIA', label: 'SLOVAKIA' },
  { value: 'SLOVENIA', label: 'SLOVENIA' },
  { value: 'SOLOMON ISLANDS', label: 'SOLOMON ISLANDS' },
  { value: 'SOMALIA', label: 'SOMALIA' },
  { value: 'SOUTH AFRICA', label: 'SOUTH AFRICA' },
  { value: 'SOUTH GEORGIA AND SOUTH SANDWICH ISLANDS', label: 'SOUTH GEORGIA AND SOUTH SANDWICH ISLANDS' },
  { value: 'SOUTH SUDAN', label: 'SOUTH SUDAN' },
  { value: 'SPAIN', label: 'SPAIN' },
  { value: 'SRI LANKA', label: 'SRI LANKA' },
  { value: 'SUDAN', label: 'SUDAN' },
  { value: 'SURINAME', label: 'SURINAME' },
  { value: 'SVALBARD AND JAN MAYEN', label: 'SVALBARD AND JAN MAYEN' },
  { value: 'SWAZILAND', label: 'SWAZILAND' },
  { value: 'SWEDEN', label: 'SWEDEN' },
  { value: 'SWITZERLAND', label: 'SWITZERLAND' },
  { value: 'SYRIA', label: 'SYRIA' },
  { value: 'TAIWAN', label: 'TAIWAN' },
  { value: 'TAJIKISTAN', label: 'TAJIKISTAN' },
  { value: 'TANZANIA', label: 'TANZANIA' },
  { value: 'THAILAND', label: 'THAILAND' },
  { value: 'TIMOR-LESTE', label: 'TIMOR-LESTE' },
  { value: 'TOGO', label: 'TOGO' },
  { value: 'TOKELAU', label: 'TOKELAU' },
  { value: 'TONGA', label: 'TONGA' },
  { value: 'TRINIDAD AND TOBAGO', label: 'TRINIDAD AND TOBAGO' },
  { value: 'TUNISIA', label: 'TUNISIA' },
  { value: 'TURKEY', label: 'TURKEY' },
  { value: 'TURKMENISTAN', label: 'TURKMENISTAN' },
  { value: 'TURKS AND CAICOS ISLANDS', label: 'TURKS AND CAICOS ISLANDS' },
  { value: 'TUVALU', label: 'TUVALU' },
  { value: 'UGANDA', label: 'UGANDA' },
  { value: 'UKRAINE', label: 'UKRAINE' },
  { value: 'UNITED ARAB EMIRATES', label: 'UNITED ARAB EMIRATES' },
  { value: 'UNITED KINGDOM', label: 'UNITED KINGDOM' },
  { value: 'UNITED STATES', label: 'UNITED STATES' },
  { value: 'UNITED STATES MINOR OUTLYING ISLANDS', label: 'UNITED STATES MINOR OUTLYING ISLANDS' },
  { value: 'URUGUAY', label: 'URUGUAY' },
  { value: 'US VIRGIN ISLANDS', label: 'US VIRGIN ISLANDS' },
  { value: 'UZBEKISTAN', label: 'UZBEKISTAN' },
  { value: 'VANUATU', label: 'VANUATU' },
  { value: 'VATICAN CITY', label: 'VATICAN CITY' },
  { value: 'VENEZUELA', label: 'VENEZUELA' },
  { value: 'VIETNAM', label: 'VIETNAM' },
  { value: 'WALLIS AND FUTUNA', label: 'WALLIS AND FUTUNA' },
  { value: 'WESTERN SAHARA', label: 'WESTERN SAHARA' },
  { value: 'YEMEN', label: 'YEMEN' },
  { value: 'ZAMBIA', label: 'ZAMBIA' },
  { value: 'ZIMBABWE', label: 'ZIMBABWE' },
];

const airlines = [
  { value: 'AERO DILI', label: 'AERO DILI' },
  { value: 'AEROFLOT', label: 'AEROFLOT' },
  { value: 'AERO INTERNATIONAL', label: 'AERO INTERNATIONAL' },
  { value: 'AEROLINEAS ARGENTINAS', label: 'AEROLINEAS ARGENTINAS' },
  { value: 'AEROMEXICO', label: 'AEROMEXICO' },
  { value: 'AEROSTAN', label: 'AEROSTAN' },
  { value: 'AEROTRANSCARGO', label: 'AEROTRANSCARGO' },
  { value: 'AIR ALLIANCE', label: 'AIR ALLIANCE' },
  { value: 'AIR ARABIA', label: 'AIR ARABIA' },
  { value: 'AIRASIA BERHAD', label: 'AIRASIA BERHAD' },
  { value: 'AIRASIA X', label: 'AIRASIA X' },
  { value: 'AIR BALTIC', label: 'AIR BALTIC' },
  { value: 'AIR BELGIUM (HONGYUAN GROUP LIVERY)', label: 'AIR BELGIUM (HONGYUAN GROUP LIVERY)' },
  { value: 'AIR BUSAN', label: 'AIR BUSAN' },
  { value: 'AIR CALEDONIE', label: 'AIR CALEDONIE' },
  { value: 'AIR CANADA', label: 'AIR CANADA' },
  { value: 'AIR CHINA', label: 'AIR CHINA' },
  { value: 'AIR FRANCE', label: 'AIR FRANCE' },
  { value: 'AIR HAMBURG', label: 'AIR HAMBURG' },
  { value: 'AIRHUB AIRLINES MAOKA', label: 'AIRHUB AIRLINES MAOKA' },
  { value: 'AIR INDIA', label: 'AIR INDIA' },
  { value: 'AIR MACAU', label: 'AIR MACAU' },
  { value: 'AIR MAURITIUS', label: 'AIR MAURITIUS' },
  { value: 'AIR NEW ZEALAND', label: 'AIR NEW ZEALAND' },
  { value: 'AIR NIUGINI', label: 'AIR NIUGINI' },
  { value: 'AIRNORTH', label: 'AIRNORTH' },
  { value: 'AIR SIAL', label: 'AIR SIAL' },
  { value: 'AIR TAHITI', label: 'AIR TAHITI' },
  { value: 'ALASKA AIRLINES', label: 'ALASKA AIRLINES' },
  { value: 'ALEXANDRIA AIRLINES', label: 'ALEXANDRIA AIRLINES' },
  { value: 'ALLIANCE AIRLINES', label: 'ALLIANCE AIRLINES' },
  { value: 'ALL NIPPON AIRWAYS', label: 'ALL NIPPON AIRWAYS' },
  { value: 'AMERICAN AIRLINES', label: 'AMERICAN AIRLINES' },
  { value: 'ASG BUSINESS AVIATION', label: 'ASG BUSINESS AVIATION' },
  { value: 'ASIANA AIRLINES', label: 'ASIANA AIRLINES' },
  { value: 'ASL AIRLINES', label: 'ASL AIRLINES' },
  { value: 'ASTRAL AVIATION', label: 'ASTRAL AVIATION' },
  { value: 'ATLAS AIR', label: 'ATLAS AIR' },
  { value: 'BAMBOO AIRWAYS', label: 'BAMBOO AIRWAYS' },
  { value: 'BANGKOK AIRWAYS', label: 'BANGKOK AIRWAYS' },
  { value: 'BATIK AIR', label: 'BATIK AIR' },
  { value: 'BATIK AIR MALAYSIA', label: 'BATIK AIR MALAYSIA' },
  { value: 'BBN AIRLINES INDONESIA', label: 'BBN AIRLINES INDONESIA' },
  { value: 'BESTFLY', label: 'BESTFLY' },
  { value: 'BIMAN BANGLADESH AIRLINES', label: 'BIMAN BANGLADESH AIRLINES' },
  { value: 'BLUEBIRD NORDIC', label: 'BLUEBIRD NORDIC' },
  { value: 'BLUORBIT', label: 'BLUORBIT' },
  { value: 'BRITISH AIRWAYS', label: 'BRITISH AIRWAYS' },
  { value: 'CAMBODIA AIRWAYS', label: 'CAMBODIA AIRWAYS' },
  { value: 'CAPITAL AIRLINES', label: 'CAPITAL AIRLINES' },
  { value: 'CAREFLIGHT', label: 'CAREFLIGHT' },
  { value: 'CARGOLUX', label: 'CARGOLUX' },
  { value: 'CATHAY PACIFIC AIRWAYS', label: 'CATHAY PACIFIC AIRWAYS' },
  { value: 'CEBU PACIFIC AIR', label: 'CEBU PACIFIC AIR' },
  { value: 'CENTRAL AIRLINES', label: 'CENTRAL AIRLINES' },
  { value: 'CHINA AIR CARGO', label: 'CHINA AIR CARGO' },
  { value: 'CHINA AIRLINES', label: 'CHINA AIRLINES' },
  { value: 'CHINA CARGO AIRLINES', label: 'CHINA CARGO AIRLINES' },
  { value: 'CHINA CENTRAL LONGHAO AIRLINES', label: 'CHINA CENTRAL LONGHAO AIRLINES' },
  { value: 'CHINA EASTERN AIRLINES', label: 'CHINA EASTERN AIRLINES' },
  { value: 'CHINA SOUTHERN AIRLINES', label: 'CHINA SOUTHERN AIRLINES' },
  { value: 'CITILINK', label: 'CITILINK' },
  { value: 'COMPANIA NATIONALA DE TRANSPORTUEU AERIENE', label: 'COMPANIA NATIONALA DE TRANSPORTUEU AERIENE' },
  { value: 'DELTA AIR LINES', label: 'DELTA AIR LINES' },
  { value: 'DHL AIR', label: 'DHL AIR' },
  { value: 'EASY CHARTER', label: 'EASY CHARTER' },
  { value: 'EGYPTAIR', label: 'EGYPTAIR' },
  { value: 'EMIRATES', label: 'EMIRATES' },
  { value: 'ETHIOPIAN AIRLINES', label: 'ETHIOPIAN AIRLINES' },
  { value: 'ETIHAD AIRWAYS', label: 'ETIHAD AIRWAYS' },
  { value: 'EVA AIR', label: 'EVA AIR' },
  { value: 'FEDERAL EXPRESS CORPORATION', label: 'FEDERAL EXPRESS CORPORATION' },
  { value: 'FIJI AIRWAYS', label: 'FIJI AIRWAYS' },
  { value: 'FIREFLY', label: 'FIREFLY' },
  { value: 'FLEXFLIGHT', label: 'FLEXFLIGHT' },
  { value: 'FLY BAGHDAD', label: 'FLY BAGHDAD' },
  { value: 'FLYDUBAI', label: 'FLYDUBAI' },
  { value: 'FLYNAS', label: 'FLYNAS' },
  { value: 'GARUDA INDONESIA', label: 'GARUDA INDONESIA' },
  { value: 'GO FIRST', label: 'GO FIRST' },
  { value: 'GULF AIR', label: 'GULF AIR' },
  { value: 'HAINAN AIRLINES', label: 'HAINAN AIRLINES' },
  { value: 'HARMONY JETS', label: 'HARMONY JETS' },
  { value: 'HAWAIIAN AIRLINES', label: 'HAWAIIAN AIRLINES' },
  { value: 'HIMALAYA AIRLINES', label: 'HIMALAYA AIRLINES' },
  { value: 'HONG KONG AIRLINES', label: 'HONG KONG AIRLINES' },
  { value: 'IBERIA', label: 'IBERIA' },
  { value: 'ICELANDAIR', label: 'ICELANDAIR' },
  { value: 'INDIGO', label: 'INDIGO' },
  { value: 'INDONESIA AIRASIA', label: 'INDONESIA AIRASIA' },
  { value: 'JAPAN AIRLINES', label: 'JAPAN AIRLINES' },
  { value: 'JEJU AIR', label: 'JEJU AIR' },
  { value: 'JETBLUE AIRWAYS', label: 'JETBLUE AIRWAYS' },
  { value: 'JET EDGE', label: 'JET EDGE' },
  { value: 'JETSMART AIRLINES', label: 'JETSMART AIRLINES' },
  { value: 'JETSTAR AIRWAYS', label: 'JETSTAR AIRWAYS' },
  { value: 'JETSTAR ASIA AIRWAYS', label: 'JETSTAR ASIA AIRWAYS' },
  { value: 'JIN AIR', label: 'JIN AIR' },
  { value: 'JUNEYAO AIRLINES', label: 'JUNEYAO AIRLINES' },
  { value: 'KARGO XPRESS', label: 'KARGO XPRESS' },
  { value: 'KLM', label: 'KLM' },
  { value: 'K-MILE AIR', label: 'K-MILE AIR' },
  { value: 'KOREAN AIR', label: 'KOREAN AIR' },
  { value: 'KUWAIT AIRWAYS', label: 'KUWAIT AIRWAYS' },
  { value: 'LAO AIRLINES', label: 'LAO AIRLINES' },
  { value: 'LION AIR', label: 'LION AIR' },
  { value: 'LUCKY AIR', label: 'LUCKY AIR' },
  { value: 'LUFTHANSA', label: 'LUFTHANSA' },
  { value: 'LYNDEN AIR CARGO', label: 'LYNDEN AIR CARGO' },
  { value: 'MALAYSIA AIRLINES', label: 'MALAYSIA AIRLINES' },
  { value: 'MALINDO AIR', label: 'MALINDO AIR' },
  { value: 'MANDARIN AIRLINES', label: 'MANDARIN AIRLINES' },
  { value: 'MASWINGS SDN BHD', label: 'MASWINGS SDN BHD' },
  { value: 'MAXIMUS AIRLINES', label: 'MAXIMUS AIRLINES' },
  { value: 'MESK AIR', label: 'MESK AIR' },
  { value: 'MOTOR SICH AIRLINES', label: 'MOTOR SICH AIRLINES' },
  { value: 'MYAIRLINE', label: 'MYAIRLINE' },
  { value: 'MYANMAR AIRWAYS INTERNATIONAL', label: 'MYANMAR AIRWAYS INTERNATIONAL' },
  { value: 'MY FREIGHTER', label: 'MY FREIGHTER' },
  { value: 'MY INDO AIRLINES', label: 'MY INDO AIRLINES' },
  { value: 'MY JET XPRESS', label: 'MY JET XPRESS' },
  { value: 'NAM AIR', label: 'NAM AIR' },
  { value: 'NANSHAN JET', label: 'NANSHAN JET' },
  { value: 'NATIONAL AIRLINES', label: 'NATIONAL AIRLINES' },
  { value: 'NAURU AIRLINES', label: 'NAURU AIRLINES' },
  { value: 'NEPAL AIRLINES', label: 'NEPAL AIRLINES' },
  { value: 'NETJETS', label: 'NETJETS' },
  { value: 'NETWORK AVIATION', label: 'NETWORK AVIATION' },
  { value: 'NOTHERN AIR CARGO', label: 'NOTHERN AIR CARGO' },
  { value: 'OMAN AIR', label: 'OMAN AIR' },
  { value: 'OMNI AIR INTERNATIONAL', label: 'OMNI AIR INTERNATIONAL' },
  { value: 'PAKISTAN INTERNATIONAL AIRLINES', label: 'PAKISTAN INTERNATIONAL AIRLINES' },
  { value: 'PEGASUS ELITE AVIATION', label: 'PEGASUS ELITE AVIATION' },
  { value: 'PELITA AIR', label: 'PELITA AIR' },
  { value: 'PHILIPPINE AIRLINES', label: 'PHILIPPINE AIRLINES' },
  { value: 'PHILIPPINES AIRASIA', label: 'PHILIPPINES AIRASIA' },
  { value: 'PRIVATE OWNER', label: 'PRIVATE OWNER' },
  { value: 'PROPAIR INC', label: 'PROPAIR INC' },
  { value: 'QANTAS AIRWAYS', label: 'QANTAS AIRWAYS' },
  { value: 'QANTASLINK', label: 'QANTASLINK' },
  { value: 'QATAR AIRWAYS', label: 'QATAR AIRWAYS' },
  { value: 'QATAR EXECUTIVE', label: 'QATAR EXECUTIVE' },
  { value: 'RAYA AIRWAYS', label: 'RAYA AIRWAYS' },
  { value: 'REDSTAR AVIATION', label: 'REDSTAR AVIATION' },
  { value: 'RGA-BLACK STONE AIRLINES', label: 'RGA-BLACK STONE AIRLINES' },
  { value: 'RIMBUN AIR', label: 'RIMBUN AIR' },
  { value: 'ROYAL AIRWAYS', label: 'ROYAL AIRWAYS' },
  { value: 'ROYAL BRUNEI AIRLINES', label: 'ROYAL BRUNEI AIRLINES' },
  { value: 'SAINT BARTH COMMUTER', label: 'SAINT BARTH COMMUTER' },
  { value: 'SALAMAIR', label: 'SALAMAIR' },
  { value: 'SAUDIA', label: 'SAUDIA' },
  { value: 'SCANDINAVIAN AIRLINES SYSTEM', label: 'SCANDINAVIAN AIRLINES SYSTEM' },
  { value: 'SCOOT', label: 'SCOOT' },
  { value: 'SERVIZI AEREI', label: 'SERVIZI AEREI' },
  { value: 'SF AIRLINES', label: 'SF AIRLINES' },
  { value: 'SHANDONG AIRLINES', label: 'SHANDONG AIRLINES' },
  { value: 'SHENZEN AIRLINES', label: 'SHENZEN AIRLINES' },
  { value: 'SICHUAN AIRLINES', label: 'SICHUAN AIRLINES' },
  { value: 'SILK WAY AIRLINES', label: 'SILK WAY AIRLINES' },
  { value: 'SILK WAY WEST AIRLINES', label: 'SILK WAY WEST AIRLINES' },
  { value: 'SINGAPORE - AIR FORCE', label: 'SINGAPORE - AIR FORCE' },
  { value: 'SINGAPORE AIRLINES', label: 'SINGAPORE AIRLINES' },
  { value: 'SKY ANGKOR AIRLINES', label: 'SKY ANGKOR AIRLINES' },
  { value: 'SMARTLYNX AIRLINES', label: 'SMARTLYNX AIRLINES' },
  { value: 'SOLOMON AIRLINES', label: 'SOLOMON AIRLINES' },
  { value: 'SPICEJET', label: 'SPICEJET' },
  { value: 'SRILANKAN AIRLINES', label: 'SRILANKAN AIRLINES' },
  { value: 'SRIWIJAYA AIR', label: 'SRIWIJAYA AIR' },
  { value: 'STARLUX AIRLINES', label: 'STARLUX AIRLINES' },
  { value: 'STP AIRWAYS', label: 'STP AIRWAYS' },
  { value: 'SUNEXPRESS', label: 'SUNEXPRESS' },
  { value: 'SUPER AIR JET', label: 'SUPER AIR JET' },
  { value: 'SWISS', label: 'SWISS' },
  { value: 'TACA INTERNATIONAL AIRLINES', label: 'TACA INTERNATIONAL AIRLINES' },
  { value: 'TAG AVIATION MALTA', label: 'TAG AVIATION MALTA' },
  { value: 'TAP AIR PORTUGAL', label: 'TAP AIR PORTUGAL' },
  { value: 'THAI AIRASIA', label: 'THAI AIRASIA' },
  { value: 'THAI AIRWAYS', label: 'THAI AIRWAYS' },
  { value: 'THAI LION AIR', label: 'THAI LION AIR' },
  { value: 'THAI SMILE', label: 'THAI SMILE' },
  { value: 'TIANJIN AIR CARGO', label: 'TIANJIN AIR CARGO' },
  { value: 'TITAN AIRWAYS (TCS WORLD TRAVEL LIVERY)', label: 'TITAN AIRWAYS (TCS WORLD TRAVEL LIVERY)' },
  { value: 'TRANSNUSA', label: 'TRANSNUSA' },
  { value: 'TRAVYA', label: 'TRAVYA' },
  { value: 'TRIGANA AIR', label: 'TRIGANA AIR' },
  { value: 'TRI-MG INTRA ASIA AIRLINES', label: 'TRI-MG INTRA ASIA AIRLINES' },
  { value: 'TURKISH AIRLINES', label: 'TURKISH AIRLINES' },
  { value: 'TURKMENISTAN AIRLINES', label: 'TURKMENISTAN AIRLINES' },
  { value: 'TWAY AIR', label: 'TWAY AIR' },
  { value: 'UNITED AIRLINES', label: 'UNITED AIRLINES' },
  { value: 'UNITED NIGERIA AIRLINES', label: 'UNITED NIGERIA AIRLINES' },
  { value: 'UNITED STATES - US AIR FORCE (USAF)', label: 'UNITED STATES - US AIR FORCE (USAF)' },
  { value: 'UPS AIRLINES', label: 'UPS AIRLINES' },
  { value: 'UZBEKISTAN AIRWAYS', label: 'UZBEKISTAN AIRWAYS' },
  { value: 'VIETJET', label: 'VIETJET' },
  { value: 'VIETNAM AIRLINES', label: 'VIETNAM AIRLINES' },
  { value: 'VIRGIN AUSTRALIA', label: 'VIRGIN AUSTRALIA' },
  { value: 'VISTAJET', label: 'VISTAJET' },
  { value: 'VISTARA', label: 'VISTARA' },
  { value: 'VOLUXIS', label: 'VOLUXIS' },
  { value: 'WAMOS AIR', label: 'WAMOS AIR' },
  { value: 'WINGS AIR', label: 'WINGS AIR' },
  { value: 'WORLD CARGO AIRLINES', label: 'WORLD CARGO AIRLINES' },
  { value: 'XIAMEN AIRLINES', label: 'XIAMEN AIRLINES' },
  { value: 'YTO CARGO AIRLINES', label: 'YTO CARGO AIRLINES' },
  { value: 'ZETAVIA', label: 'ZETAVIA' },
  { value: 'ZHEZIANG LOONG AIRLINES', label: 'ZHEZIANG LOONG AIRLINES' }
];

// Mapping from airline names to IATA codes (based on API response)
const airlineToIataMap: Record<string, string> = {
  'AERO DILI': '8G',
  'AEROFLOT': 'SU',
  'AERO INTERNATIONAL': 'AX',
  'AEROLINEAS ARGENTINAS': 'AR',
  'AEROMEXICO': 'AM',
  'AEROSTAN': 'BS',
  'AEROTRANSCARGO': 'F5',
  'AIR ALLIANCE': 'AY',
  'AIR ARABIA': 'G9',
  'AIRASIA BERHAD': 'AK',
  'AIRASIA X': 'XJ',
  'AIR BALTIC': 'BT',
  'AIR BELGIUM (HONGYUAN GROUP LIVERY)': 'KF',
  'AIR BUSAN': 'BX',
  'AIR CALEDONIE': 'TY',
  'AIR CANADA': 'AC',
  'AIR CHINA': 'CA',
  'AIR FRANCE': 'AF',
  'AIR HAMBURG': 'AH',
  'AIRHUB AIRLINES MAOKA': 'RE',
  'AIR INDIA': 'AI',
  'AIR MACAU': 'NX',
  'AIR MAURITIUS': 'MK',
  'AIR NEW ZEALAND': 'NZ',
  'AIR NIUGINI': 'PX',
  'AIRNORTH': 'TL',
  'AIR SIAL': 'PF',
  'AIR TAHITI': 'VT',
  'ALASKA AIRLINES': 'AS',
  'ALEXANDRIA AIRLINES': 'DQ',
  'ALLIANCE AIRLINES': 'QQ',
  'ALL NIPPON AIRWAYS': 'NH',
  'AMERICAN AIRLINES': 'AA',
  'ASG BUSINESS AVIATION': 'ES',
  'ASIANA AIRLINES': 'OZ',
  'ASL AIRLINES': 'SX',
  'ASTRAL AVIATION': '8V',
  'ATLAS AIR': '5Y',
  'BAMBOO AIRWAYS': 'QH',
  'BANGKOK AIRWAYS': 'PG',
  'BATIK AIR': 'ID',
  'BATIK AIR MALAYSIA': 'OD',
  'BBN AIRLINES INDONESIA': '7B',
  'BESTFLY': 'XB',
  'BIMAN BANGLADESH AIRLINES': 'BG',
  'BLUEBIRD NORDIC': 'BO',
  'BLUORBIT': 'BD',
  'BRITISH AIRWAYS': 'BA',
  'CAMBODIA AIRWAYS': 'KR',
  'CAPITAL AIRLINES': 'JD',
  'CAREFLIGHT': 'CF',
  'CARGOLUX': 'CV',
  'CATHAY PACIFIC AIRWAYS': 'CX',
  'CEBU PACIFIC AIR': '5J',
  'CENTRAL AIRLINES': 'I9',
  'CHINA AIR CARGO': 'ZY',
  'CHINA AIRLINES': 'CI',
  'CHINA CARGO AIRLINES': 'CK',
  'CHINA CENTRAL LONGHAO AIRLINES': 'GI',
  'CHINA EASTERN AIRLINES': 'MU',
  'CHINA SOUTHERN AIRLINES': 'CZ',
  'CITILINK': 'QG',
  'COMPANIA NATIONALA DE TRANSPORTUEU AERIENE': 'RO',
  'DELTA AIR LINES': 'DL',
  'DHL AIR': 'D0',
  'EASY CHARTER': 'RD',
  'EGYPTAIR': 'MS',
  'EMIRATES': 'EK',
  'ETHIOPIAN AIRLINES': 'ET',
  'ETIHAD AIRWAYS': 'EY',
  'EVA AIR': 'BR',
  'FEDERAL EXPRESS CORPORATION': 'FX',
  'FIJI AIRWAYS': 'FJ',
  'FIREFLY': 'FM',
  'FLEXFLIGHT': 'W2',
  'FLY BAGHDAD': 'IF',
  'FLYDUBAI': 'FZ',
  'FLYNAS': 'XY',
  'GARUDA INDONESIA': 'GA',
  'GO FIRST': 'G8',
  'GULF AIR': 'GF',
  'HAINAN AIRLINES': 'HU',
  'HARMONY JETS': 'HM',
  'HAWAIIAN AIRLINES': 'HA',
  'HIMALAYA AIRLINES': 'H9',
  'HONG KONG AIRLINES': 'HX',
  'IBERIA': 'IB',
  'ICELANDAIR': 'FI',
  'INDIGO': '6E',
  'INDONESIA AIRASIA': 'QZ',
  'JAPAN AIRLINES': 'JL',
  'JEJU AIR': '7C',
  'JETBLUE AIRWAYS': 'B6',
  'JET EDGE': 'ED',
  'JETSMART AIRLINES': 'JA',
  'JETSTAR AIRWAYS': 'JQ',
  'JETSTAR ASIA AIRWAYS': '3K',
  'JIN AIR': 'LJ',
  'JUNEYAO AIRLINES': 'HO',
  'KARGO XPRESS': 'WW',
  'KLM': 'KL',
  'K-MILE AIR': '8K',
  'KOREAN AIR': 'KE',
  'KUWAIT AIRWAYS': 'KU',
  'LAO AIRLINES': 'QV',
  'LION AIR': 'JT',
  'LUCKY AIR': '8L',
  'LUFTHANSA': 'LH',
  'LYNDEN AIR CARGO': 'L2',
  'MALAYSIA AIRLINES': 'MH',
  'MALINDO AIR': 'OD',
  'MANDARIN AIRLINES': 'AE',
  'MASWINGS SDN BHD': 'MY',
  'MAXIMUS AIRLINES': '6M',
  'MESK AIR': 'MA',
  'MOTOR SICH AIRLINES': 'M9',
  'MYAIRLINE': 'Z9',
  'MYANMAR AIRWAYS INTERNATIONAL': '8M',
  'MY FREIGHTER': 'C6',
  'MY INDO AIRLINES': '2Y',
  'MY JET XPRESS': 'N7',
  'NAM AIR': 'IN',
  'NANSHAN JET': 'B5',
  'NATIONAL AIRLINES': 'N8',
  'NAURU AIRLINES': 'ON',
  'NEPAL AIRLINES': 'RA',
  'NETJETS': '1I',
  'NETWORK AVIATION': 'ZF',
  'NOTHERN AIR CARGO': 'NC',
  'OMAN AIR': 'WY',
  'OMNI AIR INTERNATIONAL': 'OY',
  'PAKISTAN INTERNATIONAL AIRLINES': 'PK',
  'PEGASUS ELITE AVIATION': 'PE',
  'PELITA AIR': 'IP',
  'PHILIPPINE AIRLINES': 'PR',
  'PHILIPPINES AIRASIA': 'Z2',
  'PRIVATE OWNER': 'B3',
  'PROPAIR INC': 'PP',
  'QANTAS AIRWAYS': 'QF',
  'QANTASLINK': 'NW',
  'QATAR AIRWAYS': 'QR',
  'QATAR EXECUTIVE': 'QE',
  'RAYA AIRWAYS': 'TH',
  'REDSTAR AVIATION': 'RH',
  'RGA-BLACK STONE AIRLINES': 'RG',
  'RIMBUN AIR': 'RI',
  'ROYAL AIRWAYS': 'CH',
  'ROYAL BRUNEI AIRLINES': 'BI',
  'SAINT BARTH COMMUTER': 'PV',
  'SALAMAIR': 'OV',
  'SAUDIA': 'SV',
  'SCANDINAVIAN AIRLINES SYSTEM': 'SK',
  'SCOOT': 'TR',
  'SERVIZI AEREI': 'SN',
  'SF AIRLINES': 'O3',
  'SHANDONG AIRLINES': 'SC',
  'SHENZEN AIRLINES': 'ZH',
  'SICHUAN AIRLINES': '3U',
  'SILK WAY AIRLINES': 'ZP',
  'SILK WAY WEST AIRLINES': '7L',
  'SINGAPORE - AIR FORCE': 'SA',
  'SINGAPORE AIRLINES': 'SQ',
  'SKY ANGKOR AIRLINES': 'ZA',
  'SMARTLYNX AIRLINES': '6Y',
  'SOLOMON AIRLINES': 'SB',
  'SPICEJET': 'SG',
  'SRILANKAN AIRLINES': 'UL',
  'SRIWIJAYA AIR': 'SJ',
  'STARLUX AIRLINES': 'JX',
  'STP AIRWAYS': '8F',
  'SUNEXPRESS': 'XQ',
  'SUPER AIR JET': 'IU',
  'SWISS': 'LX',
  'TACA INTERNATIONAL AIRLINES': 'TA',
  'TAG AVIATION MALTA': 'TE',
  'TAP AIR PORTUGAL': 'TP',
  'THAI AIRASIA': 'FD',
  'THAI AIRWAYS': 'TG',
  'THAI LION AIR': 'SL',
  'THAI SMILE': 'WE',
  'TIANJIN AIR CARGO': 'HT',
  'TITAN AIRWAYS (TCS WORLD TRAVEL LIVERY)': 'ZT',
  'TRANSNUSA': '8B',
  'TRAVYA': 'CE',
  'TRIGANA AIR': 'IL',
  'TRI-MG INTRA ASIA AIRLINES': 'GM',
  'TURKISH AIRLINES': 'TK',
  'TURKMENISTAN AIRLINES': 'T5',
  'TWAY AIR': 'TW',
  'UNITED AIRLINES': 'UA',
  'UNITED NIGERIA AIRLINES': 'UN',
  'UNITED STATES - US AIR FORCE (USAF)': 'RC',
  'UPS AIRLINES': '5X',
  'UZBEKISTAN AIRWAYS': 'HY',
  'VIETJET': 'VJ',
  'VIETNAM AIRLINES': 'VN',
  'VIRGIN AUSTRALIA': 'VA',
  'VISTAJET': '5V',
  'VISTARA': 'UK',
  'VOLUXIS': 'VX',
  'WAMOS AIR': 'EB',
  'WINGS AIR': 'IW',
  'WORLD CARGO AIRLINES': '3G',
  'XIAMEN AIRLINES': 'MF',
  'YTO CARGO AIRLINES': 'YG',
  'ZETAVIA': 'ZK',
  'ZHEZIANG LOONG AIRLINES': 'GJ'
};

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

const seaPorts = [
  { value: 'TTE - ACHMAD YANI PORT', label: 'TTE - ACHMAD YANI PORT' },
  { value: 'AMA - AMAMAPARE PORT', label: 'AMA - AMAMAPARE PORT' },
  { value: 'AGK - ANGGREK PORT', label: 'AGK - ANGGREK PORT' },
  { value: 'BCP - BAGAN SIAPI API PORT', label: 'BCP - BAGAN SIAPI API PORT' },
  { value: 'LAI - BANDAR BENTAN TELANI LAGOI PORT', label: 'LAI - BANDAR BENTAN TELANI LAGOI PORT' },
  { value: 'BLS - BANDAR SRI SETIA RAJA PORT', label: 'BLS - BANDAR SRI SETIA RAJA PORT' },
  { value: 'BCR - BATAM CENTRE FERRY TERMINAL', label: 'BCR - BATAM CENTRE FERRY TERMINAL' },
  { value: 'BUR - BATU AMPAR PORT', label: 'BUR - BATU AMPAR PORT' },
  { value: 'BPD - BELAKANG PADANG PORT', label: 'BPD - BELAKANG PADANG PORT' },
  { value: 'BLW - BELAWAN PORT', label: 'BLW - BELAWAN PORT' },
  { value: 'BEN - BENETE PORT', label: 'BEN - BENETE PORT' },
  { value: 'BKG - BENGKONG PORT', label: 'BKG - BENGKONG PORT' },
  { value: 'BOA - BENOA PORT', label: 'BOA - BENOA PORT' },
  { value: 'BIA - BIAK PORT', label: 'BIA - BIAK PORT' },
  { value: 'TKBJ - BIOMAS JAYA ABADI SPECIAL TERMINAL', label: 'TKBJ - BIOMAS JAYA ABADI SPECIAL TERMINAL' },
  { value: 'PLO - BOOM BARU PORT', label: 'PLO - BOOM BARU PORT' },
  { value: 'TKRB - BUATAN SPECIAL TERMINAL', label: 'TKRB - BUATAN SPECIAL TERMINAL' },
  { value: 'PLCL - CALANG PORT', label: 'PLCL - CALANG PORT' },
  { value: 'TKCI - CARGILL INDONESIA SPECIAL IMMIGRATION CHECKPOINT (TPI)', label: 'TKCI - CARGILL INDONESIA SPECIAL IMMIGRATION CHECKPOINT (TPI)' },
  { value: 'CEB - CELUKAN BAWANG PORT', label: 'CEB - CELUKAN BAWANG PORT' },
  { value: 'CRB - CIREBON PORT', label: 'CRB - CIREBON PORT' },
  { value: 'CTT - CITRA TRITUNAS PORT (HARBOUR BAY)', label: 'CTT - CITRA TRITUNAS PORT (HARBOUR BAY)' },
  { value: 'CIW - CIWANDAN PORT', label: 'CIW - CIWANDAN PORT' },
  { value: 'DUM - DUMAI PORT', label: 'DUM - DUMAI PORT' },
  { value: 'PNK - DWI KORA PORT', label: 'PNK - DWI KORA PORT' },
  { value: 'TKRF - FUTONG SPECIAL TERMINAL', label: 'TKRF - FUTONG SPECIAL TERMINAL' },
  { value: 'GNG - GARONGKONG PORT', label: 'GNG - GARONGKONG PORT' },
  { value: 'GNS - GUNUNG SITOLI PORT', label: 'GNS - GUNUNG SITOLI PORT' },
  { value: 'DJM - JAMBI PORT', label: 'DJM - JAMBI PORT' },
  { value: 'DJY - JAYAPURA PORT', label: 'DJY - JAYAPURA PORT' },
  { value: 'KAB - KABIL PORT', label: 'KAB - KABIL PORT' },
  { value: 'TKFI - KALIMANTAN FERRO INDUSTRY SPECIAL TERMINAL', label: 'TKFI - KALIMANTAN FERRO INDUSTRY SPECIAL TERMINAL' },
  { value: 'KDI - KENDARI PORT', label: 'KDI - KENDARI PORT' },
  { value: 'TUA - KISAR ISLAND SPECIAL TERMINAL', label: 'TUA - KISAR ISLAND SPECIAL TERMINAL' },
  { value: 'KBU - KOTA BARU PORT', label: 'KBU - KOTA BARU PORT' },
  { value: 'ENO - KUALA ENOK PORT', label: 'ENO - KUALA ENOK PORT' },
  { value: 'KUA - KUALA LANGSA PORT', label: 'KUA - KUALA LANGSA PORT' },
  { value: 'KTJ - KUALA TANJUNG PORT', label: 'KTJ - KUALA TANJUNG PORT' },
  { value: 'KTK - KUALA TUNGKAL PORT', label: 'KTK - KUALA TUNGKAL PORT' },
  { value: 'KUM - KUMAI PORT', label: 'KUM - KUMAI PORT' },
  { value: 'LBO - LABUAN BAJO PORT', label: 'LBO - LABUAN BAJO PORT' },
  { value: 'PLLU - LABUAN UKI PORT', label: 'PLLU - LABUAN UKI PORT' },
  { value: 'LSM - LAUREN SAY PORT', label: 'LSM - LAUREN SAY PORT' },
  { value: 'LBR - LEMBAR PORT', label: 'LBR - LEMBAR PORT' },
  { value: 'TUA - LETTI ISLAND SPECIAL TERMINAL', label: 'TUA - LETTI ISLAND SPECIAL TERMINAL' },
  { value: 'KGH - LHOKSEUMAWE PORT', label: 'KGH - LHOKSEUMAWE PORT' },
  { value: 'TUA - LIRANG ISLAND SPECIAL TERMINAL', label: 'TUA - LIRANG ISLAND SPECIAL TERMINAL' },
  { value: 'MLH - MALAHAYATI PORT', label: 'MLH - MALAHAYATI PORT' },
  { value: 'TRK - MALUNDUNG PORT', label: 'TRK - MALUNDUNG PORT' },
  { value: 'MDO - MANADO PORT', label: 'MDO - MANADO PORT' },
  { value: 'ACL - MARINA ANCOL PORT', label: 'ACL - MARINA ANCOL PORT' },
  { value: 'TKMB - MEDANA BAY MARINA TOURISM SPECIAL TERMINAL', label: 'TKMB - MEDANA BAY MARINA TOURISM SPECIAL TERMINAL' },
  { value: 'MKE - MERAUKE PORT', label: 'MKE - MERAUKE PORT' },
  { value: 'TUA - MOA ISLAND SPECIAL TERMINAL', label: 'TUA - MOA ISLAND SPECIAL TERMINAL' },
  { value: 'MSK - MUARA SABAK PORT', label: 'MSK - MUARA SABAK PORT' },
  { value: 'NON - NONGSA BATAM PORT', label: 'NON - NONGSA BATAM PORT' },
  { value: 'PAP - NUSANTARA PARE PARE PORT', label: 'PAP - NUSANTARA PARE PARE PORT' },
  { value: 'THA - NUSANTARA PORT', label: 'THA - NUSANTARA PORT' },
  { value: 'PBI - PADANG BAI SINGARAJA PORT', label: 'PBI - PADANG BAI SINGARAJA PORT' },
  { value: 'PRN - PANARUKAN PORT', label: 'PRN - PANARUKAN PORT' },
  { value: 'PGX - PANGKAL BALAM PORT', label: 'PGX - PANGKAL BALAM PORT' },
  { value: 'PJG - PANJANG PORT', label: 'PJG - PANJANG PORT' },
  { value: 'PTL - PANTOLOAN PORT', label: 'PTL - PANTOLOAN PORT' },
  { value: 'PAZ - PASURUAN PORT', label: 'PAZ - PASURUAN PORT' },
  { value: 'PMB - PATIMBAN PORT', label: 'PMB - PATIMBAN PORT' },
  { value: 'TKPP - PRIMA COAL TBK SPECIAL TERMINAL', label: 'TKPP - PRIMA COAL TBK SPECIAL TERMINAL' },
  { value: 'PRO - PROBOLINGGO PORT', label: 'PRO - PROBOLINGGO PORT' },
  { value: 'TKSS - PT ANEKA SARANA SENTOSA BENGKONG SPECIAL TERMINAL', label: 'TKSS - PT ANEKA SARANA SENTOSA BENGKONG SPECIAL TERMINAL' },
  { value: 'TKTL - PT BADAK NATURAL GAS LIQUEFACTION SPECIAL TERMINAL', label: 'TKTL - PT BADAK NATURAL GAS LIQUEFACTION SPECIAL TERMINAL' },
  { value: 'TBDM - PT. BINTANGDELAPAN MINERAL SPECIAL TERMINAL', label: 'TBDM - PT. BINTANGDELAPAN MINERAL SPECIAL TERMINAL' },
  { value: 'TBLR - PT BINTAN LAGOON RESORT SPECIAL TERMINAL', label: 'TBLR - PT BINTAN LAGOON RESORT SPECIAL TERMINAL' },
  { value: 'TKCG - PT CEMINDO GEMILANG SPECIAL TERMINAL', label: 'TKCG - PT CEMINDO GEMILANG SPECIAL TERMINAL' },
  { value: 'TCNS - PT CONCH NORTH SULAWESI CEMENT SPECIAL TERMINAL', label: 'TCNS - PT CONCH NORTH SULAWESI CEMENT SPECIAL TERMINAL' },
  { value: 'TDSL - PT. DONGGI SENORO LNG SPECIAL TERMINAL', label: 'TDSL - PT. DONGGI SENORO LNG SPECIAL TERMINAL' },
  { value: 'TKEU - PT. ENERGI UNGGUL PERSADA SPECIAL TERMINAL', label: 'TKEU - PT. ENERGI UNGGUL PERSADA SPECIAL TERMINAL' },
  { value: 'TKHN - PT HUADI NICKEL ALLOY INDONESIA SPECIAL TERMINAL', label: 'TKHN - PT HUADI NICKEL ALLOY INDONESIA SPECIAL TERMINAL' },
  { value: 'TKIK - PT. INDAH KIAT PULP AND PAPER SPECIAL TERMINAL', label: 'TKIK - PT. INDAH KIAT PULP AND PAPER SPECIAL TERMINAL' },
  { value: 'TIDM - PT INDOMINCO MANDIRI SPECIAL TERMINAL', label: 'TIDM - PT INDOMINCO MANDIRI SPECIAL TERMINAL' },
  { value: 'TKKM - PT KALTIM METHANOL INDUSTRI SPECIAL TERMINAL', label: 'TKKM - PT KALTIM METHANOL INDUSTRI SPECIAL TERMINAL' },
  { value: 'TLTT - PT KALTIM PRIMA COAL LUBUK TUTUNG SPECIAL PORT', label: 'TLTT - PT KALTIM PRIMA COAL LUBUK TUTUNG SPECIAL PORT' },
  { value: 'TTBA - PT KALTIM PRIMA COAL TANJUNG BARA SPECIAL PORT', label: 'TTBA - PT KALTIM PRIMA COAL TANJUNG BARA SPECIAL PORT' },
  { value: 'TKJA - PT KIDECO JAYA AGUNG SPECIAL TERMINAL', label: 'TKJA - PT KIDECO JAYA AGUNG SPECIAL TERMINAL' },
  { value: 'TKXX - PT KOBEXINDO CEMENT SPECIAL TERMINAL', label: 'TKXX - PT KOBEXINDO CEMENT SPECIAL TERMINAL' },
  { value: 'TMBA - PT MIFA BERSAUDARA SPECIAL TERMINAL', label: 'TMBA - PT MIFA BERSAUDARA SPECIAL TERMINAL' },
  { value: 'TKM - PT MULTI MINERAL INDONESIA PORT', label: 'TKM - PT MULTI MINERAL INDONESIA PORT' },
  { value: 'TPAU - PT. PANCA AMARA UTAMA SPECIAL TERMINAL', label: 'TPAU - PT. PANCA AMARA UTAMA SPECIAL TERMINAL' },
  { value: 'PMS - PT PELABUHAN MUARA SEMPARA SPECIAL TERMINAL', label: 'PMS - PT PELABUHAN MUARA SEMPARA SPECIAL TERMINAL' },
  { value: 'KBB - PT PERTAMINA BAUBAU BBM SPECIAL TERMINAL', label: 'KBB - PT PERTAMINA BAUBAU BBM SPECIAL TERMINAL' },
  { value: 'TPKT - PT PUPUK KALIMANTAN TIMUR SPECIAL TERMINAL', label: 'TPKT - PT PUPUK KALIMANTAN TIMUR SPECIAL TERMINAL' },
  { value: 'TKSD - PT SDIC PAPUA CEMENT INDONESIA SPECIAL TERMINAL', label: 'TKSD - PT SDIC PAPUA CEMENT INDONESIA SPECIAL TERMINAL' },
  { value: 'TKST - PT SEMEN TONASA SPECIAL TERMINAL', label: 'TKST - PT SEMEN TONASA SPECIAL TERMINAL' },
  { value: 'TKSP - PT SINAR WIJAYA PLYWOOD INDUSTRY SPECIAL TERMINAL', label: 'TKSP - PT SINAR WIJAYA PLYWOOD INDUSTRY SPECIAL TERMINAL' },
  { value: 'TKSW - PT. STEELINDO WAHANA PERKASA IMMIGRATION CHECKPOINT (TPIK)', label: 'TKSW - PT. STEELINDO WAHANA PERKASA IMMIGRATION CHECKPOINT (TPIK)' },
  { value: 'TKSI - PT SUMBER INDAH PERKASA SPECIAL TERMINAL', label: 'TKSI - PT SUMBER INDAH PERKASA SPECIAL TERMINAL' },
  { value: 'TTSL - PT TANJUNG SARANA LESTARI SPECIAL TERMINAL', label: 'TTSL - PT TANJUNG SARANA LESTARI SPECIAL TERMINAL' },
  { value: 'TKTS - PT TRITUNAS SINAR BENUA SPECIAL TERMINAL', label: 'TKTS - PT TRITUNAS SINAR BENUA SPECIAL TERMINAL' },
  { value: 'TKVI - PT VALE INDONESIA SPECIAL TERMINAL', label: 'TKVI - PT VALE INDONESIA SPECIAL TERMINAL' },
  { value: 'TWHW - PT WELL HARVEST WINNING ALUMINA REFINERY SPECIAL TERMINAL', label: 'TWHW - PT WELL HARVEST WINNING ALUMINA REFINERY SPECIAL TERMINAL' },
  { value: 'PBA - PULAU BAAI PORT', label: 'PBA - PULAU BAAI PORT' },
  { value: 'SBA - SABANG PORT', label: 'SBA - SABANG PORT' },
  { value: 'SRI - SAMARINDA PORT', label: 'SRI - SAMARINDA PORT' },
  { value: 'SMQ - SAMPIT PORT', label: 'SMQ - SAMPIT PORT' },
  { value: 'BIT - SAMUDERA BITUNG PORT', label: 'BIT - SAMUDERA BITUNG PORT' },
  { value: 'SXK - SAUMLAKI PORT', label: 'SXK - SAUMLAKI PORT' },
  { value: 'SKP - SEKUPANG PORT', label: 'SKP - SEKUPANG PORT' },
  { value: 'STA - SELAT LAMPA PORT', label: 'STA - SELAT LAMPA PORT' },
  { value: 'BPP - SEMAYANG PORT', label: 'BPP - SEMAYANG PORT' },
  { value: 'LBM - SERI UDANA LOBAM PORT', label: 'LBM - SERI UDANA LOBAM PORT' },
  { value: 'SSI - SIAK SRI INDRAPURA PORT', label: 'SSI - SIAK SRI INDRAPURA PORT' },
  { value: 'SLG - SIBOLGA PORT', label: 'SLG - SIBOLGA PORT' },
  { value: 'SNE - SINTETE PORT', label: 'SNE - SINTETE PORT' },
  { value: 'MAK - SOEKARNO-HATTA PORT', label: 'MAK - SOEKARNO-HATTA PORT' },
  { value: 'SOQ - SORONG PORT', label: 'SOQ - SORONG PORT' },
  { value: 'TPN - SRI BAYINTAN PORT', label: 'TPN - SRI BAYINTAN PORT' },
  { value: 'SBP - SRI BINTAN PURA PORT', label: 'SBP - SRI BINTAN PURA PORT' },
  { value: 'SKL - SUNDA KELAPA PORT', label: 'SKL - SUNDA KELAPA PORT' },
  { value: 'SUQ - SUNGAI GUNTUNG PORT', label: 'SUQ - SUNGAI GUNTUNG PORT' },
  { value: 'SGP - SUNGAI PAKNING BENGKALIS PORT', label: 'SGP - SUNGAI PAKNING BENGKALIS PORT' },
  { value: 'TAB - TABONEO PORT', label: 'TAB - TABONEO PORT' },
  { value: 'TKBP - TANGGUH LNG SPECIAL TERMINAL', label: 'TKBP - TANGGUH LNG SPECIAL TERMINAL' },
  { value: 'TBK - TANJUNG BALAI KARIMUN PORT', label: 'TBK - TANJUNG BALAI KARIMUN PORT' },
  { value: 'PLBT - TANJUNG BUTON PORT', label: 'PLBT - TANJUNG BUTON PORT' },
  { value: 'TES - TANJUNG EMAS PORT', label: 'TES - TANJUNG EMAS PORT' },
  { value: 'BLN - TANJUNG GUDANG PORT', label: 'BLN - TANJUNG GUDANG PORT' },
  { value: 'SPA - TANJUNG HARAPAN PORT', label: 'SPA - TANJUNG HARAPAN PORT' },
  { value: 'CXP - TANJUNG INTAN PORT', label: 'CXP - TANJUNG INTAN PORT' },
  { value: 'TGN - TANJUNG KALIAN PORT', label: 'TGN - TANJUNG KALIAN PORT' },
  { value: 'TEN - TANJUNG LONTAR TENAU PORT', label: 'TEN - TANJUNG LONTAR TENAU PORT' },
  { value: 'TMD - TANJUNG MEDANG BENGKALIS PORT', label: 'TMD - TANJUNG MEDANG BENGKALIS PORT' },
  { value: 'TPD - TANJUNG PANDAN PORT', label: 'TPD - TANJUNG PANDAN PORT' },
  { value: 'TJP - TANJUNG PERAK PORT', label: 'TJP - TANJUNG PERAK PORT' },
  { value: 'JKT - TANJUNG PRIOK PORT', label: 'JKT - TANJUNG PRIOK PORT' },
  { value: 'TAN - TANJUNG UBAN PORT', label: 'TAN - TANJUNG UBAN PORT' },
  { value: 'BJU - TANJUNG WANGI PORT', label: 'BJU - TANJUNG WANGI PORT' },
  { value: 'TMP - TAREMPA PORT', label: 'TMP - TAREMPA PORT' },
  { value: 'TBR - TELUK BAYUR PORT', label: 'TBR - TELUK BAYUR PORT' },
  { value: 'TSH - TELUK NIBUNG PORT', label: 'TSH - TELUK NIBUNG PORT' },
  { value: 'SNB - TELUK SENIMBA MARINA PORT', label: 'SNB - TELUK SENIMBA MARINA PORT' },
  { value: 'TBH - TEMBILAHAN PORT', label: 'TBH - TEMBILAHAN PORT' },
  { value: 'TRI - TRI SAKTI PORT', label: 'TRI - TRI SAKTI PORT' },
  { value: 'TKTT - TRI TUNAS UNGGUL TELUK', label: 'TKTT - TRI TUNAS UNGGUL TELUK' },
  { value: 'TUA - TUAL PORT', label: 'TUA - TUAL PORT' },
  { value: 'TUA - WETAR ISLAND SPECIAL TERMINAL', label: 'TUA - WETAR ISLAND SPECIAL TERMINAL' },
  { value: 'AMB - YOS SUDARSO AMBON PORT', label: 'AMB - YOS SUDARSO AMBON PORT' },
  { value: 'TKYN - YOUSHAN NICKEL INDONESIA SPECIAL IMMIGRATION CHECKPOINT (TPI)', label: 'TKYN - YOUSHAN NICKEL INDONESIA SPECIAL IMMIGRATION CHECKPOINT (TPI)' },
];

export default function FormPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('en');
  const [hasStoredQR, setHasStoredQR] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [storedQRData, setStoredQRData] = useState<StoredQRData | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStarted, setFormStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Re-added submissionResult and showQRModal for direct QR display (payment step temporarily disabled)
  const [submissionResult, setSubmissionResult] = useState<{
    qrCode?: { imageData?: string };
    submissionDetails?: { 
      submissionId?: string;
      arrivalCardNumber?: string;
      passengerDetails?: Record<string, unknown>;
    };
  } | null>(null);

  // Track form start when component mounts
  useEffect(() => {
    trackUserJourney('Form Page Loaded', 3);
    
    // Check for stored QR code
    if (hasValidStoredQR()) {
      setHasStoredQR(true);
    }
  }, []);

  // Handle language changes
  const handleLanguageChange = (newLanguage: Language) => {
    trackLanguageChange(newLanguage, language);
    setLanguage(newLanguage);
  };

  const handleViewQRClick = () => {
    const stored = getStoredQR();
    if (stored) {
      setStoredQRData(stored);
      setShowQRModal(true);
      trackButtonClick('View Stored QR', 'Form Page');
    }
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
      if (formData.currentStep < 5) {
        updateFormData('currentStep', formData.currentStep + 1);
        trackUserJourney(`Step ${formData.currentStep + 1} Started`, formData.currentStep + 1);
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
      // Step 1: Citizenship Type Selection validation
      if (!formData.citizenshipType) {
        newErrors.citizenshipType = getTranslation('citizenshipTypeRequired', language);
        trackFormValidationError('citizenshipType', 'Citizenship type not selected');
      }
    } else if (formData.currentStep === 2) {
      // Step 2: Personal Information validation
      
      // Passport Number
      if (!formData.passportNumber.trim()) {
        const errorMsg = getTranslation('passportNumberRequired', language);
        newErrors.passportNumber = errorMsg;
        trackFormValidationError('passportNumber', errorMsg);
      }
      
      // Full Passport Name
      if (!formData.fullPassportName.trim()) {
        const errorMsg = getTranslation('fullPassportNameRequired', language);
        newErrors.fullPassportName = errorMsg;
        trackFormValidationError('fullPassportName', errorMsg);
      }
      
      // Nationality/Country/Region
      if (!formData.nationality) {
        const errorMsg = getTranslation('nationalityRequired', language);
        newErrors.nationality = errorMsg;
        trackFormValidationError('nationality', errorMsg);
      }
      
      // Date of Birth
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
      
      // Country/Place of Birth
      if (!formData.countryOfBirth) {
        const errorMsg = getTranslation('countryOfBirthRequired', language);
        newErrors.countryOfBirth = errorMsg;
        trackFormValidationError('countryOfBirth', errorMsg);
      }
      
      // Gender
      if (!formData.gender) {
        const errorMsg = getTranslation('genderRequired', language);
        newErrors.gender = errorMsg;
        trackFormValidationError('gender', errorMsg);
      }
      
      // Passport Expiry Date
      if (!formData.passportExpiryDate.trim()) {
        const errorMsg = getTranslation('passportExpiryDateRequired', language);
        newErrors.passportExpiryDate = errorMsg;
        trackFormValidationError('passportExpiryDate', errorMsg);
      } else {
        // Validate passport expiry date
        const [year, month, day] = formData.passportExpiryDate.split('-');
        if (year && month && day) {
          const expiryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today
          
          // Check if the date is valid (handles invalid dates like Feb 30)
          const isValidCalendarDate = 
            expiryDate.getFullYear() === parseInt(year) &&
            expiryDate.getMonth() === parseInt(month) - 1 &&
            expiryDate.getDate() === parseInt(day);
          
          // Check if the date is in the future (passport should not be expired)
          const isFuture = expiryDate > today;
          
          if (!isValidCalendarDate) {
            const errorMsg = getTranslation('passportExpiryDateInvalid', language);
            newErrors.passportExpiryDate = errorMsg;
            trackFormValidationError('passportExpiryDate', errorMsg);
          } else if (!isFuture) {
            const errorMsg = getTranslation('passportExpiryDatePast', language);
            newErrors.passportExpiryDate = errorMsg;
            trackFormValidationError('passportExpiryDate', errorMsg);
          }
        }
      }
      
      // Mobile Number
      if (!formData.mobileNumber.trim()) {
        const errorMsg = getTranslation('mobileNumberRequired', language);
        newErrors.mobileNumber = errorMsg;
        trackFormValidationError('mobileNumber', errorMsg);
      } else {
        // Extract phone number part (without country code)
        const phoneNumber = formData.mobileNumber.split(' ').slice(1).join(' ');
        if (!phoneNumber.trim()) {
          const errorMsg = getTranslation('mobileNumberRequired', language);
          newErrors.mobileNumber = errorMsg;
          trackFormValidationError('mobileNumber', errorMsg);
        } else if (!/^\d+$/.test(phoneNumber.replace(/\s/g, ''))) {
          const errorMsg = getTranslation('mobileNumberInvalid', language);
          newErrors.mobileNumber = errorMsg;
          trackFormValidationError('mobileNumber', errorMsg);
        }
      }
      
      // Email
      if (!formData.email.trim()) {
        const errorMsg = getTranslation('emailRequired', language);
        newErrors.email = errorMsg;
        trackFormValidationError('email', errorMsg);
      } else {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          const errorMsg = getTranslation('emailInvalid', language);
          newErrors.email = errorMsg;
          trackFormValidationError('email', errorMsg);
        }
      }
      
      // Additional Travellers Validation
      formData.familyMembers.forEach((traveller, index) => {
        const prefix = `${traveller.id}-`;
        
        // Passport Number
        if (!traveller.passportNumber.trim()) {
          const errorMsg = getTranslation('passportNumberRequired', language);
          newErrors[`${prefix}passportNumber`] = errorMsg;
          trackFormValidationError(`traveller${index+2}-passportNumber`, errorMsg);
        }
        
        // Full Passport Name
        if (!traveller.fullPassportName.trim()) {
          const errorMsg = getTranslation('fullPassportNameRequired', language);
          newErrors[`${prefix}fullPassportName`] = errorMsg;
          trackFormValidationError(`traveller${index+2}-fullPassportName`, errorMsg);
        }
        
        // Nationality
        if (!traveller.nationality) {
          const errorMsg = getTranslation('nationalityRequired', language);
          newErrors[`${prefix}nationality`] = errorMsg;
          trackFormValidationError(`traveller${index+2}-nationality`, errorMsg);
        }
        
        // Date of Birth
        if (!traveller.dateOfBirth.trim()) {
          const errorMsg = getTranslation('dateOfBirthRequired', language);
          newErrors[`${prefix}dateOfBirth`] = errorMsg;
          trackFormValidationError(`traveller${index+2}-dateOfBirth`, errorMsg);
        }
        
        // Country of Birth
        if (!traveller.countryOfBirth) {
          const errorMsg = getTranslation('countryOfBirthRequired', language);
          newErrors[`${prefix}countryOfBirth`] = errorMsg;
          trackFormValidationError(`traveller${index+2}-countryOfBirth`, errorMsg);
        }
        
        // Gender
        if (!traveller.gender) {
          const errorMsg = getTranslation('genderRequired', language);
          newErrors[`${prefix}gender`] = errorMsg;
          trackFormValidationError(`traveller${index+2}-gender`, errorMsg);
        }
        
        // Passport Expiry Date
        if (!traveller.passportExpiryDate.trim()) {
          const errorMsg = getTranslation('passportExpiryDateRequired', language);
          newErrors[`${prefix}passportExpiryDate`] = errorMsg;
          trackFormValidationError(`traveller${index+2}-passportExpiryDate`, errorMsg);
        }
        
        // Mobile Number
        if (!traveller.mobileNumber.trim()) {
          const errorMsg = getTranslation('mobileNumberRequired', language);
          newErrors[`${prefix}mobileNumber`] = errorMsg;
          trackFormValidationError(`traveller${index+2}-mobileNumber`, errorMsg);
        } else {
          const phoneNumber = traveller.mobileNumber.split(' ').slice(1).join(' ');
          if (!phoneNumber.trim()) {
            const errorMsg = getTranslation('mobileNumberRequired', language);
            newErrors[`${prefix}mobileNumber`] = errorMsg;
            trackFormValidationError(`traveller${index+2}-mobileNumber`, errorMsg);
          }
        }
        
        // Email
        if (!traveller.email.trim()) {
          const errorMsg = getTranslation('emailRequired', language);
          newErrors[`${prefix}email`] = errorMsg;
          trackFormValidationError(`traveller${index+2}-email`, errorMsg);
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(traveller.email)) {
            const errorMsg = getTranslation('emailInvalid', language);
            newErrors[`${prefix}email`] = errorMsg;
            trackFormValidationError(`traveller${index+2}-email`, errorMsg);
          }
        }
      });
    } else if (formData.currentStep === 3) {
      // Step 3: Travel Details validation
      
      // Check if user is Indonesian citizen (either from Step 1 or nationality from Step 2)
      const isIndonesianCitizen = formData.citizenshipType === 'indonesian' || 
                                 formData.nationality.toLowerCase() === 'indonesia';
      
      // Arrival Date (required for all)
      if (!formData.arrivalDate.trim()) {
        const errorMsg = getTranslation('arrivalDateRequired', language);
        newErrors.arrivalDate = errorMsg;
        trackFormValidationError('arrivalDate', errorMsg);
      }
      
      // Departure Date (only required for foreign citizens)
      if (!isIndonesianCitizen) {
        if (!formData.departureDate.trim()) {
          const errorMsg = getTranslation('departureDateRequired', language);
          newErrors.departureDate = errorMsg;
          trackFormValidationError('departureDate', errorMsg);
        } else if (formData.arrivalDate.trim()) {
          // Validate departure is on or after arrival (allow same-day transit)
          const arrivalDate = new Date(formData.arrivalDate);
          const departureDate = new Date(formData.departureDate);
          
          if (departureDate < arrivalDate) {
            const errorMsg = getTranslation('departureDateMustBeAfterArrival', language);
            newErrors.departureDate = errorMsg;
            trackFormValidationError('departureDate', errorMsg);
          }
        }
        
        // Visa or KITAS/KITAP Question (only for foreign citizens)
        if (formData.hasVisaOrKitas === null) {
          const errorMsg = getTranslation('visaOrKitasRequired', language);
          newErrors.hasVisaOrKitas = errorMsg;
          trackFormValidationError('hasVisaOrKitas', errorMsg);
        }
        
        // Visa/KITAS Number (if Yes is selected by foreign citizens)
        if (formData.hasVisaOrKitas === true && !formData.visaOrKitasNumber.trim()) {
          const errorMsg = getTranslation('visaOrKitasNumberRequired', language);
          newErrors.visaOrKitasNumber = errorMsg;
          trackFormValidationError('visaOrKitasNumber', errorMsg);
        }

        // Family Members Visa Validation (only for foreign citizens with family members)
        if (formData.familyMembers && formData.familyMembers.length > 0) {
          formData.familyMembers.forEach((member, index) => {
            const memberPrefix = `familyMember-${member.id}`;
            
            // Visa or KITAS/KITAP Question for each family member
            if ('hasVisaOrKitas' in member && member.hasVisaOrKitas === null) {
              const errorMsg = getTranslation('visaOrKitasRequired', language);
              newErrors[`${memberPrefix}-hasVisaOrKitas`] = errorMsg;
              trackFormValidationError(`${memberPrefix}-hasVisaOrKitas`, errorMsg);
            }
            
            // Visa/KITAS Number for family member (if Yes is selected)
            if ('hasVisaOrKitas' in member && 'visaOrKitasNumber' in member && member.hasVisaOrKitas === true && !member.visaOrKitasNumber.trim()) {
              const errorMsg = getTranslation('visaOrKitasNumberRequired', language);
              newErrors[`${memberPrefix}-visaOrKitasNumber`] = errorMsg;
              trackFormValidationError(`${memberPrefix}-visaOrKitasNumber`, errorMsg);
            }
          });
        }
      }
    } else if (formData.currentStep === 4) {
      // Step 4: Mode of Transportation and Address validation
      
      // Mode of Transport
      if (!formData.modeOfTransport.trim()) {
        const errorMsg = getTranslation('modeOfTransportRequired', language);
        newErrors.modeOfTransport = errorMsg;
        trackFormValidationError('modeOfTransport', errorMsg);
      }
      
      // Purpose of Travel
      if (!formData.purposeOfTravel.trim()) {
        const errorMsg = getTranslation('purposeOfTravelRequired', language);
        newErrors.purposeOfTravel = errorMsg;
        trackFormValidationError('purposeOfTravel', errorMsg);
      }
      
      // Conditional Air Transport validation
      if (formData.modeOfTransport === 'AIR') {
        // Place of Arrival
        if (!formData.placeOfArrival.trim()) {
          const errorMsg = getTranslation('placeOfArrivalRequired', language);
          newErrors.placeOfArrival = errorMsg;
          trackFormValidationError('placeOfArrival', errorMsg);
        }
        
        // Type of Air Transport
        if (!formData.typeOfAirTransport.trim()) {
          const errorMsg = getTranslation('typeOfAirTransportRequired', language);
          newErrors.typeOfAirTransport = errorMsg;
          trackFormValidationError('typeOfAirTransport', errorMsg);
        }
        
        // Flight Name
        if (!formData.flightName.trim()) {
          const errorMsg = getTranslation('flightNameRequired', language);
          newErrors.flightName = errorMsg;
          trackFormValidationError('flightName', errorMsg);
        }
        
        // Flight Number
        if (!formData.flightNumber.trim()) {
          const errorMsg = getTranslation('flightNumberRequired', language);
          newErrors.flightNumber = errorMsg;
          trackFormValidationError('flightNumber', errorMsg);
        }
      }
      
      // Conditional Sea Transport validation
      if (formData.modeOfTransport === 'SEA') {
        // Place of Arrival
        if (!formData.placeOfArrival.trim()) {
          const errorMsg = getTranslation('placeOfArrivalRequired', language);
          newErrors.placeOfArrival = errorMsg;
          trackFormValidationError('placeOfArrival', errorMsg);
        }
        
        // Type of Vessel
        if (!formData.typeOfVessel.trim()) {
          const errorMsg = getTranslation('typeOfVesselRequired', language);
          newErrors.typeOfVessel = errorMsg;
          trackFormValidationError('typeOfVessel', errorMsg);
        }
        
        // Vessel Name
        if (!formData.vesselName.trim()) {
          const errorMsg = getTranslation('vesselNameRequired', language);
          newErrors.vesselName = errorMsg;
          trackFormValidationError('vesselName', errorMsg);
        }
      }
      
      // Address in Indonesia
      if (!formData.addressInIndonesia.trim()) {
        const errorMsg = getTranslation('addressInIndonesiaRequired', language);
        newErrors.addressInIndonesia = errorMsg;
        trackFormValidationError('addressInIndonesia', errorMsg);
      }
    } else if (formData.currentStep === 5) {
      // Step 5: Declaration validation
      
      // Health Declaration
      if (formData.hasSymptoms === null || formData.hasSymptoms === undefined) {
        const errorMsg = 'Please answer the health symptoms question';
        newErrors.hasSymptoms = errorMsg;
        trackFormValidationError('hasSymptoms', errorMsg);
      }
      
      // Countries Visited (Required)
      if (!formData.countriesVisited || formData.countriesVisited.length === 0) {
        const errorMsg = 'Please select at least one country of origin, departure, transit or other countries visited within 21 days';
        newErrors.countriesVisited = errorMsg;
        trackFormValidationError('countriesVisited', errorMsg);
      }
      
      // Quarantine Declaration
      if (formData.hasQuarantineItems === null || formData.hasQuarantineItems === undefined) {
        const errorMsg = 'Please answer the quarantine items question';
        newErrors.hasQuarantineItems = errorMsg;
        trackFormValidationError('hasQuarantineItems', errorMsg);
      }
      
      // Customs Declaration
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
      
      // Technology Devices
      if (formData.hasTechnologyDevices === null || formData.hasTechnologyDevices === undefined) {
        const errorMsg = getTranslation('technologyDevicesRequired', language);
        newErrors.hasTechnologyDevices = errorMsg;
        trackFormValidationError('hasTechnologyDevices', errorMsg);
      }
      
      // Baggage Count
      if (!formData.baggageCount || formData.baggageCount === '') {
        const errorMsg = 'Please enter the number of baggage';
        newErrors.baggageCount = errorMsg;
        trackFormValidationError('baggageCount', errorMsg);
      } else if (parseInt(formData.baggageCount) < 0) {
        const errorMsg = 'Baggage count cannot be negative';
        newErrors.baggageCount = errorMsg;
        trackFormValidationError('baggageCount', errorMsg);
      }
      
      // Final Consent
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
      
      // Track Google Ads conversion when form passes validation and processing starts
      trackFormSubmission(); // Remove URL parameter to prevent unwanted redirect
      
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
          trackUserJourney('Form Submitted Successfully', 5);
          
          // PAYMENT STEP TEMPORARILY DISABLED - Show QR code directly
          // Store QR data and show modal immediately (skip payment flow)
          setSubmissionResult(result);
          saveCompletedQR(result); // Save without payment requirement
          setShowQRModal(true);
          
          // COMMENTED OUT - Payment flow for future re-enabling:
          // sessionStorage.setItem('pendingQR', JSON.stringify(result));
          // router.push('/checkout');
        } else {
          // Track automation failure in Mixpanel
          trackAutomationFailure(
            result.error?.code || 'UNKNOWN_ERROR',
            result.error?.message || 'Unknown error',
            result.error?.step,
            result.error?.details
          );
          
          // Track error for form validation (backwards compatibility)
          trackFormValidationError('submission', result.error?.message || 'Unknown error');
          
          // Show brief notification before redirecting
          setErrors({
            submission: 'Automation failed. Redirecting to official customs website...'
          });
          
          // Auto-redirect to official customs website after brief delay
          setTimeout(() => {
            window.location.href = 'https://allindonesia.imigrasi.go.id/';
          }, 2000);
        }
      } catch (error) {
        console.error('Submission error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Network error';
        
        // Track network failure in Mixpanel
        trackAutomationFailure(
          'NETWORK_ERROR',
          errorMessage,
          'api_call',
          error
        );
        
        // Show brief notification before redirecting
        setErrors({
          submission: 'Network error. Redirecting to official customs website...'
        });
        
        // Track error for form validation (backwards compatibility)
        trackFormValidationError('submission', 'Network error');
        
        // Auto-redirect to official customs website after brief delay
        setTimeout(() => {
          window.location.href = 'https://allindonesia.imigrasi.go.id/';
        }, 2000);
      } finally {
        setIsSubmitting(false);
      }
    }
  };



  // Render Step 1: Citizenship Type Selection
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {getTranslation('arrivalCardServiceTitle', language)}
        </h1>
        <p className="text-base text-gray-600 mb-8">
          {getTranslation('arrivalCardServiceSubtitle', language)}
        </p>
      </div>

      {/* Citizenship Selection Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Indonesian Citizen Card */}
        <button
          type="button"
          onClick={() => {
            // Redirect Indonesian citizens to the Indonesian immigration website
            window.location.href = 'https://allindonesia.imigrasi.go.id/';
          }}
          className={`p-6 border-2 rounded-lg text-left transition-all ${
            formData.citizenshipType === 'indonesian'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{getTranslation('indonesianCitizenTitle', language)}</h3>
              <p className="text-sm text-gray-600">
                {getTranslation('indonesianCitizenDescription', language)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Foreign Visitor Card */}
        <button
          type="button"
          onClick={() => {
            updateFormData('citizenshipType', 'foreign');
            // Auto-advance to next step after selection
            setTimeout(() => {
              updateFormData('currentStep', 2);
              trackUserJourney('Step 2 Started', 2);
            }, 500);
          }}
          className={`p-6 border-2 rounded-lg text-left transition-all ${
            formData.citizenshipType === 'foreign'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{getTranslation('foreignVisitorTitle', language)}</h3>
              <p className="text-sm text-gray-600">
                {getTranslation('foreignVisitorDescription', language)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Error message if citizenship type not selected */}
      {errors.citizenshipType && (
        <div className="mt-4 text-sm text-red-600">
          {errors.citizenshipType}
        </div>
      )}

    </div>
  );

  // Render Step 2: Personal Information
  const renderStep2 = () => (
    <div className="space-y-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
        Personal Information
      </h2>

      {/* Personal Data Section */}
      <div className="space-y-6">
        <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {getTranslation('personalData', language)}
          </h3>
          <p className="text-sm text-blue-800">
            {getTranslation('personalDataDescription', language)}
          </p>
        </div>

        {/* Warning Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
          <p className="text-sm text-yellow-800">
            Please use the same passport as for other immigration service applications
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormSelect
            label={getTranslation('passportCountryRegion', language)}
            required
            options={countries}
            value={formData.nationality}
            onChange={(e) => updateFormData('nationality', e.target.value)}
            error={errors.nationality}
            placeholder="Select Passport/Country/Region"
          />
          
          <FormInput
            label={getTranslation('fullPassportName', language)}
            required
            placeholder="Enter Full Name"
            value={formData.fullPassportName}
            onChange={(e) => updateFormData('fullPassportName', e.target.value.toUpperCase())}
            error={errors.fullPassportName}
          />
          
          <DateInput
            label={getTranslation('dateOfBirth', language)}
            required
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
            error={errors.dateOfBirth}
            placeholder="DD/MM/YYYY"
          />
          
          <FormSelect
            label={getTranslation('countryPlaceOfBirth', language)}
            required
            options={countries}
            value={formData.countryOfBirth}
            onChange={(e) => updateFormData('countryOfBirth', e.target.value)}
            error={errors.countryOfBirth}
            placeholder="Select Country/Place of Birth"
          />
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {getTranslation('gender', language)} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                formData.gender === 'male' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={() => updateFormData('gender', 'male')}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${
                  formData.gender === 'male' 
                    ? 'text-blue-600' 
                    : 'text-gray-700'
                }`}>
                  {getTranslation('male', language)}
                </span>
              </label>
              <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                formData.gender === 'female' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={() => updateFormData('gender', 'female')}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${
                  formData.gender === 'female' 
                    ? 'text-blue-600' 
                    : 'text-gray-700'
                }`}>
                  {getTranslation('female', language)}
                </span>
              </label>
            </div>
            {errors.gender && (
              <p className="mt-2 text-sm text-red-600">{errors.gender}</p>
            )}
          </div>
          
          <FormInput
            label={getTranslation('passportNumber', language)}
            required
            placeholder="Enter Passport Number"
            value={formData.passportNumber}
            onChange={(e) => updateFormData('passportNumber', e.target.value.toUpperCase())}
            error={errors.passportNumber}
          />
          
          <DateInput
            label={getTranslation('passportExpiryDate', language)}
            required
            value={formData.passportExpiryDate}
            onChange={(e) => updateFormData('passportExpiryDate', e.target.value)}
            error={errors.passportExpiryDate}
            placeholder="DD/MM/YYYY"
            allowFutureDate={true}
          />
        </div>
      </div>

      {/* Account Information Section */}
      <div className="space-y-6">
        <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {getTranslation('accountInformation', language)}
          </h3>
          <p className="text-sm text-blue-800">
            {getTranslation('accountInformationDescription', language)}
          </p>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {getTranslation('mobileNumber', language)} <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-2 items-center">
              <CountryCodeSelect
                options={[
                  { value: '+93', label: '+93 - AFGHANISTAN' },
                  { value: '+355', label: '+355 - ALBANIA' },
                  { value: '+213', label: '+213 - ALGERIA' },
                  { value: '+1', label: '+1 - AMERICAN SAMOA' },
                  { value: '+376', label: '+376 - ANDORRA' },
                  { value: '+244', label: '+244 - ANGOLA' },
                  { value: '+1264', label: '+1264 - ANGUILLA' },
                  { value: '+672', label: '+672 - ANTARCTICA' },
                  { value: '+1268', label: '+1268 - ANTIGUA AND BARBUDA' },
                  { value: '+54', label: '+54 - ARGENTINA' },
                  { value: '+374', label: '+374 - ARMENIA' },
                  { value: '+297', label: '+297 - ARUBA' },
                  { value: '+61', label: '+61 - AUSTRALIA' },
                  { value: '+43', label: '+43 - AUSTRIA' },
                  { value: '+994', label: '+994 - AZERBAIJAN' },
                  { value: '+1242', label: '+1242 - BAHAMAS' },
                  { value: '+973', label: '+973 - BAHRAIN' },
                  { value: '+880', label: '+880 - BANGLADESH' },
                  { value: '+1246', label: '+1246 - BARBADOS' },
                  { value: '+375', label: '+375 - BELARUS' },
                  { value: '+32', label: '+32 - BELGIUM' },
                  { value: '+501', label: '+501 - BELIZE' },
                  { value: '+229', label: '+229 - BENIN' },
                  { value: '+1441', label: '+1441 - BERMUDA' },
                  { value: '+975', label: '+975 - BHUTAN' },
                  { value: '+591', label: '+591 - BOLIVIA' },
                  { value: '+387', label: '+387 - BOSNIA AND HERZEGOVINA' },
                  { value: '+267', label: '+267 - BOTSWANA' },
                  { value: '+55', label: '+55 - BRAZIL' },
                  { value: '+246', label: '+246 - BRITISH INDIAN OCEAN TERRITORY' },
                  { value: '+673', label: '+673 - BRUNEI DARUSSALAM' },
                  { value: '+359', label: '+359 - BULGARIA' },
                  { value: '+226', label: '+226 - BURKINA FASO' },
                  { value: '+257', label: '+257 - BURUNDI' },
                  { value: '+855', label: '+855 - CAMBODIA' },
                  { value: '+237', label: '+237 - CAMEROON' },
                  { value: '+1', label: '+1 - CANADA' },
                  { value: '+238', label: '+238 - CAPE VERDE' },
                  { value: '+1345', label: '+1345 - CAYMAN ISLANDS' },
                  { value: '+236', label: '+236 - CENTRAL AFRICAN REPUBLIC' },
                  { value: '+235', label: '+235 - CHAD' },
                  { value: '+56', label: '+56 - CHILE' },
                  { value: '+86', label: '+86 - CHINA' },
                  { value: '+61', label: '+61 - CHRISTMAS ISLAND' },
                  { value: '+61', label: '+61 - COCOS (KEELING) ISLANDS' },
                  { value: '+57', label: '+57 - COLOMBIA' },
                  { value: '+269', label: '+269 - COMOROS' },
                  { value: '+242', label: '+242 - CONGO' },
                  { value: '+243', label: '+243 - CONGO, THE DEMOCRATIC REPUBLIC' },
                  { value: '+682', label: '+682 - COOK ISLANDS' },
                  { value: '+506', label: '+506 - COSTA RICA' },
                  { value: '+225', label: '+225 - COTE D\'IVOIRE' },
                  { value: '+385', label: '+385 - CROATIA' },
                  { value: '+53', label: '+53 - CUBA' },
                  { value: '+357', label: '+357 - CYPRUS' },
                  { value: '+420', label: '+420 - CZECH REPUBLIC' },
                  { value: '+45', label: '+45 - DENMARK' },
                  { value: '+253', label: '+253 - DJIBOUTI' },
                  { value: '+1767', label: '+1767 - DOMINICA' },
                  { value: '+1809', label: '+1809 - DOMINICAN REPUBLIC' },
                  { value: '+593', label: '+593 - ECUADOR' },
                  { value: '+20', label: '+20 - EGYPT' },
                  { value: '+503', label: '+503 - EL SALVADOR' },
                  { value: '+240', label: '+240 - EQUATORIAL GUINEA' },
                  { value: '+291', label: '+291 - ERITREA' },
                  { value: '+372', label: '+372 - ESTONIA' },
                  { value: '+251', label: '+251 - ETHIOPIA' },
                  { value: '+500', label: '+500 - FALKLAND ISLANDS' },
                  { value: '+298', label: '+298 - FAROE ISLANDS' },
                  { value: '+679', label: '+679 - FIJI' },
                  { value: '+358', label: '+358 - FINLAND' },
                  { value: '+33', label: '+33 - FRANCE' },
                  { value: '+594', label: '+594 - FRENCH GUIANA' },
                  { value: '+689', label: '+689 - FRENCH POLYNESIA' },
                  { value: '+262', label: '+262 - FRENCH SOUTHERN TERRITORIES' },
                  { value: '+241', label: '+241 - GABON' },
                  { value: '+220', label: '+220 - GAMBIA' },
                  { value: '+995', label: '+995 - GEORGIA' },
                  { value: '+49', label: '+49 - GERMANY' },
                  { value: '+233', label: '+233 - GHANA' },
                  { value: '+350', label: '+350 - GIBRALTAR' },
                  { value: '+30', label: '+30 - GREECE' },
                  { value: '+299', label: '+299 - GREENLAND' },
                  { value: '+1473', label: '+1473 - GRENADA' },
                  { value: '+590', label: '+590 - GUADELOUPE' },
                  { value: '+1671', label: '+1671 - GUAM' },
                  { value: '+502', label: '+502 - GUATEMALA' },
                  { value: '+44', label: '+44 - GUERNSEY' },
                  { value: '+224', label: '+224 - GUINEA' },
                  { value: '+245', label: '+245 - GUINEA-BISSAU' },
                  { value: '+592', label: '+592 - GUYANA' },
                  { value: '+509', label: '+509 - HAITI' },
                  { value: '+672', label: '+672 - HEARD ISLAND AND MCDONALD ISLANDS' },
                  { value: '+39', label: '+39 - HOLY SEE (VATICAN CITY STATE)' },
                  { value: '+504', label: '+504 - HONDURAS' },
                  { value: '+852', label: '+852 - HONG KONG' },
                  { value: '+36', label: '+36 - HUNGARY' },
                  { value: '+354', label: '+354 - ICELAND' },
                  { value: '+91', label: '+91 - INDIA' },
                  { value: '+62', label: '+62 - INDONESIA' },
                  { value: '+98', label: '+98 - IRAN, ISLAMIC REPUBLIC OF' },
                  { value: '+964', label: '+964 - IRAQ' },
                  { value: '+353', label: '+353 - IRELAND' },
                  { value: '+44', label: '+44 - ISLE OF MAN' },
                  { value: '+972', label: '+972 - ISRAEL' },
                  { value: '+39', label: '+39 - ITALY' },
                  { value: '+1876', label: '+1876 - JAMAICA' },
                  { value: '+81', label: '+81 - JAPAN' },
                  { value: '+44', label: '+44 - JERSEY' },
                  { value: '+962', label: '+962 - JORDAN' },
                  { value: '+7', label: '+7 - KAZAKHSTAN' },
                  { value: '+254', label: '+254 - KENYA' },
                  { value: '+686', label: '+686 - KIRIBATI' },
                  { value: '+850', label: '+850 - KOREA, DEMOCRATIC PEOPLE\'S REPUBLIC OF' },
                  { value: '+82', label: '+82 - KOREA, REPUBLIC OF' },
                  { value: '+965', label: '+965 - KUWAIT' },
                  { value: '+996', label: '+996 - KYRGYZSTAN' },
                  { value: '+856', label: '+856 - LAO PEOPLE\'S DEMOCRATIC REPUBLIC' },
                  { value: '+371', label: '+371 - LATVIA' },
                  { value: '+961', label: '+961 - LEBANON' },
                  { value: '+266', label: '+266 - LESOTHO' },
                  { value: '+231', label: '+231 - LIBERIA' },
                  { value: '+218', label: '+218 - LIBYAN ARAB JAMAHIRIYA' },
                  { value: '+423', label: '+423 - LIECHTENSTEIN' },
                  { value: '+370', label: '+370 - LITHUANIA' },
                  { value: '+352', label: '+352 - LUXEMBOURG' },
                  { value: '+853', label: '+853 - MACAO' },
                  { value: '+389', label: '+389 - MACEDONIA' },
                  { value: '+261', label: '+261 - MADAGASCAR' },
                  { value: '+265', label: '+265 - MALAWI' },
                  { value: '+60', label: '+60 - MALAYSIA' },
                  { value: '+960', label: '+960 - MALDIVES' },
                  { value: '+223', label: '+223 - MALI' },
                  { value: '+356', label: '+356 - MALTA' },
                  { value: '+692', label: '+692 - MARSHALL ISLANDS' },
                  { value: '+596', label: '+596 - MARTINIQUE' },
                  { value: '+222', label: '+222 - MAURITANIA' },
                  { value: '+230', label: '+230 - MAURITIUS' },
                  { value: '+262', label: '+262 - MAYOTTE' },
                  { value: '+52', label: '+52 - MEXICO' },
                  { value: '+691', label: '+691 - MICRONESIA, FEDERATED STATES OF' },
                  { value: '+373', label: '+373 - MOLDOVA, REPUBLIC OF' },
                  { value: '+377', label: '+377 - MONACO' },
                  { value: '+976', label: '+976 - MONGOLIA' },
                  { value: '+382', label: '+382 - MONTENEGRO' },
                  { value: '+1664', label: '+1664 - MONTSERRAT' },
                  { value: '+212', label: '+212 - MOROCCO' },
                  { value: '+258', label: '+258 - MOZAMBIQUE' },
                  { value: '+95', label: '+95 - MYANMAR' },
                  { value: '+264', label: '+264 - NAMIBIA' },
                  { value: '+674', label: '+674 - NAURU' },
                  { value: '+977', label: '+977 - NEPAL' },
                  { value: '+31', label: '+31 - NETHERLANDS' },
                  { value: '+599', label: '+599 - NETHERLANDS ANTILLES' },
                  { value: '+687', label: '+687 - NEW CALEDONIA' },
                  { value: '+64', label: '+64 - NEW ZEALAND' },
                  { value: '+505', label: '+505 - NICARAGUA' },
                  { value: '+227', label: '+227 - NIGER' },
                  { value: '+234', label: '+234 - NIGERIA' },
                  { value: '+683', label: '+683 - NIUE' },
                  { value: '+672', label: '+672 - NORFOLK ISLAND' },
                  { value: '+1670', label: '+1670 - NORTHERN MARIANA ISLANDS' },
                  { value: '+47', label: '+47 - NORWAY' },
                  { value: '+968', label: '+968 - OMAN' },
                  { value: '+92', label: '+92 - PAKISTAN' },
                  { value: '+680', label: '+680 - PALAU' },
                  { value: '+970', label: '+970 - PALESTINIAN TERRITORY, OCCUPIED' },
                  { value: '+507', label: '+507 - PANAMA' },
                  { value: '+675', label: '+675 - PAPUA NEW GUINEA' },
                  { value: '+595', label: '+595 - PARAGUAY' },
                  { value: '+51', label: '+51 - PERU' },
                  { value: '+63', label: '+63 - PHILIPPINES' },
                  { value: '+870', label: '+870 - PITCAIRN' },
                  { value: '+48', label: '+48 - POLAND' },
                  { value: '+351', label: '+351 - PORTUGAL' },
                  { value: '+1787', label: '+1787 - PUERTO RICO' },
                  { value: '+974', label: '+974 - QATAR' },
                  { value: '+262', label: '+262 - REUNION' },
                  { value: '+40', label: '+40 - ROMANIA' },
                  { value: '+7', label: '+7 - RUSSIAN FEDERATION' },
                  { value: '+250', label: '+250 - RWANDA' },
                  { value: '+290', label: '+290 - SAINT HELENA' },
                  { value: '+1869', label: '+1869 - SAINT KITTS AND NEVIS' },
                  { value: '+1758', label: '+1758 - SAINT LUCIA' },
                  { value: '+508', label: '+508 - SAINT PIERRE AND MIQUELON' },
                  { value: '+1784', label: '+1784 - SAINT VINCENT AND THE GRENADINES' },
                  { value: '+685', label: '+685 - SAMOA' },
                  { value: '+378', label: '+378 - SAN MARINO' },
                  { value: '+239', label: '+239 - SAO TOME AND PRINCIPE' },
                  { value: '+966', label: '+966 - SAUDI ARABIA' },
                  { value: '+221', label: '+221 - SENEGAL' },
                  { value: '+381', label: '+381 - SERBIA' },
                  { value: '+248', label: '+248 - SEYCHELLES' },
                  { value: '+232', label: '+232 - SIERRA LEONE' },
                  { value: '+65', label: '+65 - SINGAPORE' },
                  { value: '+421', label: '+421 - SLOVAKIA' },
                  { value: '+386', label: '+386 - SLOVENIA' },
                  { value: '+677', label: '+677 - SOLOMON ISLANDS' },
                  { value: '+252', label: '+252 - SOMALIA' },
                  { value: '+27', label: '+27 - SOUTH AFRICA' },
                  { value: '+500', label: '+500 - SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS' },
                  { value: '+34', label: '+34 - SPAIN' },
                  { value: '+94', label: '+94 - SRI LANKA' },
                  { value: '+249', label: '+249 - SUDAN' },
                  { value: '+597', label: '+597 - SURINAME' },
                  { value: '+47', label: '+47 - SVALBARD AND JAN MAYEN' },
                  { value: '+268', label: '+268 - SWAZILAND' },
                  { value: '+46', label: '+46 - SWEDEN' },
                  { value: '+41', label: '+41 - SWITZERLAND' },
                  { value: '+963', label: '+963 - SYRIAN ARAB REPUBLIC' },
                  { value: '+886', label: '+886 - TAIWAN, PROVINCE OF CHINA' },
                  { value: '+992', label: '+992 - TAJIKISTAN' },
                  { value: '+255', label: '+255 - TANZANIA, UNITED REPUBLIC OF' },
                  { value: '+66', label: '+66 - THAILAND' },
                  { value: '+670', label: '+670 - TIMOR-LESTE' },
                  { value: '+228', label: '+228 - TOGO' },
                  { value: '+690', label: '+690 - TOKELAU' },
                  { value: '+676', label: '+676 - TONGA' },
                  { value: '+1868', label: '+1868 - TRINIDAD AND TOBAGO' },
                  { value: '+216', label: '+216 - TUNISIA' },
                  { value: '+90', label: '+90 - TURKEY' },
                  { value: '+993', label: '+993 - TURKMENISTAN' },
                  { value: '+1649', label: '+1649 - TURKS AND CAICOS ISLANDS' },
                  { value: '+688', label: '+688 - TUVALU' },
                  { value: '+256', label: '+256 - UGANDA' },
                  { value: '+380', label: '+380 - UKRAINE' },
                  { value: '+971', label: '+971 - UNITED ARAB EMIRATES' },
                  { value: '+44', label: '+44 - UNITED KINGDOM' },
                  { value: '+1', label: '+1 - UNITED STATES' },
                  { value: '+1', label: '+1 - UNITED STATES MINOR OUTLYING ISLANDS' },
                  { value: '+598', label: '+598 - URUGUAY' },
                  { value: '+998', label: '+998 - UZBEKISTAN' },
                  { value: '+678', label: '+678 - VANUATU' },
                  { value: '+58', label: '+58 - VENEZUELA' },
                  { value: '+84', label: '+84 - VIET NAM' },
                  { value: '+1284', label: '+1284 - VIRGIN ISLANDS, BRITISH' },
                  { value: '+1340', label: '+1340 - VIRGIN ISLANDS, U.S.' },
                  { value: '+681', label: '+681 - WALLIS AND FUTUNA' },
                  { value: '+212', label: '+212 - WESTERN SAHARA' },
                  { value: '+967', label: '+967 - YEMEN' },
                  { value: '+260', label: '+260 - ZAMBIA' },
                  { value: '+263', label: '+263 - ZIMBABWE' },
                ]}
                value={formData.mobileNumber.split(' ')[0] || '+62'}
                onChange={(countryCode) => {
                  const phoneNumber = formData.mobileNumber.split(' ').slice(1).join(' ');
                  updateFormData('mobileNumber', `${countryCode} ${phoneNumber}`);
                }}
                className="w-24 sm:w-28"
                placeholder="Select"
              />
              <input
                type="text"
                placeholder="Enter Mobile Number"
                value={formData.mobileNumber.split(' ').slice(1).join(' ') || ''}
                onChange={(e) => {
                  const countryCode = formData.mobileNumber.split(' ')[0] || '+62';
                  updateFormData('mobileNumber', `${countryCode} ${e.target.value}`);
                }}
                className={`flex-1 h-[42px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                  errors.mobileNumber ? 'border-red-500' : ''
                }`}
              />
            </div>
            {errors.mobileNumber && <p className="text-sm text-red-600">{errors.mobileNumber}</p>}
          </div>
          
          <FormInput
            label={getTranslation('email', language)}
            type="email"
            required
            placeholder="Enter Email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            error={errors.email}
          />
        </div>

        {/* Additional Travellers */}
        <TravellerManager
          travellers={formData.familyMembers}
          onChange={(travellers) => updateFormData('familyMembers', travellers)}
          countries={countries}
          countryCodeOptions={[
            { value: '+93', label: '+93 - AFGHANISTAN' },
            { value: '+355', label: '+355 - ALBANIA' },
            { value: '+213', label: '+213 - ALGERIA' },
            { value: '+1', label: '+1 - AMERICAN SAMOA' },
            { value: '+376', label: '+376 - ANDORRA' },
            { value: '+244', label: '+244 - ANGOLA' },
            { value: '+1264', label: '+1264 - ANGUILLA' },
            { value: '+672', label: '+672 - ANTARCTICA' },
            { value: '+1268', label: '+1268 - ANTIGUA AND BARBUDA' },
            { value: '+54', label: '+54 - ARGENTINA' },
            { value: '+374', label: '+374 - ARMENIA' },
            { value: '+297', label: '+297 - ARUBA' },
            { value: '+61', label: '+61 - AUSTRALIA' },
            { value: '+43', label: '+43 - AUSTRIA' },
            { value: '+994', label: '+994 - AZERBAIJAN' },
            { value: '+1242', label: '+1242 - BAHAMAS' },
            { value: '+973', label: '+973 - BAHRAIN' },
            { value: '+880', label: '+880 - BANGLADESH' },
            { value: '+1246', label: '+1246 - BARBADOS' },
            { value: '+375', label: '+375 - BELARUS' },
            { value: '+32', label: '+32 - BELGIUM' },
            { value: '+501', label: '+501 - BELIZE' },
            { value: '+229', label: '+229 - BENIN' },
            { value: '+1441', label: '+1441 - BERMUDA' },
            { value: '+975', label: '+975 - BHUTAN' },
            { value: '+591', label: '+591 - BOLIVIA' },
            { value: '+387', label: '+387 - BOSNIA AND HERZEGOVINA' },
            { value: '+267', label: '+267 - BOTSWANA' },
            { value: '+55', label: '+55 - BRAZIL' },
            { value: '+246', label: '+246 - BRITISH INDIAN OCEAN TERRITORY' },
            { value: '+673', label: '+673 - BRUNEI DARUSSALAM' },
            { value: '+359', label: '+359 - BULGARIA' },
            { value: '+226', label: '+226 - BURKINA FASO' },
            { value: '+257', label: '+257 - BURUNDI' },
            { value: '+855', label: '+855 - CAMBODIA' },
            { value: '+237', label: '+237 - CAMEROON' },
            { value: '+1', label: '+1 - CANADA' },
            { value: '+238', label: '+238 - CAPE VERDE' },
            { value: '+1345', label: '+1345 - CAYMAN ISLANDS' },
            { value: '+236', label: '+236 - CENTRAL AFRICAN REPUBLIC' },
            { value: '+235', label: '+235 - CHAD' },
            { value: '+56', label: '+56 - CHILE' },
            { value: '+86', label: '+86 - CHINA' },
            { value: '+61', label: '+61 - CHRISTMAS ISLAND' },
            { value: '+61', label: '+61 - COCOS (KEELING) ISLANDS' },
            { value: '+57', label: '+57 - COLOMBIA' },
            { value: '+269', label: '+269 - COMOROS' },
            { value: '+242', label: '+242 - CONGO' },
            { value: '+243', label: '+243 - CONGO, THE DEMOCRATIC REPUBLIC' },
            { value: '+682', label: '+682 - COOK ISLANDS' },
            { value: '+506', label: '+506 - COSTA RICA' },
            { value: '+225', label: '+225 - COTE D\'IVOIRE' },
            { value: '+385', label: '+385 - CROATIA' },
            { value: '+53', label: '+53 - CUBA' },
            { value: '+357', label: '+357 - CYPRUS' },
            { value: '+420', label: '+420 - CZECH REPUBLIC' },
            { value: '+45', label: '+45 - DENMARK' },
            { value: '+253', label: '+253 - DJIBOUTI' },
            { value: '+1767', label: '+1767 - DOMINICA' },
            { value: '+1809', label: '+1809 - DOMINICAN REPUBLIC' },
            { value: '+593', label: '+593 - ECUADOR' },
            { value: '+20', label: '+20 - EGYPT' },
            { value: '+503', label: '+503 - EL SALVADOR' },
            { value: '+240', label: '+240 - EQUATORIAL GUINEA' },
            { value: '+291', label: '+291 - ERITREA' },
            { value: '+372', label: '+372 - ESTONIA' },
            { value: '+251', label: '+251 - ETHIOPIA' },
            { value: '+500', label: '+500 - FALKLAND ISLANDS' },
            { value: '+298', label: '+298 - FAROE ISLANDS' },
            { value: '+679', label: '+679 - FIJI' },
            { value: '+358', label: '+358 - FINLAND' },
            { value: '+33', label: '+33 - FRANCE' },
            { value: '+594', label: '+594 - FRENCH GUIANA' },
            { value: '+689', label: '+689 - FRENCH POLYNESIA' },
            { value: '+262', label: '+262 - FRENCH SOUTHERN TERRITORIES' },
            { value: '+241', label: '+241 - GABON' },
            { value: '+220', label: '+220 - GAMBIA' },
            { value: '+995', label: '+995 - GEORGIA' },
            { value: '+49', label: '+49 - GERMANY' },
            { value: '+233', label: '+233 - GHANA' },
            { value: '+350', label: '+350 - GIBRALTAR' },
            { value: '+30', label: '+30 - GREECE' },
            { value: '+299', label: '+299 - GREENLAND' },
            { value: '+1473', label: '+1473 - GRENADA' },
            { value: '+590', label: '+590 - GUADELOUPE' },
            { value: '+1671', label: '+1671 - GUAM' },
            { value: '+502', label: '+502 - GUATEMALA' },
            { value: '+44', label: '+44 - GUERNSEY' },
            { value: '+224', label: '+224 - GUINEA' },
            { value: '+245', label: '+245 - GUINEA-BISSAU' },
            { value: '+592', label: '+592 - GUYANA' },
            { value: '+509', label: '+509 - HAITI' },
            { value: '+672', label: '+672 - HEARD ISLAND AND MCDONALD ISLANDS' },
            { value: '+39', label: '+39 - HOLY SEE (VATICAN CITY STATE)' },
            { value: '+504', label: '+504 - HONDURAS' },
            { value: '+852', label: '+852 - HONG KONG' },
            { value: '+36', label: '+36 - HUNGARY' },
            { value: '+354', label: '+354 - ICELAND' },
            { value: '+91', label: '+91 - INDIA' },
            { value: '+62', label: '+62 - INDONESIA' },
            { value: '+98', label: '+98 - IRAN, ISLAMIC REPUBLIC OF' },
            { value: '+964', label: '+964 - IRAQ' },
            { value: '+353', label: '+353 - IRELAND' },
            { value: '+44', label: '+44 - ISLE OF MAN' },
            { value: '+972', label: '+972 - ISRAEL' },
            { value: '+39', label: '+39 - ITALY' },
            { value: '+1876', label: '+1876 - JAMAICA' },
            { value: '+81', label: '+81 - JAPAN' },
            { value: '+44', label: '+44 - JERSEY' },
            { value: '+962', label: '+962 - JORDAN' },
            { value: '+7', label: '+7 - KAZAKHSTAN' },
            { value: '+254', label: '+254 - KENYA' },
            { value: '+686', label: '+686 - KIRIBATI' },
            { value: '+850', label: '+850 - KOREA, DEMOCRATIC PEOPLE\'S REPUBLIC OF' },
            { value: '+82', label: '+82 - KOREA, REPUBLIC OF' },
            { value: '+965', label: '+965 - KUWAIT' },
            { value: '+996', label: '+996 - KYRGYZSTAN' },
            { value: '+856', label: '+856 - LAO PEOPLE\'S DEMOCRATIC REPUBLIC' },
            { value: '+371', label: '+371 - LATVIA' },
            { value: '+961', label: '+961 - LEBANON' },
            { value: '+266', label: '+266 - LESOTHO' },
            { value: '+231', label: '+231 - LIBERIA' },
            { value: '+218', label: '+218 - LIBYAN ARAB JAMAHIRIYA' },
            { value: '+423', label: '+423 - LIECHTENSTEIN' },
            { value: '+370', label: '+370 - LITHUANIA' },
            { value: '+352', label: '+352 - LUXEMBOURG' },
            { value: '+853', label: '+853 - MACAO' },
            { value: '+389', label: '+389 - MACEDONIA' },
            { value: '+261', label: '+261 - MADAGASCAR' },
            { value: '+265', label: '+265 - MALAWI' },
            { value: '+60', label: '+60 - MALAYSIA' },
            { value: '+960', label: '+960 - MALDIVES' },
            { value: '+223', label: '+223 - MALI' },
            { value: '+356', label: '+356 - MALTA' },
            { value: '+692', label: '+692 - MARSHALL ISLANDS' },
            { value: '+596', label: '+596 - MARTINIQUE' },
            { value: '+222', label: '+222 - MAURITANIA' },
            { value: '+230', label: '+230 - MAURITIUS' },
            { value: '+262', label: '+262 - MAYOTTE' },
            { value: '+52', label: '+52 - MEXICO' },
            { value: '+691', label: '+691 - MICRONESIA, FEDERATED STATES OF' },
            { value: '+373', label: '+373 - MOLDOVA, REPUBLIC OF' },
            { value: '+377', label: '+377 - MONACO' },
            { value: '+976', label: '+976 - MONGOLIA' },
            { value: '+382', label: '+382 - MONTENEGRO' },
            { value: '+1664', label: '+1664 - MONTSERRAT' },
            { value: '+212', label: '+212 - MOROCCO' },
            { value: '+258', label: '+258 - MOZAMBIQUE' },
            { value: '+95', label: '+95 - MYANMAR' },
            { value: '+264', label: '+264 - NAMIBIA' },
            { value: '+674', label: '+674 - NAURU' },
            { value: '+977', label: '+977 - NEPAL' },
            { value: '+31', label: '+31 - NETHERLANDS' },
            { value: '+599', label: '+599 - NETHERLANDS ANTILLES' },
            { value: '+687', label: '+687 - NEW CALEDONIA' },
            { value: '+64', label: '+64 - NEW ZEALAND' },
            { value: '+505', label: '+505 - NICARAGUA' },
            { value: '+227', label: '+227 - NIGER' },
            { value: '+234', label: '+234 - NIGERIA' },
            { value: '+683', label: '+683 - NIUE' },
            { value: '+672', label: '+672 - NORFOLK ISLAND' },
            { value: '+1670', label: '+1670 - NORTHERN MARIANA ISLANDS' },
            { value: '+47', label: '+47 - NORWAY' },
            { value: '+968', label: '+968 - OMAN' },
            { value: '+92', label: '+92 - PAKISTAN' },
            { value: '+680', label: '+680 - PALAU' },
            { value: '+970', label: '+970 - PALESTINIAN TERRITORY, OCCUPIED' },
            { value: '+507', label: '+507 - PANAMA' },
            { value: '+675', label: '+675 - PAPUA NEW GUINEA' },
            { value: '+595', label: '+595 - PARAGUAY' },
            { value: '+51', label: '+51 - PERU' },
            { value: '+63', label: '+63 - PHILIPPINES' },
            { value: '+870', label: '+870 - PITCAIRN' },
            { value: '+48', label: '+48 - POLAND' },
            { value: '+351', label: '+351 - PORTUGAL' },
            { value: '+1787', label: '+1787 - PUERTO RICO' },
            { value: '+974', label: '+974 - QATAR' },
            { value: '+262', label: '+262 - REUNION' },
            { value: '+40', label: '+40 - ROMANIA' },
            { value: '+7', label: '+7 - RUSSIAN FEDERATION' },
            { value: '+250', label: '+250 - RWANDA' },
            { value: '+290', label: '+290 - SAINT HELENA' },
            { value: '+1869', label: '+1869 - SAINT KITTS AND NEVIS' },
            { value: '+1758', label: '+1758 - SAINT LUCIA' },
            { value: '+508', label: '+508 - SAINT PIERRE AND MIQUELON' },
            { value: '+1784', label: '+1784 - SAINT VINCENT AND THE GRENADINES' },
            { value: '+685', label: '+685 - SAMOA' },
            { value: '+378', label: '+378 - SAN MARINO' },
            { value: '+239', label: '+239 - SAO TOME AND PRINCIPE' },
            { value: '+966', label: '+966 - SAUDI ARABIA' },
            { value: '+221', label: '+221 - SENEGAL' },
            { value: '+381', label: '+381 - SERBIA' },
            { value: '+248', label: '+248 - SEYCHELLES' },
            { value: '+232', label: '+232 - SIERRA LEONE' },
            { value: '+65', label: '+65 - SINGAPORE' },
            { value: '+421', label: '+421 - SLOVAKIA' },
            { value: '+386', label: '+386 - SLOVENIA' },
            { value: '+677', label: '+677 - SOLOMON ISLANDS' },
            { value: '+252', label: '+252 - SOMALIA' },
            { value: '+27', label: '+27 - SOUTH AFRICA' },
            { value: '+500', label: '+500 - SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS' },
            { value: '+34', label: '+34 - SPAIN' },
            { value: '+94', label: '+94 - SRI LANKA' },
            { value: '+249', label: '+249 - SUDAN' },
            { value: '+597', label: '+597 - SURINAME' },
            { value: '+47', label: '+47 - SVALBARD AND JAN MAYEN' },
            { value: '+268', label: '+268 - SWAZILAND' },
            { value: '+46', label: '+46 - SWEDEN' },
            { value: '+41', label: '+41 - SWITZERLAND' },
            { value: '+963', label: '+963 - SYRIAN ARAB REPUBLIC' },
            { value: '+886', label: '+886 - TAIWAN, PROVINCE OF CHINA' },
            { value: '+992', label: '+992 - TAJIKISTAN' },
            { value: '+255', label: '+255 - TANZANIA, UNITED REPUBLIC OF' },
            { value: '+66', label: '+66 - THAILAND' },
            { value: '+670', label: '+670 - TIMOR-LESTE' },
            { value: '+228', label: '+228 - TOGO' },
            { value: '+690', label: '+690 - TOKELAU' },
            { value: '+676', label: '+676 - TONGA' },
            { value: '+1868', label: '+1868 - TRINIDAD AND TOBAGO' },
            { value: '+216', label: '+216 - TUNISIA' },
            { value: '+90', label: '+90 - TURKEY' },
            { value: '+993', label: '+993 - TURKMENISTAN' },
            { value: '+1649', label: '+1649 - TURKS AND CAICOS ISLANDS' },
            { value: '+688', label: '+688 - TUVALU' },
            { value: '+256', label: '+256 - UGANDA' },
            { value: '+380', label: '+380 - UKRAINE' },
            { value: '+971', label: '+971 - UNITED ARAB EMIRATES' },
            { value: '+44', label: '+44 - UNITED KINGDOM' },
            { value: '+1', label: '+1 - UNITED STATES' },
            { value: '+1', label: '+1 - UNITED STATES MINOR OUTLYING ISLANDS' },
            { value: '+598', label: '+598 - URUGUAY' },
            { value: '+998', label: '+998 - UZBEKISTAN' },
            { value: '+678', label: '+678 - VANUATU' },
            { value: '+58', label: '+58 - VENEZUELA' },
            { value: '+84', label: '+84 - VIET NAM' },
            { value: '+1284', label: '+1284 - VIRGIN ISLANDS, BRITISH' },
            { value: '+1340', label: '+1340 - VIRGIN ISLANDS, U.S.' },
            { value: '+681', label: '+681 - WALLIS AND FUTUNA' },
            { value: '+212', label: '+212 - WESTERN SAHARA' },
            { value: '+967', label: '+967 - YEMEN' },
            { value: '+260', label: '+260 - ZAMBIA' },
            { value: '+263', label: '+263 - ZIMBABWE' },
          ]}
          labels={{
            addTraveller: getTranslation('addTraveller', language),
            removeTraveller: getTranslation('removeTraveller', language),
            passportNumber: getTranslation('passportNumber', language),
            fullPassportName: getTranslation('fullPassportName', language),
            nationality: getTranslation('nationality', language),
            dateOfBirth: getTranslation('dateOfBirth', language),
            countryOfBirth: getTranslation('countryOfBirth', language),
            gender: getTranslation('gender', language),
            male: getTranslation('male', language),
            female: getTranslation('female', language),
            passportExpiryDate: getTranslation('passportExpiryDate', language),
            mobileNumber: getTranslation('mobileNumber', language),
            email: getTranslation('email', language),
            hasVisaOrKitas: getTranslation('hasVisaOrKitas', language),
            visaOrKitasNumber: getTranslation('visaOrKitasNumber', language),
            yes: getTranslation('yes', language),
            no: getTranslation('no', language),
          }}
        />
      </div>
    </div>
  );

  // Render Step 3: Travel Details
  const renderStep3 = () => {
    // Check if user is Indonesian citizen (either from Step 1 or nationality from Step 2)
    const isIndonesianCitizen = formData.citizenshipType === 'indonesian' || 
                               formData.nationality.toLowerCase() === 'indonesia';
    
    return (
      <div className="space-y-6">
        <div className="border-l-4 border-blue-500 pl-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {getTranslation('travelDetails', language)}
          </h2>
          <p className="text-gray-600 mt-2">
            Please complete your Arrival Card before entering Indonesia by filling out the required information.
          </p>
        </div>
        
        {/* Arrival Date - Always shown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <DateInput
            label={getTranslation('arrivalDateToIndonesia', language)}
            required
            value={formData.arrivalDate}
            onChange={(e) => updateFormData('arrivalDate', e.target.value)}
            error={errors.arrivalDate}
            allowedDaysFromToday={3}
            placeholder="DD/MM/YYYY"
          />
          
          {/* Departure Date - Only for Foreign citizens */}
          {!isIndonesianCitizen && (
            <DateInput
              label={getTranslation('departureDateFromIndonesia', language)}
              required
              value={formData.departureDate}
              onChange={(e) => updateFormData('departureDate', e.target.value)}
              error={errors.departureDate}
              allowFutureDate={true}
              placeholder="DD/MM/YYYY"
            />
          )}
        </div>

        {/* Visa or KITAS/KITAP Question - Only for Foreign citizens */}
        {!isIndonesianCitizen && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {getTranslation('hasVisaOrKitas', language)} <span className="text-red-500">*</span>
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                formData.hasVisaOrKitas === true 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="hasVisaOrKitas"
                  value="true"
                  checked={formData.hasVisaOrKitas === true}
                  onChange={() => updateFormData('hasVisaOrKitas', true)}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${
                  formData.hasVisaOrKitas === true 
                    ? 'text-blue-600' 
                    : 'text-gray-700'
                }`}>
                  {getTranslation('yes', language)}
                </span>
              </label>
              
              <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                formData.hasVisaOrKitas === false 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="hasVisaOrKitas"
                  value="false"
                  checked={formData.hasVisaOrKitas === false}
                  onChange={() => {
                    updateFormData('hasVisaOrKitas', false);
                    updateFormData('visaOrKitasNumber', ''); // Clear visa number when No is selected
                  }}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${
                  formData.hasVisaOrKitas === false 
                    ? 'text-blue-600' 
                    : 'text-gray-700'
                }`}>
                  {getTranslation('no', language)}
                </span>
              </label>
            </div>
            {errors.hasVisaOrKitas && (
              <p className="text-sm text-red-600">{errors.hasVisaOrKitas}</p>
            )}
          </div>
        )}

        {/* Conditional Visa/KITAS Number Field - Only for Foreign citizens who answered Yes */}
        {!isIndonesianCitizen && formData.hasVisaOrKitas === true && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FormInput
              label={getTranslation('visaOrKitasNumber', language)}
              required
              placeholder="Enter Visa or KITAS/KITAP Number"
              value={formData.visaOrKitasNumber}
              onChange={(e) => updateFormData('visaOrKitasNumber', e.target.value.toUpperCase())}
              error={errors.visaOrKitasNumber}
            />
          </div>
        )}

        {/* Visa Information for Additional Travelers */}
        {!isIndonesianCitizen && formData.familyMembers && formData.familyMembers.length > 0 && (
          <div className="space-y-6">
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-lg font-bold text-gray-900">
                Visa Information for Additional Travelers
              </h3>
              <p className="text-gray-600 mt-2">
                Please provide visa information for each additional traveler.
              </p>
            </div>

            {formData.familyMembers.map((member, index) => (
              <div key={member.id} className="border border-gray-200 rounded-lg p-6 space-y-6 bg-gray-50">
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-base font-medium text-gray-900">
                    Traveler {index + 2}: {member.fullPassportName || 'Unnamed Traveler'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Passport: {member.passportNumber || 'Not specified'}
                  </p>
                </div>

                {/* Visa/KITAS Question for this family member */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {getTranslation('hasVisaOrKitas', language)} <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      member.hasVisaOrKitas === true 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name={`familyMemberVisa-${member.id}`}
                        value="true"
                        checked={member.hasVisaOrKitas === true}
                        onChange={() => {
                          const updatedMembers = formData.familyMembers.map(m => 
                            m.id === member.id ? { ...m, hasVisaOrKitas: true } : m
                          );
                          updateFormData('familyMembers', updatedMembers);
                        }}
                        className="sr-only"
                      />
                      <span className={`text-sm font-medium ${
                        member.hasVisaOrKitas === true 
                          ? 'text-blue-600' 
                          : 'text-gray-700'
                      }`}>
                        {getTranslation('yes', language)}
                      </span>
                    </label>
                    
                    <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      member.hasVisaOrKitas === false 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name={`familyMemberVisa-${member.id}`}
                        value="false"
                        checked={member.hasVisaOrKitas === false}
                        onChange={() => {
                          const updatedMembers = formData.familyMembers.map(m => 
                            m.id === member.id ? { ...m, hasVisaOrKitas: false, visaOrKitasNumber: '' } : m
                          );
                          updateFormData('familyMembers', updatedMembers);
                        }}
                        className="sr-only"
                      />
                      <span className={`text-sm font-medium ${
                        member.hasVisaOrKitas === false 
                          ? 'text-blue-600' 
                          : 'text-gray-700'
                      }`}>
                        {getTranslation('no', language)}
                      </span>
                    </label>
                  </div>
                  {errors[`familyMember-${member.id}-hasVisaOrKitas`] && (
                    <p className="text-sm text-red-600">{errors[`familyMember-${member.id}-hasVisaOrKitas`]}</p>
                  )}
                </div>

                {/* Conditional Visa Number Field for this family member */}
                {member.hasVisaOrKitas === true && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormInput
                      label={getTranslation('visaOrKitasNumber', language)}
                      required
                      placeholder="Enter Visa or KITAS/KITAP Number"
                      value={member.visaOrKitasNumber}
                      onChange={(e) => {
                        const updatedMembers = formData.familyMembers.map(m => 
                          m.id === member.id ? { ...m, visaOrKitasNumber: e.target.value.toUpperCase() } : m
                        );
                        updateFormData('familyMembers', updatedMembers);
                      }}
                      error={errors[`familyMember-${member.id}-visaOrKitasNumber`]}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };


  // Render Step 4: Mode of Transportation and Address
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="border-l-4 border-blue-500 pl-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {getTranslation('modeOfTransportAndAddress', language)}
        </h2>
        <p className="text-gray-600 mt-2">
          Please select the method of transport you will use to enter Indonesia.
        </p>
      </div>

      {/* Mode of Transport Section */}
      <div className="border-l-4 border-blue-500 pl-4 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {getTranslation('modeOfTransport', language)}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormSelect
            label={getTranslation('modeOfTransport', language)}
            required
            options={[
              { value: 'AIR', label: 'AIR' },
              { value: 'SEA', label: 'SEA' }
            ]}
            value={formData.modeOfTransport}
            onChange={(e) => {
              updateFormData('modeOfTransport', e.target.value);
              // Clear all transport-specific fields when changing mode
              updateFormData('placeOfArrival', '');
              updateFormData('typeOfAirTransport', '');
              updateFormData('flightName', '');
              updateFormData('flightNumber', '');
              updateFormData('typeOfVessel', '');
              updateFormData('vesselName', '');
            }}
            error={errors.modeOfTransport}
          />
          
          <FormSelect
            label={getTranslation('purposeOfTravel', language)}
            required
            options={[
              { value: '1-DAY TRANSIT', label: '1-DAY TRANSIT' },
              { value: 'BUSINESS/MEETING/CONFERENCE/CONVENTION/EXHIBITION', label: 'BUSINESS/MEETING/CONFERENCE/CONVENTION/EXHIBITION' },
              { value: 'CREW', label: 'CREW' },
              { value: 'EDUCATION/TRAINING', label: 'EDUCATION/TRAINING' },
              { value: 'EMPLOYMENT', label: 'EMPLOYMENT' },
              { value: 'HOLIDAY/SIGHTSEEING/LEISURE', label: 'HOLIDAY/SIGHTSEEING/LEISURE' },
              { value: 'MEDICAL CARE', label: 'MEDICAL CARE' },
              { value: 'OFFICIAL/GOVERNMENT VISIT', label: 'OFFICIAL/GOVERNMENT VISIT' },
              { value: 'RELIGION', label: 'RELIGION' },
              { value: 'SPORT EVENT', label: 'SPORT EVENT' },
              { value: 'VISITING FRIENDS/RELATIVES', label: 'VISITING FRIENDS/RELATIVES' },
              { value: 'OTHERS', label: 'OTHERS' }
            ]}
            value={formData.purposeOfTravel}
            onChange={(e) => updateFormData('purposeOfTravel', e.target.value)}
            error={errors.purposeOfTravel}
          />
        </div>

        {/* Conditional Air Transport Fields */}
        {formData.modeOfTransport === 'AIR' && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">
              The fields in this section are based on the selected &quot;AIR&quot; transport mode above.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormSelect
                label={getTranslation('placeOfArrival', language)}
                required
                options={[
                  { value: 'CGK - SOEKARNO-HATTA AIRPORT', label: 'CGK - SOEKARNO-HATTA AIRPORT' },
                  { value: 'DPS - I GUSTI NGURAH RAI AIRPORT', label: 'DPS - I GUSTI NGURAH RAI AIRPORT' },
                  { value: 'SUB - JUANDA AIRPORT', label: 'SUB - JUANDA AIRPORT' },
                  { value: 'KNO - KUALANAMU AIRPORT', label: 'KNO - KUALANAMU AIRPORT' },
                  { value: 'SRG - AHMAD YANI AIRPORT', label: 'SRG - AHMAD YANI AIRPORT' },
                  { value: 'HLP - HALIM PERDANAKUSUMA AIRPORT', label: 'HLP - HALIM PERDANAKUSUMA AIRPORT' },
                  { value: 'BTH - HANG NADIM AIRPORT', label: 'BTH - HANG NADIM AIRPORT' },
                  { value: 'TJQ - H.A.S. HANANDJOEDDIN AIRPORT', label: 'TJQ - H.A.S. HANANDJOEDDIN AIRPORT' },
                  { value: 'KJT - KERTAJATI AIRPORT', label: 'KJT - KERTAJATI AIRPORT' },
                  { value: 'KMD - KOMODO AIRPORT', label: 'KMD - KOMODO AIRPORT' },
                  { value: 'YIA - KULON PROGO AIRPORT', label: 'YIA - KULON PROGO AIRPORT' },
                  { value: 'PDG - MINANGKABAU AIRPORT', label: 'PDG - MINANGKABAU AIRPORT' },
                  { value: 'MDC - SAM RATULANGI AIRPORT', label: 'MDC - SAM RATULANGI AIRPORT' },
                  { value: 'DJJ - SENTANI AIRPORT', label: 'DJJ - SENTANI AIRPORT' },
                  { value: 'BPN - SULTAN AJI MUHAMMAD SULAIMAN AIRPORT', label: 'BPN - SULTAN AJI MUHAMMAD SULAIMAN AIRPORT' },
                  { value: 'UPG - SULTAN HASANUDDIN AIRPORT', label: 'UPG - SULTAN HASANUDDIN AIRPORT' },
                  { value: 'BTJ - SULTAN ISKANDAR MUDA AIRPORT', label: 'BTJ - SULTAN ISKANDAR MUDA AIRPORT' },
                  { value: 'PLM - SULTAN MAHMUD BADARUDDIN II AIRPORT', label: 'PLM - SULTAN MAHMUD BADARUDDIN II AIRPORT' },
                  { value: 'PKU - SULTAN SYARIF KASIM II AIRPORT', label: 'PKU - SULTAN SYARIF KASIM II AIRPORT' },
                  { value: 'PNK - SUPADIO AIRPORT', label: 'PNK - SUPADIO AIRPORT' },
                  { value: 'BDJ - SYAMSUDIN NOOR AIRPORT', label: 'BDJ - SYAMSUDIN NOOR AIRPORT' },
                  { value: 'LOP - ZAINUDDIN ABDUL MAJID AIRPORT', label: 'LOP - ZAINUDDIN ABDUL MAJID AIRPORT' }
                ]}
                value={formData.placeOfArrival}
                onChange={(e) => updateFormData('placeOfArrival', e.target.value)}
                error={errors.placeOfArrival}
              />
              
              <FormSelect
                label={getTranslation('typeOfAirTransport', language)}
                required
                options={[
                  { value: 'COMMERCIAL FLIGHT', label: 'COMMERCIAL FLIGHT' },
                  { value: 'GOVERNMENT FLIGHT', label: 'GOVERNMENT FLIGHT' },
                  { value: 'CHARTER FLIGHT', label: 'CHARTER FLIGHT' }
                ]}
                value={formData.typeOfAirTransport}
                onChange={(e) => updateFormData('typeOfAirTransport', e.target.value)}
                error={errors.typeOfAirTransport}
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {getTranslation('flightName', language)} <span className="text-red-500 ml-1">*</span>
                </label>
                <AirlineSelect
                  options={airlines}
                  value={formData.flightName}
                  onChange={(value) => {
                    updateFormData('flightName', value);
                    // Extract airline code from airline name using mapping
                    const airlineCode = airlineToIataMap[value] || '';
                    // Clear the flight number when airline changes
                    updateFormData('flightNumber', '');
                  }}
                  placeholder="Select airline..."
                  className={errors.flightName ? 'border-red-500' : ''}
                />
                {errors.flightName && <p className="text-sm text-red-600">{errors.flightName}</p>}
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {getTranslation('flightNumber', language)} <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 min-w-[50px] text-center">
                    {formData.flightName ? (airlineToIataMap[formData.flightName] || 'XXX') : 'XXX'}
                  </span>
                  <input
                    type="text"
                    placeholder="Enter Flight Number"
                    value={formData.flightNumber}
                    onChange={(e) => updateFormData('flightNumber', e.target.value.toUpperCase())}
                    className={`flex-1 h-[42px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      errors.flightNumber ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.flightNumber && <p className="text-sm text-red-600">{errors.flightNumber}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Conditional Sea Transport Fields */}
        {formData.modeOfTransport === 'SEA' && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">
              The fields in this section are based on the selected &quot;SEA&quot; transport mode above.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormSelect
                label={getTranslation('placeOfArrival', language)}
                required
                options={seaPorts}
                value={formData.placeOfArrival}
                onChange={(e) => updateFormData('placeOfArrival', e.target.value)}
                error={errors.placeOfArrival}
              />
              
              <FormSelect
                label={getTranslation('typeOfVessel', language)}
                required
                options={[
                  { value: 'YACHT', label: 'YACHT' },
                  { value: 'FERRY', label: 'FERRY' },
                  { value: 'CRUISE', label: 'CRUISE' },
                  { value: 'CARGO / TANKER', label: 'CARGO / TANKER' }
                ]}
                value={formData.typeOfVessel}
                onChange={(e) => updateFormData('typeOfVessel', e.target.value)}
                error={errors.typeOfVessel}
              />
              
              <FormInput
                label={getTranslation('vesselName', language)}
                required
                placeholder="Enter Vessel Name"
                value={formData.vesselName}
                onChange={(e) => updateFormData('vesselName', e.target.value)}
                error={errors.vesselName}
              />
            </div>
          </div>
        )}
      </div>

      {/* Address in Indonesia Section */}
      <div className="border-l-4 border-blue-500 pl-4 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {getTranslation('addressInIndonesia', language)}
        </h3>
        <p className="text-gray-600">
          Please provide the address where you will be staying in Indonesia
        </p>
        
        <div className="space-y-4">
          <FormInput
            label={getTranslation('addressInIndonesia', language)}
            required
            placeholder="Enter your address in Indonesia"
            value={formData.addressInIndonesia}
            onChange={(e) => updateFormData('addressInIndonesia', e.target.value)}
            error={errors.addressInIndonesia}
          />
        </div>
      </div>
    </div>
  );

  // Render Step 5: Declaration
  const renderStep5 = () => (
    <div className="space-y-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
        Declaration
      </h2>
      
      {/* Health Declaration */}
      <div className="border-l-4 border-blue-500 pl-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Health Declaration
        </h3>
        <p className="text-sm text-gray-600">
          In accordance with Indonesia&apos;s national health protocols, please complete the health declaration form to support public health monitoring and prevent the spread of infectious diseases.
        </p>
        
        {/* Symptoms Question */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Do you have any of the following symptoms: fever, cough, runny nose, shortness of breath, sore throat, or skin lesions/rashes?
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasSymptoms"
                value="true"
                checked={formData.hasSymptoms === true}
                onChange={() => {
                  updateFormData('hasSymptoms', true);
                }}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasSymptoms"
                value="false"
                checked={formData.hasSymptoms === false}
                onChange={() => {
                  updateFormData('hasSymptoms', false);
                  updateFormData('selectedSymptoms', []); // Clear symptoms when selecting "No"
                }}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">No</span>
            </label>
          </div>
          {errors.hasSymptoms && (
            <p className="text-sm text-red-600">{errors.hasSymptoms}</p>
          )}
        </div>
        
        {/* Symptom Selection - Only shown when hasSymptoms is true */}
        {formData.hasSymptoms === true && (
          <div className="space-y-2 pl-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">
              Select your symptoms (Can select more than one)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'COUGH',
                'FEVER', 
                'RUNNY NOSE',
                'SHORTNESS OF BREATH',
                'SKIN LESIONS / RASHES / PATCHES',
                'SORE THROAT'
              ].map((symptom) => (
                <label key={symptom} className="flex items-center gap-2 cursor-pointer p-2 border rounded-md hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.selectedSymptoms.includes(symptom)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFormData('selectedSymptoms', [...formData.selectedSymptoms, symptom]);
                      } else {
                        updateFormData('selectedSymptoms', formData.selectedSymptoms.filter(s => s !== symptom));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{symptom}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Countries Visited */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Countries of origin departure, transit and other countries that you visited within 21 days before departure to Indonesia (Can select more than one)
          </p>
          <FormSelect
            label="Countries visited within 21 days"
            options={[
              { value: '', label: 'Select countries visited' },
              ...countries
            ]}
            value=""
            onChange={(e) => {
              if (e.target.value && !formData.countriesVisited.includes(e.target.value)) {
                updateFormData('countriesVisited', [...formData.countriesVisited, e.target.value]);
              }
            }}
          />
          {errors.countriesVisited && (
            <p className="text-red-600 text-sm">{errors.countriesVisited}</p>
          )}
          {formData.countriesVisited.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.countriesVisited.map((country, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                  {country}
                  <button
                    type="button"
                    onClick={() => {
                      updateFormData('countriesVisited', formData.countriesVisited.filter((_, i) => i !== index));
                    }}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quarantine Declaration */}
      <div className="border-l-4 border-blue-500 pl-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Quarantine Declaration
        </h3>
        <p className="text-sm text-gray-600">
          Please fill out the quarantine declaration according to your current condition, which will later be verified by quarantine officers.
        </p>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Are you carrying any animals, fish, plants, and/or their processed products?
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasQuarantineItems"
                value="true"
                checked={formData.hasQuarantineItems === true}
                onChange={() => updateFormData('hasQuarantineItems', true)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasQuarantineItems"
                value="false"
                checked={formData.hasQuarantineItems === false}
                onChange={() => updateFormData('hasQuarantineItems', false)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">No</span>
            </label>
          </div>
          {errors.hasQuarantineItems && (
            <p className="text-sm text-red-600">{errors.hasQuarantineItems}</p>
          )}
        </div>
      </div>

      {/* Customs Declaration (BC 2.2) - Collapsible */}
      <div className="border-l-4 border-blue-500 pl-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Customs Declaration (BC 2.2) - Customs Declaration of Goods Carried by Passenger & Crew Members
        </h3>
        <p className="text-sm text-gray-600">
          This page is the section to declare your belongings to be submitted to Customs Officers.
        </p>

        {/* Collapsible Details Section */}
        <CollapsibleSection 
          title="Please press this button to read the following information before answers the question below:"
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p>Thank you for your cooperation in complying with Indonesian laws and regulations during the customs clearance process. You may declare your family belongings in a joint declaration.</p>
              <p className="font-medium">Your family belongings may be exempt from Import Duties and Taxes subject to the following conditions:</p>
            </div>
            
            {/* Exemption Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left border-b">Subject/Object</th>
                    <th className="px-4 py-2 text-center border-b">Import Duties Exemption (per Arrival per Person/Categories)</th>
                    <th className="px-4 py-2 text-center border-b">per Passenger</th>
                    <th className="px-4 py-2 text-center border-b">per Crew Member</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2">Passengers</td>
                    <td className="px-4 py-2">Up to FOR USD500.00</td>
                    <td className="px-4 py-2 text-center">All personal goods</td>
                    <td className="px-4 py-2 text-center">-</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2">Regular Bag Regime</td>
                    <td className="px-4 py-2">Up to FOR USD1,500.00</td>
                    <td className="px-4 py-2 text-center">All personal goods, as long as comply with the applicable terms and conditions</td>
                    <td className="px-4 py-2 text-center">-</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2">Exclusive Bag Regime</td>
                    <td className="px-4 py-2">Up to FOR USD500.00</td>
                    <td className="px-4 py-2 text-center">All personal goods</td>
                    <td className="px-4 py-2 text-center">-</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2">Competition/Award Prize Items</td>
                    <td className="px-4 py-2">Up to FOR USD5,000.00</td>
                    <td className="px-4 py-2 text-center">All prizes, as long as comply with the applicable terms and conditions</td>
                    <td className="px-4 py-2 text-center">-</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2">Crew Members</td>
                    <td className="px-4 py-2">Up to FOR USD500.00</td>
                    <td className="px-4 py-2 text-center">-</td>
                    <td className="px-4 py-2 text-center">25 sticks or 5 capsules</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Type of Excise Goods Table */}
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left border-b">Type of Excise Goods</th>
                    <th className="px-4 py-2 text-center border-b">per Passenger</th>
                    <th className="px-4 py-2 text-center border-b">per Crew Member</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2">Alcoholic Beverage</td>
                    <td className="px-4 py-2 text-center">1 Litre</td>
                    <td className="px-4 py-2 text-center">350 ml</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2">Tobacco Products/Cigarettes</td>
                    <td className="px-4 py-2 text-center">200 sticks</td>
                    <td className="px-4 py-2 text-center">40 sticks</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2">Cigars</td>
                    <td className="px-4 py-2 text-center">25 sticks</td>
                    <td className="px-4 py-2 text-center">10 sticks</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2">Sliced Tobacco</td>
                    <td className="px-4 py-2 text-center">100 grams</td>
                    <td className="px-4 py-2 text-center">40 grams</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2">Other Tobacco Products</td>
                    <td className="px-4 py-2 text-center">100 grams or equivalent</td>
                    <td className="px-4 py-2 text-center">40 grams or equivalent</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2">Closed System Liquid Electronic Cigarettes</td>
                    <td className="px-4 py-2 text-center">100 sticks or 40 capsules</td>
                    <td className="px-4 py-2 text-center">25 sticks or 5 capsules</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2">Open System Liquid Electronic Cigarettes</td>
                    <td className="px-4 py-2 text-center">20 ml</td>
                    <td className="px-4 py-2 text-center">15 ml</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-sm text-gray-600 space-y-2 mt-4">
              <ul className="list-disc pl-5 space-y-1">
                <li>If you are carrying more than 3 unit type of excise tobacco product, the duty exemption will be granted proportionally.</li>
                <li>Excise goods (alcohol, liquor and/or tobacco) exceeding the allowable limits will be destroyed by Customs Officers.</li>
                <li>If you are carrying important goods that are not for personal use (an unreasonable quantity for personal use/consumption, commercial goods, or goods intended for business, others, institutions, or donations), import duties and taxes will be applied, and you must comply with import restrictions.</li>
                <li>Import duty exemptions exclude goods whose imports are prohibited or restricted in accordance with applicable laws and regulations.</li>
                <li>Personal effects purchased or obtained abroad s value exceeding the duty-free limit (check information page above).</li>
                <li>Any medicine/drug is subject to permit and control in accordance with applicable laws and regulations.</li>
                <li>Goods originating from Indonesia that are brought back into the country (re-imported), which were previously declared to the Customs Officers upon departure.</li>
                <li>Goods from abroad for temporary used in Indonesia that will be brought back (temporary admission).</li>
              </ul>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Number of Baggage */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Number of Baggage Arriving with You
        </label>
        <input
          type="number"
          min="0"
          placeholder="Enter number of baggage"
          value={formData.baggageCount}
          onChange={(e) => updateFormData('baggageCount', e.target.value)}
          className={`w-full h-[42px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
            errors.baggageCount ? 'border-red-500' : ''
          }`}
        />
        {errors.baggageCount && (
          <p className="text-sm text-red-600">{errors.baggageCount}</p>
        )}
      </div>

      {/* Additional Goods Declaration */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-700">
          Are You bringing any goods that need to declare to Customs?
        </p>
        
        {/* Expandable list of goods that need declaration */}
        <CollapsibleSection 
          title="Please press this button to know list of goods that need to declare."
          className="mb-4"
        >
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>A.</strong> Narcotics, psycotropic substances, precursors, drugs, firearms, air guns, sharp weapons, ammunition, explosives, and pornographic items/publications.</p>
            <p><strong>B.</strong> Currency and/or bearer negotiable instruments in Rupiah or other foreign currencies equivalent to the amount to 100 million Rupiah or more.</p>
            <p><strong>C.</strong> Excise Goods, such as alcoholic beverages, cigarettes/cigars, sliced tobacco, other tobacco products, or electronic cigarettes, with an amount exceeding the excise exemption limit (check information page above).</p>
            <p><strong>D.</strong> Personal effects purchased or obtained abroad a value exceeding the duty-free limit (check information page above).</p>
            <p><strong>E.</strong> Non-personal effects purchased or obtained abroad (including commercial goods).</p>
            <p><strong>F.</strong> Goods originating from Indonesia that are brought back into the country (re-imported), which were previously declared to the Customs Officers upon departure.</p>
            <p><strong>G.</strong> Goods from abroad for temporary used in Indonesia that will be brought back (temporary admission).</p>
          </div>
        </CollapsibleSection>
        
        {/* Yes/No for additional goods */}
        <div className="flex gap-6">
          <label className={`flex items-center gap-2 cursor-pointer px-6 py-2 border rounded-lg hover:bg-gray-50 ${
            formData.hasGoodsToDeclarate === true ? 'bg-blue-50 border-blue-500' : ''
          }`}>
            <input
              type="radio"
              name="hasAdditionalGoods"
              value="true"
              checked={formData.hasGoodsToDeclarate === true}
              onChange={() => updateFormData('hasGoodsToDeclarate', true)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Yes</span>
          </label>
          <label className={`flex items-center gap-2 cursor-pointer px-6 py-2 border rounded-lg hover:bg-gray-50 ${
            formData.hasGoodsToDeclarate === false ? 'bg-blue-50 border-blue-500' : ''
          }`}>
            <input
              type="radio"
              name="hasAdditionalGoods"
              value="false"
              checked={formData.hasGoodsToDeclarate === false}
              onChange={() => updateFormData('hasGoodsToDeclarate', false)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">No</span>
          </label>
        </div>
        {errors.hasGoodsToDeclarate && (
          <p className="text-sm text-red-600">{errors.hasGoodsToDeclarate}</p>
        )}
      </div>

      {/* Technology Devices (IMEI Registration) */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          Mobile Phones, Handheld Computers, and Cellular-based Tablet Computers
        </p>
        <p className="text-xs text-gray-500">
          purchased or obtained abroad and will be used in Indonesia with the Indonesian cellular network? (IMEI Registration)
        </p>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasTechnologyDevices"
              value="true"
              checked={formData.hasTechnologyDevices === true}
              onChange={() => updateFormData('hasTechnologyDevices', true)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Yes</span>
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
            <span className="text-sm font-medium text-gray-700">No</span>
          </label>
        </div>
        {errors.hasTechnologyDevices && (
          <p className="text-sm text-red-600">{errors.hasTechnologyDevices}</p>
        )}
      </div>

      {/* Final Consent */}
      <div className="space-y-4 border-t pt-6">
        <FormCheckbox
          label="I, the Applicant hereby certify that I understand and agree on the information and Declaration in this application"
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
      
      {/* QR Notification Banner */}
      {hasStoredQR && (
        <QRNotificationBanner
          language={language}
          onViewQR={handleViewQRClick}
          onDismiss={() => setHasStoredQR(false)}
        />
      )}
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
            {/* Render current step */}
            {formData.currentStep === 1 && renderStep1()}
            {formData.currentStep === 2 && renderStep2()}
            {formData.currentStep === 3 && renderStep3()}
            {formData.currentStep === 4 && renderStep4()}
            {formData.currentStep === 5 && renderStep5()}

            {/* Navigation buttons - Hide for Step 1 since it auto-advances */}
            {formData.currentStep > 1 && (
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
                    {formData.currentStep < 5 ? (
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
            )}
          </div>
        </div>
      </div>
      
      {/* Processing Modal */}
      <ProcessingModal
        isOpen={isSubmitting}
        language={language}
      />
      
      {/* QR Code Modal for stored QR */}
      {storedQRData && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          submissionResult={storedQRData}
          formData={formData}
          language={language}
        />
      )}
      
      {/* QR Code Modal for fresh submission (payment step temporarily disabled) */}
      {submissionResult && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSubmissionResult(null);
            // OPTION: Uncomment to redirect to home after QR modal closes
            // router.push('/');
          }}
          submissionResult={submissionResult}
          formData={formData}
          language={language}
        />
      )}
    </div>
  );
};