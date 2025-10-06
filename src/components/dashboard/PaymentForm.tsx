import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface Card {
  number: string;
  name: string;
  limit: number;
  available: number;
}

interface PaymentFormProps {
  cards: Card[];
  onPayment: (cardNumber: string, amount: number) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ cards, onPayment }) => {
  const [selectedCard, setSelectedCard] = useState(cards[0].number);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const monto = parseFloat(amount);
    if (monto <= 0) return;

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onPayment(selectedCard, monto);
    setAmount('');
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">Realizar Pago</h2>
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
              label="Monto del Pago"
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
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 transition-all"
          disabled={isLoading}
        >
          {isLoading ? 'Procesando Pago...' : 'Realizar Pago'}
        </Button>
      </form>
    </div>
  );
};

export default PaymentForm;