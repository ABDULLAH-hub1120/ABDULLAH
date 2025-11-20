export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  role: UserRole;
  isBlocked: boolean;
  password?: string; // In a real app, this would be hashed. Storing plain for simulation.
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  packageId: string;
  packageName: string;
  amount: number;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  date: string;
}

export interface AppSettings {
  paymentDetails: {
    methodName: string;
    accountNumber: string;
    qrCodeUrl: string;
  };
  creditPackages: CreditPackage[];
}

export interface GlobalState {
  currentUser: User | null;
  users: User[];
  payments: PaymentRequest[];
  settings: AppSettings;
  gallery: GeneratedImage[];
}
