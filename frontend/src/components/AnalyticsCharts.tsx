import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { BarChart3, Activity } from 'lucide-react';

interface AnalyticsChartsProps {
  projects: any[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ projects }) => {
  const { formatCurrency } = useCurrency();

  // Aggregate milestone statuses
  let pendingCount = 0;
  let inProgressCount = 0;
  let reviewCount = 0;
  let approvedCount = 0;
  let approvedTotalAmount = 0;
  let totalProjectedAmount = 0;

  projects.forEach((p) => {
    totalProjectedAmount += p.total_amount || 0;
    p.milestones?.forEach((m: any) => {
      if (m.status === 'pending') pendingCount++;
      if (m.status === 'in_progress') inProgressCount++;
      if (m.status === 'under_review') reviewCount++;
      if (m.status === 'approved') {
        approvedCount++;
        approvedTotalAmount += m.amount;
      }
    });
  });

  const totalMilestones = pendingCount + inProgressCount + reviewCount + approvedCount || 1;
  const approvedPct = Math.round((approvedCount / totalMilestones) * 100);
  const inProgressPct = Math.round((inProgressCount / totalMilestones) * 100);
  const reviewPct = Math.round((reviewCount / totalMilestones) * 100);
  const pendingPct = Math.round((pendingCount / totalMilestones) * 100);

  return (
    <div className="glass-panel p-6 space-y-6 animate-slideUp">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Analítica Financiera & Velocidad de Entregas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Métricas consolidadas de liquidez y avance de proyectos</p>
        </div>
        <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1">
          <Activity className="w-3 h-3 animate-pulse" /> Actualizado
        </span>
      </div>

      {/* Financial Bar & Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-semibold">
            <span>Volumen Fondeado Liberado</span>
            <span className="text-emerald-400">{approvedPct}%</span>
          </div>
          <div className="text-xl font-black text-emerald-400">
            {formatCurrency(approvedTotalAmount)}
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-1000" style={{ width: `${approvedPct}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-semibold">
            <span>Proyección Total Contratada</span>
            <span className="text-cyan-400">100%</span>
          </div>
          <div className="text-xl font-black text-cyan-300">
            {formatCurrency(totalProjectedAmount)}
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Visual Distribution Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
          <span>Distribución por Fases de Hitos</span>
          <span className="text-slate-400">{totalMilestones} Hitos Totales</span>
        </div>

        <div className="w-full h-4 bg-slate-900 rounded-full flex overflow-hidden border border-white/10 p-0.5">
          <div className="bg-emerald-500 h-full rounded-l-full transition-all" style={{ width: `${approvedPct}%` }} title={`Aprobados: ${approvedCount}`} />
          <div className="bg-purple-500 h-full transition-all" style={{ width: `${reviewPct}%` }} title={`En Revisión: ${reviewCount}`} />
          <div className="bg-blue-500 h-full transition-all" style={{ width: `${inProgressPct}%` }} title={`En Progreso: ${inProgressCount}`} />
          <div className="bg-amber-500 h-full rounded-r-full transition-all" style={{ width: `${pendingPct}%` }} title={`Pendientes: ${pendingCount}`} />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Aprobados ({approvedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
            <span>En Revisión ({reviewCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span>En Progreso ({inProgressCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span>Pendientes ({pendingCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
