import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { CreditCard, CheckCircle2, ShieldCheck, Hash, Wallet } from 'lucide-react';

interface Transaction {
  id: number;
  milestone_id: number;
  project_id: number;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  tx_hash: string;
  created_at: string;
}

export const Transactions: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const res = await api.get('/payments/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error('Error fetching transactions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesCurrency = currencyFilter === 'ALL' || tx.currency.toUpperCase() === currencyFilter.toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || tx.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesCurrency && matchesStatus;
  });

  const currencies = ['ALL', 'USD', 'COP', 'EUR', 'BTC', 'ETH', 'USDT'];
  const statuses = [
    { value: 'ALL', label: 'Todos' },
    { value: 'completed', label: 'Completado' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'failed', label: 'Fallido' }
  ];

  const getMethodBadge = (method: string) => {
    const m = method.toLowerCase();
    if (m.includes('stripe') || m.includes('card')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
          <CreditCard className="w-3 h-3" /> {method}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
        <Wallet className="w-3 h-3" /> {method}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            {t('nav.transactions')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Registro inmutable de pagos y notificaciones de webhook</p>
        </div>
        <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-4 h-4" /> Entorno de Pruebas Seguro
        </span>
      </div>

      {/* Filtering Toolbar */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold w-16">Moneda:</span>
              <div className="flex flex-wrap gap-1.5">
                {currencies.map(curr => (
                  <button
                    key={curr}
                    onClick={() => setCurrencyFilter(curr)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${
                      currencyFilter === curr 
                        ? 'bg-indigo-600 text-white font-medium shadow-sm border-indigo-600' 
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {curr === 'ALL' ? 'Todas' : curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold w-16">Estado:</span>
              <div className="flex flex-wrap gap-1.5">
                {statuses.map(st => (
                  <button
                    key={st.value}
                    onClick={() => setStatusFilter(st.value)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${
                      statusFilter === st.value 
                        ? 'bg-indigo-600 text-white font-medium shadow-sm border-indigo-600' 
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
              Resultados: <strong className="text-indigo-400">{filteredTransactions.length}</strong> / {transactions.length}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold">Cargando historial de pagos...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center gap-3">
          <CreditCard className="w-10 h-10 text-slate-600" />
          <div>
            <p className="text-slate-300 font-semibold">No se encontraron transacciones</p>
            <p className="text-xs text-slate-500 mt-1">Intenta ajustando los filtros de búsqueda.</p>
          </div>
        </div>
      ) : (
        <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Hash de Transacción</th>
                  <th className="px-6 py-4 font-semibold">Método</th>
                  <th className="px-6 py-4 font-semibold">Monto Liberado</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Fecha (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-slate-300">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-[11px] text-slate-400 group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                        <div className="p-1.5 rounded bg-slate-800 border border-slate-700 group-hover:border-indigo-500/30">
                          <Hash className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate max-w-[180px] sm:max-w-[240px]" title={tx.tx_hash}>
                          {tx.tx_hash}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getMethodBadge(tx.payment_method)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200 group-hover:text-white flex items-center gap-1 text-sm">
                        {formatCurrency(tx.amount)}
                        <span className="text-[9px] font-mono text-slate-500 uppercase">{tx.currency}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${tx.status.toLowerCase() === 'completed' ? 'badge-approved' : 'badge-pending'}`}>
                        {tx.status.toLowerCase() === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 font-mono text-[10px]">
                      {new Date(tx.created_at).toLocaleString(undefined, { 
                        year: 'numeric', month: 'short', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

