import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FileText, CheckCircle2, Clock, PlayCircle, ShieldAlert, CreditCard, Sparkles, UserCheck, Briefcase } from 'lucide-react';

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'in_progress' | 'under_review' | 'approved';
  proof_link?: string;
  proof_notes?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  total_amount: number;
  currency: string;
  status: string;
  milestones: Milestone[];
  client?: { full_name: string; email: string };
  freelancer?: { full_name: string; email: string };
}

interface KanbanBoardProps {
  project: Project;
  onRefresh: () => void;
  onOpenContract: (projectId: number, projectTitle: string) => void;
  onOpenCheckout: (milestone: Milestone) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  project,
  onRefresh,
  onOpenContract,
  onOpenCheckout
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();

  const handleStatusChange = async (milestoneId: number, nextStatus: string) => {
    try {
      await api.patch(`/projects/milestones/${milestoneId}/status`, {
        status: nextStatus
      });
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al actualizar estado');
    }
  };

  const cols = [
    { key: 'pending', title: t('dashboard.cols.pending'), icon: Clock, color: 'text-slate-400', badgeClass: 'badge-pending', border: 'hover:border-slate-500/40' },
    { key: 'in_progress', title: t('dashboard.cols.in_progress'), icon: PlayCircle, color: 'text-blue-400', badgeClass: 'badge-in_progress', border: 'hover:border-blue-500/40' },
    { key: 'under_review', title: t('dashboard.cols.under_review'), icon: ShieldAlert, color: 'text-purple-400', badgeClass: 'badge-under_review', border: 'hover:border-purple-500/40' },
    { key: 'approved', title: t('dashboard.cols.approved'), icon: CheckCircle2, color: 'text-emerald-400', badgeClass: 'badge-approved', border: 'hover:border-emerald-500/40' }
  ];

  return (
    <div className="space-y-8 animate-slideUp">
      {/* Project Banner Header */}
      <div className="glass-panel p-8 space-y-4 border-l-4 border-l-indigo-500">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-sans font-bold text-slate-100">{project.title}</h2>
              <span className="badge badge-in_progress text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" /> {project.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{project.description || 'Sin descripción adicional'}</p>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Presupuesto Proyecto</span>
              <span className="text-2xl font-sans font-bold text-white">{formatCurrency(project.total_amount)}</span>
            </div>
            <button
              onClick={() => onOpenContract(project.id, project.title)}
              className="btn-secondary text-xs flex items-center gap-2 shadow-sm py-2.5 px-4"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              {t('dashboard.contractPdf')}
            </button>
          </div>
        </div>

        {/* Stakeholders Bar */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-700/50 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50 shadow-sm">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Cliente: <strong className="text-slate-100">{project.client?.full_name || 'Alex Morgan'}</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50 shadow-sm">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Freelancer: <strong className="text-slate-100">{project.freelancer?.full_name || 'Sofia Ramírez'}</strong></span>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {cols.map((col) => {
          const colMilestones = project.milestones.filter((m) => m.status === col.key);
          const ColIcon = col.icon;

          return (
            <div key={col.key} className="bg-slate-900/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col min-h-[460px] shadow-sm">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <ColIcon className={`w-4 h-4 ${col.color}`} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">{col.title}</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-600/50">
                  {colMilestones.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colMilestones.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500 border border-dashed border-slate-700/50 rounded-xl">
                    Sin hitos
                  </div>
                ) : (
                  colMilestones.map((ms) => (
                    <div
                      key={ms.id}
                      className={`glass-card-interactive p-4 space-y-3 ${col.border}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-100 leading-snug">
                          {ms.title}
                        </h4>
                        <span className={`badge ${col.badgeClass} shrink-0 text-[9px] h-6 flex items-center justify-center px-2.5`}>
                          {col.key}
                        </span>
                      </div>

                      {ms.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{ms.description}</p>
                      )}

                      <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
                        <span className="text-sm font-sans font-bold text-indigo-300">
                          {formatCurrency(ms.amount)}
                        </span>

                        {/* Action Buttons based on User Role & Status */}
                        <div className="flex items-center gap-1.5">
                          {/* Freelancer actions */}
                          {ms.status === 'pending' && user?.role === 'freelancer' && (
                            <button
                              onClick={() => handleStatusChange(ms.id, 'in_progress')}
                              className="text-[10px] bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-3 py-1 rounded-md border border-blue-500/30 font-semibold transition cursor-pointer shadow-sm"
                            >
                              Iniciar
                            </button>
                          )}
                          {ms.status === 'in_progress' && user?.role === 'freelancer' && (
                            <button
                              onClick={() => handleStatusChange(ms.id, 'under_review')}
                              className="text-[10px] bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 px-3 py-1 rounded-md border border-purple-500/30 font-semibold transition cursor-pointer shadow-sm"
                            >
                              Entregar
                            </button>
                          )}

                          {/* Client Actions: Approve / Fund Milestone */}
                          {ms.status !== 'approved' && user?.role === 'client' && (
                            <button
                              onClick={() => onOpenCheckout(ms)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 px-4 rounded-lg transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
                            >
                              <CreditCard className="w-3 h-3" />
                              {t('dashboard.payMilestone')}
                            </button>
                          )}

                          {ms.status === 'approved' && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center justify-center gap-1 bg-emerald-500/10 px-3 h-6 rounded-md border border-emerald-500/20 shadow-sm cursor-not-allowed">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
