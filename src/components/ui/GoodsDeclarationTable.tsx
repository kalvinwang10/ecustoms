'use client';

import { useState } from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';

interface DeclaredGood {
  id: string;
  description: string;
  quantity: string;
  value: string;
  currency: string;
}

interface GoodsDeclarationTableProps {
  goods: DeclaredGood[];
  onChange: (goods: DeclaredGood[]) => void;
  labels: {
    title: string;
    description: string;
    quantity: string;
    value: string;
    currency: string;
    addItem: string;
    removeItem: string;
    noData: string;
  };
}

const GoodsDeclarationTable: React.FC<GoodsDeclarationTableProps> = ({
  goods,
  onChange,
  labels
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Common currencies used in Indonesia
  const currencies = [
    { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'CNY', label: 'CNY - Chinese Yuan' },
    { value: 'SGD', label: 'SGD - Singapore Dollar' },
    { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
    { value: 'THB', label: 'THB - Thai Baht' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'KRW', label: 'KRW - South Korean Won' },
  ];

  const addGood = () => {
    const newGood: DeclaredGood = {
      id: `good-${Date.now()}`,
      description: '',
      quantity: '',
      value: '',
      currency: ''
    };
    
    onChange([...goods, newGood]);
  };

  const removeGood = (id: string) => {
    onChange(goods.filter(good => good.id !== id));
    
    // Clear errors for removed good
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.includes(id)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const updateGood = (id: string, field: keyof Omit<DeclaredGood, 'id'>, value: string) => {
    const updatedGoods = goods.map(good =>
      good.id === id ? { ...good, [field]: value } : good
    );
    onChange(updatedGoods);

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
        <button
          type="button"
          onClick={addGood}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {labels.addItem}
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  {labels.description}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  {labels.quantity}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  {labels.value}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  {labels.currency}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {goods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{labels.noData}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                goods.map((good, index) => (
                  <tr key={good.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 border-r border-gray-300">
                      <FormInput
                        label=""
                        value={good.description}
                        onChange={(e) => updateGood(good.id, 'description', e.target.value)}
                        error={errors[`${good.id}-description`]}
                        placeholder="Enter goods description"
                        className="text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300">
                      <FormInput
                        label=""
                        type="number"
                        min="1"
                        value={good.quantity}
                        onChange={(e) => updateGood(good.id, 'quantity', e.target.value)}
                        error={errors[`${good.id}-quantity`]}
                        placeholder="Qty"
                        className="text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300">
                      <FormInput
                        label=""
                        type="number"
                        min="0"
                        step="0.01"
                        value={good.value}
                        onChange={(e) => updateGood(good.id, 'value', e.target.value)}
                        error={errors[`${good.id}-value`]}
                        placeholder="0.00"
                        className="text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300">
                      <FormSelect
                        label=""
                        options={currencies}
                        value={good.currency}
                        onChange={(e) => updateGood(good.id, 'currency', e.target.value)}
                        error={errors[`${good.id}-currency`]}
                        className="text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeGood(good.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium focus:outline-none"
                      >
                        {labels.removeItem}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GoodsDeclarationTable;