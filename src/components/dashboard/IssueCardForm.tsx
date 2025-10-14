import React, { useState, useEffect } from 'react';
import Input from '../ui/Input'; import Button from '../ui/Button';
import { cardsAPI, bankAPI } from '../../services/api';
import type { IssueCardRequest } from '../../types/card';
import type { BankAccountResponse } from '../../types/bank';

interface IssueCardFormProps {
  onCardIssued: () => void;
  onCancel: () => void;
}

const IssueCardForm: React.FC<IssueCardFormProps> = ({ onCardIssued, onCancel }) => {
  const [formData, setFormData] = useState<IssueCardRequest>({
    bank_account_id: 0,
    amex: true,
    credit_limit: 5000,
    cut_date: '',
    due_date: '',
    interest: 15.5,
    expiration_date: '',
    cardholder_name: ''
  });
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<BankAccountResponse | null>(null);

  // Cargar cuentas bancarias del usuario
  useEffect(() => {
    const loadBankAccounts = async () => {
      try {
        console.log('Cargando cuentas bancarias del usuario...');
        const accounts = await bankAPI.getUserBankAccounts();
        console.log('Cuentas bancarias cargadas:', accounts);
        
        setBankAccounts(accounts);
        
        if (accounts.length > 0) {
          const firstAccount = accounts[0];
          setSelectedAccount(firstAccount);
          setFormData(prev => ({
            ...prev,
            bank_account_id: firstAccount.account_id
          }));
          console.log('Cuenta seleccionada por defecto:', firstAccount);
        } else {
          console.log('No se encontraron cuentas bancarias');
        }
      } catch (error: any) {
        console.error('Error cargando cuentas bancarias:', error);
        setError('Error al cargar cuentas bancarias: ' + (error.message || 'Error desconocido'));
      } finally {
        setLoadingAccounts(false);
      }
    };
    loadBankAccounts();
  }, []);

  // Generar fechas automáticamente
  useEffect(() => {
    const now = new Date();
    
    // Fecha de expiración: 3 años desde ahora (YYYYMM)
    const expirationDate = new Date(now.getFullYear() + 3, now.getMonth(), 1);
    const expirationDateStr = expirationDate.getFullYear().toString() + 
      (expirationDate.getMonth() + 1).toString().padStart(2, '0');
    
    // Fecha de corte: día 15 del mes actual (YYYYMMDD)
    const cutDate = new Date(now.getFullYear(), now.getMonth(), 15);
    const cutDateStr = cutDate.getFullYear().toString() + 
      (cutDate.getMonth() + 1).toString().padStart(2, '0') + 
      cutDate.getDate().toString().padStart(2, '0');
    
    // Fecha de vencimiento: día 30 del mes actual (YYYYMMDD)
    const dueDate = new Date(now.getFullYear(), now.getMonth(), 30);
    const dueDateStr = dueDate.getFullYear().toString() + 
      (dueDate.getMonth() + 1).toString().padStart(2, '0') + 
      dueDate.getDate().toString().padStart(2, '0');

    setFormData(prev => ({ ...prev, expiration_date: expirationDateStr, cut_date: cutDateStr, due_date: dueDateStr}));}, []);

  const handleAccountSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = Number(e.target.value);
    const account = bankAccounts.find(acc => acc.account_id === accountId);
    
    if (account) {
      setSelectedAccount(account);
      setFormData(prev => ({
        ...prev,
        bank_account_id: account.account_id
      }));
      console.log('Cuenta seleccionada:', account);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev,  [name]: name === 'limite de credito' || name === 'intereses' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // console.log('Enviando solicitud de tarjeta:', formData);
    // console.log('Cuenta bancaria seleccionada ID:', formData.bank_account_id);
    
    if (!formData.cardholder_name.trim()) {
      setError('Por favor ingresa el nombre del titular');
      return;
    }

    if (formData.bank_account_id === 0) {
      setError('Por favor selecciona una cuenta bancaria válida');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Enviando solicitud a la API...');
      await cardsAPI.issueCard(formData);
      console.log('Tarjeta emitida exitosamente');
      onCardIssued();
    } catch (error: any) {
      console.error('Error emitiendo tarjeta:', error);
      setError(error.message || 'Error al emitir tarjeta. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingAccounts) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-blue-900 font-medium">Cargando tus cuentas bancarias...</div>
          <p className="text-sm text-gray-500 mt-2">Verificando cuentas disponibles</p>
        </div>
      </div>
    );
  }
  if (bankAccounts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-blue-900 text-center"> Emitir Nueva Tarjeta AMEX </h2>
        <div className="text-center py-4">
          <p className="text-blue-600 mb-4">No tienes cuentas bancarias registradas</p>
          <p className="text-sm text-gray-500 mb-6"> Para emitir una tarjeta AMEX, primero necesitas vincular una cuenta bancaria </p>
          <div className="space-y-3">
            <Button onClick={onCancel} className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3" >Volver al Dashboard</Button>
            <p className="text-xs text-gray-500">Ve a "Agregar Cuenta Bancaria" en el dashboard principal </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-900 text-center"> Emitir Nueva Tarjeta AMEX</h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <div>
              <p className="font-medium">{error}</p>
              {error.includes('No valid bank account') && (<p className="text-sm mt-1">Asegúrate de seleccionar una cuenta bancaria válida y que esté activa.</p>)}
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna 1: Selección de cuenta bancaria */}
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Selecciona tu Cuenta Bancaria </h3>
          <p className="text-sm text-gray-600 mb-4"> Elige la cuenta bancaria que quieres vincular a tu nueva tarjeta AMEX </p>
          {/* Dropdown de cuentas bancarias */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-blue-800 mb-2"> Cuenta Bancaria * </label>
            <select value={formData.bank_account_id} onChange={handleAccountSelect} className="w-full p-3 rounded-lg border border-blue-200 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"  required>
              <option value={0}>Selecciona una cuenta bancaria</option>
              {bankAccounts.map((account) => ( <option key={account.account_id} value={account.account_id}>
                  {account.account_number} - {account.account_type} - Saldo: ${account.balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Información de la cuenta seleccionada */}
          {selectedAccount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Cuenta Seleccionada</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-green-700">Número:</span>
                  <div className="font-semibold">{selectedAccount.account_number}</div>
                </div>
                <div>
                  <span className="text-green-700">Tipo:</span>
                  <div className="font-semibold">{selectedAccount.account_type}</div>
                </div>
                <div>
                  <span className="text-green-700">Saldo:</span>
                  <div className="font-semibold text-green-600"> ${selectedAccount.balance.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-green-700">Estado:</span>
                  <div className="font-semibold"> 
                    <span className={`px-2 py-1 rounded-full text-xs ${selectedAccount.balance > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800' }`}>
                      {selectedAccount.balance > 0 ? 'Activa' : 'Sin fondos'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Lista de todas las cuentas disponibles */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-blue-900 mb-3"> Todas tus Cuentas Disponibles</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto"> {bankAccounts.map((account) => (
                <div key={account.account_id}
                  className={`border rounded-lg p-3 transition-all ${selectedAccount?.account_id === account.account_id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-blue-900">{account.account_number}</h5>
                      <p className="text-xs text-gray-600 capitalize">{account.account_type.toLowerCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600"> ${account.balance.toLocaleString()}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        account.balance > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {account.balance > 0 ? 'Activa' : 'Sin fondos'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Columna 2: Formulario de tarjeta */}
        <div> <h3 className="text-lg font-semibold text-blue-900 mb-4">Información de la Tarjeta</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre del titular */}
            <Input label="Nombre del Titular *"name="cardholder_name" value={formData.cardholder_name} onChange={handleChange} required placeholder="JUAN PEREZ"/>
            {/* Límite de crédito */}
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2"> Límite de Crédito Solicitado * </label>
              <select name="credit_limit" value={formData.credit_limit} onChange={handleChange}
                className="w-full p-3 rounded-lg border border-blue-200 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required>
                <option value={1000}>$1,000</option>
                <option value={2000}>$2,000</option>
                <option value={5000}>$5,000</option>
                <option value={10000}>$10,000</option>
                <option value={15000}>$15,000</option>
              </select>
            </div>
            {/* Información automática */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Detalles Automáticos:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700">Fecha de Expiración:</span>
                  <div className="font-semibold">{formData.expiration_date}</div>
                </div>
                <div>
                  <span className="text-blue-700">Fecha de Corte:</span>
                  <div className="font-semibold">{formData.cut_date}</div>
                </div>
                <div>
                  <span className="text-blue-700">Fecha de Vencimiento:</span>
                  <div className="font-semibold">{formData.due_date}</div>
                </div>
                <div>
                  <span className="text-blue-700">Tasa de Interés:</span>
                  <div className="font-semibold">{formData.interest}% anual</div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button type="button" onClick={onCancel} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3" disabled={isLoading}> Cancelar </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3"
                disabled={isLoading || !selectedAccount || formData.bank_account_id === 0}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Emitiendo...</div>) : ('Aceptar Oferta y Emitir Tarjeta')}
              </Button>
            </div>
          </form>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              💡 <strong>Importante:</strong> La aprobación de tu tarjeta AMEX está sujeta a 
              la verificación de tu cuenta bancaria vinculada y tu historial crediticio.
              Al hacer clic en "Aceptar Oferta", autorizas a American Express a verificar 
              tu información y emitir tu tarjeta. </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCardForm;