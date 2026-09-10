import React, { useState } from 'react';
import { ShieldCheck, Smartphone, Key, CheckCircle2, QrCode, Copy, Check } from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  twoFactorActive: boolean;
  onToggle: () => void;
}

export function TwoFactorModal({ isOpen, onClose, twoFactorActive, onToggle }: TwoFactorModalProps) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const secretKey = 'MELZ-INHA-2026-AUTH-SEC';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      if (!twoFactorActive) {
        onToggle();
      }
      setStatusMsg('Código verificado! 2FA ativo para sua conta.');
      setTimeout(() => {
        setStatusMsg(null);
        onClose();
      }, 1500);
    } else {
      setStatusMsg('Insira o código de 6 dígitos.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-amber-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Autenticação de Dois Fatores (2FA)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-700 hover:text-slate-900 font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Proteja as escalas e finanças da Melzinha & Cia com autenticação em duas etapas via aplicativo autenticador (Google Authenticator, Microsoft Authenticator ou Authy).
          </p>

          {/* QR Code Demo Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl border border-slate-300 flex items-center justify-center shadow-2xs">
              <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-slate-900 rounded">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i % 2 === 0 && i % 3 === 0) || i < 6 || i > 30 ? 'bg-white' : 'bg-slate-900'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-700 font-medium">
              Chave manual para o app autenticador:
            </p>

            <div className="flex items-center justify-center gap-2 font-mono text-[11px] font-bold text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200">
              <span>{secretKey}</span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="text-slate-700 hover:text-slate-900"
                title="Copiar Chave"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Verification input */}
          <form onSubmit={handleVerify} className="space-y-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Digite o código de 6 dígitos gerado:
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-widest font-mono text-lg font-bold p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {statusMsg && (
              <p className="text-center font-bold text-emerald-700">{statusMsg}</p>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onToggle();
                  onClose();
                }}
                className="text-xs font-bold text-slate-700 hover:text-slate-900"
              >
                {twoFactorActive ? 'Desativar 2FA' : 'Ativar sem código'}
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Confirmar e Ativar
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
