import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, PaymentRequest, AppSettings, GlobalState, GeneratedImage } from '../types';
import { APP_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, INITIAL_CREDITS } from '../config';
import toast from 'react-hot-toast';

// Default Initial State
const defaultSettings: AppSettings = {
  paymentDetails: {
    methodName: 'Bkash/Nagad',
    accountNumber: '01700000000',
    qrCodeUrl: 'https://picsum.photos/200/200', // Placeholder
  },
  creditPackages: [
    { id: 'pkg1', name: 'Starter Pack', credits: 100, price: 50 },
    { id: 'pkg2', name: 'Pro Pack', credits: 500, price: 200 },
  ],
};

interface GlobalContextType extends GlobalState {
  login: (email: string, pass: string) => boolean;
  signup: (name: string, email: string, pass: string) => boolean;
  logout: () => void;
  deductCredit: (amount: number) => boolean;
  addCredits: (userId: string, amount: number) => void;
  requestPayment: (packageId: string, trxId: string) => void;
  approvePayment: (paymentId: string) => void;
  rejectPayment: (paymentId: string) => void;
  updateSettings: (newSettings: AppSettings) => void;
  toggleUserBlock: (userId: string) => void;
  addToGallery: (image: GeneratedImage) => void;
  deleteFromGallery: (imageId: string) => void;
}

const GlobalStateContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- State Initialization (Simulating Database) ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);

  // Load data from localStorage for persistence across reloads
  useEffect(() => {
    const storedUsers = localStorage.getItem(`${APP_NAME}_users`);
    const storedPayments = localStorage.getItem(`${APP_NAME}_payments`);
    const storedSettings = localStorage.getItem(`${APP_NAME}_settings`);
    const storedGallery = localStorage.getItem(`${APP_NAME}_gallery`);
    
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedPayments) setPayments(JSON.parse(storedPayments));
    if (storedSettings) setSettings(JSON.parse(storedSettings));
    if (storedGallery) setGallery(JSON.parse(storedGallery));
  }, []);

  // Persist data on change
  useEffect(() => { localStorage.setItem(`${APP_NAME}_users`, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(`${APP_NAME}_payments`, JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem(`${APP_NAME}_settings`, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(`${APP_NAME}_gallery`, JSON.stringify(gallery)); }, [gallery]);


  // --- Actions ---

  const login = (email: string, pass: string): boolean => {
    // 1. Check Admin
    if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: 'admin_001',
        name: 'Administrator',
        email: ADMIN_EMAIL,
        role: 'admin',
        credits: 99999,
        isBlocked: false
      };
      setCurrentUser(adminUser);
      toast.success("Welcome back, Administrator.");
      return true;
    }

    // 2. Check User
    const foundUser = users.find(u => u.email === email && u.password === pass);
    if (foundUser) {
      if (foundUser.isBlocked) {
        toast.error("Your account has been suspended.");
        return false;
      }
      setCurrentUser(foundUser);
      toast.success(`Welcome back, ${foundUser.name}.`);
      return true;
    }

    toast.error("Invalid credentials.");
    return false;
  };

  const signup = (name: string, email: string, pass: string): boolean => {
    if (users.find(u => u.email === email) || email === ADMIN_EMAIL) {
      toast.error("Email already in use.");
      return false;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password: pass,
      role: 'user',
      credits: INITIAL_CREDITS,
      isBlocked: false
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    toast.success("Account created! 10 free credits added.");
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    toast.success("Logged out successfully.");
  };

  const deductCredit = (amount: number): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; // Admin has infinite credits

    if (currentUser.credits < amount) {
      toast.error("Insufficient credits.");
      return false;
    }

    const updatedUser = { ...currentUser, credits: currentUser.credits - amount };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    return true;
  };

  const addCredits = (userId: string, amount: number) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        return { ...u, credits: u.credits + amount };
      }
      return u;
    }));
    
    // If the user being updated is logged in, update their session too
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, credits: currentUser.credits + amount });
    }
  };

  const requestPayment = (packageId: string, trxId: string) => {
    if (!currentUser) return;

    const pkg = settings.creditPackages.find(p => p.id === packageId);
    if (!pkg) return;

    const newPayment: PaymentRequest = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      userEmail: currentUser.email,
      packageId,
      packageName: pkg.name,
      amount: pkg.price,
      trxId,
      status: 'pending',
      date: new Date().toISOString()
    };

    setPayments([...payments, newPayment]);
    toast.success("Payment submitted for verification.");
  };

  const approvePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment || payment.status !== 'pending') return;

    const pkg = settings.creditPackages.find(p => p.id === payment.packageId);
    const creditsToAdd = pkg ? pkg.credits : 0;

    // Add credits
    addCredits(payment.userId, creditsToAdd);

    // Update payment status
    setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'approved' } : p));
    toast.success(`Payment approved. Credits added to ${payment.userEmail}.`);
  };

  const rejectPayment = (paymentId: string) => {
    setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'rejected' } : p));
    toast.error("Payment rejected.");
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    toast.success("System settings updated.");
  };

  const toggleUserBlock = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
    toast.success("User status updated.");
  };

  const addToGallery = (image: GeneratedImage) => {
    setGallery([image, ...gallery]);
  };

  const deleteFromGallery = (imageId: string) => {
    setGallery(gallery.filter(g => g.id !== imageId));
    toast.success("Image deleted.");
  };

  return (
    <GlobalStateContext.Provider value={{
      currentUser, users, payments, settings, gallery,
      login, signup, logout, deductCredit, addCredits,
      requestPayment, approvePayment, rejectPayment, updateSettings, toggleUserBlock,
      addToGallery, deleteFromGallery
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) throw new Error("useGlobalState must be used within a GlobalStateProvider");
  return context;
};
