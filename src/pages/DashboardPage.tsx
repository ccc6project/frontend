// DashboardPage.tsx - VERSIÓN AMEX
import React, { useState } from 'react';
import CardList from '../components/dashboard/CardList';
import TransactionList from '../components/dashboard/TransactionList';
import AuthorizationForm from '../components/dashboard/AuthorizationForm';
import PaymentForm from '../components/dashboard/PaymentForm';
import amexLogo from '../assets/amexlogo.png';
import { useAuth } from '../contexts/AuthContext';

interface Card {
  number: string;
  name: string;
  limit: number;
  available: number;
}

interface Transaction {
  id: number;
  type: 'Compra' | 'Pago';
  amount: number;
  store: string;
  cardNumber: string;
  status?: 'APROBADO' | 'DENEGADO';
  authorizationCode?: string;
}

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [cards, setCards] = useState<Card[]>([
    { number: '**** **** **** 1234', name: 'JUAN PEREZ', limit: 5000, available: 3200 },
    { number: '**** **** **** 5678', name: 'JUAN PEREZ', limit: 10000, available: 7500 },
    { number: '**** **** **** 9012', name: 'JUAN PEREZ', limit: 8000, available: 6000 },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: 'Compra', amount: 120.5, store: 'Amazon', cardNumber: '**** **** **** 1234', status: 'APROBADO', authorizationCode: '123456' },
    { id: 2, type: 'Pago', amount: 200, store: 'Banco', cardNumber: '**** **** **** 1234', status: 'APROBADO', authorizationCode: '654321' },
  ]);

  // Maneja pagos de tarjeta
  const handlePayment = (cardNumber: string, amount: number) => {
    setCards(prev =>
      prev.map(c =>
        c.number === cardNumber ? { ...c, available: c.available + amount } : c
      )
    );

    setTransactions(prev => [
      ...prev,
      { id: prev.length + 1, type: 'Pago', amount, store: 'Pago Tarjeta', cardNumber, status: 'APROBADO', authorizationCode: '000000' }
    ]);
  };

  // Maneja autorizaciones de pago
  const handleAuthorize = (
    cardNumber: string,
    amount: number,
    type: 'Compra' | 'Pago',
    authorizationCode: string,
    status: 'APROBADO' | 'DENEGADO'
  ) => {
    if (status === 'APROBADO') {
      setCards(prev =>
        prev.map(c =>
          c.number === cardNumber ? { ...c, available: c.available - amount } : c
        )
      );
    }

    setTransactions(prev => [
      ...prev,
      { id: prev.length + 1, type, amount, store: 'Autorización', cardNumber, status, authorizationCode }
    ]);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 p-6">
      {/* Header Mejorado */}
      <header className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <img src={amexLogo} alt="AMEX" className="h-10" />
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Banca Electrónica</h1>
              <p className="text-blue-600">American Express</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">👤</span>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Bienvenido, {user?.name}</p>
                  <p className="text-sm text-blue-600">{user?.email}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Tarjetas - Ocupa 2/3 */}
        <div className="lg:col-span-2">
          <CardList cards={cards} />
        </div>
        
        {/* Transacciones - Ocupa 1/3 */}
        <div className="lg:col-span-1">
          <TransactionList transactions={transactions} />
        </div>
      </div>

      {/* Formularios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AuthorizationForm 
          cards={cards}
          onAuthorize={handleAuthorize} 
        />
        <PaymentForm cards={cards} onPayment={handlePayment} />
      </div>
    </div>
  );
};

export default DashboardPage;