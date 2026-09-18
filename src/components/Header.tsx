import { useState } from 'react';
import { 
  Sparkles, 
  CalendarPlus, 
  ShieldCheck, 
  Bell, 
  LifeBuoy, 
  UserCheck, 
  Check, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  LogOut,
  ChevronDown,
  User
} from 'lucide-react';
import { UserRole, NotificationItem, AuthUser } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  twoFactorActive: boolean;
  onOpenTwoFactor: () => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onNewPartyClick: () => void;
  onOpenSupport: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export function Header({
  currentRole,
  setCurrentRole,
  twoFactorActive,
  onOpenTwoFactor,
  notifications,
  onMarkNotificationAsRead,
  onNewPartyClick,
  onOpenSupport,
  currentUser,
  onLogout,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    admin: { label: 'Administrador Geral', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
    coordenador: { label: 'Coordenador de Recreação', badgeClass: 'bg-orange-100 text-orange-800 border-orange-300' },
    recreador: { label: 'Recreador / Animador', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    atendimento: { label: 'Atendimento & Vendas', badgeClass: 'bg-sky-100 text-sky-800 border-sky-300' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/70 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Company Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-500/20 text-white font-extrabold text-xl relative group">
              <span className="transform -rotate-6 transition-transform group-hover:rotate-0">🐝</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
                  Melzinha <span className="text-amber-500">&</span> Cia
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100/90 text-amber-900 border border-amber-200">
                  Agenda Interna
                </span>
              </div>
              <p className="text-xs text-slate-700 hidden sm:block font-medium">
                Animação Infantil • Recreação • Escalas em Tempo Real
              </p>
            </div>
          </div>

          {/* Center/Right Actions & Security Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 2FA Status Pill */}
            <button
              id="btn-two-factor-status"
              onClick={onOpenTwoFactor}
              title="Autenticação de Dois Fatores (2FA)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                twoFactorActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${twoFactorActive ? 'text-emerald-600' : 'text-amber-500'}`} />
              <span className="hidden md:inline">2FA:</span>
              <span className="font-semibold">{twoFactorActive ? 'Ativo' : 'Pendente'}</span>
            </button>

            {/* Role Switcher (Simula diferentes níveis de permissões) */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <UserCheck className="w-3.5 h-3.5 text-slate-700 ml-1.5" />
              <select
                id="select-user-role"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-2 py-0.5"
                title="Alternar Perfil de Acesso (RBAC)"
              >
                <option value="admin">Administrador Master</option>
                <option value="coordenador">Coordenação de Recreação</option>
                <option value="recreador">Recreador(a) de Campo</option>
                <option value="atendimento">Atendimento & Vendas</option>
              </select>
            </div>

            {/* 24/7 Support Hotline Button */}
            <button
              id="btn-header-support"
              onClick={onOpenSupport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors shadow-2xs"
              title="Plantão de Emergência 24 Horas"
            >
              <LifeBuoy className="w-4 h-4 text-rose-600 animate-spin-slow" />
              <span className="hidden sm:inline">Plantão 24h</span>
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                id="btn-notifications-toggle"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notificações e Alertas de Festas"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div 
                  id="notifications-dropdown"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-sm text-slate-800">Alertas & Notificações</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {unreadCount} não lidos
                      </span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-700">
                        Nenhuma notificação no momento.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-3 text-xs transition-colors hover:bg-slate-50/80 cursor-pointer ${
                            !n.read ? 'bg-amber-50/40' : ''
                          }`}
                          onClick={() => onMarkNotificationAsRead(n.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-700 whitespace-nowrap">
                              {n.timestamp}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed">
                            {n.message}
                          </p>
                          {!n.read && (
                            <div className="mt-1.5 flex justify-end">
                              <span className="text-[10px] text-amber-700 font-semibold hover:underline">
                                Marcar como lida
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick New Party Button (if authorized) */}
            {currentRole !== 'recreador' && (
              <button
                id="btn-header-new-party"
                onClick={onNewPartyClick}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <CalendarPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Agendar Festa</span>
              </button>
            )}

            {/* User Profile / Google Account Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  id="btn-user-profile-menu"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all cursor-pointer bg-white"
                  title="Perfil e Conta Google"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-amber-700 font-semibold leading-none">
                      {currentUser.isAdminMaster ? 'Admin Master' : roleLabels[currentRole]?.label || 'Colaborador'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div 
                    id="user-profile-dropdown"
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {/* User header */}
                    <div className="px-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {currentUser.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono truncate">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1 text-slate-600">
                          {/* Google logo */}
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                          </svg>
                          <span>Conta Google</span>
                        </div>
                        <span className="font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          {currentUser.isAdminMaster ? 'Admin Master' : 'Verificado'}
                        </span>
                      </div>
                    </div>

                    {/* Role indicator / switch */}
                    <div className="px-4 py-2 text-xs border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                        Visualizar Sistema Como:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['admin', 'coordenador', 'recreador', 'atendimento'] as UserRole[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setCurrentRole(r);
                              setShowUserMenu(false);
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold text-left transition-colors ${
                              currentRole === r
                                ? 'bg-amber-500 text-white font-bold'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {r === 'admin' ? 'Admin' : r === 'coordenador' ? 'Coord.' : r === 'recreador' ? 'Recreador' : 'Vendas'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-2 pt-2">
                      <button
                        id="btn-logout"
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair da Conta (Logout)</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
