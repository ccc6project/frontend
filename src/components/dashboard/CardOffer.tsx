import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { cardsAPI, bankAPI } from '../../services/api';
import type { BankAccountResponse } from '../../types/bank';
import type { IssueCardRequest } from '../../types/card';
import AddBankAccountForm from '../../components/dashboard/AddBankAccountForm';
import { useAuth } from '../../contexts/AuthContext';

interface CardOfferProps { onOfferAccepted: () => void; onCancel: () => void; }

interface GeneratedOffer {
  creditLimit: number;
  interestRate: number;
  cutDate: string; 
  dueDate: string; 
  expirationDate: string;
  cardType: string;
  annualFee: number;
  benefits: string[];
}

const CardOffer: React.FC<CardOfferProps> = ({ onOfferAccepted, onCancel }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState('');
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number>(0);
  const [generatedOffer, setGeneratedOffer] = useState<GeneratedOffer | null>(null);

  // Función para generar oferta compatible con el backend
  const generatePreApprovedOffer = (userBalance: number = 0): GeneratedOffer => {
    const now = new Date();

    // Límite de crédito basado en saldo del usuario
    const baseCreditLimit = userBalance > 0 ?
      Math.max(1000, Math.min(userBalance * 1.5, 15000)) :
      Math.floor(Math.random() * 4000) + 1000;

    // Variación del ±10% en el límite
    const variation = (Math.random() * 0.2) - 0.1;
    const creditLimit = Math.round(baseCreditLimit * (1 + variation) / 100) * 100;

    // Tasa de interés realista
    const baseInterestRate = creditLimit > 10000 ? 14.5 : creditLimit > 5000 ? 16.9 : 19.5;
    const interestRate = parseFloat((baseInterestRate + (Math.random() * 1 - 0.5)).toFixed(1));

    // Fechas SOLO como días del mes (formato "dd")
    const cutDay = (Math.floor(Math.random() * 10) + 10).toString().padStart(2, '0'); // "10" - "19"
    const dueDay = (parseInt(cutDay) + 15).toString().padStart(2, '0'); // 15 días después

    // Expiración: 3 años desde ahora (formato yyyymm)
    const expirationDate = new Date(now.getFullYear() + 3, now.getMonth(), 1);
    const expirationDateStr = `${expirationDate.getFullYear()}${(expirationDate.getMonth() + 1).toString().padStart(2, '0')}`;

    // Tipo de tarjeta y beneficios
    let cardType = 'American Express Standard';
    let annualFee = 0;
    let benefits: string[] = [];

    if (creditLimit > 10000) {
      cardType = 'American Express Gold';
      annualFee = 200;
      benefits = [
        '2x puntos en supermercados',
        '1x puntos en otras compras',
        'Seguro de viaje',
        'Asistencia en carretera'
      ];
    } else {
      cardType = 'American Express Standard';
      annualFee = 0;
      benefits = [
        '1x puntos en todas las compras',
        'Seguro de compras básico',
        'Sin cuota anual',
        'Alertas de seguridad'
      ];
    }

    return {
      creditLimit,
      interestRate,
      cutDate: cutDay,
      dueDate: dueDay,
      expirationDate: expirationDateStr,
      cardType,
      annualFee,
      benefits
    };
  };

  // Cargar cuentas bancarias del usuario
  const loadBankAccounts = async () => {
    try {
      console.log('Cargando cuentas bancarias...');
      const accounts = await bankAPI.getUserBankAccounts();
      console.log('Cuentas encontradas:', accounts.length);
      setBankAccounts(accounts);

      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].account_id);
        const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
        const offer = generatePreApprovedOffer(totalBalance);
        setGeneratedOffer(offer);
        setError('');
      } else {
        console.log('No hay cuentas bancarias');
        setError('Necesitas una cuenta bancaria para aceptar la oferta');
        const offer = generatePreApprovedOffer(0);
        setGeneratedOffer(offer);
      }
    } catch (error: any) {
      console.error('Error cargando cuentas:', error);
      setError('Error al cargar cuentas bancarias');
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => { loadBankAccounts();}, []);

  // Función para cuando se agrega exitosamente una cuenta bancaria
  const handleBankAccountAdded = () => { setShowBankAccountForm(false);  loadBankAccounts();};

  const handleAccountSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = Number(e.target.value);  setSelectedAccountId(accountId);};

  const handleAcceptOffer = async () => {
    setIsLoading(true);
    setError('');

    if (selectedAccountId === 0 || !generatedOffer) {
      setError('Selecciona una cuenta bancaria');
      setIsLoading(false);
      return;
    }

    try {
      // Usar el nombre REAL del usuario desde useAuth()
      const userName = user?.name || 'CLIENTE AMEX';
      console.log('Usuario actual:', user);
      console.log('Nombre en tarjeta:', userName);

      // Datos en el formato EXACTO que espera el backend
      const requestData: IssueCardRequest = {
        bank_account_id: selectedAccountId,
        amex: true,
        credit_limit: generatedOffer.creditLimit,
        cut_date: generatedOffer.cutDate, 
        due_date: generatedOffer.dueDate, 
        interest: generatedOffer.interestRate,
        expiration_date: generatedOffer.expirationDate,
        cardholder_name: userName
      };

      await cardsAPI.issueCard(requestData);
      console.log('Tarjeta emitida exitosamente');
      onOfferAccepted();
    } catch (error: any) {
      console.error('Error al emitir tarjeta:', error);
      setError(error.message || 'Error al aceptar la oferta');
    } finally {
      setIsLoading(false);
    }
  };

  // Si el modal del formulario está abierto, mostrar el modal
  if (showBankAccountForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <AddBankAccountForm onAccountAdded={handleBankAccountAdded} onCancel={() => setShowBankAccountForm(false)} />
      </div>
    );
  }

  // Mostrar loading mientras se cargan las cuentas
  if (loadingAccounts) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-20 border-2 border-blue-200 max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-blue-900 font-medium">Analizando tu perfil crediticio...</div>
          <p className="text-sm text-gray-500 mt-2">Preparando tu oferta personalizada</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no hay cuentas bancarias
  if (bankAccounts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">¡Oferta Pre-Aprobada!</h2>
          <p className="text-gray-600">American Express tiene una oferta especial para ti</p>
        </div>

        {generatedOffer && (
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-4 text-center">Tu Oferta Personalizada</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Límite de crédito:</span>
                <span className="font-bold">${generatedOffer.creditLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasa de interés:</span>
                <span className="font-bold">{generatedOffer.interestRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Tipo de tarjeta:</span>
                <span className="font-bold">{generatedOffer.cardType}</span>
              </div>
              <div className="flex justify-between">
                <span>Cuota anual:</span>
                <span className="font-bold">${generatedOffer.annualFee}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6">
          <p className="font-medium">Cuenta bancaria requerida</p>
          <p className="text-sm mt-1">Para aceptar esta oferta, necesitas tener una cuenta bancaria registrada.</p>
        </div>

        <div className="flex gap-4">
          <Button onClick={onCancel} className="flex-1 bg-gray-500 hover:bg-gray-600"> Cancelar </Button>
          <Button onClick={() => setShowBankAccountForm(true)} className="flex-1 bg-blue-600 hover:bg-blue-700"> Agregar Cuenta Bancaria</Button>
        </div>
      </div>);
  }

  // Si no hay oferta generada aún
  if (!generatedOffer) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200 max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="text-blue-900 font-medium">Generando tu oferta personalizada...</div>
        </div>
      </div>);
  }

  // Oferta normal con cuentas disponibles
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">¡Oferta Pre-Aprobada!</h2>
        <p className="text-blue-600">American Express - Tarjeta de Crédito</p>
        {/* Mostrar el nombre del usuario que aparecerá en la tarjeta */}
        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 inline-block">
          <p className="text-sm text-green-800 font-medium"> La tarjeta se emitirá a nombre de: <span className="font-bold">{user?.name}</span> </p>
        </div>
      </div>

      {/* Selector de cuenta bancaria */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium text-blue-800 mb-2"> Vincula tu tarjeta a una cuenta: </label>
        <select value={selectedAccountId} onChange={handleAccountSelect} className="w-full p-3 rounded-lg border border-blue-200 bg-white text-blue-900">
          {bankAccounts.map((account) => (<option key={account.account_id} value={account.account_id}>{account.account_number} - {account.account_type} (${account.balance})</option>))}
        </select>
      </div>

      {/* Detalles de la oferta */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-4 text-center">Detalles de tu Tarjeta</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Límite de crédito:</span>
            <span className="font-semibold">${generatedOffer.creditLimit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Tasa anual:</span>
            <span className="font-semibold">{generatedOffer.interestRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Corte cada:</span>
            <span className="font-semibold">Día {generatedOffer.cutDate} del mes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Pago hasta:</span>
            <span className="font-semibold">Día {generatedOffer.dueDate} del mes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Tipo:</span>
            <span className="font-semibold">{generatedOffer.cardType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Cuota anual:</span>
            <span className="font-semibold">${generatedOffer.annualFee}</span>
          </div>
        </div>
      </div>

      {/* Beneficios */}
      <div className="mb-3">
        <h4 className="font-semibold text-blue-900 mb-3">Beneficios:</h4>
        <ul className="space-y-2 text-sm text-blue-700">
          {generatedOffer.benefits.map((benefit, index) => (<li key={index} className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> {benefit}</li>))} </ul>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6"><p className="font-medium">{error}</p></div>)}

      <div className="flex gap-2 justify-center items-center">
        <Button onClick={onCancel} className="px-8 bg-gray-500 hover:bg-gray-600" disabled={isLoading}>Rechazar </Button>
        <Button onClick={handleAcceptOffer} className="px-8 bg-blue-600 hover:bg-blue-700" disabled={isLoading || selectedAccountId === 0}>
          {isLoading ? 'Procesando...' : 'Aceptar Oferta'} </Button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">Al aceptar, autorizas la verificación de tu información y la emisión de tu tarjeta American Express.</p>
    </div>);};

export default CardOffer;