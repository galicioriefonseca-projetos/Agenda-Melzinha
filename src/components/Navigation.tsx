import { 
  Calendar, 
  Users, 
  Contact2, 
  TrendingUp, 
  ShieldCheck, 
  LifeBuoy 
} from 'lucide-react';
import { UserRole } from '../types';

export type TabType = 'agenda' | 'escalas' | 'clientes' | 'financeiro' | 'seguranca' | 'suporte';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  partiesCount: number;
  unassignedPartiesCount: number;
  currentRole: UserRole;
}

const ROLE_ALLOWED_TABS: Record<UserRole, TabType[]> = {
  admin: ['agenda', 'escalas', 'clientes', 'financeiro', 'seguranca', 'suporte'],
  coordenador: ['agenda', 'escalas', 'clientes', 'suporte'],
  recreador: ['agenda', 'suporte'],
  atendimento: ['agenda', 'clientes', 'suporte'],
};

export function Navigation({
  activeTab,
  setActiveTab,
  partiesCount,
  unassignedPartiesCount,
  currentRole,
}: NavigationProps) {
  const allTabs = [
    {
      id: 'agenda' as TabType,
      label: currentRole === 'recreador' ? 'Minhas Festas & Agenda' : 'Agenda de Festas',
      icon: Calendar,
      badge: partiesCount,
    },
    {
      id: 'escalas' as TabType,
      label: 'Escala de Recreadores',
      icon: Users,
      badge: unassignedPartiesCount > 0 ? `${unassignedPartiesCount} pendente` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'clientes' as TabType,
      label: 'Clientes & Histórico',
      icon: Contact2,
    },
    {
      id: 'financeiro' as TabType,
      label: 'Métricas & Financeiro',
      icon: TrendingUp,
    },
    {
      id: 'seguranca' as TabType,
      label: 'Segurança & Auditoria',
      icon: ShieldCheck,
    },
    {
      id: 'suporte' as TabType,
      label: 'Plantão 24h',
      icon: LifeBuoy,
      special: true,
    },
  ];

  const allowedTabs = ROLE_ALLOWED_TABS[currentRole] || ROLE_ALLOWED_TABS.admin;
  const tabs = allTabs.filter((t) => allowedTabs.includes(t.id));

  return (
    <nav className="bg-white border-b border-amber-100 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.special ? 'text-rose-500' : 'text-slate-700'}`} />
                <span>{tab.label}</span>

                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.badgeColor || 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
