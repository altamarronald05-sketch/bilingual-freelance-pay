import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { X, FileText, Download, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

interface ContractModalProps {
  projectId: number;
  projectTitle: string;
  onClose: () => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({ projectId, projectTitle, onClose }) => {
  const { t } = useTranslation();
  const [contractInfo, setContractInfo] = useState<{ digital_signature: string; signed_at: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get(`/contracts/project/${projectId}/info`);
        setContractInfo(res.data);
      } catch (err) {
        console.error('Error fetching contract info', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [projectId]);

  const handleDownloadPdf = () => {
    window.open(`http://localhost:8000/api/v1/contracts/project/${projectId}/download`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl p-6 relative animate-fadeIn text-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t('dashboard.contractPdf')}</h3>
            <p className="text-xs text-slate-400">{projectTitle}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Cargando certificado de contrato...</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> Firma Digital Verificada (SHA-256)
                </span>
                <span>{new Date(contractInfo?.signed_at || '').toLocaleDateString()}</span>
              </div>
              <div className="bg-black/60 p-3 rounded-lg font-mono text-xs text-cyan-300 break-all border border-cyan-500/20 flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{contractInfo?.digital_signature}</span>
              </div>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-white/10 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Documento Criptográficamente Sellado</span>
              </div>
              <p>
                Este contrato incluye la definición de hitos, valores acordados en divisas y términos legales simulados de prestación de servicios freelance.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={onClose} className="btn-secondary text-sm">
                Cerrar
              </button>
              <button onClick={handleDownloadPdf} className="btn-primary text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Descargar PDF de Contrato
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
