import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  CreditCard, 
  Wallet, 
  PiggyBank, 
  Users, 
  FileSpreadsheet, 
  Printer, 
  Calendar,
  Award,
  BarChart3,
  Percent
} from 'lucide-react';
import { Party, Recreador, UserRole } from '../types';
import { exportPartiesToCsv, exportTeamFinancialReportToCsv, triggerPrintPdf } from '../utils/exportUtils';

interface FinancialViewProps {
  parties: Party[];
  staffList: Recreador[];
  currentRole: UserRole;
}

export function FinancialView({ parties, staffList, currentRole }: FinancialViewProps) {
  
  // Calculate financial metrics
  const metrics = useMemo(() => {
    const activeParties = parties.filter((p) => p.status !== 'cancelada');
    const totalRevenue = activeParties.reduce((acc, p) => acc + p.totalPrice, 0);
    const totalReceived = activeParties.reduce((acc, p) => acc + p.depositPaid, 0);
    const totalPending = activeParties.reduce((acc, p) => acc + p.remainingBalance, 0);

    const totalStaffFees = activeParties.reduce((acc, p) => {
      return acc + p.recreadoresAssigned.reduce((sAcc, a) => sAcc + a.fee, 0);
    }, 0);

    const netProfit = totalRevenue - totalStaffFees;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const averageTicket = activeParties.length > 0 ? totalRevenue / activeParties.length : 0;

    return {
      activePartiesCount: activeParties.length,
      totalRevenue,
      totalReceived,
      totalPending,
      totalStaffFees,
      netProfit,
      profitMargin,
      averageTicket,
    };
  }, [parties]);

  // Performance ranking of staff
  const staffPerformance = useMemo(() => {
    return staffList.map((staff) => {
      let partiesCount = 0;
      let totalEarned = 0;

      parties.forEach((p) => {
        if (p.status !== 'cancelada') {
          const assignment = p.recreadoresAssigned.find((a) => a.recreadorId === staff.id);
          if (assignment) {
            partiesCount++;
            totalEarned += assignment.fee;
          }
        }
      });

      return {
        ...staff,
        partiesCount,
        totalEarned,
      };
    }).sort((a, b) => b.totalEarned - a.totalEarned);
  }, [staffList, parties]);

  // Group by themes
  const themeBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    parties.forEach((p) => {
      if (p.status !== 'cancelada') {
        if (!map[p.theme]) map[p.theme] = { count: 0, total: 0 };
        map[p.theme].count++;
        map[p.theme].total += p.totalPrice;
      }
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [parties]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Export Actions */}
      <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-display text-slate-900">
              Desempenho Financeiro & Métricas Operacionais
            </h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Acompanhamento de faturamento, rentabilidade, comissões de recreadores e fechamento mensal.
          </p>
        </div>

        {/* Action Buttons: Export Spreadsheet & Print PDF */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-print-financial-pdf"
            onClick={triggerPrintPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            title="Imprimir ou Salvar em PDF o Relatório Financeiro"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Imprimir PDF</span>
          </button>

          <button
            id="btn-export-financial-csv"
            onClick={() => exportTeamFinancialReportToCsv(staffList, parties)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            title="Exportar Planilha Excel com Desempenho e Cachês"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Planilha</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Faturamento Bruto */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Faturamento</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900 mt-2">
            R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-700 block mt-0.5">{metrics.activePartiesCount} festas ativas</span>
        </div>

        {/* Recebido (Sinais) */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Arrecadado</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-emerald-600 mt-2">
            R$ {metrics.totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-700 block mt-0.5">Sinais confirmados</span>
        </div>

        {/* A Receber */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">A Receber</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-rose-600 mt-2">
            R$ {metrics.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-700 block mt-0.5">No dia da festa</span>
        </div>

        {/* Cachês Equipe */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Cachês Equipe</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-purple-700 mt-2">
            R$ {metrics.totalStaffFees.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-700 block mt-0.5">Repasse aos animadores</span>
        </div>

        {/* Lucro Operacional */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Lucro Operac.</span>
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-sky-700 mt-2">
            R$ {metrics.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-700 block mt-0.5">Margem: {metrics.profitMargin.toFixed(0)}%</span>
        </div>

        {/* Tíquete Médio */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tíquete Médio</span>
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900 mt-2">
            R$ {metrics.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-700 block mt-0.5">Por comemoração</span>
        </div>

      </div>

      {/* Two Column Layout: Team Performance Ranking & Themes Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Team Performance (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-amber-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Desempenho & Cachês por Recreador
              </h3>
              <p className="text-xs text-slate-700">
                Detalhamento dos valores a serem pagos para cada colaborador neste ciclo.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {staffPerformance.map((staff, index) => {
              return (
                <div key={staff.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${staff.avatarBg}`}>
                      {index + 1}º
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {staff.artisticName}
                      </h4>
                      <p className="text-[11px] text-slate-700">
                        {staff.partiesCount} festa(s) escalada(s) • Média {staff.rating.toFixed(1)} ★
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">
                      R$ {staff.totalEarned.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Cachê acumulado
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Theme Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-amber-100 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-500" />
              Temas Mais Contratados
            </h3>
            <p className="text-xs text-slate-700">
              Distribuição do faturamento por pacote e temática.
            </p>
          </div>

          <div className="space-y-3">
            {themeBreakdown.map(([theme, data], index) => {
              const percentage = metrics.totalRevenue > 0 ? (data.total / metrics.totalRevenue) * 100 : 0;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 font-bold truncate max-w-[200px]">{theme}</span>
                    <span className="text-slate-600">
                      {data.count}x • R$ {data.total.toLocaleString('pt-BR')} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
