import React, { useState, useEffect } from 'react';
import CardList from '../components/dashboard/CardList';
import TransactionList from '../components/dashboard/TransactionList';
import AuthorizationForm from '../components/dashboard/AuthorizationForm';
import PaymentForm from '../components/dashboard/PaymentForm';
import CardOffer from '../components/dashboard/CardOffer';
import AddBankAccountForm from '../components/dashboard/AddBankAccountForm';
import BankAccountList from '../components/dashboard/BankAccountList';
import DepositForm from '../components/dashboard/DepositForm';
import amexLogo from '../assets/amexlogo.png';
import { useAuth } from '../contexts/AuthContext';
import { cardsAPI, bankAPI } from '../services/api';
import type { Card } from '../types/card';
import type { BankAccountResponse } from '../types/bank';

interface Transaction {
  id: number;
  type: 'Compra' | 'Pago';
  amount: number;
  store: string;
  cardNumber: string;
  status?: 'APROBADO' | 'DENEGADO';
  authorizationCode?: string;
}

// Interface local para compatibilidad con AuthorizationForm
interface DashboardCard {
  number: string;
  name: string;
  limit: number;
  available: number;
  expiration?: string;
  security_code?: string;
}

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [error, setError] = useState('');
  const [showCardOffer, setShowCardOffer] = useState(false);
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccountResponse | null>(null);

  // Función para recargar tarjetas
  const loadCards = async () => {
    try {
      const userCards = await cardsAPI.getUserCards();
      setCards(userCards);
      
      // Convertir las tarjetas al formato que espera el dashboard
      const convertedCards: DashboardCard[] = userCards.map(card => ({
        number: card.card_number,
        name: card.cardholder_name,
        limit: card.credit_limit,
        available: card.available_credit,
        expiration: card.expiration_date,
        security_code: card.security_code
      }));
      
      setDashboardCards(convertedCards);
      setError('');
    } catch (error: any) {
      console.error('Error cargando tarjetas:', error);
      setError(error.message || 'Error al cargar las tarjetas');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar cuentas bancarias
  const loadBankAccounts = async () => {
    setLoadingBankAccounts(true);
    try {
      const accounts = await bankAPI.getUserBankAccounts();
      setBankAccounts(accounts);
    } catch (error: any) {
      console.error('Error cargando cuentas bancarias:', error);
    } finally {
      setLoadingBankAccounts(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadCards();
    loadBankAccounts();
  }, []);

  // Maneja pagos de tarjeta
  const handlePayment = (cardNumber: string, amount: number) => {
    setCards(prev =>
      prev.map(c =>
        c.card_number === cardNumber ? { 
          ...c, 
          available_credit: c.available_credit + amount 
        } : c
      )
    );

    setDashboardCards(prev =>
      prev.map(c =>
        c.number === cardNumber ? { 
          ...c, 
          available: c.available + amount 
        } : c
      )
    );

    setTransactions(prev => [
      ...prev,
      { 
        id: prev.length + 1, 
        type: 'Pago', 
        amount, 
        store: 'Pago Tarjeta', 
        cardNumber, 
        status: 'APROBADO', 
        authorizationCode: '000000' 
      }
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
          c.card_number === cardNumber ? { 
            ...c, 
            available_credit: c.available_credit - amount 
          } : c
        )
      );

      setDashboardCards(prev =>
        prev.map(c =>
          c.number === cardNumber ? { 
            ...c, 
            available: c.available - amount 
          } : c
        )
      );
    }

    setTransactions(prev => [
      ...prev,
      { 
        id: prev.length + 1, 
        type, 
        amount, 
        store: 'Autorización', 
        cardNumber, 
        status, 
        authorizationCode 
      }
    ]);
  };

  // Función para cuando se emite una tarjeta
  const handleCardIssued = () => {
    setShowCardOffer(false);
    loadCards();
  };

  // Función para cuando se agrega cuenta bancaria
  const handleBankAccountAdded = () => {
    setShowBankAccountForm(false);
    loadBankAccounts();
  };

  // Función para manejar clic en depositar
  const handleDepositClick = (account: BankAccountResponse) => {
    setSelectedAccount(account);
    setShowDepositForm(true);
  };

  // Función para cuando el depósito es exitoso
  const handleDepositSuccess = (updatedAccount: BankAccountResponse) => {
    setShowDepositForm(false);
    setSelectedAccount(null);
    // Actualizar la lista de cuentas bancarias
    setBankAccounts(prev => 
      prev.map(acc => 
        acc.account_id === updatedAccount.account_id ? updatedAccount : acc
      )
    );
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-900 text-xl">Cargando tus datos...</div>
      </div>
    );
  }

  return (
    <>
      {/* Modal para agregar cuenta bancaria */}
      {showBankAccountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <AddBankAccountForm 
            onAccountAdded={handleBankAccountAdded}
            onCancel={() => setShowBankAccountForm(false)}
          />
        </div>
      )}

      {/* Modal para hacer depósito */}
      {showDepositForm && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <DepositForm 
            account={selectedAccount}
            onDepositSuccess={handleDepositSuccess}
            onCancel={() => {
              setShowDepositForm(false);
              setSelectedAccount(null);
            }}
          />
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 p-6">
        {/* Header */}
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
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowBankAccountForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors"
                >
                  + Cuenta Bancaria
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mostrar error si hay */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Mostrar oferta de tarjeta o dashboard normal */}
        {showCardOffer ? (
          <CardOffer 
            onOfferAccepted={handleCardIssued}
            onCancel={() => setShowCardOffer(false)}
          />
        ) : cards.length === 0 ? (
          <div className="space-y-6">
            {/* Sección cuando no hay tarjetas */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">No tienes tarjetas aún</h2>
              <p className="text-blue-600 mb-6">American Express tiene una oferta pre-aprobada para ti</p>
              <button 
                onClick={() => setShowCardOffer(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors"
              >
                Ver Oferta Pre-Aprobada
              </button>
            </div>

            {/* Mostrar cuentas bancarias incluso cuando no hay tarjetas */}
            {loadingBankAccounts ? (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                <h2 className="text-xl font-semibold mb-4 text-blue-900">Cuentas Bancarias</h2>
                <div className="text-center py-4">
                  <div className="text-blue-900">Cargando cuentas...</div>
                </div>
              </div>
            ) : (
              <BankAccountList 
                accounts={bankAccounts} 
                onDepositClick={handleDepositClick}
              />
            )}
          </div>
        ) : (
          <>
            {/* Grid Principal - Cuando SÍ hay tarjetas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <CardList cards={cards} />
              </div>
              
              <div className="lg:col-span-1 space-y-6">
                {/* Lista de cuentas bancarias */}
                {loadingBankAccounts ? (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                    <h2 className="text-xl font-semibold mb-4 text-blue-900">Cuentas Bancarias</h2>
                    <div className="text-center py-4">
                      <div className="text-blue-900">Cargando cuentas...</div>
                    </div>
                  </div>
                ) : (
                  <BankAccountList 
                    accounts={bankAccounts} 
                    onDepositClick={handleDepositClick}
                  />
                )}
                
                {/* Lista de transacciones */}
                <TransactionList transactions={transactions} />
              </div>
            </div>

            {/* Formularios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AuthorizationForm 
                cards={dashboardCards}
                onAuthorize={handleAuthorize} 
              />
              <PaymentForm cards={dashboardCards} onPayment={handlePayment} />
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 justify-center mt-8">
              <button 
                onClick={() => setShowCardOffer(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-colors"
              >
                + Solicitar Otra Tarjeta
              </button>
              <button 
                onClick={() => setShowBankAccountForm(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors"
              >
                + Agregar Cuenta Bancaria
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DashboardPage;