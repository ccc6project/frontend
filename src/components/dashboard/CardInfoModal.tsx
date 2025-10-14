import React from 'react';
import type { Card } from '../../types/card';
interface CardInfoModalProps {
  card: Card | null;
  onClose: () => void;
}

const formatDate = (d: string) =>
  d.length === 8 ? `${d.substring(6, 8)}/${d.substring(4, 6)}/${d.substring(0, 4)}` : d;

const CardInfoModal: React.FC<CardInfoModalProps> = ({ card, onClose }) => {
  if (!card) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose} >
      <div className="w-full max-w-md mx-4 p-6 rounded-xl shadow-2xl bg-white"  onClick={e => e.stopPropagation()}>
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
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-blue-900 text-blue-900 rounded hover:bg-blue-50" >Cerrar</button>
        </div>
      </div>
    </div>
  );
};
export default CardInfoModal;
