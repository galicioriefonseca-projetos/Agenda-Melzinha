import React, { useState, useMemo } from 'react';
import { 
  Contact2, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  Sparkles, 
  Cake, 
  MapPin, 
  DollarSign, 
  MessageSquare,
  History,
  Tag
} from 'lucide-react';
import { Client, Party, UserRole } from '../types';

interface ClientsViewProps {
  clients: Client[];
  parties: Party[];
  onOpenClientModal: (client?: Client) => void;
  onOpenNewPartyForClient: (client: Client) => void;
  currentRole: UserRole;
}

export function ClientsView({
  clients,
  parties,
  onOpenClientModal,
  onOpenNewPartyForClient,
  currentRole,
}: ClientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [clients]);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (selectedTag !== 'all' && !c.tags.includes(selectedTag)) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = c.name.toLowerCase().includes(term);
        const matchChild = c.childName.toLowerCase().includes(term);
        const matchPhone = c.phone.toLowerCase().includes(term);
        const matchEmail = c.email.toLowerCase().includes(term);
        return matchName || matchChild || matchPhone || matchEmail;
      }
      return true;
    });
  }, [clients, selectedTag, searchTerm]);

  const openWhatsAppGreeting = (client: Client) => {
    const cleanPhone = client.phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá ${client.name}, tudo bem? Aqui é da Melzinha & Cia ✨ Passando para desejar um dia maravilhoso para você e para o(a) ${client.childName}! Conta com a gente para transformar datas especiais em pura alegria!`
    );
    window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <Contact2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-display text-slate-900">
              Base de Clientes & Aniversariantes
            </h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Histórico completo de festas, datas de nascimento para fidelização e contato direto via WhatsApp.
          </p>
        </div>

        {currentRole !== 'recreador' && (
          <button
            id="btn-add-client"
            onClick={() => onOpenClientModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-clients"
              type="text"
              placeholder="Buscar por nome dos pais, criança, telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white text-slate-800 placeholder:text-slate-700"
            />
          </div>

          {/* Tags Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Tag:
            </span>
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedTag === 'all'
                  ? 'bg-amber-500 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedTag === t
                    ? 'bg-amber-500 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          // Find parties for this client
          const clientParties = parties.filter(
            (p) => p.clientName.toLowerCase() === client.name.toLowerCase() || client.partyHistoryIds.includes(p.id)
          );

          return (
            <div
              key={client.id}
              id={`client-card-${client.id}`}
              className="bg-white rounded-2xl border border-amber-100 p-5 shadow-xs transition-all hover:shadow-md hover:border-amber-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mt-0.5">
                      <Cake className="w-3.5 h-3.5 text-amber-500" />
                      <span>Filho(a): {client.childName}</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    R$ {client.totalSpent.toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* Tags */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {client.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Notes */}
                {client.notes && (
                  <p className="mt-2.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl italic leading-relaxed border border-slate-100">
                    "{client.notes}"
                  </p>
                )}

                {/* Contacts & Location */}
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                </div>

                {/* History of Parties */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Histórico de Festas ({clientParties.length})
                  </span>
                  {clientParties.length === 0 ? (
                    <p className="text-[11px] text-slate-700">Nenhuma festa registrada ainda.</p>
                  ) : (
                    <div className="space-y-1">
                      {clientParties.map((cp) => (
                        <div key={cp.id} className="text-xs bg-slate-50 p-1.5 rounded-lg flex items-center justify-between">
                          <span className="font-medium text-slate-800 truncate">{cp.theme}</span>
                          <span className="text-[10px] text-slate-700">{cp.date.split('-').reverse().join('/')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openWhatsAppGreeting(client)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                  title="Enviar mensagem carinhosa no WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                {currentRole !== 'recreador' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenNewPartyForClient(client)}
                      className="px-2.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                    >
                      + Nova Festa
                    </button>
                    <button
                      onClick={() => onOpenClientModal(client)}
                      className="px-2 py-1.5 text-xs text-slate-700 hover:text-slate-900"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
