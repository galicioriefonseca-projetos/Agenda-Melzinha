import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Party, 
  Recreador, 
  Client, 
  AuditLog, 
  NotificationItem, 
  SupportTicket, 
  UserRole,
  AuthUser 
} from './types';
import { 
  INITIAL_PARTIES, 
  INITIAL_RECREADORES, 
  INITIAL_CLIENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SUPPORT_TICKETS 
} from './data/mockData';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { CalendarView } from './components/CalendarView';
import { EscalaView } from './components/EscalaView';
import { ClientsView } from './components/ClientsView';
import { FinancialView } from './components/FinancialView';
import { SecurityView } from './components/SecurityView';
import { SupportView } from './components/SupportView';
import { PartyModal } from './components/PartyModal';
import { PrintablePartySheet } from './components/PrintablePartySheet';
import { RecreadorModal } from './components/RecreadorModal';
import { ClientModal } from './components/ClientModal';
import { TwoFactorModal } from './components/TwoFactorModal';
import { LoginView } from './components/LoginView';

export default function App() {
  // Authentication & Users State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('melzinha_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredUsers, setRegisteredUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem('melzinha_users_db');
    return saved ? JSON.parse(saved) : [];
  });

  const [welcomeBannerDismissed, setWelcomeBannerDismissed] = useState(false);

  // Persistence in localStorage
  const [parties, setParties] = useState<Party[]>(() => {
    const saved = localStorage.getItem('melzinha_parties');
    return saved ? JSON.parse(saved) : INITIAL_PARTIES;
  });

  const [staffList, setStaffList] = useState<Recreador[]>(() => {
    const saved = localStorage.getItem('melzinha_staff');
    return saved ? JSON.parse(saved) : INITIAL_RECREADORES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('melzinha_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('melzinha_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('melzinha_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('melzinha_tickets');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  const [twoFactorActive, setTwoFactorActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('melzinha_2fa');
    return saved ? JSON.parse(saved) : true;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<TabType>('agenda');

  // Modals state
  const [partyModalOpen, setPartyModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [defaultClientForParty, setDefaultClientForParty] = useState<{
    name: string;
    phone: string;
    email: string;
    childName: string;
    address: string;
  } | null>(null);

  const [printParty, setPrintParty] = useState<Party | null>(null);
  const [recreadorModalOpen, setRecreadorModalOpen] = useState(false);
  const [editingRecreador, setEditingRecreador] = useState<Recreador | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('melzinha_parties', JSON.stringify(parties));
  }, [parties]);

  useEffect(() => {
    localStorage.setItem('melzinha_staff', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('melzinha_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('melzinha_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('melzinha_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('melzinha_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('melzinha_2fa', JSON.stringify(twoFactorActive));
  }, [twoFactorActive]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('melzinha_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('melzinha_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('melzinha_users_db', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Helper to add audit log
  const logAction = (
    action: string,
    details: string,
    category: AuditLog['category'] = 'sistema'
  ) => {
    const userName = currentUser ? `${currentUser.name} (${currentUser.role.toUpperCase()})` : (currentRole === 'admin' ? 'Administrador Master' : `${currentRole.toUpperCase()}`);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: userName,
      role: currentRole,
      action,
      details,
      ip: '187.54.12.89',
      category,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleLogin = (user: AuthUser, isFirstAdmin: boolean) => {
    setCurrentUser(user);
    setCurrentRole(user.role);

    setRegisteredUsers((prev) => {
      const exists = prev.some((u) => u.email.toLowerCase() === user.email.toLowerCase());
      if (exists) {
        return prev.map((u) => u.email.toLowerCase() === user.email.toLowerCase() ? user : u);
      }
      return [...prev, user];
    });

    if (isFirstAdmin) {
      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 },
      });
      logAction(
        'Criação de Conta Google / Primeiro Acesso Master',
        `Primeiro Administrador Master registrado com sucesso via Conta Google: ${user.name} (${user.email})`,
        'segurança'
      );
    } else {
      logAction(
        'Login via Conta Google',
        `Autenticação efetuada com sucesso: ${user.name} (${user.email})`,
        'segurança'
      );
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      logAction(
        'Encerramento de Sessão (Logout)',
        `Sessão encerrada por ${currentUser.name} (${currentUser.email})`,
        'segurança'
      );
    }
    setCurrentUser(null);
  };

  // Party handlers
  const handleSaveParty = (
    partyData: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    if (id) {
      setParties((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...partyData, updatedAt: new Date().toISOString() }
            : p
        )
      );
      logAction('Edição de Festa', `Festa ${partyData.code} (${partyData.childName}) atualizada.`, 'agendamento');
    } else {
      const newParty: Party = {
        ...partyData,
        id: `pty-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setParties((prev) => [newParty, ...prev]);
      logAction('Nova Festa Agendada', `Festa ${partyData.code} criada para ${partyData.childName} (${partyData.theme}).`, 'agendamento');

      // Add celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#06b6d4', '#10b981'],
      });

      // Notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Nova Festa: ${partyData.childName} (${partyData.childAge} anos)`,
        message: `Festa agendada para ${partyData.date.split('-').reverse().join('/')} às ${partyData.startTime}. Tema: ${partyData.theme}.`,
        timestamp: 'Agora mesmo',
        read: false,
        type: 'party_alert',
        partyId: newParty.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const handleToggleChecklistItem = (partyId: string, itemId: string) => {
    setParties((prev) =>
      prev.map((p) => {
        if (p.id !== partyId) return p;
        return {
          ...p,
          checklist: p.checklist.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item
          ),
        };
      })
    );
  };

  const handleToggleRecreadorConfirmation = (partyId: string, recreadorId: string) => {
    setParties((prev) =>
      prev.map((p) => {
        if (p.id !== partyId) return p;
        return {
          ...p,
          recreadoresAssigned: p.recreadoresAssigned.map((a) =>
            a.recreadorId === recreadorId ? { ...a, confirmed: !a.confirmed } : a
          ),
        };
      })
    );
    logAction('Confirmação de Presença', `Status de presença alternado na festa para recreador.`, 'escala');
  };

  // Recreador handlers
  const handleSaveRecreador = (data: Omit<Recreador, 'id'>, id?: string) => {
    if (id) {
      setStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
      logAction('Edição de Recreador', `Dados de ${data.artisticName} atualizados.`, 'escala');
    } else {
      const newStaff: Recreador = { ...data, id: `rec-${Date.now()}` };
      setStaffList((prev) => [...prev, newStaff]);
      logAction('Novo Recreador', `Recreador ${data.artisticName} (${data.name}) cadastrado no quadro.`, 'escala');
    }
  };

  // Client handlers
  const handleSaveClient = (data: Omit<Client, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
      logAction('Edição de Cliente', `Cadastro de ${data.name} atualizado.`, 'agendamento');
    } else {
      const newClient: Client = {
        ...data,
        id: `cli-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setClients((prev) => [...prev, newClient]);
      logAction('Novo Cliente', `Cliente ${data.name} (Aniversariante: ${data.childName}) cadastrado.`, 'agendamento');
    }
  };

  const handleOpenNewPartyForClient = (client: Client) => {
    setDefaultClientForParty({
      name: client.name,
      phone: client.phone,
      email: client.email,
      childName: client.childName,
      address: client.address,
    });
    setEditingParty(null);
    setPartyModalOpen(true);
  };

  // Support handlers
  const handleAddTicket = (ticketData: Omit<SupportTicket, 'id' | 'createdAt'>) => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) => [newTicket, ...prev]);
    logAction('Abertura de Chamado Plantão', `Chamado aberto: ${ticketData.title} (${ticketData.priority}).`, 'sistema');
  };

  const handleResolveTicket = (ticketId: string, notes: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'resolvido', resolutionNotes: notes }
          : t
      )
    );
    logAction('Chamado Solucionado', `Chamado ${ticketId} marcado como resolvido.`, 'sistema');
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unassignedPartiesCount = parties.filter(
    (p) => p.status !== 'cancelada' && p.recreadoresAssigned.length === 0
  ).length;

  // Render Login view if user is not authenticated
  if (!currentUser) {
    return (
      <LoginView
        onLogin={handleLogin}
        registeredUsers={registeredUsers}
        detectedGoogleEmail="galicioriefonseca@gmail.com"
      />
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30 text-slate-800 flex flex-col font-sans">
      
      {/* Master Admin First-Access Banner */}
      {currentUser.isAdminMaster && !welcomeBannerDismissed && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 px-4 py-2.5 shadow-md flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <span className="p-1 bg-white/30 rounded-lg text-base">👑</span>
            <div className="text-xs">
              <span className="font-extrabold block">
                Boas-vindas, {currentUser.name}! Administrador Master Ativo
              </span>
              <span className="text-slate-800 font-medium text-[11px]">
                Conta Google: <strong>{currentUser.email}</strong> • Posse do sistema configurada com sucesso no primeiro acesso.
              </span>
            </div>
          </div>
          <button
            onClick={() => setWelcomeBannerDismissed(true)}
            className="px-2.5 py-1 bg-white/70 hover:bg-white text-[11px] font-bold rounded-lg text-slate-900 transition-colors cursor-pointer"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        twoFactorActive={twoFactorActive}
        onOpenTwoFactor={() => setTwoFactorModalOpen(true)}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onNewPartyClick={() => {
          setEditingParty(null);
          setDefaultClientForParty(null);
          setPartyModalOpen(true);
        }}
        onOpenSupport={() => setActiveTab('suporte')}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        partiesCount={parties.length}
        unassignedPartiesCount={unassignedPartiesCount}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'agenda' && (
          <CalendarView
            parties={parties}
            staffList={staffList}
            onOpenPartyModal={(party) => {
              setEditingParty(party || null);
              setDefaultClientForParty(null);
              setPartyModalOpen(true);
            }}
            onSelectPartyForPrint={(party) => setPrintParty(party)}
            onToggleChecklistItem={handleToggleChecklistItem}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'escalas' && (
          <EscalaView
            staffList={staffList}
            parties={parties}
            onOpenRecreadorModal={(rec) => {
              setEditingRecreador(rec || null);
              setRecreadorModalOpen(true);
            }}
            onOpenPartyModal={(party) => {
              setEditingParty(party);
              setPartyModalOpen(true);
            }}
            onToggleRecreadorConfirmation={handleToggleRecreadorConfirmation}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'clientes' && (
          <ClientsView
            clients={clients}
            parties={parties}
            onOpenClientModal={(cli) => {
              setEditingClient(cli || null);
              setClientModalOpen(true);
            }}
            onOpenNewPartyForClient={handleOpenNewPartyForClient}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'financeiro' && (
          <FinancialView
            parties={parties}
            staffList={staffList}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'seguranca' && (
          <SecurityView
            twoFactorActive={twoFactorActive}
            onToggleTwoFactor={() => {
              setTwoFactorActive(!twoFactorActive);
              logAction(
                'Alteração 2FA',
                `Autenticação em dois fatores ${!twoFactorActive ? 'ativada' : 'desativada'}.`,
                'segurança'
              );
            }}
            auditLogs={auditLogs}
            currentRole={currentRole}
            setCurrentRole={setCurrentRole}
          />
        )}

        {activeTab === 'suporte' && (
          <SupportView
            tickets={tickets}
            parties={parties}
            onAddTicket={handleAddTicket}
            onResolveTicket={handleResolveTicket}
            currentRole={currentRole}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-amber-100 py-4 text-center text-xs text-slate-700">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">
            🐝 <strong>Melzinha & Cia</strong> • Sistema de Gestão Operacional & Escalas de Animação
          </p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Sincronização em Nuvem Ativa
            </span>
            <span>•</span>
            <span>Plantão 24/7</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {partyModalOpen && (
        <PartyModal
          party={editingParty}
          staffList={staffList}
          isOpen={partyModalOpen}
          onClose={() => {
            setPartyModalOpen(false);
            setEditingParty(null);
            setDefaultClientForParty(null);
          }}
          onSave={handleSaveParty}
          defaultClient={defaultClientForParty}
        />
      )}

      {printParty && (
        <PrintablePartySheet
          party={printParty}
          staffList={staffList}
          onClose={() => setPrintParty(null)}
        />
      )}

      {recreadorModalOpen && (
        <RecreadorModal
          recreador={editingRecreador}
          isOpen={recreadorModalOpen}
          onClose={() => {
            setRecreadorModalOpen(false);
            setEditingRecreador(null);
          }}
          onSave={handleSaveRecreador}
        />
      )}

      {clientModalOpen && (
        <ClientModal
          client={editingClient}
          isOpen={clientModalOpen}
          onClose={() => {
            setClientModalOpen(false);
            setEditingClient(null);
          }}
          onSave={handleSaveClient}
        />
      )}

      {twoFactorModalOpen && (
        <TwoFactorModal
          isOpen={twoFactorModalOpen}
          onClose={() => setTwoFactorModalOpen(false)}
          twoFactorActive={twoFactorActive}
          onToggle={() => {
            setTwoFactorActive(!twoFactorActive);
            logAction(
              'Alteração 2FA',
              `Autenticação em dois fatores ${!twoFactorActive ? 'ativada' : 'desativada'}.`,
              'segurança'
            );
          }}
        />
      )}

    </div>
  );
}
