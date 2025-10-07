// components/dashboard/CardOffer.tsx
import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { cardsAPI, bankAPI } from '../../services/api';
import type { BankAccountResponse } from '../../types/bank';

interface CardOfferProps {
  onOfferAccepted: () => void;
  onCancel: () => void;
}

const CardOffer: React.FC<CardOfferProps> = ({ onOfferAccepted, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState('');
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number>(0);

  // Cargar cuentas bancarias del usuario
  useEffect(() => {
    const loadBankAccounts = async () => {
      try {
        console.log('🔄 Cargando cuentas bancarias para oferta...');
        const accounts = await bankAPI.getUserBankAccounts();
        console.log('📊 Cuentas disponibles para oferta:', accounts);
        
        setBankAccounts(accounts);
        
        if (accounts.length > 0) {
          setSelectedAccountId(accounts[0].account_id);
          console.log('✅ Cuenta seleccionada por defecto:', accounts[0].account_id);
        } else {
          console.log('❌ No se encontraron cuentas bancarias para la oferta');
          setError('No valid bank account found for user.');
        }
      } catch (error: any) {
        console.error('❌ Error cargando cuentas bancarias:', error);
        setError('Error al cargar cuentas bancarias: ' + (error.message || 'Error desconocido'));
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadBankAccounts();
  }, []);

  const handleAccountSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = Number(e.target.value);
    setSelectedAccountId(accountId);
    console.log('✅ Cuenta seleccionada para oferta:', accountId);
  };

  const handleAcceptOffer = async () => {
    setIsLoading(true);
    setError('');

    // Validar que hay una cuenta seleccionada
    if (selectedAccountId === 0) {
      setError('Por favor selecciona una cuenta bancaria para vincular tu tarjeta');
      setIsLoading(false);
      return;
    }

    try {
      // Obtener el nombre del usuario del contexto o localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Oferta pre-aprobada con la cuenta seleccionada
      const preApprovedOffer = {
        bank_account_id: selectedAccountId,
        amex: true,
        credit_limit: 5000, // Límite fijo que el banco ofrece
        cut_date: '12', // Fija para todos
        due_date: '15', // Fija para todos
        interest: 15.5, // Tasa estándar
        expiration_date: '202712', // 3 años desde ahora
        cardholder_name: userData.name || 'CLIENTE AMEX'
      };

      console.log('🚀 Aceptando oferta con datos:', preApprovedOffer);
      await cardsAPI.issueCard(preApprovedOffer);
      onOfferAccepted();
    } catch (error: any) {
      console.error('❌ Error aceptando oferta:', error);
      setError(error.message || 'Error al aceptar la oferta');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se cargan las cuentas
  if (loadingAccounts) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200 max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-blue-900 font-medium">Verificando tus cuentas bancarias...</div>
          <p className="text-sm text-gray-500 mt-2">Preparando tu oferta pre-aprobada</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no hay cuentas bancarias
  if (bankAccounts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            ¡Oferta Pre-Aprobada!
          </h2>
          <p className="text-blue-600">
            American Express te ha pre-aprobado una tarjeta de crédito
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <span className="text-red-500 mr-2">❌</span>
            <div>
              <p className="font-medium">No valid bank account found for user.</p>
              <p className="text-sm mt-1">
                Para aceptar esta oferta, necesitas tener al menos una cuenta bancaria registrada.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3"
          >
            Volver al Dashboard
          </Button>
          <Button
            onClick={onCancel}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            Agregar Cuenta Bancaria
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-blue-900 mb-2">
          ¡Oferta Pre-Aprobada!
        </h2>
        <p className="text-blue-600">
          American Express te ha pre-aprobado una tarjeta de crédito
        </p>
      </div>

      {/* Selector de cuenta bancaria */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium text-blue-800 mb-2">
          Selecciona la cuenta bancaria para vincular:
        </label>
        <select
          value={selectedAccountId}
          onChange={handleAccountSelect}
          className="w-full p-3 rounded-lg border border-blue-200 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value={0}>Selecciona una cuenta bancaria</option>
          {bankAccounts.map((account) => (
            <option 
              key={account.account_id} 
              value={account.account_id}
            >
              {account.account_number} - {account.account_type} - 
              Saldo: ${account.balance.toLocaleString()}
            </option>
          ))}
        </select>
        
        {selectedAccountId !== 0 && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>✅ Cuenta seleccionada:</strong> Tu tarjeta AMEX se vinculará a esta cuenta
            </p>
          </div>
        )}
      </div>

      {/* Detalles de la oferta */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-4 text-center">
          Detalles de tu oferta
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Límite de crédito:</span>
            <span className="font-semibold text-blue-900">$5,000.00</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-blue-700">Tasa de interés:</span>
            <span className="font-semibold text-blue-900">15.5% anual</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-blue-700">Fecha de corte:</span>
            <span className="font-semibold text-blue-900">Día 15 de cada mes</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-blue-700">Fecha de pago:</span>
            <span className="font-semibold text-blue-900">Día 30 de cada mes</span>
          </div>
          
          <div className="flex justify-between md:col-span-2">
            <span className="text-blue-700">Tarjeta:</span>
            <span className="font-semibold text-blue-900">American Express Standard</span>
          </div>
        </div>
      </div>

      {/* Beneficios */}
      <div className="mb-6">
        <h4 className="font-semibold text-blue-900 mb-3">Beneficios incluidos:</h4>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Protección de compras
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Programa de recompensas
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Seguro de viaje
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Asistencia en carretera 24/7
          </li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <span className="text-red-500 mr-2">❌</span>
            <div>
              <p className="font-medium">{error}</p>
              {error.includes('bank account') && (
                <p className="text-sm mt-1">
                  Por favor selecciona una cuenta bancaria válida para continuar.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-4">
        <Button
          onClick={onCancel}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3"
          disabled={isLoading}
        >
          Rechazar Oferta
        </Button>
        <Button
          onClick={handleAcceptOffer}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3"
          disabled={isLoading || selectedAccountId === 0}
        >
          {isLoading ? 'Procesando...' : '¡Aceptar Oferta!'}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Al aceptar, autorizas a American Express a verificar tu información y emitir tu tarjeta.
        Recibirás tu tarjeta física en 7-10 días hábiles.
      </p>
    </div>
  );
};

export default CardOffer;