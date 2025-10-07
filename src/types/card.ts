
export interface Card {
    card_number: string;
    cardholder_name: string;
    expiration_date: string; // yyyymm
    security_code: string;
    credit_limit: number;
    available_credit: number;
    cut_date: string; // yyyymmdd
    due_date: string; // yyyymmdd
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
    formato?: 'JSON' | 'XML';
  }
  
  export interface AuthorizationResponse {
    emisor: string;
    tarjeta: string;
    status: 'APROBADO' | 'DENEGADO';
    numero: string;
  }

  // types/card.ts - AGREGAR esto al final
export interface IssueCardRequest {
    bank_account_id: number;
    amex: boolean;
    credit_limit: number;
    cut_date: string; // yyyymmdd
    due_date: string; // yyyymmdd
    interest: number;
    expiration_date: string; // yyyymm
    cardholder_name: string;
  }