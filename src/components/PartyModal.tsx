import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  DollarSign, 
  Users, 
  Plus, 
  Trash2, 
  CheckSquare, 
  ExternalLink 
} from 'lucide-react';
import { Party, Recreador, PartyStatus, AssignedRecreador, PartyChecklistItem } from '../types';
import { generateGoogleCalendarUrl } from '../utils/googleCalendar';

interface PartyModalProps {
  party?: Party | null;
  staffList: Recreador[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (partyData: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  defaultClient?: { name: string; phone: string; email: string; childName: string; address: string } | null;
}

const PRESET_THEMES = [
  'Princesas Encantadas & Castelo',
  'Super-Heróis em Ação & Caça ao Tesouro',
  'Circo Encantado da Melzinha',
  'Baladinha Neon Kids & Oficina de Slime',
  'Festa Recreação Aquática & Espuma',
  'Mundo Bita & Ciranda das Cores',
  'Safari dos Bichinhos & Gincanas',
  'Mágico Ilusionista & Palhaçaria',
  'Recreação Tradicional com Pintura e Balões',
];

const PRESET_PACKAGES = [
  'Pacote Magia Real (4h)',
  'Pacote Aventura Total (4h)',
  'Pacote Palhaçaria & Mágica (3h)',
  'Pacote VIP Neon Deluxe (5h)',
  'Pacote Splash Kids (4h)',
  'Pacote Baby Play (3h)',
  'Personalizado',
];

export function PartyModal({
  party,
  staffList,
  isOpen,
  onClose,
  onSave,
  defaultClient,
}: PartyModalProps) {
  const [code, setCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(5);
  const [theme, setTheme] = useState(PRESET_THEMES[0]);
  const [packageType, setPackageType] = useState(PRESET_PACKAGES[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationNeighborhood, setLocationNeighborhood] = useState('');
  const [locationCity, setLocationCity] = useState('São Paulo - SP');
  const [guestCount, setGuestCount] = useState(30);
  const [status, setStatus] = useState<PartyStatus>('confirmada');
  const [totalPrice, setTotalPrice] = useState(1600);
  const [depositPaid, setDepositPaid] = useState(800);
  const [notes, setNotes] = useState('');
  const [assignedStaff, setAssignedStaff] = useState<AssignedRecreador[]>([]);
  const [checklist, setChecklist] = useState<PartyChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Populate when editing or opening
  useEffect(() => {
    if (party) {
      setCode(party.code);
      setClientName(party.clientName);
      setClientPhone(party.clientPhone);
      setClientEmail(party.clientEmail);
      setChildName(party.childName);
      setChildAge(party.childAge);
      setTheme(party.theme);
      setPackageType(party.packageType);
      setDate(party.date);
      setStartTime(party.startTime);
      setEndTime(party.endTime);
      setLocationName(party.locationName || '');
      setLocationAddress(party.locationAddress);
      setLocationNeighborhood(party.locationNeighborhood);
      setLocationCity(party.locationCity);
      setGuestCount(party.guestCount);
      setStatus(party.status);
      setTotalPrice(party.totalPrice);
      setDepositPaid(party.depositPaid);
      setNotes(party.notes || '');
      setAssignedStaff(party.recreadoresAssigned);
      setChecklist(party.checklist);
    } else {
      // New party default
      const randomNum = Math.floor(100 + Math.random() * 900);
      setCode(`MEL-2026-${randomNum}`);
      if (defaultClient) {
        setClientName(defaultClient.name);
        setClientPhone(defaultClient.phone);
        setClientEmail(defaultClient.email);
        setChildName(defaultClient.childName);
        setLocationAddress(defaultClient.address);
      } else {
        setClientName('');
        setClientPhone('');
        setClientEmail('');
        setChildName('');
        setLocationAddress('');
      }
      setChildAge(5);
      setTheme(PRESET_THEMES[0]);
      setPackageType(PRESET_PACKAGES[0]);
      setDate(new Date().toISOString().slice(0, 10));
      setStartTime('14:00');
      setEndTime('18:00');
      setLocationNeighborhood('Moema');
      setLocationCity('São Paulo - SP');
      setGuestCount(30);
      setStatus('confirmada');
      setTotalPrice(1600);
      setDepositPaid(800);
      setNotes('');
      // Default checklist
      setChecklist([
        { id: 'ck-1', item: 'Caixa de Som Bluetooth + Microfone sem fio', done: false },
        { id: 'ck-2', item: 'Maleta de Tintas Faciais Hipoalergênicas e Pincéis', done: false },
        { id: 'ck-3', item: 'Pacote de Bexigas 260Q para Esculturas de Balão', done: false },
        { id: 'ck-4', item: 'Pára-quedas e Materiais de Gincanas Lúdicas', done: false },
      ]);
      setAssignedStaff([]);
    }
  }, [party, defaultClient, isOpen]);

  if (!isOpen) return null;

  const remainingBalance = Math.max(0, totalPrice - depositPaid);

  const handleToggleStaff = (recreador: Recreador) => {
    const exists = assignedStaff.find((s) => s.recreadorId === recreador.id);
    if (exists) {
      setAssignedStaff(assignedStaff.filter((s) => s.recreadorId !== recreador.id));
    } else {
      setAssignedStaff([
        ...assignedStaff,
        {
          recreadorId: recreador.id,
          role: recreador.specialties[0] || 'Recreador',
          fee: recreador.baseFee,
          confirmed: true,
        },
      ]);
    }
  };

  const handleUpdateStaffFee = (recreadorId: string, fee: number) => {
    setAssignedStaff(
      assignedStaff.map((s) => (s.recreadorId === recreadorId ? { ...s, fee } : s))
    );
  };

  const handleUpdateStaffRole = (recreadorId: string, role: string) => {
    setAssignedStaff(
      assignedStaff.map((s) => (s.recreadorId === recreadorId ? { ...s, role } : s))
    );
  };

  const handleAddChecklist = () => {
    if (!newChecklistItem.trim()) return;
    setChecklist([
      ...checklist,
      { id: `ck-${Date.now()}`, item: newChecklistItem.trim(), done: false },
    ]);
    setNewChecklistItem('');
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklist(checklist.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave(
      {
        code,
        clientName,
        clientPhone,
        clientEmail,
        childName,
        childAge,
        theme,
        packageType,
        date,
        startTime,
        endTime,
        locationName,
        locationAddress,
        locationNeighborhood,
        locationCity,
        guestCount,
        status,
        totalPrice: Number(totalPrice),
        depositPaid: Number(depositPaid),
        remainingBalance,
        notes,
        recreadoresAssigned: assignedStaff,
        checklist,
        googleCalendarSynced: true,
      },
      party?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-8 shadow-2xl overflow-hidden border border-amber-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-400 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="text-lg font-bold font-display">
                {party ? `Editar Festa: ${party.code}` : 'Agendar Nova Festa Infantil'}
              </h3>
              <p className="text-xs text-white/90">
                Preencha os detalhes da celebração, escalação de recreadores e valores.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Aniversariante e Tema */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider border-b border-amber-100 pb-1">
              1. Aniversariante & Tema
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Nome do Aniversariante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Helena"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Idade Comemorada</label>
                <input
                  type="number"
                  min={1}
                  max={17}
                  required
                  value={childAge}
                  onChange={(e) => setChildAge(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tema da Festa</label>
                <input
                  type="text"
                  list="themes-list"
                  required
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <datalist id="themes-list">
                  {PRESET_THEMES.map((t, idx) => (
                    <option key={idx} value={t} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pacote Contratado</label>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                >
                  {PRESET_PACKAGES.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Data, Horários e Localização */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider border-b border-amber-100 pb-1">
              2. Data, Horário & Endereço
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Data da Festa *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Horário Início *</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Horário Fim *</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Endereço Completo (Rua e Nº) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rua das Camélias, 420"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bairro *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Moema"
                  value={locationNeighborhood}
                  onChange={(e) => setLocationNeighborhood(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Cliente & Financeiro */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider border-b border-amber-100 pb-1">
              3. Dados do Responsável & Financeiro
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Responsável *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefone WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status da Festa</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PartyStatus)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-800"
                >
                  <option value="confirmada">✅ Confirmada</option>
                  <option value="em_negociacao">⏳ Em Negociação</option>
                  <option value="concluida">🎉 Concluída</option>
                  <option value="cancelada">❌ Cancelada</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  min={0}
                  step="10"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sinal Pago (R$)</label>
                <input
                  type="number"
                  min={0}
                  step="10"
                  value={depositPaid}
                  onChange={(e) => setDepositPaid(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Saldo a Receber (R$)</label>
                <div className="w-full p-2 rounded-xl bg-slate-100 border border-slate-200 font-extrabold text-rose-600">
                  R$ {remainingBalance.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Escalação de Recreadores */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider border-b border-amber-100 pb-1">
              4. Escalar Recreadores para esta festa
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {staffList.map((staff) => {
                const isAssigned = assignedStaff.find((s) => s.recreadorId === staff.id);

                return (
                  <div
                    key={staff.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isAssigned
                        ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!isAssigned}
                          onChange={() => handleToggleStaff(staff)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                        />
                        <span className="font-bold text-slate-800">{staff.artisticName}</span>
                      </label>
                      <span className="text-[11px] text-slate-700">Base: R$ {staff.baseFee}</span>
                    </div>

                    {isAssigned && (
                      <div className="mt-2 grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60">
                        <div>
                          <label className="text-[10px] text-slate-700 block">Função</label>
                          <input
                            type="text"
                            value={isAssigned.role}
                            onChange={(e) => handleUpdateStaffRole(staff.id, e.target.value)}
                            className="w-full p-1 text-[11px] bg-white border border-amber-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-700 block">Cachê (R$)</label>
                          <input
                            type="number"
                            value={isAssigned.fee}
                            onChange={(e) => handleUpdateStaffFee(staff.id, Number(e.target.value))}
                            className="w-full p-1 text-[11px] bg-white border border-amber-300 rounded font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Checklist de Materiais */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider border-b border-amber-100 pb-1">
              5. Checklist de Materiais & Brinquedos
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Adicionar item ao checklist (ex: Máquina de bolhas de sabão)..."
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklist();
                  }
                }}
                className="flex-1 p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl"
              >
                Adicionar
              </button>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs"
                >
                  <span className="text-slate-700">{item.item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklist(item.id)}
                    className="text-slate-700 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Observações Especiais</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferências da criança, alergias, detalhes da entrada triunfal..."
              className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-[11px] text-slate-700 flex items-center gap-1">
              <span>📅 Sincronização direta com Google Agenda disponível após salvar.</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                Salvar Festa & Escala
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
