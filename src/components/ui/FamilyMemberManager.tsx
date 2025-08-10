'use client';

import { useState } from 'react';
import FormInput from './FormInput';

interface FamilyMember {
  id: string;
  passportNumber: string;
  name: string;
  nationality: string;
}

interface FamilyMemberManagerProps {
  familyMembers: FamilyMember[];
  onChange: (familyMembers: FamilyMember[]) => void;
  labels: {
    title: string;
    passportNumber: string;
    name: string;
    nationality: string;
    addMember: string;
    removeMember: string;
    maxMembersReached: string;
  };
}

const FamilyMemberManager: React.FC<FamilyMemberManagerProps> = ({
  familyMembers,
  onChange,
  labels
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const addFamilyMember = () => {
    if (familyMembers.length >= 10) return;
    
    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      passportNumber: '',
      name: '',
      nationality: ''
    };
    
    onChange([...familyMembers, newMember]);
  };

  const removeFamilyMember = (id: string) => {
    onChange(familyMembers.filter(member => member.id !== id));
    
    // Clear errors for removed member
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.includes(id)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const updateFamilyMember = (id: string, field: keyof Omit<FamilyMember, 'id'>, value: string) => {
    const updatedMembers = familyMembers.map(member =>
      member.id === id ? { ...member, [field]: value } : member
    );
    onChange(updatedMembers);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{labels.title}</h3>
        {familyMembers.length < 10 && (
          <button
            type="button"
            onClick={addFamilyMember}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {labels.addMember}
          </button>
        )}
      </div>

      {familyMembers.length >= 10 && (
        <p className="text-sm text-orange-600">{labels.maxMembersReached}</p>
      )}

      {familyMembers.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No family members added</p>
      ) : (
        <div className="space-y-4">
          {familyMembers.map((member, index) => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Family Member {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeFamilyMember(member.id)}
                  className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
                >
                  {labels.removeMember}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormInput
                  label={labels.passportNumber}
                  value={member.passportNumber}
                  onChange={(e) => updateFamilyMember(member.id, 'passportNumber', e.target.value.toUpperCase())}
                  error={errors[`${member.id}-passportNumber`]}
                  required
                />
                
                <FormInput
                  label={labels.name}
                  value={member.name}
                  onChange={(e) => updateFamilyMember(member.id, 'name', e.target.value.toUpperCase())}
                  error={errors[`${member.id}-name`]}
                  required
                />
                
                <FormInput
                  label={labels.nationality}
                  value={member.nationality}
                  onChange={(e) => updateFamilyMember(member.id, 'nationality', e.target.value)}
                  error={errors[`${member.id}-nationality`]}
                  required
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyMemberManager;