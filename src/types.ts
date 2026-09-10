export type PartyStatus = 'confirmada' | 'em_negociacao' | 'concluida' | 'cancelada';

export type UserRole = 'admin' | 'coordenador' | 'recreador' | 'atendimento';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isAdminMaster?: boolean;
  avatarUrl?: string;
  provider: 'google';
  createdAt: string;
  lastLoginAt: string;
  isFirstAccess?: boolean;
  googleId?: string;
}

export interface AssignedRecreador {
  recreadorId: string;
  role: string; // e.g. "Recreador Principal", "Pintura Facial", "Mágico", "Apoio"
  fee: number;
  confirmed: boolean;
}

export interface PartyChecklistItem {
  id: string;
  item: string;
  done: boolean;
}

export interface Party {
  id: string;
  code: string; // e.g. "MEL-2026-081"
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  childName: string;
  childAge: number;
  theme: string;
  packageType: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  locationName?: string;
  locationAddress: string;
  locationNeighborhood: string;
  locationCity: string;
  guestCount: number;
  status: PartyStatus;
  totalPrice: number;
  depositPaid: number;
  remainingBalance: number;
  notes?: string;
  recreadoresAssigned: AssignedRecreador[];
  checklist: PartyChecklistItem[];
  googleCalendarSynced: boolean;
  googleCalendarEventUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recreador {
  id: string;
  name: string;
  artisticName: string; // "Tia Melzinha", "Tio Pipoca"
  phone: string;
  email: string;
  specialties: string[]; // "Pintura Facial", "Escultura de Balões", "Mágica", "Baladinha", "Recreação Aquática"
  baseFee: number;
  active: boolean;
  rating: number; // 4.9
  avatarBg: string;
  totalPartiesCount: number;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  childName: string;
  childBirthDate?: string;
  address: string;
  city: string;
  totalSpent: number;
  partyHistoryIds: string[];
  notes?: string;
  tags: string[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
  ip: string;
  category: 'agendamento' | 'escala' | 'financeiro' | 'segurança' | 'exportação' | 'sistema';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'party_alert' | 'staff_alert' | 'payment_alert' | 'security_alert';
  partyId?: string;
}

export interface SupportTicket {
  id: string;
  createdAt: string;
  title: string;
  priority: 'urgente' | 'alta' | 'media';
  status: 'aberto' | 'em_atendimento' | 'resolvido';
  requesterName: string;
  requesterRole: string;
  phone: string;
  partyCode?: string;
  description: string;
  category: 'substituicao_urgente' | 'endereco_localizacao' | 'atraso_transito' | 'material_brinquedo' | 'outro';
  resolutionNotes?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalReceived: number;
  totalPending: number;
  totalStaffFees: number;
  netProfit: number;
  partiesCount: number;
  averageTicket: number;
}
