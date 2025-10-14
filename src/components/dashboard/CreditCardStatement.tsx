import React, { useState, useEffect } from 'react';
import type { Statement, Transaction } from '../../types/card'; 
import { cardsAPI } from '../../services/api';

interface CreditCardStatementProps {
  cardNumber: string;
  onClose: () => void;
}

// Interface temporal para la respuesta del backend
interface BackendStatement {
  card_number: string;
  cardholder_name: string;
  period: string;
  start_date: string;
  end_date: string;
  credit_limit?: number;
  available_credit: number;
  previous_balance: number;
  purchases: number;
  payments: number;
  current_balance: number;
  due_date: string;
  minimum_payment: number;
  transactions: Array<{
    transaction_id?: number;
    id?: string;
    card_number: string;
    timestamp: string;
    type: 'PURCHASE' | 'PAYMENT';
    amount: number;
    description?: string;
    status: string;
    store?: string;
    source_account_id?: number;
    authorization_id?: number;
  }>;
}

const CreditCardStatement: React.FC<CreditCardStatementProps> = ({ cardNumber, onClose }) => {
  const [statement, setStatement] = useState<BackendStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatement();
  }, [cardNumber]);

  const loadStatement = async () => {
    try {
      setLoading(true);
      const data = await cardsAPI.getCardStatement(cardNumber) as BackendStatement;
      setStatement(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Cargando estado de cuenta...</div>;
  if (error) return <div className="text-red-500 text-center py-4">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Estado de Cuenta</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-lg font-semibold"
        >
          ✕
        </button>
      </div>

      {statement && (
        <div className="space-y-6">
          {/* Resumen del estado de cuenta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Límite de Crédito</div>
              <div className="font-semibold">${(statement.credit_limit || statement.available_credit + statement.current_balance).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Saldo Actual</div>
              <div className="font-semibold">${statement.current_balance.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Pago Mínimo</div>
              <div className="font-semibold">${statement.minimum_payment.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Fecha Límite</div>
              <div className="font-semibold">{new Date(statement.due_date).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Resumen financiero */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Compras del Periodo</div>
              <div className="font-semibold text-green-700">${statement.purchases.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Pagos del Periodo</div>
              <div className="font-semibold text-blue-700">${statement.payments.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Saldo Anterior</div>
              <div className="font-semibold">${statement.previous_balance.toLocaleString()}</div>
            </div>
          </div>

          {/* Detalle de movimientos */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Movimientos del Periodo</h3>
            <div className="space-y-2">
              {statement.transactions.length > 0 ? (
                statement.transactions.map((transaction, index) => (
                  <div key={transaction.transaction_id || transaction.id || index} className="flex justify-between items-center p-3 border-b">
                    <div className="flex-1">
                      <div className="font-medium">
                        {transaction.description || transaction.store || `Transacción ${transaction.type.toLowerCase()}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleDateString()} - {transaction.type}
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'PAYMENT' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'PAYMENT' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay transacciones en este periodo
                </div>
              )}
            </div>
          </div>
        </div>  
      )}
    </div>
  );
};

export default CreditCardStatement;