import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { CreditCard, CheckCircle2, ShieldCheck, Hash } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            {t('nav.transactions')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Registro inmutable de pagos Sandbox y notificaciones de webhook</p>
        </div>
        <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Entorno de Pruebas Seguro
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Cargando historial de pagos...</div>
      ) : transactions.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 text-sm space-y-2">
          <p>No se han registrado transacciones aún.</p>
          <p className="text-xs text-slate-500">Aaprueba o fondea un hito desde el tablero Kanban para simular un pago.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4">ID / Hash</th>
                  <th className="p-4">Método</th>
                  <th className="p-4">Monto Liberado</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-mono text-cyan-300 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-[200px]" title={tx.tx_hash}>
                          {tx.tx_hash}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 uppercase font-semibold text-slate-200">
                      {tx.payment_method}
                    </td>
                    <td className="p-4 font-black text-cyan-300 text-sm">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="p-4">
                      <span className="badge badge-approved text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(tx.created_at).toLocaleString()}
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
