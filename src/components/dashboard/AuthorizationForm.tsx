import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface Card {
  number: string;
  name: string;
  limit: number;
  available: number;
}

interface AuthorizationFormProps {
  cards: Card[];
  onAuthorize: (
    cardNumber: string,
    amount: number,
    type: 'Compra' | 'Pago',
    authorizationCode: string,
    status: 'APROBADO' | 'DENEGADO'
  ) => void;
}

const AuthorizationForm: React.FC<AuthorizationFormProps> = ({ cards, onAuthorize }) => {
  const [selectedCard, setSelectedCard] = useState(cards[0].number);
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const card = cards.find(c => c.number === selectedCard);
    if (!card) return;

    const monto = parseFloat(amount);
    let status: 'APROBADO' | 'DENEGADO';
    let authorizationCode = '0';

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (monto <= card.available) {
      status = 'APROBADO';
      authorizationCode = Math.floor(100000 + Math.random() * 900000).toString();
      setResult(`APROBADO ✅ - Código: ${authorizationCode}`);
    } else {
      status = 'DENEGADO';
      setResult(`DENEGADO ❌ - Crédito insuficiente`);
    }

    onAuthorize(selectedCard, monto, 'Compra', authorizationCode, status);
    setAmount('');
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">Autorizar Pagos</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Seleccionar Tarjeta
            </label>
            <select
              className="w-full p-3 rounded-lg border border-blue-200 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedCard}
              onChange={(e) => setSelectedCard(e.target.value)}
            >
              {cards.map(c => (
                <option key={c.number} value={c.number}>
                  {c.number} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <Input
              label="Monto a Autorizar"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 transition-all"
          disabled={isLoading}
        >
          {isLoading ? 'Procesando...' : 'Solicitar Autorización'}
        </Button>
      </form>

      {result && (
        <div className={`mt-4 p-4 rounded-lg ${
          result.includes('APROBADO') 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="font-medium">{result}</p>
        </div>
      )}
    </div>
  );
};

export default AuthorizationForm;