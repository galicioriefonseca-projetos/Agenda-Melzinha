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
import {
  testFirestoreConnection,
  subscribeToParties,
  savePartyToFirestore,
  deletePartyFromFirestore,
  subscribeToStaff,
  saveStaffToFirestore,
  deleteStaffFromFirestore,
  subscribeToClients,
  saveClientToFirestore,
  deleteClientFromFirestore,
  subscribeToAuditLogs,
  saveAuditLogToFirestore,
  subscribeToNotifications,
  saveNotificationToFirestore,
  markNotificationAsReadInFirestore,
  subscribeToSupportTickets,
  saveSupportTicketToFirestore,
  updateSupportTicketInFirestore,
  subscribeToUsers,
  saveUserToFirestore,
  logoutFirebase
} from './lib/firebase';

const ROLE_ALLOWED_TABS: Record<UserRole, TabType[]> = {
  admin: ['agenda', 'escalas', 'clientes', 'financeiro', 'seguranca', 'suporte'],
  coordenador: ['agenda', 'escalas', 'clientes', 'suporte'],
  recreador: ['agenda', 'suporte'],
  atendimento: ['agenda', 'clientes', 'suporte'],
};

// Helper to filter out any mock/fictitious items from local storage to ensure clean production
function loadCleanData<T extends { id?: string }>(key: string): T[] {
  const saved = localStorage.getItem(key);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      // Discard legacy mock entries (pty-1..5, rec-1..5, cli-1..3, tkt-1..2, log-1..4)
      return parsed.filter((item: any) => {
        if (!item || !item.id) return false;
        if (/^(pty-[1-5]|rec-[1-5]|cli-[1-3]|tkt-[1-2]|log-[1-4])$/.test(item.id)) {
          return false;
        }
        return true;
      });
    }
    return [];
  } catch {
    return [];
  }
}

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

  // Persistence in localStorage - Starts completely clean without fictitious data
  const [parties, setParties] = useState<Party[]>(() => loadCleanData<Party>('melzinha_parties'));
  const [staffList, setStaffList] = useState<Recreador[]>(() => loadCleanData<Recreador>('melzinha_staff'));
  const [clients, setClients] = useState<Client[]>(() => loadCleanData<Client>('melzinha_clients'));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const cleaned = loadCleanData<AuditLog>('melzinha_audit_logs');
    if (cleaned.length === 0) {
      return [{
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Sistema Melzinha & Cia',
        role: 'admin',
        action: 'Inicialização de Produção',
        details: 'Ambiente pronto para uso em produção, sem dados fictícios.',
        ip: '187.54.12.89',
        category: 'sistema',
      }];
    }
    return cleaned;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadCleanData<NotificationItem>('melzinha_notifications'));
  const [tickets, setTickets] = useState<SupportTicket[]>(() => loadCleanData<SupportTicket>('melzinha_tickets'));

  const [twoFactorActive, setTwoFactorActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('melzinha_2fa');
    return saved ? JSON.parse(saved) : true;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<TabType>('agenda');

  // Guard active tab based on role permissions
  useEffect(() => {
    const allowed = ROLE_ALLOWED_TABS[currentRole] || ['agenda'];
    if (!allowed.includes(activeTab)) {
      setActiveTab('agenda');
    }
  }, [currentRole, activeTab]);

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

  // Real-time synchronization with Firebase Firestore
  useEffect(() => {
    testFirestoreConnection();

    const unsubParties = subscribeToParties((cloudParties) => {
      if (cloudParties) {
        setParties(cloudParties);
      }
    });

    const unsubStaff = subscribeToStaff((cloudStaff) => {
      if (cloudStaff) {
        setStaffList(cloudStaff);
      }
    });

    const unsubClients = subscribeToClients((cloudClients) => {
      if (cloudClients) {
        setClients(cloudClients);
      }
    });

    const unsubLogs = subscribeToAuditLogs((cloudLogs) => {
      if (cloudLogs && cloudLogs.length > 0) {
        setAuditLogs(cloudLogs);
      }
    });

    const unsubNotifs = subscribeToNotifications((cloudNotifs) => {
      if (cloudNotifs) {
        setNotifications(cloudNotifs);
      }
    });

    const unsubTickets = subscribeToSupportTickets((cloudTickets) => {
      if (cloudTickets) {
        setTickets(cloudTickets);
      }
    });

    const unsubUsers = subscribeToUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setRegisteredUsers(cloudUsers);
      }
    });

    return () => {
      unsubParties();
      unsubStaff();
      unsubClients();
      unsubLogs();
      unsubNotifs();
      unsubTickets();
      unsubUsers();
    };
  }, []);

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
    saveAuditLogToFirestore(newLog).catch(err => console.warn('Erro ao salvar log no Firestore:', err));
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

    saveUserToFirestore(user).catch(err => console.warn('Erro ao salvar usuário no Firestore:', err));

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
    logoutFirebase().catch(err => console.warn('Logout Firebase:', err));
    setCurrentUser(null);
  };

  // Party handlers
  const handleSaveParty = (
    partyData: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    if (id) {
      const updatedParty: Party = {
        ...partyData,
        id,
        createdAt: parties.find(p => p.id === id)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setParties((prev) =>
        prev.map((p) => (p.id === id ? updatedParty : p))
      );
      savePartyToFirestore(updatedParty).catch(err => console.warn('Erro ao salvar festa no Firestore:', err));
      logAction('Edição de Festa', `Festa ${partyData.code} (${partyData.childName}) atualizada.`, 'agendamento');
    } else {
      const newParty: Party = {
        ...partyData,
        id: `pty-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setParties((prev) => [newParty, ...prev]);
      savePartyToFirestore(newParty).catch(err => console.warn('Erro ao salvar nova festa no Firestore:', err));
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
      saveNotificationToFirestore(newNotif).catch(err => console.warn('Erro ao salvar notificação no Firestore:', err));
    }
  };

  const handleToggleChecklistItem = (partyId: string, itemId: string) => {
    setParties((prev) =>
      prev.map((p) => {
        if (p.id !== partyId) return p;
        const updated = {
          ...p,
          checklist: p.checklist.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item
          ),
        };
        savePartyToFirestore(updated).catch(err => console.warn('Erro ao atualizar checklist:', err));
        return updated;
      })
    );
  };

  const handleToggleRecreadorConfirmation = (partyId: string, recreadorId: string) => {
    setParties((prev) =>
      prev.map((p) => {
        if (p.id !== partyId) return p;
        const updated = {
          ...p,
          recreadoresAssigned: p.recreadoresAssigned.map((a) =>
            a.recreadorId === recreadorId ? { ...a, confirmed: !a.confirmed } : a
          ),
        };
        savePartyToFirestore(updated).catch(err => console.warn('Erro ao atualizar confirmação:', err));
        return updated;
      })
    );
    logAction('Confirmação de Presença', `Status de presença alternado na festa para recreador.`, 'escala');
  };

  // Recreador handlers
  const handleSaveRecreador = (data: Omit<Recreador, 'id'>, id?: string) => {
    if (id) {
      const updatedStaff: Recreador = { ...data, id };
      setStaffList((prev) => prev.map((s) => (s.id === id ? updatedStaff : s)));
      saveStaffToFirestore(updatedStaff).catch(err => console.warn('Erro ao atualizar recreador no Firestore:', err));
      logAction('Edição de Recreador', `Dados de ${data.artisticName} atualizados.`, 'escala');
    } else {
      const newStaff: Recreador = { ...data, id: `rec-${Date.now()}` };
      setStaffList((prev) => [...prev, newStaff]);
      saveStaffToFirestore(newStaff).catch(err => console.warn('Erro ao salvar recreador no Firestore:', err));
      logAction('Novo Recreador', `Recreador ${data.artisticName} (${data.name}) cadastrado no quadro.`, 'escala');
    }
  };

  // Client handlers
  const handleSaveClient = (data: Omit<Client, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      const existingClient = clients.find(c => c.id === id);
      const updatedClient: Client = {
        ...data,
        id,
        createdAt: existingClient?.createdAt || new Date().toISOString(),
      };
      setClients((prev) => prev.map((c) => (c.id === id ? updatedClient : c)));
      saveClientToFirestore(updatedClient).catch(err => console.warn('Erro ao atualizar cliente no Firestore:', err));
      logAction('Edição de Cliente', `Cadastro de ${data.name} atualizado.`, 'agendamento');
    } else {
      const newClient: Client = {
        ...data,
        id: `cli-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setClients((prev) => [...prev, newClient]);
      saveClientToFirestore(newClient).catch(err => console.warn('Erro ao salvar cliente no Firestore:', err));
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
    saveSupportTicketToFirestore(newTicket).catch(err => console.warn('Erro ao salvar chamado no Firestore:', err));
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
    updateSupportTicketInFirestore(ticketId, { status: 'resolvido', resolutionNotes: notes }).catch(err => console.warn('Erro ao resolver chamado no Firestore:', err));
    logAction('Chamado Solucionado', `Chamado ${ticketId} marcado como resolvido.`, 'sistema');
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    markNotificationAsReadInFirestore(id).catch(err => console.warn('Erro ao atualizar notificação:', err));
  };

  const handleDeleteParty = (partyId: string) => {
    setParties((prev) => prev.filter((p) => p.id !== partyId));
    deletePartyFromFirestore(partyId).catch(err => console.warn('Erro ao excluir festa do Firestore:', err));
    logAction('Exclusão de Festa', `Festa ID ${partyId} foi excluída pelo Administrador.`, 'agendamento');
  };

  const handleClearMockData = () => {
    localStorage.removeItem('melzinha_parties');
    localStorage.removeItem('melzinha_staff');
    localStorage.removeItem('melzinha_clients');
    localStorage.removeItem('melzinha_notifications');
    localStorage.removeItem('melzinha_tickets');
    setParties([]);
    setStaffList([]);
    setClients([]);
    setNotifications([]);
    setTickets([]);
    logAction('Sanitização de Produção', 'Todos os dados de teste foram limpos com sucesso.', 'sistema');
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
        currentRole={currentRole}
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
            onToggleRecreadorConfirmation={handleToggleRecreadorConfirmation}
            onDeleteParty={handleDeleteParty}
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
            onClearMockData={handleClearMockData}
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
