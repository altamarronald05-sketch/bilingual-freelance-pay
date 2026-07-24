import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { X, Plus, Trash2, Layers } from 'lucide-react';

interface NewProjectModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onCreated }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [milestones, setMilestones] = useState<{ title: string; description: string; amount: number }[]>([
    { title: 'Fase 1: Diseño de Arquitectura & UI', description: 'Entregable inicial', amount: 300 },
    { title: 'Fase 2: Desarrollo Frontend & Backend API', description: 'Integración completa', amount: 700 }
  ]);

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', description: '', amount: 100 }]);
  };

  const removeMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleMilestoneChange = (idx: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[idx] = { ...updated[idx], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || milestones.length === 0) return;

    try {
      await api.post('/projects', {
        title,
        description,
        freelancer_email: freelancerEmail || null,
        currency,
        milestones: milestones.map((m) => ({
          title: m.title || 'Hito sin título',
          description: m.description,
          amount: Number(m.amount) || 0,
          currency
        }))
      });
      onCreated();
    } catch (err) {
      console.error('Error creating project', err);
    }
  };

  const totalAmount = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl p-6 relative animate-fadeIn text-slate-100 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Layers className="w-6 h-6 text-cyan-400" />
          {t('projectModal.createTitle')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">{t('projectModal.titleLabel')}</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Desarrollo de Plataforma E-Commerce"
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">{t('projectModal.freelancerEmail')}</label>
              <input
                type="email"
                value={freelancerEmail}
                onChange={(e) => setFreelancerEmail(e.target.value)}
                placeholder="freelancer@ejemplo.com"
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Moneda del Proyecto</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-100"
              >
                <option value="USD">USD ($)</option>
                <option value="COP">COP ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">{t('projectModal.descLabel')}</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles y alcances generales del trabajo..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-100"
            />
          </div>

          {/* Milestones list */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                {t('projectModal.milestonesHeader')} ({milestones.length})
              </label>
              <span className="text-xs text-slate-300 font-semibold">
                Total: <span className="text-cyan-300 font-bold">${totalAmount} {currency}</span>
              </span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {milestones.map((ms, idx) => (
                <div key={idx} className="bg-slate-900/90 p-3 rounded-xl border border-white/10 flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    required
                    placeholder="Título del Hito"
                    value={ms.title}
                    onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/10 px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Monto"
                    value={ms.amount}
                    onChange={(e) => handleMilestoneChange(idx, 'amount', e.target.value)}
                    className="w-24 bg-transparent border-b border-white/10 px-2 py-1 text-xs text-right focus:outline-none focus:border-cyan-500 font-bold text-cyan-400"
                  />
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(idx)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addMilestone}
              className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> {t('projectModal.addMilestone')}
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              {t('projectModal.cancel')}
            </button>
            <button type="submit" className="btn-primary text-xs">
              {t('projectModal.saveProject')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
