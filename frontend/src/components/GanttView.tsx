import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { Calendar, CheckCircle2, Clock, PlayCircle, ShieldAlert } from 'lucide-react';

interface GanttViewProps {
  project: any;
}

export const GanttView: React.FC<GanttViewProps> = ({ project }) => {
  const { formatCurrency } = useCurrency();

  const milestones = project?.milestones || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'under_review': return <ShieldAlert className="w-4 h-4 text-purple-400" />;
      case 'in_progress': return <PlayCircle className="w-4 h-4 text-blue-400" />;
      default: return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusWidth = (status: string) => {
    switch (status) {
      case 'approved': return 'w-full bg-emerald-500/80';
      case 'under_review': return 'w-3/4 bg-purple-500/80';
      case 'in_progress': return 'w-1/2 bg-blue-500/80';
      default: return 'w-1/4 bg-amber-500/80';
    }
  };

  return (
    <div className="glass-panel p-6 space-y-6 animate-slideUp">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Cronograma de Entregables (Vista Gantt)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{project?.title}</p>
        </div>
        <span className="text-xs font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-xl border border-white/10">
          Línea de Tiempo
        </span>
      </div>

      <div className="space-y-4">
        {milestones.map((ms: any, idx: number) => (
          <div key={ms.id} className="bg-slate-900/80 p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 text-xs font-bold flex items-center justify-center border border-white/10">
                  {idx + 1}
                </span>
                {getStatusIcon(ms.status)}
                <h4 className="text-xs font-bold text-slate-200">{ms.title}</h4>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono text-cyan-300 font-bold">{formatCurrency(ms.amount)}</span>
                <span className={`badge badge-${ms.status} text-[9px]`}>{ms.status}</span>
              </div>
            </div>

            {/* Timeline Progress Bar */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div className={`h-full rounded-full transition-all duration-700 ${getStatusWidth(ms.status)}`} />
            </div>

            {ms.proof_link && (
              <div className="text-[11px] text-slate-400 bg-black/40 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                <span>Evidencia adjunta: <a href={ms.proof_link} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{ms.proof_link}</a></span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
