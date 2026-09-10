import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Star, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Award, 
  DollarSign, 
  Filter, 
  Sparkles, 
  Check, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Party, Recreador, UserRole } from '../types';
import { exportTeamFinancialReportToCsv } from '../utils/exportUtils';

interface EscalaViewProps {
  staffList: Recreador[];
  parties: Party[];
  onOpenRecreadorModal: (recreador?: Recreador) => void;
  onOpenPartyModal: (party: Party) => void;
  onToggleRecreadorConfirmation: (partyId: string, recreadorId: string) => void;
  currentRole: UserRole;
}

export function EscalaView({
  staffList,
  parties,
  onOpenRecreadorModal,
  onOpenPartyModal,
  onToggleRecreadorConfirmation,
  currentRole,
}: EscalaViewProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<string | null>(null);

  // Extract all unique specialties
  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    staffList.forEach((s) => s.specialties.forEach((spec) => set.add(spec)));
    return Array.from(set);
  }, [staffList]);

  // Filter staff
  const filteredStaff = useMemo(() => {
    if (selectedSpecialty === 'all') return staffList;
    return staffList.filter((s) => s.specialties.includes(selectedSpecialty));
  }, [staffList, selectedSpecialty]);

  // Check for time conflicts: Recreador in multiple parties on same date with overlapping times
  const conflictAlerts = useMemo(() => {
    const conflicts: { recreadorName: string; date: string; parties: Party[] }[] = [];
    const partiesByDate: Record<string, Party[]> = {};

    parties.forEach((p) => {
      if (p.status !== 'cancelada') {
        if (!partiesByDate[p.date]) partiesByDate[p.date] = [];
        partiesByDate[p.date].push(p);
      }
    });

    staffList.forEach((staff) => {
      Object.entries(partiesByDate).forEach(([date, dayParties]) => {
        const staffPartiesOnDay = dayParties.filter((p) =>
          p.recreadoresAssigned.some((a) => a.recreadorId === staff.id)
        );

        if (staffPartiesOnDay.length > 1) {
          // Check overlap
          for (let i = 0; i < staffPartiesOnDay.length; i++) {
            for (let j = i + 1; j < staffPartiesOnDay.length; j++) {
              const p1 = staffPartiesOnDay[i];
              const p2 = staffPartiesOnDay[j];
              // If start1 < end2 && start2 < end1
              if (p1.startTime < p2.endTime && p2.startTime < p1.endTime) {
                conflicts.push({
                  recreadorName: staff.artisticName,
                  date,
                  parties: [p1, p2],
                });
              }
            }
          }
        }
      });
    });

    return conflicts;
  }, [parties, staffList]);

  // Total fees paid across scheduled parties
  const totalFeesScheduled = useMemo(() => {
    return parties
      .filter((p) => p.status !== 'cancelada')
      .reduce((sum, p) => {
        const partyStaffTotal = p.recreadoresAssigned.reduce((acc, a) => acc + a.fee, 0);
        return sum + partyStaffTotal;
      }, 0);
  }, [parties]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 backdrop-blur-xs rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </span>
            <h2 className="text-2xl font-black font-display tracking-tight">
              Escala & Equipe de Recreadores
            </h2>
          </div>
          <p className="text-white/90 text-xs sm:text-sm mt-1 max-w-xl font-medium">
            Gerenciamento de disponibilidade, escalas de festas, confirmação de cachês e distribuição equilibrada de eventos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportTeamFinancialReportToCsv(staffList, parties)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl backdrop-blur-xs transition-colors border border-white/30"
            title="Exportar desempenho da equipe em CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Relatório</span>
          </button>

          {currentRole !== 'recreador' && (
            <button
              id="btn-add-recreador"
              onClick={() => onOpenRecreadorModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Recreador</span>
            </button>
          )}
        </div>
      </div>

      {/* Conflict Warnings (if any) */}
      {conflictAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 shadow-xs flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Atenção: Conflito de Horário Detectado na Escala!
            </h4>
            {conflictAlerts.map((conflict, idx) => (
              <p key={idx} className="text-xs text-rose-800">
                • <strong>{conflict.recreadorName}</strong> foi escalado(a) em 2 festas com choque de horário no dia{' '}
                <strong>{conflict.date.split('-').reverse().join('/')}</strong> (Festas:{' '}
                {conflict.parties.map((p) => `${p.code} às ${p.startTime}`).join(' e ')}).
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Roster & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Quadro de Recreadores Cadastrados ({filteredStaff.length})
            </h3>
            <p className="text-xs text-slate-700">
              Total de cachês previstos para a equipe: <strong>R$ {totalFeesScheduled.toFixed(2)}</strong>
            </p>
          </div>

          {/* Specialty Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Habilidade:
            </span>
            <button
              onClick={() => setSelectedSpecialty('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedSpecialty === 'all'
                  ? 'bg-amber-500 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            {allSpecialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedSpecialty === spec
                    ? 'bg-amber-500 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => {
            // Count upcoming parties for this staff
            const assignedParties = parties.filter((p) =>
              p.recreadoresAssigned.some((a) => a.recreadorId === staff.id) && p.status !== 'cancelada'
            );

            return (
              <div
                key={staff.id}
                id={`staff-card-${staff.id}`}
                className="bg-amber-50/20 rounded-2xl border border-amber-100 p-4 transition-all hover:shadow-md hover:border-amber-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs ${staff.avatarBg}`}>
                      {staff.artisticName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 font-display">
                        {staff.artisticName}
                      </h4>
                      <p className="text-xs text-slate-700">{staff.name}</p>
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{staff.rating.toFixed(1)}</span>
                        <span className="text-slate-700 font-normal">({staff.totalPartiesCount} festas)</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    staff.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {staff.active ? 'Ativo' : 'Pausa'}
                  </span>
                </div>

                {/* Specialties */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {staff.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-slate-700 border border-slate-200"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Contacts & Cachet */}
                <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-700 block text-[10px]">Cachê Base</span>
                    <span className="font-extrabold text-slate-900">R$ {staff.baseFee.toFixed(2)} / festa</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-700 block text-[10px]">Festas na Agenda</span>
                    <span className="font-bold text-amber-600">{assignedParties.length} agendadas</span>
                  </div>
                </div>

                {/* Edit & Contact Buttons */}
                <div className="mt-3 pt-2 border-t border-amber-100/60 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${staff.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{staff.phone}</span>
                  </a>

                  {currentRole !== 'recreador' && (
                    <button
                      onClick={() => onOpenRecreadorModal(staff)}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline"
                    >
                      Editar Dados
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Escalas Matrix (Festas & Quem está escalado) */}
      <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Distribuição de Festas & Confirmação de Presença
          </h3>
          <p className="text-xs text-slate-700">
            Acompanhe o aceite dos recreadores para garantir que nenhuma festa fique sem monitor.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {parties
            .filter((p) => p.status !== 'cancelada')
            .map((party) => {
              return (
                <div key={party.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Party Summary */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {party.code}
                      </span>
                      <span className="text-xs font-bold text-amber-700">
                        {party.childName} ({party.childAge} anos)
                      </span>
                      <span className="text-xs text-slate-700">• {party.theme}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-700">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {party.date.split('-').reverse().join('/')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-700" />
                        {party.startTime} - {party.endTime}
                      </span>
                      <span>📍 {party.locationNeighborhood}, {party.locationCity}</span>
                    </div>
                  </div>

                  {/* Recreadores Assigned on this Party */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {party.recreadoresAssigned.length === 0 ? (
                      <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        ⚠️ Sem recreador escalado
                      </span>
                    ) : (
                      party.recreadoresAssigned.map((assigned, idx) => {
                        const rec = staffList.find((s) => s.id === assigned.recreadorId);
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs ${
                              assigned.confirmed
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                : 'bg-amber-50 border-amber-200 text-amber-900'
                            }`}
                          >
                            <span className="font-bold">{rec?.artisticName || 'Recreador'}</span>
                            <span className="text-[10px] text-slate-700">({assigned.role})</span>

                            <button
                              onClick={() => onToggleRecreadorConfirmation(party.id, assigned.recreadorId)}
                              title={assigned.confirmed ? 'Presença Confirmada' : 'Aguardando confirmação'}
                              className={`p-0.5 rounded-full transition-colors ${
                                assigned.confirmed
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })
                    )}

                    {currentRole !== 'recreador' && (
                      <button
                        onClick={() => onOpenPartyModal(party)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        Ajustar Escala
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
        </div>
      </div>

    </div>
  );
}
