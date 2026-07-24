import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Briefcase, Lock, Mail, User as UserIcon } from 'lucide-react';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'freelancer' | 'client'>('freelancer');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register({
          email,
          password,
          full_name: fullName,
          role,
          preferred_currency: 'USD'
        });
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error en autenticación');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md p-8 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl relative space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black gradient-text">{t('auth.title')}</h2>
          <p className="text-xs text-slate-400">{t('auth.subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs text-center">
            {error}
          </div>
        )}

        {/* Quick Demo Access Buttons */}
        <div className="bg-cyan-950/40 p-4 rounded-2xl border border-cyan-500/30 space-y-2.5 shadow-xl">
          <span className="text-[11px] font-extrabold text-cyan-300 block text-center uppercase tracking-wider">
            ⚡ Acceso Rápido de Demostración (1 Clic)
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={async () => {
                setError('');
                try {
                  await login('client@nexusglobal.com', 'demo1234');
                } catch (err: any) {
                  setError(err.response?.data?.detail || 'Error al conectar con usuario demo cliente');
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              🏢 Demo Cliente
            </button>
            <button
              type="button"
              onClick={async () => {
                setError('');
                try {
                  await login('freelancer@dev.com', 'demo1234');
                } catch (err: any) {
                  setError(err.response?.data?.detail || 'Error al conectar con usuario demo freelancer');
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold border border-purple-500/40 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              💻 Demo Freelancer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">{t('auth.fullName')}</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">{t('auth.email')}</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">{t('auth.password')}</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">{t('nav.role')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`p-3 rounded-xl border flex items-center gap-2 transition text-xs font-semibold ${
                    role === 'freelancer' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4 shrink-0" />
                  {t('auth.roleFreelancer')}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`p-3 rounded-xl border flex items-center gap-2 transition text-xs font-semibold ${
                    role === 'client' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Briefcase className="w-4 h-4 shrink-0" />
                  {t('auth.roleClient')}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="w-full btn-primary py-3 justify-center text-sm font-bold mt-2">
            {isRegister ? t('auth.submitRegister') : t('auth.submitLogin')}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/10">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            {isRegister ? t('auth.switchLogin') : t('auth.switchRegister')}
          </button>
        </div>
      </div>
    </div>
  );
};
