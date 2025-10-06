// CardList.tsx - VERSIÓN CON FONDO PLATINUM
import React from 'react';
import fondo from '../../assets/fondo.jpeg';

interface Card {
  number: string;
  name: string;
  limit: number;
  available: number;
  expiration?: string;
  securityCode?: string;
}

interface CardListProps {
  cards: Card[];
}

const CardList: React.FC<CardListProps> = ({ cards }) => {
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
                <span className="text-sm font-mono">{card.number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">{card.name}</span>
                <span className="font-bold">${card.available.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-300 mt-2">
                <span>Límite: ${card.limit.toLocaleString()}</span>
                <span>Disponible: ${card.available.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardList;