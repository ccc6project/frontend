import React, { useState, useEffect } from 'react';
import CardList from '../components/dashboard/CardList';
import CardOffer from '../components/dashboard/CardOffer';
import AddBankAccountForm from '../components/dashboard/AddBankAccountForm';
import BankAccountList from '../components/dashboard/BankAccountList';
import DepositForm from '../components/dashboard/DepositForm';
import amexLogo from '../assets/amexlogo.png';
import { useAuth } from '../contexts/AuthContext';
import { cardsAPI, bankAPI } from '../services/api';
import type { Card } from '../types/card';
import type { BankAccountResponse } from '../types/bank';

// Interfaz local para compatibilidad con AuthorizationForm
interface DashboardCard { number: string; name: string; limit: number; available: number; expiration?: string; security_code?: string; }

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [showCardOffer, setShowCardOffer] = useState(false);
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccountResponse | null>(null);
  
  // ✅ NUEVO: Estado para forzar recarga de cuentas bancarias
  const [refreshBankAccounts, setRefreshBankAccounts] = useState(0);

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
    } catch (error: any) {
      console.error('Error cargando tarjetas:', error);
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

  // ✅ NUEVO: Recargar cuentas bancarias cuando cambie refreshBankAccounts
  useEffect(() => {
    if (refreshBankAccounts > 0) {
      loadBankAccounts();
    }
  }, [refreshBankAccounts]);

  // Función para cuando se emite una tarjeta
  const handleCardIssued = () => { 
    setShowCardOffer(false); 
    loadCards(); 
    loadBankAccounts();
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
      prev.map(acc => acc.account_id === updatedAccount.account_id ? updatedAccount : acc));
  };

  // ✅ NUEVO: Callback para actualizar cuentas bancarias desde CardList
  const handleBankAccountUpdate = () => {
    setRefreshBankAccounts(prev => prev + 1);
  };

  const handleLogout = () => { logout(); };

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
          <AddBankAccountForm onAccountAdded={handleBankAccountAdded} onCancel={() => setShowBankAccountForm(false)} />
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

      <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 text-gray-800 p-2">
        {/* Header */}
        <header className="bg-gradient-to-br mb-8 from-slate-900 via-gray-800 to-black rounded-2xl shadow-2xl p-3 relative overflow-hidden border border-gray-800">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-gray-500 to-gray-900 p-2 rounded-xl shadow-xl border border-gray-700">
                <img src={amexLogo} alt="AMEX" className="h-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Banca Electrónica</h1>
                <p className="text-gray-300 font-medium tracking-wider text-sm">American Express®</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50 shadow-lg">
                <div className="text-left">
                  <p className="font-semibold text-white text-sm">Bienvenido, {user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowBankAccountForm(true)} 
                  className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl border border-gray-600 flex items-center gap-1"
                >
                  <span className="text-lg">+</span> <span>Cuenta Bancaria</span>
                </button>
                <button 
                  onClick={handleLogout} 
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 font-semibold border border-gray-600 hover:border-red-500 text-sm"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mostrar oferta de tarjeta o dashboard normal */}
        {showCardOffer ? (
          <CardOffer 
            onOfferAccepted={handleCardIssued} 
            onCancel={() => { 
              setShowCardOffer(false); 
              loadBankAccounts();
            }} 
          />
        ) : cards.length === 0 ? (
          <div className="space-y-8">
            {/* Sección cuando no hay tarjetas */}
            <div className="bg-white rounded-xl shadow-lg p-10 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No tienes tarjetas aún</h2>
              <p className="text-blue-900 mb-6">American Express tiene una oferta pre-aprobada para ti</p>
              <button 
                onClick={() => setShowCardOffer(true)} 
                className="bg-gradient-to-r from-gray-600 to-gray-900 text-white px-6 py-3 rounded-lg hover:from-gray-900 hover:to-gray-700 transition-colors"
              >
                Ver Oferta Pre-Aprobada
              </button>
            </div>
            
            {/* Mostrar cuentas bancarias incluso cuando no hay tarjetas */}
            {loadingBankAccounts ? (
              <div className="bg-white rounded-xl shadow-lg p-20 border border-blue-100">
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
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              <div className="lg:w-[65%]">
                {/* ✅ ACTUALIZADO: Pasar el callback onBankAccountUpdate */}
                <CardList 
                  onCardUpdate={loadCards} 
                  onBankAccountUpdate={handleBankAccountUpdate} 
                />
              </div>
              <div className="lg:w-[35%] space-y-6">
                {/* Lista de cuentas bancarias */}
                {loadingBankAccounts ? (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-900">
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
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <button 
                onClick={() => setShowCardOffer(true)}
                className="bg-gradient-to-br from-gray-950 via-slate-900 to-black text-white px-4 py-2 rounded-xl hover:from-gray-900 hover:via-slate-800 hover:to-gray-900 transition-all duration-300 font-semibold shadow-2xl hover:shadow-blue-900/50 border border-blue-900/50 hover:border-blue-700/50 flex items-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="text-xl font-bold relative z-6">+</span>
                <span className="relative z-10">Solicitar Otra Tarjeta</span>
              </button>
              <button 
                onClick={() => setShowBankAccountForm(true)}
                className="bg-gradient-to-br from-gray-950 via-slate-900 to-black text-white px-4 py-2 rounded-xl hover:from-gray-900 hover:via-slate-800 hover:to-gray-900 transition-all duration-300 font-semibold shadow-2xl hover:shadow-blue-900/50 border border-blue-900/50 hover:border-blue-700/50 flex items-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="text-xl font-bold relative z-10">+</span>
                <span className="relative z-6">Agregar Cuenta Bancaria</span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DashboardPage;