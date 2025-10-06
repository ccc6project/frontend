// TransactionList.tsx - VERSIÓN AMEX
import React from 'react';

interface Transaction {
  id: number;
  type: 'Compra' | 'Pago';
  amount: number;
  store: string;
  cardNumber: string;
  status?: 'APROBADO' | 'DENEGADO';
  authorizationCode?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">Transacciones Recientes</h2>
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
        {transactions.map(tx => (
          <div
            key={tx.id}
            className={`p-4 rounded-lg border-l-4 ${
              tx.status === 'DENEGADO' 
                ? 'border-red-500 bg-red-50' 
                : 'border-green-500 bg-green-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-800">{tx.store}</p>
                <p className="text-sm text-gray-600">{tx.type}</p>
                <p className="text-xs text-gray-500 mt-1">Tarjeta: {tx.cardNumber}</p>
                {tx.authorizationCode && tx.authorizationCode !== '0' && (
                  <p className="text-xs text-gray-500">Código: {tx.authorizationCode}</p>
                )}
              </div>
              <div className={`font-bold ${
                tx.type === 'Pago' ? 'text-green-600' : 'text-blue-600'
              }`}>
                ${tx.amount.toLocaleString()}
              </div>
            </div>
            {tx.status && (
              <div className={`text-xs font-semibold mt-2 ${
                tx.status === 'APROBADO' ? 'text-green-600' : 'text-red-600'
              }`}>
                {tx.status}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;