import React, { useState } from 'react';
import { 
  LifeBuoy, 
  PhoneCall, 
  AlertCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  MessageSquare, 
  Sparkles,
  MapPin,
  Users
} from 'lucide-react';
import { SupportTicket, Party, UserRole } from '../types';

interface SupportViewProps {
  tickets: SupportTicket[];
  parties: Party[];
  onAddTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt'>) => void;
  onResolveTicket: (ticketId: string, notes: string) => void;
  currentRole: UserRole;
}

export function SupportView({
  tickets,
  parties,
  onAddTicket,
  onResolveTicket,
  currentRole,
}: SupportViewProps) {
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('substituicao_urgente');
  const [priority, setPriority] = useState<SupportTicket['priority']>('urgente');
  const [requesterName, setRequesterName] = useState('');
  const [phone, setPhone] = useState('');
  const [partyCode, setPartyCode] = useState('');
  const [description, setDescription] = useState('');
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onAddTicket({
      title,
      category,
      priority,
      requesterName,
      requesterRole: currentRole,
      phone,
      partyCode: partyCode || undefined,
      description,
      status: 'aberto',
    });

    // Reset
    setTitle('');
    setDescription('');
    setShowNewTicketModal(false);
  };

  const handleConfirmResolve = (ticketId: string) => {
    onResolveTicket(ticketId, resolutionText || 'Chamado atendido e solucionado pelo plantão.');
    setResolvingTicketId(null);
    setResolutionText('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 backdrop-blur-xs rounded-xl">
              <LifeBuoy className="w-6 h-6 text-white" />
            </span>
            <h2 className="text-2xl font-black font-display tracking-tight">
              Plantão Operacional 24h & Suporte Dedicado
            </h2>
          </div>
          <p className="text-white/90 text-xs sm:text-sm mt-1 max-w-xl">
            Canal prioritário para recreadores e coordenadores em campo. Resposta imediata para substituições, rotas, emergências e suporte técnico.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Direct Hotline Call */}
          <a
            href="tel:11987654321"
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-rose-700 font-bold text-xs rounded-xl shadow-md hover:bg-rose-50 transition-all hover:scale-[1.02]"
          >
            <PhoneCall className="w-4 h-4 text-rose-600 animate-bounce" />
            <span>Ligar para Coordenadora</span>
          </a>

          <button
            onClick={() => setShowNewTicketModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Abrir Chamado Urgente</span>
          </button>
        </div>
      </div>

      {/* SLA & Quick Action Hotline Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">SLA de Resposta Imediata</h4>
            <p className="text-[11px] text-slate-700">Atendimento em menos de 5 minutos durante finais de semana.</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Banco de Recreadores Reserva</h4>
            <p className="text-[11px] text-slate-700">Monitores de prontidão para cobertura em caso de imprevistos.</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Disponibilidade Contínua</h4>
            <p className="text-[11px] text-slate-700">Infraestrutura em nuvem ativa 24/7 com alta redundância.</p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Chamados Operacionais Registrados ({tickets.length})
            </h3>
            <p className="text-xs text-slate-700">
              Histórico de solicitações de apoio, substituição de monitores e suporte técnico.
            </p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-display">
              Nenhum chamado operacional em aberto
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 mb-5">
              O canal de emergência e plantão 24h está ativo e pronto para registrar ocorrências, imprevistos de trânsito ou reposições de monitores da sua equipe.
            </p>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Abrir Novo Chamado</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => {
              const isResolving = resolvingTicketId === ticket.id;

              return (
                <div key={ticket.id} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        ticket.priority === 'urgente' 
                          ? 'bg-rose-100 text-rose-800' 
                          : ticket.priority === 'alta'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ticket.priority}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        ticket.status === 'resolvido' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : ticket.status === 'em_atendimento'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ticket.status === 'resolvido' ? '✅ Resolvido' : ticket.status === 'em_atendimento' ? '⚡ Em Atendimento' : '🕒 Aberto'}
                      </span>

                      <h4 className="text-sm font-bold text-slate-900">
                        {ticket.title}
                      </h4>
                    </div>

                    <span className="text-[11px] text-slate-700 font-mono">
                      {new Date(ticket.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {ticket.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 pt-1">
                    <div className="flex items-center gap-3">
                      <span>Solicitante: <strong>{ticket.requesterName}</strong></span>
                      <span>Tel: <strong>{ticket.phone}</strong></span>
                      {ticket.partyCode && (
                        <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold">
                          Festa: {ticket.partyCode}
                        </span>
                      )}
                    </div>

                    {ticket.status !== 'resolvido' && currentRole !== 'recreador' && (
                      <button
                        onClick={() => setResolvingTicketId(isResolving ? null : ticket.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        {isResolving ? 'Cancelar' : 'Solucionar Chamado'}
                      </button>
                    )}
                  </div>

                  {ticket.resolutionNotes && (
                    <div className="mt-2 text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200">
                      <strong>Resolução:</strong> {ticket.resolutionNotes}
                    </div>
                  )}

                  {/* Resolve Box */}
                  {isResolving && (
                    <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                      <p className="text-xs font-bold text-slate-800">
                        Adicionar notas de solução para o chamado:
                      </p>
                      <textarea
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        placeholder="Ex: Novo recreador acionado, chegou ao buffet às 13:45..."
                        className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleConfirmResolve(ticket.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
                        >
                          Confirmar Resolução
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-rose-500" />
                Abertura de Chamado de Plantão 24h
              </h3>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="text-slate-700 hover:text-slate-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Chamado</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Recreador com pneu furado / Troca de emergência"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
                  >
                    <option value="urgente">🚨 Urgente (Menos de 2h para a festa)</option>
                    <option value="alta">⚠️ Alta prioridade</option>
                    <option value="media">📋 Média prioridade</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  >
                    <option value="substituicao_urgente">Substituição de Recreador</option>
                    <option value="atraso_transito">Trânsito / Atraso</option>
                    <option value="endereco_localizacao">Endereço / Localização</option>
                    <option value="material_brinquedo">Material ou Brinquedo</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seu Nome</label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Festa Relacionada (Opcional)</label>
                <select
                  value={partyCode}
                  onChange={(e) => setPartyCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                >
                  <option value="">Nenhuma ou Geral</option>
                  {parties.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code} - {p.childName} ({p.date.split('-').reverse().join('/')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição Detalhada do Problema</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique o que aconteceu, endereço exato e como o plantão pode ajudar agora..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
                >
                  Enviar para o Plantão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
