import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  DollarSign, 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Download,
  CalendarCheck,
  ChevronRight,
  Smile
} from 'lucide-react';
import { Party, Recreador, PartyStatus, UserRole } from '../types';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/googleCalendar';
import { exportPartiesToCsv } from '../utils/exportUtils';

interface CalendarViewProps {
  parties: Party[];
  staffList: Recreador[];
  onOpenPartyModal: (party?: Party) => void;
  onSelectPartyForPrint: (party: Party) => void;
  onToggleChecklistItem: (partyId: string, itemId: string) => void;
  currentRole: UserRole;
}

export function CalendarView({
  parties,
  staffList,
  onOpenPartyModal,
  onSelectPartyForPrint,
  onToggleChecklistItem,
  currentRole,
}: CalendarViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [selectedPartyChecklist, setSelectedPartyChecklist] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter parties based on search and filters
  const filteredParties = useMemo(() => {
    return parties
      .filter((party) => {
        // Status filter
        if (statusFilter !== 'all' && party.status !== statusFilter) {
          return false;
        }

        // Date filter
        if (dateFilter === 'today' && party.date !== todayStr) return false;
        if (dateFilter === 'upcoming' && party.date < todayStr) return false;
        if (dateFilter === 'past' && party.date >= todayStr) return false;

        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchChild = party.childName.toLowerCase().includes(term);
          const matchClient = party.clientName.toLowerCase().includes(term);
          const matchTheme = party.theme.toLowerCase().includes(term);
          const matchCode = party.code.toLowerCase().includes(term);
          const matchNeighborhood = party.locationNeighborhood.toLowerCase().includes(term);
          return matchChild || matchClient || matchTheme || matchCode || matchNeighborhood;
        }

        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [parties, statusFilter, dateFilter, searchTerm, todayStr]);

  // Quick stats
  const stats = useMemo(() => {
    const totalCount = parties.length;
    const confirmedCount = parties.filter((p) => p.status === 'confirmada').length;
    const pendingCount = parties.filter((p) => p.status === 'em_negociacao').length;
    const totalVolume = parties.reduce((sum, p) => sum + p.totalPrice, 0);
    const totalPendingBalance = parties.reduce((sum, p) => sum + p.remainingBalance, 0);
    return { totalCount, confirmedCount, pendingCount, totalVolume, totalPendingBalance };
  }, [parties]);

  const statusBadges: Record<PartyStatus, { label: string; bg: string; text: string; border: string }> = {
    confirmada: { label: 'Confirmada', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    em_negociacao: { label: 'Em Negociação', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    concluida: { label: 'Concluída', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    cancelada: { label: 'Cancelada', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  };

  const openWhatsApp = (phone: string, party: Party) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá ${party.clientName}! Aqui é da equipe Melzinha & Cia ✨ Estamos passando para confirmar os detalhes da festa do(a) ${party.childName} no dia ${party.date.split('-').reverse().join('/')} às ${party.startTime}. Tudo pronto para muita alegria!`
    );
    window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-700">Total de Festas</p>
            <p className="text-xl font-extrabold text-slate-900">{stats.totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-700">Confirmadas</p>
            <p className="text-xl font-extrabold text-slate-900">{stats.confirmedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-700">Faturamento Agendado</p>
            <p className="text-xl font-extrabold text-slate-900">
              R$ {stats.totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-700">Saldo a Receber</p>
            <p className="text-xl font-extrabold text-rose-600">
              R$ {stats.totalPendingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* Action Controls & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-parties"
              type="text"
              placeholder="Buscar por criança, tema, cliente, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-700"
            />
          </div>

          {/* Quick Action Buttons: Export & New Party */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-export-csv"
              onClick={() => exportPartiesToCsv(parties, staffList)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Exportar dados para planilha Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Planilha</span>
            </button>

            {currentRole !== 'recreador' && (
              <button
                id="btn-new-party-action"
                onClick={() => onOpenPartyModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Festa</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
          
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-700 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {[
              { id: 'all', label: 'Todas' },
              { id: 'confirmada', label: 'Confirmadas' },
              { id: 'em_negociacao', label: 'Em Negociação' },
              { id: 'concluida', label: 'Concluídas' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === st.id
                    ? 'bg-amber-500 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: 'Todas as Datas' },
              { id: 'today', label: 'Hoje' },
              { id: 'upcoming', label: 'Próximas' },
              { id: 'past', label: 'Passadas' },
            ].map((df) => (
              <button
                key={df.id}
                onClick={() => setDateFilter(df.id as any)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  dateFilter === df.id
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {df.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Party Cards List */}
      <div className="space-y-4">
        {filteredParties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-amber-100 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Smile className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Nenhuma festa encontrada</h3>
            <p className="text-xs text-slate-700 max-w-sm mx-auto mt-1">
              Experimente ajustar os filtros ou agende uma nova comemoração cheia de diversão!
            </p>
          </div>
        ) : (
          filteredParties.map((party) => {
            const badge = statusBadges[party.status];
            const isToday = party.date === todayStr;
            const googleCalUrl = generateGoogleCalendarUrl(party, staffList);
            const isChecklistOpen = selectedPartyChecklist === party.id;
            const completedChecklistCount = party.checklist.filter(c => c.done).length;

            return (
              <div
                key={party.id}
                id={`party-card-${party.id}`}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md ${
                  isToday 
                    ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xs' 
                    : 'border-amber-100/90 shadow-2xs'
                }`}
              >
                <div className="p-4 sm:p-5">
                  
                  {/* Top Row: Code, Theme, Status & Google Calendar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 tracking-wider">
                        {party.code}
                      </span>
                      {isToday && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-500 text-white animate-pulse">
                          🎉 É HOJE!
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Google Calendar 1-Click Sync Badge */}
                    <div className="flex items-center gap-1.5">
                      <a
                        href={googleCalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                        title="Sincronizar no Google Agenda (Abre o Google Calendar com todos os dados preenchidos)"
                      >
                        <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Google Agenda</span>
                        <ExternalLink className="w-3 h-3 text-blue-500" />
                      </a>

                      <button
                        onClick={() => downloadIcsFile(party, staffList)}
                        className="p-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Baixar arquivo .ICS para o calendário"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Main Grid: Info, Animators, Finances */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    
                    {/* Col 1: Kid & Party Details (5 cols) */}
                    <div className="lg:col-span-5 space-y-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-1.5">
                            {party.childName}
                            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              {party.childAge} anos
                            </span>
                          </h3>
                        </div>
                        <p className="text-sm font-semibold text-amber-600 flex items-center gap-1 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          {party.theme}
                        </p>
                        <p className="text-xs text-slate-700">{party.packageType}</p>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-3 text-xs text-slate-700 font-medium pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-800 bg-amber-50/70 px-2 py-1 rounded-md">
                          <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
                          {party.date.split('-').reverse().join('/')}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5 text-slate-700" />
                          {party.startTime} às {party.endTime}
                        </span>
                      </div>

                      {/* Location & Client */}
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-700 shrink-0 mt-0.5" />
                          <span>
                            {party.locationAddress} • {party.locationNeighborhood}, {party.locationCity}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                          <span>Resp: {party.clientName} ({party.clientPhone})</span>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Assigned Staff / Escala (4 cols) */}
                    <div className="lg:col-span-4 bg-amber-50/40 p-3 rounded-xl border border-amber-100/70">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Equipe Escalada ({party.recreadoresAssigned.length})
                        </span>
                      </div>

                      {party.recreadoresAssigned.length === 0 ? (
                        <div className="p-2 text-center text-xs text-amber-700 font-medium bg-amber-100/50 rounded-lg">
                          ⚠️ Nenhum recreador escalado ainda.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {party.recreadoresAssigned.map((assigned, idx) => {
                            const staff = staffList.find((s) => s.id === assigned.recreadorId);
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-100 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${staff?.avatarBg || 'bg-amber-500 text-white'}`}>
                                    {staff?.artisticName.slice(0, 2).toUpperCase() || 'RE'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800">
                                      {staff?.artisticName || 'Recreador'}
                                    </p>
                                    <p className="text-[10px] text-slate-700">{assigned.role}</p>
                                  </div>
                                </div>
                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  R$ {assigned.fee}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Checklist Quick Summary */}
                      <button
                        onClick={() => setSelectedPartyChecklist(isChecklistOpen ? null : party.id)}
                        className="mt-2.5 w-full flex items-center justify-between text-xs font-medium text-amber-800 bg-amber-100/60 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <span>Checklist de Materiais ({completedChecklistCount}/{party.checklist.length})</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isChecklistOpen ? 'rotate-90' : ''}`} />
                      </button>
                    </div>

                    {/* Col 3: Financials & Action Buttons (3 cols) */}
                    <div className="lg:col-span-3 flex flex-col justify-between h-full bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Financeiro da Festa
                        </span>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>Valor Total:</span>
                            <span className="font-bold text-slate-800">R$ {party.totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-emerald-700">
                            <span>Sinal Pago:</span>
                            <span className="font-semibold">R$ {party.depositPaid.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-slate-200">
                            <span>Saldo Restante:</span>
                            <span>R$ {party.remainingBalance.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-1.5">
                        {/* WhatsApp Button */}
                        <button
                          onClick={() => openWhatsApp(party.clientPhone, party)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Enviar confirmação no WhatsApp do cliente"
                        >
                          <Phone className="w-4 h-4" />
                        </button>

                        {/* Printable Order Sheet (PDF) */}
                        <button
                          onClick={() => onSelectPartyForPrint(party)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                          title="Imprimir ou exportar Ficha de Ordem de Serviço em PDF"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-700" />
                          <span>Ficha PDF</span>
                        </button>

                        {/* Edit Button */}
                        {currentRole !== 'recreador' && (
                          <button
                            onClick={() => onOpenPartyModal(party)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-2xs"
                            title="Editar Festa e Escala"
                          >
                            Editar
                          </button>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Expandable Checklist Drawer */}
                  {isChecklistOpen && (
                    <div className="mt-4 pt-3 border-t border-amber-100 bg-amber-50/20 p-3 rounded-xl animate-in fade-in duration-150">
                      <p className="text-xs font-bold text-slate-800 mb-2">
                        🎒 Checklist de Materiais e Brinquedos para esta festa:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {party.checklist.map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors border ${
                              item.done
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={item.done}
                              onChange={() => onToggleChecklistItem(party.id, item.id)}
                              className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                            />
                            <span className={item.done ? 'line-through text-slate-700' : ''}>
                              {item.item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
