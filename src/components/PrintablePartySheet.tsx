import React from 'react';
import { Printer, X, Sparkles, MapPin, Phone, User, Calendar, Clock, CheckSquare } from 'lucide-react';
import { Party, Recreador } from '../types';

interface PrintablePartySheetProps {
  party: Party;
  staffList: Recreador[];
  onClose: () => void;
}

export function PrintablePartySheet({ party, staffList, onClose }: PrintablePartySheetProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-3xl w-full my-6 shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Top Screen Toolbar (hidden in print) */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500 rounded-lg text-white">
              <Printer className="w-4 h-4" />
            </span>
            <span className="text-xs sm:text-sm font-bold">
              Visualização de Impressão / Ficha de Serviço em PDF
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar em PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* The Printable Sheet Document Body */}
        <div id="printable-order-sheet" className="p-8 sm:p-10 space-y-6 text-slate-800 bg-white">
          
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-amber-500 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-3xl font-black shadow-md">
                🐝
              </div>
              <div>
                <h1 className="text-2xl font-black font-display tracking-tight text-slate-900">
                  MELZINHA & CIA
                </h1>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest">
                  Animação & Recreação Infantil Profissional
                </p>
                <p className="text-[11px] text-slate-700">
                  São Paulo e Grande SP • WhatsApp: (11) 98765-4321
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Ordem de Serviço
              </span>
              <span className="text-xl font-mono font-black text-slate-900">
                {party.code}
              </span>
              <span className="text-xs font-bold block mt-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                STATUS: {party.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
            <div>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                Aniversariante
              </span>
              <span className="text-base font-extrabold text-slate-900">
                {party.childName}
              </span>
              <span className="text-xs text-amber-800 block font-semibold">{party.childAge} anos</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                Data do Evento
              </span>
              <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {party.date.split('-').reverse().join('/')}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                Horário da Recreação
              </span>
              <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {party.startTime} às {party.endTime}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                Nº Estimado Crianças
              </span>
              <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                {party.guestCount} convidados
              </span>
            </div>
          </div>

          {/* Theme & Package */}
          <div className="p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Tema & Pacote Contratado
            </span>
            <div className="flex items-center justify-between">
              <p className="text-base font-black text-amber-600 font-display">
                🎉 {party.theme}
              </p>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                {party.packageType}
              </span>
            </div>
          </div>

          {/* Location & Client Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                Local do Evento
              </span>
              {party.locationName && (
                <p className="font-bold text-sm text-slate-900">{party.locationName}</p>
              )}
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {party.locationAddress}
              </p>
              <p className="text-xs text-slate-700">
                {party.locationNeighborhood} - {party.locationCity}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-500" />
                Contato do Responsável
              </span>
              <p className="font-bold text-sm text-slate-900">{party.clientName}</p>
              <p className="text-xs text-slate-800 flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {party.clientPhone}
              </p>
              <p className="text-xs text-slate-700">{party.clientEmail}</p>
            </div>
          </div>

          {/* Equipe Escalada */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block">
              Equipe de Recreadores Escalada
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {party.recreadoresAssigned.map((assigned, idx) => {
                const staff = staffList.find((s) => s.id === assigned.recreadorId);
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-black text-slate-900">
                        {staff?.artisticName || 'Recreador'} ({staff?.name})
                      </p>
                      <p className="text-slate-700 text-[11px]">Função: {assigned.role}</p>
                      <p className="text-slate-700 text-[10px]">{staff?.phone}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                      Cachê: R$ {assigned.fee.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checklist de Materiais */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block">
              Checklist de Materiais & Brinquedos (Conferência na Saída e Chegada)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {party.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50"
                >
                  <div className="w-4 h-4 border-2 border-slate-400 rounded flex items-center justify-center shrink-0">
                    {item.done ? '✓' : ''}
                  </div>
                  <span className="text-slate-800">{item.item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          {party.notes && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <strong className="text-amber-900 block mb-0.5">Observações Especiais:</strong>
              <p className="text-amber-800 italic">{party.notes}</p>
            </div>
          )}

          {/* Financeiro e Assinatura */}
          <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900">
                Valor Total: <span className="font-extrabold text-sm">R$ {party.totalPrice.toFixed(2)}</span>
              </p>
              <p className="text-emerald-700 font-semibold">
                Sinal Pago: R$ {party.depositPaid.toFixed(2)}
              </p>
              <p className="text-rose-600 font-bold text-sm">
                Saldo a Receber no Término: R$ {party.remainingBalance.toFixed(2)}
              </p>
            </div>

            <div className="text-center sm:text-right w-64 pt-6 border-t sm:border-t-0 sm:border-l border-slate-300 sm:pl-6">
              <div className="border-b border-slate-400 w-full mb-1" />
              <span className="text-[10px] text-slate-700 block">
                Assinatura do Responsável da Festa
              </span>
              <span className="text-[9px] text-slate-700">
                Confirmo a realização dos serviços contratados
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 text-[10px] text-slate-700">
            Documento gerado pelo sistema interno Melzinha & Cia • Emissão em {new Date().toLocaleDateString('pt-BR')}
          </div>

        </div>

      </div>
    </div>
  );
}
