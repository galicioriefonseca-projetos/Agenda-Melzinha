import React, { useState, useEffect } from 'react';
import { Contact2, Cake, Phone, Mail, MapPin, Tag } from 'lucide-react';
import { Client } from '../types';

interface ClientModalProps {
  client?: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Client, 'id' | 'createdAt'>, id?: string) => void;
}

export function ClientModal({ client, isOpen, onClose, onSave }: ClientModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [childName, setChildName] = useState('');
  const [childBirthDate, setChildBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('São Paulo - SP');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone);
      setEmail(client.email);
      setChildName(client.childName);
      setChildBirthDate(client.childBirthDate || '');
      setAddress(client.address);
      setCity(client.city);
      setNotes(client.notes || '');
      setTagsInput(client.tags.join(', '));
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setChildName('');
      setChildBirthDate('');
      setAddress('');
      setCity('São Paulo - SP');
      setNotes('');
      setTagsInput('Novo Cliente, WhatsApp');
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave(
      {
        name,
        phone,
        email,
        childName,
        childBirthDate: childBirthDate || undefined,
        address,
        city,
        totalSpent: client ? client.totalSpent : 0,
        partyHistoryIds: client ? client.partyHistoryIds : [],
        notes,
        tags,
      },
      client?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-amber-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Contact2 className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display">
              {client ? `Editar: ${client.name}` : 'Cadastrar Novo Cliente'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-700 hover:text-slate-900 font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome do Responsável (Pai/Mãe) *</label>
            <input
              type="text"
              required
              placeholder="Ex: Fernanda Vasconcelos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefone WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="(11) 99123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                placeholder="cliente@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome da Criança *</label>
              <input
                type="text"
                required
                placeholder="Ex: Helena"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white font-bold text-amber-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data Nascimento Criança</label>
              <input
                type="date"
                value={childBirthDate}
                onChange={(e) => setChildBirthDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Endereço Residencial</label>
            <input
              type="text"
              placeholder="Rua, número, bairro..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tags (separadas por vírgula)</label>
            <input
              type="text"
              placeholder="VIP, Indicação Buffet, Baladinha Neon"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Observações / Preferências</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferências musicais, histórico de atendimento..."
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
              Salvar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
