'use client';

import { useState } from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import DateInput from './DateInput';
import CountryCodeSelect from './CountryCodeSelect';

interface Traveller {
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
}

interface TravellerManagerProps {
  travellers: Traveller[];
  onChange: (travellers: Traveller[]) => void;
  countries: Array<{ value: string; label: string }>;
  countryCodeOptions: Array<{ value: string; label: string }>;
  labels: {
    addTraveller: string;
    removeTraveller: string;
    passportNumber: string;
    fullPassportName: string;
    nationality: string;
    dateOfBirth: string;
    countryOfBirth: string;
    gender: string;
    male: string;
    female: string;
    passportExpiryDate: string;
    mobileNumber: string;
    email: string;
  };
}

const TravellerManager: React.FC<TravellerManagerProps> = ({
  travellers,
  onChange,
  countries,
  countryCodeOptions,
  labels
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const addTraveller = () => {
    const newTraveller: Traveller = {
      id: `traveller-${Date.now()}`,
      passportNumber: '',
      fullPassportName: '',
      nationality: '',
      dateOfBirth: '',
      countryOfBirth: '',
      gender: null,
      passportExpiryDate: '',
      mobileNumber: '+62 ',
      email: ''
    };
    
    onChange([...travellers, newTraveller]);
  };

  const removeTraveller = (id: string) => {
    onChange(travellers.filter(traveller => traveller.id !== id));
    
    // Clear errors for removed traveller
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.includes(id)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const updateTraveller = (id: string, field: keyof Omit<Traveller, 'id'>, value: string) => {
    const updatedTravellers = travellers.map(traveller =>
      traveller.id === id ? { ...traveller, [field]: value } : traveller
    );
    onChange(updatedTravellers);

    // Clear field error when user starts typing
    const errorKey = `${id}-${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      {travellers.map((traveller, index) => (
        <div key={traveller.id} className="border-2 border-blue-200 rounded-lg p-6 space-y-6 bg-white">
          {/* Traveller Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Traveller {index + 2}
            </h3>
            <button
              type="button"
              onClick={() => removeTraveller(traveller.id)}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-300 hover:border-red-400 transition-colors"
            >
              {labels.removeTraveller}
            </button>
          </div>

          {/* Personal Data Section */}
          <div>
            <h4 className="text-base font-medium text-gray-800 mb-4">Personal Data</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormInput
                label={labels.passportNumber}
                required
                placeholder="Enter Passport Number"
                value={traveller.passportNumber}
                onChange={(e) => updateTraveller(traveller.id, 'passportNumber', e.target.value.toUpperCase())}
                error={errors[`${traveller.id}-passportNumber`]}
              />
              
              <FormInput
                label={labels.fullPassportName}
                required
                placeholder="Enter Full Name"
                value={traveller.fullPassportName}
                onChange={(e) => updateTraveller(traveller.id, 'fullPassportName', e.target.value.toUpperCase())}
                error={errors[`${traveller.id}-fullPassportName`]}
              />
              
              <FormSelect
                label={labels.nationality}
                required
                options={countries}
                value={traveller.nationality}
                onChange={(e) => updateTraveller(traveller.id, 'nationality', e.target.value)}
                error={errors[`${traveller.id}-nationality`]}
              />
              
              <DateInput
                label={labels.dateOfBirth}
                required
                value={traveller.dateOfBirth}
                onChange={(e) => updateTraveller(traveller.id, 'dateOfBirth', e.target.value)}
                error={errors[`${traveller.id}-dateOfBirth`]}
                allowFutureDate={false}
              />
              
              <FormSelect
                label={labels.countryOfBirth}
                required
                options={countries}
                value={traveller.countryOfBirth}
                onChange={(e) => updateTraveller(traveller.id, 'countryOfBirth', e.target.value)}
                error={errors[`${traveller.id}-countryOfBirth`]}
              />
              
              <DateInput
                label={labels.passportExpiryDate}
                required
                value={traveller.passportExpiryDate}
                onChange={(e) => updateTraveller(traveller.id, 'passportExpiryDate', e.target.value)}
                error={errors[`${traveller.id}-passportExpiryDate`]}
                allowFutureDate={true}
              />
            </div>

            {/* Gender Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                {labels.gender} <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  traveller.gender === 'male' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name={`gender-${traveller.id}`}
                    value="male"
                    checked={traveller.gender === 'male'}
                    onChange={() => updateTraveller(traveller.id, 'gender', 'male')}
                    className="sr-only"
                  />
                  <span className={`text-sm font-medium ${
                    traveller.gender === 'male' 
                      ? 'text-blue-600' 
                      : 'text-gray-700'
                  }`}>
                    {labels.male}
                  </span>
                </label>
                <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  traveller.gender === 'female' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name={`gender-${traveller.id}`}
                    value="female"
                    checked={traveller.gender === 'female'}
                    onChange={() => updateTraveller(traveller.id, 'gender', 'female')}
                    className="sr-only"
                  />
                  <span className={`text-sm font-medium ${
                    traveller.gender === 'female' 
                      ? 'text-blue-600' 
                      : 'text-gray-700'
                  }`}>
                    {labels.female}
                  </span>
                </label>
              </div>
              {errors[`${traveller.id}-gender`] && (
                <p className="mt-2 text-sm text-red-600">{errors[`${traveller.id}-gender`]}</p>
              )}
            </div>
          </div>

          {/* Account Information Section */}
          <div>
            <h4 className="text-base font-medium text-gray-800 mb-4">Account Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {labels.mobileNumber} <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex gap-2 items-center">
                  <CountryCodeSelect
                    options={countryCodeOptions}
                    value={traveller.mobileNumber.split(' ')[0] || '+62'}
                    onChange={(countryCode) => {
                      const phoneNumber = traveller.mobileNumber.split(' ').slice(1).join(' ');
                      updateTraveller(traveller.id, 'mobileNumber', `${countryCode} ${phoneNumber}`);
                    }}
                    className="w-20"
                    placeholder="Select"
                  />
                  <input
                    type="text"
                    placeholder="Enter Mobile Number"
                    value={traveller.mobileNumber.split(' ').slice(1).join(' ') || ''}
                    onChange={(e) => {
                      const countryCode = traveller.mobileNumber.split(' ')[0] || '+62';
                      updateTraveller(traveller.id, 'mobileNumber', `${countryCode} ${e.target.value}`);
                    }}
                    className={`flex-1 h-[42px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      errors[`${traveller.id}-mobileNumber`] ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors[`${traveller.id}-mobileNumber`] && <p className="text-sm text-red-600">{errors[`${traveller.id}-mobileNumber`]}</p>}
              </div>
              
              <FormInput
                label={labels.email}
                type="email"
                required
                placeholder="Enter Email"
                value={traveller.email}
                onChange={(e) => updateTraveller(traveller.id, 'email', e.target.value)}
                error={errors[`${traveller.id}-email`]}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add Traveller Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addTraveller}
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {labels.addTraveller}
        </button>
      </div>
    </div>
  );
};

export default TravellerManager;