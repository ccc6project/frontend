import React, { useState, useEffect } from 'react';
import { cardsAPI } from '../../services/api';

interface CreditCardStatementProps {
  cardNumber: string;
  onClose: () => void;
}

// Tipos para los motivos de denegación
type DeniedReason = 
  | 'CARD_NOT_FOUND'
  | 'CARD_INACTIVE'
  | 'EXPIRED_CARD'
  | 'INVALID_EXPIRY_FORMAT'
  | 'INVALID_CVV'
  | 'NAME_MISMATCH'
  | 'OVER_LIMIT'
  | 'INSUFFICIENT_FUNDS'
  | 'DUPLICATE'
  | 'VELOCITY_LIMIT'
  | 'MERCHANT_BLOCKED'
  | 'CURRENCY_BLOCKED'
  | 'SYSTEM_ERROR';

const DENIAL_MESSAGES: Record<DeniedReason, string> = {
  CARD_NOT_FOUND: "Tarjeta no encontrada.",
  CARD_INACTIVE: "Tarjeta inactiva o bloqueada.",
  EXPIRED_CARD: "La tarjeta está vencida.",
  INVALID_EXPIRY_FORMAT: "Formato de fecha de vencimiento inválido.",
  INVALID_CVV: "Código de seguridad incorrecto.",
  NAME_MISMATCH: "Nombre del tarjeta-habiente no coincide.",
  OVER_LIMIT: "La operación excede el límite de crédito.",
  INSUFFICIENT_FUNDS: "Fondos/Crédito disponible insuficiente.",
  DUPLICATE: "Transacción duplicada detectada.",
  VELOCITY_LIMIT: "Límite de frecuencia de transacciones excedido.",
  MERCHANT_BLOCKED: "Comercio no permitido para esta tarjeta.",
  CURRENCY_BLOCKED: "Moneda/combinación no permitida.",
  SYSTEM_ERROR: "Error interno al procesar la transacción."
};

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
    denied_reason?: DeniedReason;
  }>;
}

const CreditCardStatement: React.FC<CreditCardStatementProps> = ({ cardNumber, onClose }) => {
  const [statement, setStatement] = useState<BackendStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatement();
  }, [cardNumber]);

  const loadStatement = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await cardsAPI.getCardStatement(cardNumber) as BackendStatement;
      setStatement(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      const data = await cardsAPI.getCardStatement(cardNumber) as BackendStatement;
      setStatement(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Función para obtener el mensaje de denegación
  const getDenialMessage = (deniedReason?: DeniedReason): string => {
    if (!deniedReason) return "Transacción denegada";
    return DENIAL_MESSAGES[deniedReason] || "Transacción denegada";
  };

  if (loading) return <div className="text-center py-4">Cargando estado de cuenta...</div>;
  if (error) return <div className="text-red-500 text-center py-4">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Estado de Cuenta</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg font-semibold"
          >
            ✕
          </button>
        </div>
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
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Movimientos del Periodo</h3>
              <span className="text-sm text-gray-500">
                {statement.transactions.length} transacciones
              </span>
            </div>
            <div className="space-y-2">
              {statement.transactions.length > 0 ? (
                statement.transactions.map((transaction, index) => (
                  <div key={transaction.transaction_id || transaction.id || index} className="flex justify-between items-center p-3 border-b">
                    <div className="flex-1">
                      <div className="font-medium">
                        {transaction.description || transaction.store || `Transacción ${transaction.type.toLowerCase()}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                        {transaction.status === 'DENIED' && (
                          <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                            DENEGADO
                          </span>
                        )}
                      </div>
                      {transaction.status === 'DENIED' && transaction.denied_reason && (
                        <div className="text-red-600 text-xs mt-1 font-medium">
                          {getDenialMessage(transaction.denied_reason)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`font-semibold ${ transaction.type === 'PAYMENT' ? 'text-green-600' : 'text-red-600' }`}>
                        {transaction.type === 'PAYMENT' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </div>
                      {transaction.status === 'DENIED' && (<div className="text-red-500 text-xs font-semibold mt-1">
                          TRANSACCIÓN DENEGADA
                        </div>
                      )}
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