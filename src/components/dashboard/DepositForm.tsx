// components/dashboard/DepositForm.tsx
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { bankAPI } from '../../services/api';
import type { BankAccountResponse } from '../../types/bank';

interface DepositFormProps {
  account: BankAccountResponse;
  onDepositSuccess: (updatedAccount: BankAccountResponse) => void;
  onCancel: () => void;
}

const DepositForm: React.FC<DepositFormProps> = ({ 
  account, 
  onDepositSuccess, 
  onCancel 
}) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const depositAmount = parseFloat(amount);
    
    if (!depositAmount || depositAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await bankAPI.makeDeposit(account.account_id, { amount: depositAmount });
      setSuccess(`¡Depósito exitoso! ${response.message}`);
      setAmount('');
      
      // Esperar un momento antes de cerrar para que el usuario vea el mensaje
      setTimeout(() => {
        onDepositSuccess(response.account);
      }, 1500);
      
    } catch (error: any) {
      setError(error.message || 'Error al realizar el depósito');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para formatear el número de cuenta (mostrar solo últimos 4 dígitos)
  const formatAccountNumber = (accountNumber: string): string => {
    if (accountNumber.length <= 4) return accountNumber;
    return `****${accountNumber.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-blue-900 text-center">
        Realizar Depósito
      </h2>
      
      <div className="text-center mb-6">
        <p className="text-blue-600">Cuenta: {formatAccountNumber(account.account_number)}</p>
        <p className="text-sm text-gray-500">Saldo actual: <span className="font-semibold">${account.balance.toLocaleString()}</span></p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">
          <p className="font-medium">{success}</p>
          <p className="text-sm mt-1">Redirigiendo...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Monto a Depositar *"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="0.00"
          min="0.01"
          step="0.01"
          disabled={isLoading || success !== ''}
        />

        {/* Información del depósito */}
        {amount && parseFloat(amount) > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Resumen del depósito:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Saldo actual:</span>
                <span className="font-semibold">${account.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Monto a depositar:</span>
                <span className="font-semibold">${parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-1">
                <span className="text-blue-900 font-semibold">Nuevo saldo:</span>
                <span className="font-bold text-green-600">
                  ${(account.balance + parseFloat(amount)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3"
            disabled={isLoading || success !== ''}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3"
            disabled={isLoading || success !== '' || !amount || parseFloat(amount) <= 0}
          >
            {isLoading ? 'Procesando...' : success ? '¡Éxito!' : 'Realizar Depósito'}
          </Button>
        </div>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        * El depósito se reflejará inmediatamente en tu cuenta
      </p>
    </div>
  );
};

export default DepositForm;