// types/bank.ts - ARCHIVO NUEVO
export interface Bank {
    bank_id: number;
    name: string;
    bank_code: string;
    host: string;
  }
  
  export interface BankAccountRequest {
    bank_id: number;
    account_number: string;
    account_type: string;
  }
  
  export interface BankAccountResponse {
    account_id: number;
    user_id: number;
    bank_id: number;
    account_number: string;
    account_type: string;
    balance: number;
  }

  export interface DepositRequest {
    amount: number;
  }
  
  export interface DepositResponse {
    message: string;
    account: BankAccountResponse;
  }