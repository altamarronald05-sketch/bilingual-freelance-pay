import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api, downloadContractPDF } from '../services/api';
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

  const handleDownloadPdf = async () => {
    try {
      await downloadContractPDF(projectId);
    } catch (error) {
      console.error('Download failed', error);
      alert('Error descargando el contrato. Por favor intente de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl p-6 md:p-8 relative animate-fadeIn text-slate-100 shadow-2xl border border-slate-700/50">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{t('dashboard.contractPdf')}</h3>
            <p className="text-sm text-slate-400 mt-1">{projectTitle}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-slate-400 font-semibold">Generando certificado criptográfico...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> Firma Digital Verificada (SHA-256)
                </span>
                <span className="font-mono bg-slate-800 px-2 py-1 rounded text-[10px]">
                  {new Date(contractInfo?.signed_at || '').toLocaleString()}
                </span>
              </div>
              <div className="bg-black/40 p-3.5 rounded-lg font-mono text-[11px] sm:text-xs text-indigo-300 break-all border border-indigo-500/20 flex items-start gap-3 shadow-inner">
                <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{contractInfo?.digital_signature}</span>
              </div>
            </div>

            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/30 text-sm text-slate-300 space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Documento Criptográficamente Sellado</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Este contrato incluye la definición de hitos, valores acordados en divisas y términos legales simulados de prestación de servicios freelance. Almacenado de forma inmutable.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button onClick={onClose} className="btn-secondary text-sm px-6">
                Cerrar
              </button>
              <button onClick={handleDownloadPdf} className="btn-primary text-sm flex items-center gap-2 px-6">
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
