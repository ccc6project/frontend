import React, { useState, useEffect } from 'react';
import fondo from '../../assets/fondo.jpeg';
import CardModal from './CardModal';
import CardInfoModal from './CardInfoModal';
import CreditCardStatement from './CreditCardStatement';
import type { Card } from '../../types/card';
import { bankAPI, cardsAPI } from '../../services/api';

interface CardListProps { onCardUpdate?: () => void;  onBankAccountUpdate?: () => void;}

const CardList: React.FC<CardListProps> = ({ onCardUpdate, onBankAccountUpdate }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [,setError] = useState<string>('');
  const [modal, setModal] = useState<{ type: 'payment' | 'pay-card' | null; card: Card | null }>({ type: null, card: null });
  const [formData, setFormData] = useState({ amount: '', store: '' });
  const [infoModalCard, setInfoModalCard] = useState<Card | null>(null);
  const [statementModalCard, setStatementModalCard] = useState<Card | null>(null);
  const [visibleCVVs, setVisibleCVVs] = useState<{ [key: string]: boolean }>({});

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const loadCards = async () => {
    try {
      const data = await cardsAPI.getUserCards();
      setCards(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tarjetas');
    }
  };

  useEffect(() => {  loadCards(); }, []);

  const toggleCVVVisibility = (cardNumber: string) => {
    setVisibleCVVs(prev => ({
      ...prev,
      [cardNumber]: !prev[cardNumber]
    }));
  };

  const handleSubmit = async (selectedBankAccountId?: number) => {
    if (!modal.card || !formData.amount) return;

    const amountNumber = parseFloat(formData.amount);
    setLoading(prev => ({ ...prev, [modal.card!.card_number]: true }));
    setError('');

    try {
      if (modal.type === 'pay-card') {
        const accounts = await bankAPI.getUserBankAccounts();
        if (accounts.length === 0) {
          throw new Error('No tienes cuentas bancarias registradas');
        }

        //Usar el account_id seleccionado o el primero
        const bankAccountId = selectedBankAccountId || accounts[0].account_id;
        
        // Verificar que la cuenta seleccionada tenga suficiente saldo
        const selectedAccount = accounts.find(acc => acc.account_id === bankAccountId);
        if (!selectedAccount) {
          throw new Error('La cuenta seleccionada no existe');
        }
        if (selectedAccount.balance < amountNumber) {
          throw new Error(`La cuenta ${selectedAccount.account_number} no tiene suficiente saldo`);
        }
        await cardsAPI.payCard(modal.card.card_number, {
          amount: amountNumber,
          bank_account_id: bankAccountId
        });
        
        showToast(`Pago de $${amountNumber.toLocaleString()} realizado exitosamente`, 'success');
        onBankAccountUpdate?.();
      } else {
        // Código de COMPRA
        const storeValue = formData.store || "Tienda Online";    
        if (amountNumber > modal.card.available_credit) {
          showToast('Saldo insuficiente para esta compra', 'error');
          return;
        }
        
        const result = await cardsAPI.authorizePayment({
          tarjeta: modal.card.card_number,
          nombre: modal.card.cardholder_name,
          fecha_venc: modal.card.expiration_date,
          num_seguridad: modal.card.security_code,
          monto: amountNumber,
          tienda: storeValue,
          formato: 'JSON'
        });
        
        showToast(result.status === 'APROBADO'    ? `Compra en ${storeValue} por $${amountNumber.toLocaleString()} aprobada`
            : `Compra en ${storeValue} denegada`,   result.status === 'APROBADO' ? 'success' : 'error'  ); }

      setModal({ type: null, card: null });
      setFormData({ amount: '', store: '' });
      await loadCards();
      onCardUpdate?.();
    } catch (err: any) {
      showToast(err.message || 'Error al procesar la transacción', 'error');
    } finally {
      setLoading(prev => ({ ...prev, [modal.card!.card_number]: false }));
    }
  };

  const openModal = (type: 'payment' | 'pay-card', card: Card) => {setModal({ type, card }); setFormData({ amount: '', store: '' });};

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">Mis Tarjetas</h2>
      
      {toast.show && (
        <div 
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg border-l-4 ${
            toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
          } transition-all duration-300 ease-out ${ toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}>
          <div className="font-semibold">{toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {cards.map((card, i) => (
          <div key={i} className="relative p-6 rounded-xl text-white hover:scale-[1.02] transition-transform shadow-lg overflow-hidden"
            style={{ backgroundImage: `url(${fondo})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-medium text-lg">{card.cardholder_name}</div>
                  <div className="font-mono text-sm opacity-90">{card.card_number}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-75">Disponible</div>
                  <div className="font-bold text-2xl">${card.available_credit.toLocaleString()}</div>
                  <div className="text-xs opacity-75">de ${card.credit_limit.toLocaleString()}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-xs opacity-90 mb-3">
                <div>Exp: {card.expiration_date}</div>
                <div className="flex items-center gap-1">
                  CVV: 
                  <span className="font-mono">
                    {visibleCVVs[card.card_number] ? card.security_code : '•••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCVVVisibility(card.card_number)}
                    className="text-white hover:text-gray-300 transition-colors focus:outline-none"
                    title={visibleCVVs[card.card_number] ? 'Ocultar CVV' : 'Mostrar CVV'}
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      {visibleCVVs[card.card_number] ? (
                        // Icono de ojo tachado (cuando está visible)
                        <>
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.411 3.411M9.88 9.88l-3.41-3.41m9.02 9.02l3.411-3.411M9.88 9.88l6.41-6.41"
                          />
                        </>
                      ) : (
                        // Icono de ojo abierto (cuando está oculto)
                        <>
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                          />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                <div className="text-right">{card.status}</div>
              </div>
              <div className="flex justify-between gap-2 mt-2">
                <button onClick={() => openModal('payment', card)} disabled={loading[card.card_number]}
                  className="flex-1 bg-gradient-to-r from-[#7DA1C4] to-[#3A6EA5] hover:opacity-90 py-2 rounded-lg text-xs font-semibold shadow-md transition">
                  {loading[card.card_number] ? '...' : 'Comprar'} </button>
                <button onClick={() => openModal('pay-card', card)} disabled={loading[card.card_number]}
                  className="flex-1 bg-gradient-to-r from-[#0A2540] to-[#1E3C72] hover:opacity-90 py-2 rounded-lg text-xs font-semibold shadow-md transition">
                  {loading[card.card_number] ? '...' : 'Pagar'}</button>
                <button onClick={() => setStatementModalCard(card)}
                  className="flex-1 bg-gradient-to-r from-[#B0BEC5] to-[#90A4AE] hover:opacity-90 py-2 rounded-lg text-xs font-semibold shadow-md transition">
                  Estado
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && <div className="text-center py-8 text-gray-500">No tienes tarjetas registradas</div>}

      <CardModal modal={modal}  formData={formData} onClose={() => setModal({ type: null, card: null })}
        onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}  onSubmit={handleSubmit} />

      <CardInfoModal card={infoModalCard} onClose={() => setInfoModalCard(null)} />
      
      {statementModalCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CreditCardStatement  cardNumber={statementModalCard.card_number}  onClose={() => setStatementModalCard(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CardList;