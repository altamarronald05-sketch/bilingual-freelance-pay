import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../services/api';
import { X, CreditCard, Coins, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  milestoneId: number;
  milestoneTitle: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  milestoneId,
  milestoneTitle,
  amount,
  currency,
  onSuccess,
  onClose
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [method, setMethod] = useState<'stripe' | 'crypto_usdt' | 'crypto_btc' | 'crypto_eth'>('stripe');
  const [loading, setLoading] = useState(false);
  const [txSuccess, setTxSuccess] = useState<{ tx_hash: string } | null>(null);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payments/checkout', {
        milestone_id: milestoneId,
        payment_method: method,
        amount: amount,
        currency: currency
      });
      setTxSuccess({ tx_hash: res.data.tx_hash });
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Payment failed', err);
    } finally {
      setLoading(false);
    }
  };

  const [web3Connected, setWeb3Connected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectMetaMask = () => {
    setWeb3Connected(true);
    setWalletAddress('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg p-6 relative text-slate-100 animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-cyan-400" />
          {t('checkoutModal.title')}
        </h3>
        <p className="text-xs text-slate-400 mb-6">{milestoneTitle}</p>

        {txSuccess ? (
          <div className="py-8 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-emerald-300">¡Pago Liberado Exitosamente!</h4>
            <p className="text-xs text-slate-400">El hito ha sido marcado como APROBADO / PAGADO.</p>
            <div className="bg-black/60 p-3 rounded-lg text-[11px] font-mono text-cyan-300 border border-cyan-500/30">
              Tx Hash: {txSuccess.tx_hash}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount Summary */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">{t('checkoutModal.amountToPay')}</span>
              <span className="text-2xl font-extrabold text-cyan-400">{formatCurrency(amount)}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">{t('checkoutModal.method')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('stripe')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition text-left text-xs font-semibold ${
                    method === 'stripe' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900/50 border-white/10 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-slate-200">Stripe Elements</p>
                    <span className="text-[10px] text-slate-400">Tarjeta Sandbox</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('crypto_usdt')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition text-left text-xs font-semibold ${
                    method === 'crypto_usdt' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900/50 border-white/10 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Coins className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-slate-200">MetaMask Web3</p>
                    <span className="text-[10px] text-slate-400">USDT / Sepolia</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Card info placeholder for Stripe */}
            {method === 'stripe' ? (
              <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950 p-5 rounded-2xl border border-cyan-500/30 space-y-4 shadow-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300 tracking-wider">STRIPE TEST CARD</span>
                  <span className="text-slate-400 font-mono text-[10px]">VISA</span>
                </div>
                <div className="font-mono text-lg text-slate-100 tracking-widest">
                  4242 •••• •••• 4242
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>TITULAR: ALEX MORGAN</span>
                  <span>EXP: 12/28 | CVC: 123</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/90 p-4 rounded-xl border border-white/10 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">Wallet Web3 Integrada:</span>
                  {!web3Connected ? (
                    <button
                      type="button"
                      onClick={connectMetaMask}
                      className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-3 py-1 rounded-lg border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      🦊 Conectar MetaMask
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> MetaMask Conectado
                    </span>
                  )}
                </div>
                <div className="font-mono text-[11px] text-emerald-400 bg-black/60 p-2.5 rounded-lg border border-emerald-500/30 truncate">
                  {walletAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'}
                </div>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full btn-primary py-3 justify-center text-sm font-bold flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('checkoutModal.processing')}
                </>
              ) : (
                t('checkoutModal.confirmPay')
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
