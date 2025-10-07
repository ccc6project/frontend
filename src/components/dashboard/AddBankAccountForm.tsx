// components/dashboard/AddBankAccountForm.tsx
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { bankAPI } from '../../services/api';
import type { BankAccountRequest } from '../../types/bank';

interface AddBankAccountFormProps {
  onAccountAdded: () => void;
  onCancel: () => void;
}

const AddBankAccountForm: React.FC<AddBankAccountFormProps> = ({ onAccountAdded, onCancel }) => {
  const [formData, setFormData] = useState<BankAccountRequest>({
    bank_id: 0,
    account_number: '',
    account_type: 'Ahorros'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const banks = bankAPI.getBanks();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bank_id' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bank_id) {
      setError('Por favor selecciona un banco');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await bankAPI.addBankAccount(formData);
      onAccountAdded();
    } catch (error: any) {
      setError(error.message || 'Error al agregar cuenta bancaria');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-900 text-center">
        Agregar Cuenta Bancaria
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selección de Banco */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Seleccionar Banco *
          </label>
          <select
            name="bank_id"
            value={formData.bank_id}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-blue-200 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Selecciona un banco</option>
            {banks.map(bank => (
              <option key={bank.bank_id} value={bank.bank_id}>
                {bank.name} - {bank.bank_code}
              </option>
            ))}
          </select>
        </div>

        {/* Número de Cuenta */}
        <Input
          label="Número de Cuenta *"
          name="account_number"
          value={formData.account_number}
          onChange={handleChange}
          required
          placeholder="1234567890"
          pattern="[0-9]+"
          minLength={5}
          maxLength={20}
        />

        {/* Tipo de Cuenta */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Tipo de Cuenta *
          </label>
          <select
            name="account_type"
            value={formData.account_type}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-blue-200 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="Ahorros">Cuenta de Ahorros</option>
            <option value="Corriente">Cuenta Corriente</option>
            <option value="Monetaria">Cuenta Monetaria</option>
          </select>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3"
            disabled={isLoading}
          >
            {isLoading ? 'Agregando...' : 'Agregar Cuenta'}
          </Button>
        </div>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        * Los campos son obligatorios. Tu información bancaria está protegida y encriptada.
      </p>
    </div>
  );
};

export default AddBankAccountForm;