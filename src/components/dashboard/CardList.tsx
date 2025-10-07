// components/dashboard/CardList.tsx - VERSIÓN COMPLETA
import React from 'react';
import fondo from '../../assets/fondo.jpeg';
import type { Card } from '../../types/card';

interface CardListProps {
  cards: Card[];
}

const CardList: React.FC<CardListProps> = ({ cards }) => {
  // Función para formatear número de tarjeta
  const formatCardNumber = (cardNumber: string) => {
    // Si ya tiene espacios, dejarlo como está
    if (cardNumber.includes(' ')) return cardNumber;
    // Si no, formatearlo
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Función para formatear fecha de expiración
  const formatExpirationDate = (expDate: string) => {
    if (expDate.length === 6) {
      return `${expDate.substring(4, 6)}/${expDate.substring(2, 4)}`;
    }
    return expDate;
  };

  // Función para traducir estado
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Activa',
      'blocked': 'Bloqueada', 
      'lost': 'Perdida',
      'inactive': 'Inactiva'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">Mis Tarjetas</h2>
      <div className="flex flex-col gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className="relative p-6 rounded-xl text-white hover:scale-105 transform transition-all duration-300 overflow-hidden shadow-lg"
            style={{
              backgroundImage: `url(${fondo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold">AMEX</span>
                <span className="text-sm font-mono">{formatCardNumber(card.card_number)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">{card.cardholder_name}</span>
                <span className="font-bold text-lg">
                  ${card.available_credit.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-300 mt-2">
                <span>Límite: ${card.credit_limit.toLocaleString()}</span>
                <span>Exp: {formatExpirationDate(card.expiration_date)}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-300">
                <span>Estado: {getStatusText(card.status)}</span>
                <span>Vence: {card.due_date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardList;