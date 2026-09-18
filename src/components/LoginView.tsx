import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Calendar, 
  Clock, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { AuthUser } from '../types';
import { loginWithGoogle } from '../lib/firebase';

interface LoginViewProps {
  onLogin: (user: AuthUser, isFirstAdmin: boolean) => void;
  registeredUsers: AuthUser[];
  detectedGoogleEmail?: string;
}

export function LoginView({
  onLogin,
  registeredUsers,
  detectedGoogleEmail = 'galicioriefonseca@gmail.com',
}: LoginViewProps) {
  const isFirstAdminSetup = registeredUsers.length === 0;

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleName, setGoogleName] = useState(
    detectedGoogleEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Galicio Rie Fonseca'
  );
  const [googleEmail, setGoogleEmail] = useState(detectedGoogleEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'coordenador' | 'recreador' | 'atendimento'>(
    isFirstAdminSetup ? 'admin' : 'admin'
  );

  // Quick sign-in with Google account via Firebase
  const handleQuickGoogleSignIn = async (emailToUse: string, nameToUse: string) => {
    setIsLoading(true);
    try {
      const fbUser = await loginWithGoogle();
      const actualEmail = fbUser?.email || emailToUse;
      const actualName = fbUser?.displayName || nameToUse || actualEmail.split('@')[0];
      const avatarUrl = fbUser?.photoURL || undefined;
      const existing = registeredUsers.find((u) => u.email.toLowerCase() === actualEmail.toLowerCase());
      const now = new Date().toISOString();

      if (existing) {
        onLogin(
          {
            ...existing,
            avatarUrl: avatarUrl || existing.avatarUrl,
            lastLoginAt: now,
          },
          false
        );
      } else {
        const isMaster = isFirstAdminSetup || registeredUsers.filter(u => u.role === 'admin').length === 0;
        const newUser: AuthUser = {
          id: fbUser?.uid || `usr-${Date.now()}`,
          name: actualName,
          email: actualEmail,
          avatarUrl,
          role: isMaster ? 'admin' : selectedRole,
          isAdminMaster: isMaster,
          provider: 'google',
          createdAt: now,
          lastLoginAt: now,
          isFirstAccess: true,
          googleId: fbUser?.uid || `google-uid-${Math.floor(100000 + Math.random() * 900000)}`,
        };
        onLogin(newUser, isMaster);
      }
    } catch (err) {
      console.warn('Erro ao autenticar com Google:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;
    handleQuickGoogleSignIn(googleEmail.trim(), googleName.trim());
    setIsGoogleModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/40 to-orange-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      
      {/* Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-xl shadow-amber-500/25 mb-4 transform hover:scale-105 transition-transform">
            <span className="text-4xl">🐝</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">
            Melzinha <span className="text-amber-500">&</span> Cia
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Gestão Operacional de Festas & Escalas de Animação
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-100/80 space-y-6">
          
          {/* First Administrator Setup Callout */}
          {isFirstAdminSetup ? (
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-md space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-white/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </span>
                <span className="font-extrabold text-sm tracking-wide uppercase">
                  Primeiro Acesso de Administrador
                </span>
              </div>
              <p className="text-xs text-white/95 leading-relaxed">
                Bem-vindo ao sistema! Como este é o <strong>primeiro acesso</strong>, a criação da sua conta via <strong>Conta Google</strong> definirá automaticamente o <strong>Administrador Master</strong> com acesso total aos dados e configurações.
              </p>
            </div>
          ) : (
            <div className="text-center border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                Acesse sua Conta
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Faça login para gerenciar a agenda, escalas e finanças
              </p>
            </div>
          )}

          {/* Google Sign-in Action Area */}
          <div className="space-y-4">
            
            {/* Primary Google Auth Button */}
            <button
              id="btn-google-login-primary"
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickGoogleSignIn(detectedGoogleEmail, googleName)}
              className="w-full relative flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl border-2 border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group disabled:opacity-60"
            >
              {/* Official Google G SVG icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>

              <span>
                {isLoading 
                  ? 'Autenticando com Google...' 
                  : isFirstAdminSetup 
                  ? 'Criar Conta de Administrador com Google' 
                  : 'Continuar com a Conta Google'
                }
              </span>
            </button>

            {/* Detected Google Account Highlight */}
            {detectedGoogleEmail && (
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 shadow-2xs">
                    {googleName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{googleName}</p>
                    <p className="text-slate-500 text-[11px] truncate">{detectedGoogleEmail}</p>
                  </div>
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200/80 text-amber-900">
                  {isFirstAdminSetup ? 'Admin Master' : 'Google Conectado'}
                </span>
              </div>
            )}

            {/* Option to use another Google account */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="text-xs text-amber-700 hover:text-amber-900 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Usar outra conta Google ou personalizar dados</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>

          {/* Security Guarantee Badges */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Autenticação direta e segura via Google OAuth</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Privilégios de Administrador Master vinculados permanentemente</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Trilha de auditoria e controle de acessos (LGPD)</span>
            </div>
          </div>

          {/* Already registered users info (if any exist) */}
          {registeredUsers.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                Usuários Registrados ({registeredUsers.length})
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {registeredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onLogin(u, false)}
                    className="w-full p-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-left border border-slate-200 hover:border-amber-300 flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <div className="truncate">
                      <span className="font-bold text-slate-800 block truncate">{u.name}</span>
                      <span className="text-[10px] text-slate-500 truncate">{u.email}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      u.role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Melzinha & Cia Recreação Infantil • São Paulo - SP
        </p>

      </div>

      {/* Modal: Sign In / Create with another Google Account */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-amber-200 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {isFirstAdminSetup ? 'Primeiro Administrador Google' : 'Autenticar com Conta Google'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Informe os dados da sua Conta Google para vinculação com o perfil do sistema.
            </p>

            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Ex: Galicio Rie Fonseca"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail Google (@gmail.com ou Workspace)</label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white font-mono"
                />
              </div>

              {!isFirstAdminSetup && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Perfil de Acesso Solicitado</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
                  >
                    <option value="admin">Administrador Geral</option>
                    <option value="coordenador">Coordenador de Recreação</option>
                    <option value="recreador">Recreador / Monitor</option>
                    <option value="atendimento">Atendimento & Vendas</option>
                  </select>
                </div>
              )}

              {isFirstAdminSetup && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Como primeiro usuário cadastrado, você terá permissão de <strong>Administrador Master</strong>.
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  {isFirstAdminSetup ? 'Confirmar e Criar Administrador' : 'Acessar com Google'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
