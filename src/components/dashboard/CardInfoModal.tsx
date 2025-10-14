import React from 'react';
import type { Card } from '../../types/card';

interface CardInfoModalProps {
  card: Card | null;
  onClose: () => void;
  onRefresh?: () => void;
}

const formatDate = (d: string) =>
  d.length === 8 ? `${d.substring(6, 8)}/${d.substring(4, 6)}/${d.substring(0, 4)}` : d;

const CardInfoModal: React.FC<CardInfoModalProps> = ({ card, onClose, onRefresh }) => {
  if (!card) return null;

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-full max-w-md mx-4 p-6 rounded-xl shadow-2xl bg-white" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4 text-blue-900">Estado de Tarjeta</h3>
        <div className="space-y-2 text-sm">
          <div>Tarjeta: {card.card_number}</div>
          <div>Nombre: {card.cardholder_name}</div>
          <div>Límite: ${card.credit_limit.toLocaleString()}</div>
          <div>Disponible: ${card.available_credit.toLocaleString()}</div>
          <div>Fecha de corte: {formatDate(card.cut_date)}</div>
          <div>Vencimiento: {formatDate(card.due_date)}</div>
          <div>Estado: {card.status}</div>
        </div>
        <div className="mt-6 flex justify-between">
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-blue-900 text-blue-900 rounded hover:bg-blue-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardInfoModal;