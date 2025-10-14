export interface Card {
  card_number: string;
  cardholder_name: string;
  expiration_date: string;
  security_code: string;
  credit_limit: number;
  available_credit: number;
  cut_date: string; 
  due_date: string; 
  status: 'active' | 'blocked' | 'lost' | 'inactive';
  emisor_id: string;
}

export interface AuthorizationRequest {
  tarjeta: string;
  nombre: string;
  fecha_venc: string;
  num_seguridad: string;
  monto: number;
  tienda: string;
  formato?: string;
}

export interface AuthorizationResponse {
  emisor: string;
  tarjeta: string;
  status: 'APROBADO' | 'DENEGADO';
  numero: string;
}

export interface IssueCardRequest {
  bank_account_id: number;
  amex: boolean; 
  credit_limit: number;
  cut_date: string;
  due_date: string;
  interest: number;
  expiration_date: string;
  cardholder_name: string;
}

export interface Transaction {
  transaction_id?: number; 
  id?: string; 
  card_number: string;
  amount: number;
  store?: string; 
  description?: string; 
  timestamp: string; 
  status: 'APPROVED' | 'DENIED' | 'PENDING' | 'INCOMPLETE'; 
  type: 'PURCHASE' | 'PAYMENT';
  source_account_id?: number; 
  authorization_id?: number; 
}

export interface CreditCardPayment {
  amount: number;
  bank_account_id: number;
}

export interface Statement {
  card_number: string;
  cardholder_name?: string; 
  period: string;
  start_date: string;
  end_date: string;
  credit_limit?: number; 
  available_credit?: number; 
  previous_balance: number;
  payments: number;
  purchases: number;
  current_balance: number;
  due_date: string;
  minimum_payment: number;
  transactions: Transaction[];
}