import React from 'react';
import type { Card } from '../../types/card';

interface CardDetailsModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
}

const CardDetailsModal: React.FC<CardDetailsModalProps> = ({ card, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Función para formatear número de tarjeta
  const formatCardNumber = (cardNumber: string) => {
    if (cardNumber.includes(' ')) return cardNumber;
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Función para formatear fecha de expiración
  const formatExpirationDate = (expDate: string) => {
    if (expDate.length === 6) {
      return `${expDate.substring(4, 6)}/${expDate.substring(2, 4)}`;
    }
    return expDate;
  };

  // Función para formatear fecha
  const formatDate = (dateStr: string) => {
    if (dateStr.length === 8) {
      return `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`;
    }
    return dateStr;
  };

  // Función para traducir estado
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Activa',
      'blocked': 'Bloqueada', 
      'lost': 'Perdida',
      'inactiva': 'Inactiva'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Detalles de la Tarjeta</h2>
            <button  onClick={onClose} className="text-white hover:text-blue-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-semibold">American Express</span>
            <span className="font-mono text-sm">{formatCardNumber(card.card_number)}</span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información del Titular */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Información del Titular
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre del Titular</p>
                <p className="font-medium">{card.cardholder_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  card.status === 'active' ? 'bg-green-100 text-green-800' :
                  card.status === 'blocked' ? 'bg-red-100 text-red-800' :
                  card.status === 'lost' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusText(card.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Información de la Tarjeta */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Información de la Tarjeta
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Fecha de Expiración</p>
                <p className="font-medium">{formatExpirationDate(card.expiration_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CVV</p>
                <p className="font-mono font-medium">•••</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID del Emisor</p>
                <p className="font-medium">{card.emisor_id}</p>
              </div>
            </div>
          </div>

          {/* Límites y Crédito */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Límites y Crédito
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Límite de Crédito</span>
                <span className="font-semibold">${card.credit_limit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Crédito Disponible</span>
                <span className="font-semibold text-green-600">${card.available_credit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Crédito Utilizado</span>
                <span className="font-semibold text-blue-600">
                  ${(card.credit_limit - card.available_credit).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${((card.credit_limit - card.available_credit) / card.credit_limit) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Fechas Importantes */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Fechas Importantes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Fecha de Corte</p>
                <p className="font-medium">{formatDate(card.cut_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                <p className="font-medium">{formatDate(card.due_date)}</p>
              </div>
            </div>
          </div>

          {/* Información de Seguridad */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">Información de Seguridad</p>
                <p className="text-xs text-blue-600 mt-1">
                  Mantén tu CVV en un lugar seguro y nunca lo compartas con nadie. 
                  American Express nunca te pedirá esta información por teléfono o email.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailsModal;