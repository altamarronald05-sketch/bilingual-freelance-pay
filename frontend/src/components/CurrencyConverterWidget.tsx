import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../context/CurrencyContext';
import { TrendingUp } from 'lucide-react';

export const CurrencyConverterWidget: React.FC = () => {
  const { t } = useTranslation();
  const { rates } = useCurrency();
  const [amount, setAmount] = useState<number>(100);
  const [fromCurr, setFromCurr] = useState<string>('USD');
  const [toCurr, setToCurr] = useState<string>('COP');

  const rateFrom = rates[fromCurr] || 1.0;
  const rateTo = rates[toCurr] || 1.0;
  const convertedValue = (amount / rateFrom) * rateTo;

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          {t('currency.liveRates')}
        </h3>
        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-white/10">
          En Tiempo Real
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Monto</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">De</label>
          <select
            value={fromCurr}
            onChange={(e) => setFromCurr(e.target.value)}
            className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            {Object.keys(rates).map((c) => (
              <option key={c} value={c} className="bg-slate-900">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">A</label>
          <select
            value={toCurr}
            onChange={(e) => setToCurr(e.target.value)}
            className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            {Object.keys(rates).map((c) => (
              <option key={c} value={c} className="bg-slate-900">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-900/90 p-4 rounded-xl border border-white/10 flex items-center justify-between">
        <span className="text-xs text-slate-400">Resultado Estimado:</span>
        <span className="text-xl font-extrabold text-cyan-300">
          {toCurr === 'BTC' || toCurr === 'ETH'
            ? `${convertedValue.toFixed(5)} ${toCurr}`
            : `${new Intl.NumberFormat().format(roundTwo(convertedValue))} ${toCurr}`}
        </span>
      </div>
    </div>
  );
};

function roundTwo(num: number) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
