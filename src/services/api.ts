import type { LoginData, RegisterData, AuthResponse, User, LogoutResponse } from '../types/user';
import type { Card, AuthorizationRequest, AuthorizationResponse, Statement, Transaction } from '../types/card';
import type { Bank, BankAccountRequest, BankAccountResponse, DepositRequest, DepositResponse } from '../types/bank';

const API_BASE_URL = 'http://localhost:5300';

export const authAPI = {
  // Registrar nuevo usuario
  async register(userData: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en el registro');
    }

    return await response.json();
  },

  // Login de usuario
  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en el login');
    }

    return await response.json();
  },

  // Logout
  async logout(): Promise<LogoutResponse> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error en el logout');
    }

    return await response.json();
  },

  // Obtener lista de usuarios
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios`);

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    return await response.json();
  },
};

export const cardsAPI = {
  // Obtener tarjetas del usuario autenticado
  async getUserCards(): Promise<Card[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/tarjeta-credito`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener tarjetas');
    }

    return await response.json();
  },

  // Autorizar pago
async authorizePayment(authData: AuthorizationRequest): Promise<AuthorizationResponse> {
  const params = new URLSearchParams({
    tarjeta: authData.tarjeta,
    nombre: authData.nombre,
    fecha_venc: authData.fecha_venc,
    num_seguridad: authData.num_seguridad,
    monto: authData.monto.toString(),
    tienda: authData.tienda, // ← obligatorio
    formato: authData.formato || 'JSON',
  });

  const response = await fetch(`${API_BASE_URL}/authorization?${params.toString()}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error ${response.status}: ${text}`);
  }

  return await response.json();
},



  // Emitir nueva tarjeta
  async issueCard(cardData: any): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/tarjeta-credito/emitir`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al emitir tarjeta');
    }

    return await response.json();
  },

  // Pagar tarjeta
  async payCard(cardNumber: string, paymentData: any): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/tarjeta-credito/${cardNumber}/pagar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al procesar pago');
    }

    return await response.json();
  },

   // Obtener transacciones de una tarjeta
  async getCardTransactions(cardNumber: string): Promise<Transaction[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/tarjeta-credito/${cardNumber}/transacciones`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener transacciones');
    }

    return await response.json();
  },

  // Obtener estado de cuenta
  async getCardStatement(cardNumber: string, period?: string): Promise<Statement> {
    const token = localStorage.getItem('token');
    const params = period ? `?period=${period}` : '';
    const response = await fetch(`${API_BASE_URL}/api/tarjeta-credito/${cardNumber}/estado-cuenta${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener estado de cuenta');
    }

    return await response.json();
  },
};

export const bankAPI = {
  // Lista de bancos disponibles
  getBanks(): Bank[] {
    return [
      { bank_id: 1, name: 'BI', bank_code: '0001', host: 'http://bi.com' },
      { bank_id: 2, name: 'BAC', bank_code: '0002', host: 'http://bac.com' },
      { bank_id: 3, name: 'BBVA', bank_code: '0003', host: 'http://BBVA.com' },
      { bank_id: 4, name: 'CITI BANK', bank_code: '0004', host: 'http://CITIBANK.com' },
    ];
  },

  // Agregar cuenta bancaria al usuario
  async addBankAccount(accountData: BankAccountRequest): Promise<BankAccountResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/cuentas-banco`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al agregar cuenta bancaria');
    }

    return await response.json();
  },

  // Obtener cuentas bancarias del usuario
  async getUserBankAccounts(): Promise<BankAccountResponse[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/cuentas-banco`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener cuentas bancarias');
    }

    return await response.json();
  },

  // Realizar depósito
  async makeDeposit(accountId: number, depositData: DepositRequest): Promise<DepositResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/cuentas-banco/${accountId}/deposito`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(depositData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al realizar el depósito');
    }

    return await response.json();
  },
};
