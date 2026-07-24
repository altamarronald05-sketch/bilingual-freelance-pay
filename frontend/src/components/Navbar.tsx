import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Globe, DollarSign, LogOut, ShieldCheck, Layers, CreditCard, TrendingUp, Sparkles, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenNewProject }) => {
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
      <div className="bg-slate-950/90 border-b border-yellow-500/10 py-1.5 px-6 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-400 font-bold shrink-0 uppercase tracking-widest text-[10px]">
          <TrendingUp className="w-3.5 h-3.5 animate-pulse" />
          <span>FINANCIAL TICKER</span>
        </div>

        <div className="ticker-wrap flex-1 mx-6">
          <div className="ticker-move space-x-8 text-slate-300">
            <span>USD/COP: <strong className="text-emerald-400">${copRate}</strong></span>
            <span>•</span>
            <span>EUR/USD: <strong className="text-emerald-400">€{eurRate}</strong></span>
            <span>•</span>
            <span>BTC/USD: <strong className="text-amber-400">${btcRate}</strong></span>
            <span>•</span>
            <span>ETH/USD: <strong className="text-purple-400">${ethRate}</strong></span>
            <span>•</span>
            <span>USDT/USD: <strong className="text-emerald-400">$1.00</strong></span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-amber-400/80 font-sans uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-amber-400" /> Live Data
        </div>
      </div>

      {/* Main Luxury Glass Navbar */}
      <nav className="glass-nav px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-all border border-amber-300/30">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-semibold gradient-text-gold tracking-tight">{t('appName')}</h1>
              <span className="bg-amber-500/10 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 tracking-wider">
                LUXURY PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans tracking-luxury uppercase">{t('tagline')}</p>
          </div>
        </div>

        {/* Center Nav Links */}
        {user && (
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-yellow-500/20 shadow-inner">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              {t('nav.dashboard')}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
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
            className="p-2.5 rounded-xl bg-slate-900/90 border border-yellow-500/20 text-amber-300 hover:bg-slate-800 transition cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Cambiar Tema"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          {/* Currency Selector */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-yellow-500/20 text-xs shadow-sm">
            <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
              <option value="COP" className="bg-slate-900 text-white">COP ($)</option>
              <option value="EUR" className="bg-slate-900 text-white">EUR (€)</option>
              <option value="BTC" className="bg-slate-900 text-white">BTC (₿)</option>
              <option value="ETH" className="bg-slate-900 text-white">ETH (Ξ)</option>
            </select>
          </div>

          {/* Language Switcher Pill */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-yellow-500/20 text-xs font-bold text-slate-200 hover:bg-slate-800 transition cursor-pointer shadow-sm"
          >
            <Globe className="w-4 h-4 text-purple-400" />
            <span>{i18n.language === 'es' ? '🇲🇽 ES' : '🇺🇸 EN'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3.5 ml-2 border-l border-yellow-500/20 pl-4">
              {user.role === 'client' && (
                <button onClick={onOpenNewProject} className="btn-primary text-xs py-2 px-4">
                  {t('nav.newProject')}
                </button>
              )}
              <div className="text-right text-xs hidden sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="font-bold text-slate-100">{user.full_name}</p>
                </div>
                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 tracking-wider">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                title={t('nav.logout')}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-yellow-500/20 transition cursor-pointer"
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
