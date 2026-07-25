import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Globe, DollarSign, LogOut, ShieldCheck, Layers, CreditCard, TrendingUp, Sparkles, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { selectedCurrency, setSelectedCurrency, rates } = useCurrency();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const copRate = (rates['COP'] || 4150).toLocaleString();
  const eurRate = (rates['EUR'] || 0.92).toFixed(2);
  const btcRate = (rates['BTC'] ? (1 / rates['BTC']).toLocaleString() : '64,250');
  const ethRate = (rates['ETH'] ? (1 / rates['ETH']).toLocaleString() : '3,450');

  return (
    <header className="sticky top-0 z-40">
      {/* Top Live Crypto/Fiat Ticker Bar */}
      <div className="py-2 px-4 bg-slate-900/90 border-b border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2 text-indigo-400 font-bold shrink-0 uppercase tracking-widest text-[10px]">
          <TrendingUp className="w-3.5 h-3.5 animate-pulse" />
          <span>FINANCIAL TICKER</span>
        </div>

        <div className="ticker-wrap flex-1 mx-6">
          <div className="ticker-move space-x-8 text-slate-300">
            <span>USD/COP: <strong className="text-emerald-400">${copRate}</strong></span>
            <span>•</span>
            <span>EUR/USD: <strong className="text-emerald-400">€{eurRate}</strong></span>
            <span>•</span>
            <span>BTC/USD: <strong className="text-indigo-400">${btcRate}</strong></span>
            <span>•</span>
            <span>ETH/USD: <strong className="text-purple-400">${ethRate}</strong></span>
            <span>•</span>
            <span>USDT/USD: <strong className="text-emerald-400">$1.00</strong></span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-indigo-400/80 font-sans uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Live Data
        </div>
      </div>

      {/* Main SaaS Glass Navbar */}
      <nav className="glass-nav px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:bg-indigo-500 transition-all border border-indigo-400/30">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-sans font-bold text-white tracking-tight">{t('appName')}</h1>
              <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 tracking-wider">
                SAAS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans tracking-wide uppercase">{t('tagline')}</p>
          </div>
        </div>

        {/* Center Nav Links */}
        {user && (
          <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700/50 shadow-inner">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white border border-slate-600/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              {t('nav.dashboard')}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'bg-slate-800 text-white border border-slate-600/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              {t('nav.transactions')}
            </button>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/50 text-slate-300 hover:bg-slate-800 transition cursor-pointer text-xs flex items-center shadow-sm"
            title="Cambiar Tema"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Currency Selector */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-md transition-all">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="USD" className="bg-slate-900 text-white">USD</option>
              <option value="COP" className="bg-slate-900 text-white">COP</option>
              <option value="EUR" className="bg-slate-900 text-white">EUR</option>
              <option value="BTC" className="bg-slate-900 text-white">BTC</option>
              <option value="ETH" className="bg-slate-900 text-white">ETH</option>
            </select>
          </div>

          {/* Language Switcher Pill */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-md transition-all group"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            <span>{i18n.language === 'es' ? 'ES' : 'EN'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3.5 ml-2 border-l border-slate-700/50 pl-4">
              <div className="text-right text-xs hidden sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="font-semibold text-slate-100">{user.full_name}</p>
                </div>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wider">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                title={t('nav.logout')}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700/50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
};
