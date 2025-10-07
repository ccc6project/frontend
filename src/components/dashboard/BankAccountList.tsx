// components/dashboard/BankAccountList.tsx - ACTUALIZADO
import React from 'react';
import type { BankAccountResponse, Bank } from '../../types/bank';
import { bankAPI } from '../../services/api';

interface BankAccountListProps {
  accounts: BankAccountResponse[];
  onDepositClick?: (account: BankAccountResponse) => void;
}

const BankAccountList: React.FC<BankAccountListProps> = ({ accounts, onDepositClick }) => {
  const banks = bankAPI.getBanks();

  // Función para obtener el nombre del banco por bank_id
  const getBankName = (bankId: number): string => {
    const bank = banks.find(b => b.bank_id === bankId);
    return bank ? bank.name : 'Banco Desconocido';
  };

  // Función para formatear el número de cuenta (mostrar solo últimos 4 dígitos)
  const formatAccountNumber = (accountNumber: string): string => {
    if (accountNumber.length <= 4) return accountNumber;
    return `****${accountNumber.slice(-4)}`;
  };

  // Función para traducir el tipo de cuenta
  const getAccountTypeText = (accountType: string): string => {
    const typeMap: { [key: string]: string } = {
      'Ahorros': 'Cuenta de Ahorros',
      'Corriente': 'Cuenta Corriente',
      'Monetaria': 'Cuenta Monetaria'
    };
    return typeMap[accountType] || accountType;
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">Cuentas Bancarias</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-blue-500">🏦</span>
          </div>
          <p className="text-blue-600 mb-4">No tienes cuentas bancarias asociadas</p>
          <p className="text-sm text-gray-500">
            Agrega una cuenta bancaria para realizar pagos desde tu tarjeta AMEX
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">Cuentas Bancarias</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.account_id}
            className="border border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-blue-900">
                  {getBankName(account.bank_id)}
                </h3>
                <p className="text-sm text-blue-600">
                  {getAccountTypeText(account.account_type)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-gray-600">
                  {formatAccountNumber(account.account_number)}
                </p>
                <p className="text-xs text-gray-500">Número de cuenta</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-blue-100">
              <div>
                <p className="text-xs text-gray-500">Saldo disponible</p>
                <p className="font-semibold text-green-600">
                  ${account.balance.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">ID: {account.account_id}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    account.balance > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {account.balance > 0 ? 'Activa' : 'Sin fondos'}
                  </span>
                  {onDepositClick && (
                    <button
                      onClick={() => onDepositClick(account)}
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-1 text-xs rounded-full transition-colors"
                    >
                      Depositar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-blue-100">
        <p className="text-xs text-gray-500 text-center">
          Tus cuentas bancarias están vinculadas para realizar pagos automáticos
        </p>
      </div>
    </div>
  );
};

export default BankAccountList;