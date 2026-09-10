import React, { useState, useEffect } from 'react';
import { Users, Star, Phone, Mail, Award, DollarSign } from 'lucide-react';
import { Recreador } from '../types';

interface RecreadorModalProps {
  recreador?: Recreador | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Recreador, 'id'>, id?: string) => void;
}

const COMMON_SPECIALTIES = [
  'Recreação Master',
  'Pintura Facial Artística',
  'Escultura de Balões',
  'Show de Mágica',
  'Baladinha Neon',
  'Oficina de Slime',
  'Contação de Histórias',
  'Animação Baby',
  'Recreação Aquática & Espuma',
  'Caça ao Tesouro',
  'Teatrinho de Fantoches',
  'Gincanas Esportivas',
];

export function RecreadorModal({ recreador, isOpen, onClose, onSave }: RecreadorModalProps) {
  const [name, setName] = useState('');
  const [artisticName, setArtisticName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [baseFee, setBaseFee] = useState(220);
  const [rating, setRating] = useState(5.0);
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [avatarBg, setAvatarBg] = useState('bg-amber-500 text-white');

  useEffect(() => {
    if (recreador) {
      setName(recreador.name);
      setArtisticName(recreador.artisticName);
      setPhone(recreador.phone);
      setEmail(recreador.email);
      setSpecialties(recreador.specialties);
      setBaseFee(recreador.baseFee);
      setRating(recreador.rating);
      setActive(recreador.active);
      setNotes(recreador.notes || '');
      setAvatarBg(recreador.avatarBg);
    } else {
      setName('');
      setArtisticName('');
      setPhone('');
      setEmail('');
      setSpecialties(['Recreação Master', 'Escultura de Balões']);
      setBaseFee(220);
      setRating(5.0);
      setActive(true);
      setNotes('');
      const bgColors = [
        'bg-amber-500 text-white',
        'bg-pink-500 text-white',
        'bg-sky-500 text-white',
        'bg-purple-500 text-white',
        'bg-emerald-500 text-white',
        'bg-orange-500 text-white',
      ];
      setAvatarBg(bgColors[Math.floor(Math.random() * bgColors.length)]);
    }
  }, [recreador, isOpen]);

  if (!isOpen) return null;

  const toggleSpecialty = (spec: string) => {
    if (specialties.includes(spec)) {
      setSpecialties(specialties.filter((s) => s !== spec));
    } else {
      setSpecialties([...specialties, spec]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        name,
        artisticName,
        phone,
        email,
        specialties,
        baseFee: Number(baseFee),
        active,
        rating: Number(rating),
        avatarBg,
        totalPartiesCount: recreador ? recreador.totalPartiesCount : 0,
        notes,
      },
      recreador?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-amber-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display">
              {recreador ? `Editar: ${recreador.artisticName}` : 'Cadastrar Novo Recreador'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-700 hover:text-slate-900 font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome Artístico *</label>
              <input
                type="text"
                required
                placeholder="Ex: Tio Pipoca"
                value={artisticName}
                onChange={(e) => setArtisticName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                placeholder="Ex: Lucas Pimentel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefone WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="(11) 97654-3210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                placeholder="recreador@melzinha.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cachê Base (R$) *</label>
              <input
                type="number"
                required
                min={50}
                step={10}
                value={baseFee}
                onChange={(e) => setBaseFee(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold"
              >
                <option value="true">✅ Ativo na Escala</option>
                <option value="false">⏸️ Em Pausa / Férias</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Habilidades & Especialidades
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {COMMON_SPECIALTIES.map((spec) => {
                const selected = specialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      selected
                        ? 'bg-amber-500 text-white font-bold'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Observações / Preferências</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Disponibilidade de dias, bairros onde atende, detalhes..."
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md"
            >
              Salvar Recreador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
