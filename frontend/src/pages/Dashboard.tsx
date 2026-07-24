import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { GanttView } from '../components/GanttView';
import { KanbanBoard } from '../components/KanbanBoard';
import type { Project, Milestone } from '../components/KanbanBoard';
import { CurrencyConverterWidget } from '../components/CurrencyConverterWidget';
import { ContractModal } from '../components/ContractModal';
import { CheckoutModal } from '../components/CheckoutModal';
import { NewProjectModal } from '../components/NewProjectModal';
import { FolderCheck, DollarSign, CheckCircle2, Plus, PieChart, ShieldCheck, Zap, LayoutGrid, CalendarRange } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'gantt'>('kanban');

  // Modals
  const [activeContract, setActiveContract] = useState<{ projectId: number; projectTitle: string } | null>(null);
  const [activeCheckout, setActiveCheckout] = useState<Milestone | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      if (res.data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(res.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Metrics
  const totalFunded = projects.reduce((sum, p) => {
    const approvedMs = p.milestones.filter((m) => m.status === 'approved');
    return sum + approvedMs.reduce((msSum, m) => msSum + m.amount, 0);
  }, 0);

  const totalAllMs = projects.reduce((sum, p) => sum + p.milestones.length, 0);
  const totalApprovedMs = projects.reduce((count, p) => count + p.milestones.filter((m) => m.status === 'approved').length, 0);

  const completionPercentage = totalAllMs > 0 ? Math.round((totalApprovedMs / totalAllMs) * 100) : 0;

  return (
    <div className="space-y-10 animate-slideUp py-4">
      {/* Top Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-7 flex items-center justify-between group hover:border-amber-500/50">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-luxury block">{t('dashboard.activeProjects')}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-serif font-bold text-slate-100">{projects.length}</span>
              <span className="text-xs font-bold text-amber-400">Activos</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition shadow-lg">
            <FolderCheck className="w-7 h-7" />
          </div>
        </div>

        <div className="glass-panel p-7 flex items-center justify-between group hover:border-emerald-500/50">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-luxury block">{t('dashboard.totalEarnings')}</span>
            <div className="mt-2">
              <span className="text-3xl font-serif font-bold gradient-text-emerald">{formatCurrency(totalFunded)}</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition shadow-lg">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        <div className="glass-panel p-7 flex items-center justify-between group hover:border-blue-500/50">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-luxury block">{t('dashboard.milestonesApproved')}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-serif font-bold text-emerald-400">{totalApprovedMs}</span>
              <span className="text-xs text-slate-400 font-medium">/ {totalAllMs} Hitos</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition shadow-lg">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>

        {/* Donut Progress Card */}
        <div className="glass-panel p-7 flex items-center justify-between group hover:border-purple-500/50">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-luxury block">Progreso Global</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-serif font-bold text-purple-300">{completionPercentage}%</span>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Completo</span>
            </div>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-slate-800" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={138}
                strokeDashoffset={138 - (138 * completionPercentage) / 100}
                className="text-purple-400 transition-all duration-1000"
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <Zap className="w-5 h-5 text-purple-300 absolute" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <AnalyticsCharts projects={projects} />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left 3 Columns: Project Selector & Kanban / Gantt */}
        <div className="lg:col-span-3 space-y-6">
          {/* Project Selector & View Mode Buttons */}
          <div className="glass-panel p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-luxury shrink-0 mr-1 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-amber-400" /> Proyecto:
              </span>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedProject?.id === p.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'text-slate-400 hover:text-slate-100 bg-slate-900/60 border border-yellow-500/10'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* View Switcher: Kanban vs Gantt */}
              <div className="flex items-center bg-slate-900/90 p-1.5 rounded-xl border border-yellow-500/20 text-xs">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-4 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'kanban' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Kanban
                </button>
                <button
                  onClick={() => setViewMode('gantt')}
                  className={`px-4 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'gantt' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400'
                  }`}
                >
                  <CalendarRange className="w-3.5 h-3.5" /> Gantt
                </button>
              </div>

              {user?.role === 'client' && (
                <button onClick={() => setShowNewProjectModal(true)} className="btn-primary text-xs py-2.5 shrink-0">
                  <Plus className="w-4 h-4" />
                  {t('nav.newProject')}
                </button>
              )}
            </div>
          </div>

          {/* Kanban Board or Gantt View */}
          {loading ? (
            <div className="glass-panel p-20 text-center text-slate-400 text-sm">
              Cargando proyectos de la base de datos...
            </div>
          ) : selectedProject ? (
            viewMode === 'kanban' ? (
              <KanbanBoard
                project={selectedProject}
                onRefresh={fetchProjects}
                onOpenContract={(pId, pTitle) => setActiveContract({ projectId: pId, projectTitle: pTitle })}
                onOpenCheckout={(ms) => setActiveCheckout(ms)}
              />
            ) : (
              <GanttView project={selectedProject} />
            )
          ) : (
            <div className="glass-panel p-20 text-center text-slate-400 text-sm space-y-4">
              <p>No tienes proyectos registrados aún.</p>
              {user?.role === 'client' && (
                <button onClick={() => setShowNewProjectModal(true)} className="btn-primary text-xs mx-auto">
                  Crear tu Primer Proyecto
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Real-time Currency Converter & Security Card */}
        <div className="space-y-6">
          <CurrencyConverterWidget />

          {/* Enterprise Security Status Widget */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-luxury">
              <ShieldCheck className="w-5 h-5" /> Seguridad Pro Verified
            </div>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between items-center bg-slate-900/80 p-3 rounded-xl border border-yellow-500/10">
                <span>Canal Encriptado</span>
                <span className="text-emerald-400 font-bold font-mono">TLS 1.3 🔒</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/80 p-3 rounded-xl border border-yellow-500/10">
                <span>Firma Digital PDF</span>
                <span className="text-amber-400 font-bold font-mono">SHA-256</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/80 p-3 rounded-xl border border-yellow-500/10">
                <span>Rate Limiter</span>
                <span className="text-purple-400 font-bold font-mono">ACTIVO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeContract && (
        <ContractModal
          projectId={activeContract.projectId}
          projectTitle={activeContract.projectTitle}
          onClose={() => setActiveContract(null)}
        />
      )}

      {activeCheckout && (
        <CheckoutModal
          milestoneId={activeCheckout.id}
          milestoneTitle={activeCheckout.title}
          amount={activeCheckout.amount}
          currency={activeCheckout.currency}
          onSuccess={() => {
            setActiveCheckout(null);
            fetchProjects();
          }}
          onClose={() => setActiveCheckout(null)}
        />
      )}

      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onCreated={() => {
            setShowNewProjectModal(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
};
