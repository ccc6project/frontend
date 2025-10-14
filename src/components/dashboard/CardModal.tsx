import React, { useEffect, useState } from 'react';
import type { Card } from '../../types/card';
import type { BankAccountResponse } from '../../types/bank';
import { bankAPI } from '../../services/api';

interface ModalData {
  type: 'payment' | 'pay-card' | null;
  card: Card | null;
}

interface CardModalProps {
  modal: ModalData;
  formData: { amount: string; store: string };
  onClose: () => void;
  onChange: (field: string, value: string) => void;
  onSubmit: (bankAccountId?: number) => void; // ← Cambiado para aceptar parámetro
}

const formatCardNumber = (num: string) =>
  num.includes(' ') ? num : num.replace(/(\d{4})(?=\d)/g, '$1 ');

const CardModal: React.FC<CardModalProps> = ({ modal, formData, onClose, onChange, onSubmit }) => {
  const [accounts, setAccounts] = useState<BankAccountResponse[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadAccounts = async () => {
      if (modal.type === 'pay-card' && modal.card) {
        try {
          const data = await bankAPI.getUserBankAccounts();
          setAccounts(data);
          // Seleccionar la primera cuenta por defecto
          if (data.length > 0) {
            setSelectedAccountId(data[0].account_id.toString());
          }
        } catch (err: any) {
          setError(err.message || 'Error al cargar cuentas bancarias');
        }
      }
    };
    loadAccounts();
  }, [modal]);

  if (!modal.type || !modal.card) return null;

  const amountNumber = parseFloat(formData.amount || '0');

  const canPay = () => {
    if (modal.type === 'pay-card') {
      const selectedAccount = accounts.find(acc => acc.account_id.toString() === selectedAccountId);
      return selectedAccount && selectedAccount.balance >= amountNumber;
    }
    return amountNumber <= modal.card!.available_credit;
  };

  const handleSubmit = () => {
    if (modal.type === 'pay-card' && selectedAccountId) {
      // ✅ CORREGIDO: Pasar el bank_account_id seleccionado
      onSubmit(parseInt(selectedAccountId));
    } else {
      onSubmit(); // Para compras, sin parámetro
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 p-6 rounded-xl shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0A2540 0%, #3A6EA5 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4 text-[#F0F4F8]">
          {modal.type === 'pay-card' ? 'Pagar Tarjeta' : 'Realizar Compra'}
        </h3>

        <div className="mb-5 p-4 rounded-lg bg-white/10 backdrop-blur-sm">
          <div className="text-sm text-[#E1E8F0]">
            Tarjeta: {formatCardNumber(modal.card.card_number)}
          </div>
          <div className="font-medium text-[#F0F4F8] mt-1">
            {modal.card.cardholder_name}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#E1E8F0]">
              Monto
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={e => onChange('amount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7DA1C4] outline-none text-black"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          {/* Campo para seleccionar cuenta bancaria (solo en pagos) */}
          {modal.type === 'pay-card' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-[#E1E8F0]">
                Cuenta Bancaria para Pagar
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7DA1C4] outline-none text-black"
              >
                <option value="">Seleccionar cuenta</option>
                {accounts.map(account => (
                  <option key={account.account_id} value={account.account_id}>
                    {account.account_number} - ${account.balance.toLocaleString()} ({account.account_type})
                  </option>
                ))}
              </select>
              {accounts.length === 0 && (
                <div className="text-yellow-500 text-sm mt-1">
                  No tienes cuentas bancarias registradas
                </div>
              )}
            </div>
          )}

          {/* Campo tienda solo para compras */}
          {modal.type === 'payment' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-[#E1E8F0]">
                Nombre de la Tienda
              </label>
              <input
                type="text"
                value={formData.store}
                onChange={e => onChange('store', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7DA1C4] outline-none text-black"
                placeholder="Ej: Amazon, Walmart, etc."
              />
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {modal.type === 'pay-card' && amountNumber > 0 && !canPay() && (
            <div className="text-red-500 text-sm">
              La cuenta seleccionada no tiene suficiente saldo para pagar esta tarjeta
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#E1E8F0] rounded-lg text-[#F0F4F8] hover:bg-white/10 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.amount || !canPay() || (modal.type === 'payment' && !formData.store) || (modal.type === 'pay-card' && !selectedAccountId)}
              className="flex-1 px-4 py-2 rounded-lg text-white font-semibold shadow-md transition
                         disabled:bg-gray-400
                         bg-gradient-to-r from-[#0A2540] to-[#1E3C72] hover:opacity-90"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;