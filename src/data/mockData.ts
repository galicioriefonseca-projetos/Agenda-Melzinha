import { Party, Recreador, Client, AuditLog, NotificationItem, SupportTicket } from '../types';

/**
 * Dados de Produção - Melzinha & Cia
 * Inicializados vazios para cadastro real de recreadores, festas e clientes.
 */

export const INITIAL_RECREADORES: Recreador[] = [];

export const INITIAL_PARTIES: Party[] = [];

export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: `log-prod-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Sistema Operacional',
    role: 'admin',
    action: 'Inicialização de Produção',
    details: 'Banco de dados pronto para uso operacional sem dados fictícios.',
    ip: '127.0.0.1',
    category: 'sistema',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [];
