import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (curr: string) => void;
  rates: Record<string, number>;
  convert: (amount: number, fromCurr?: string) => string;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [rates, setRates] = useState<Record<string, number>>({
    USD: 1.0,
    COP: 4150.0,
    EUR: 0.92,
    BTC: 0.000015,
    ETH: 0.00031,
    USDT: 1.0,
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get('/currency/rates?base=USD');
        if (res.data && res.data.rates) {
          setRates(res.data.rates);
        }
      } catch (err) {
        console.warn('Using fallback currency rates', err);
      }
    };
    fetchRates();
  }, []);

  const convert = (amount: number, fromCurr: string = 'USD'): string => {
    const rateFrom = rates[fromCurr] || 1.0;
    const rateTo = rates[selectedCurrency] || 1.0;
    const amountInUSD = amount / rateFrom;
    const converted = amountInUSD * rateTo;

    if (selectedCurrency === 'COP') {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(converted);
    } else if (selectedCurrency === 'EUR') {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(converted);
    } else if (selectedCurrency === 'BTC' || selectedCurrency === 'ETH') {
      return `${converted.toFixed(5)} ${selectedCurrency}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(converted);
  };

  const formatCurrency = (amount: number): string => {
    return convert(amount, 'USD');
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency, rates, convert, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
