import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Lock, 
  Users, 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Server, 
  Clock, 
  RefreshCw,
  QrCode
} from 'lucide-react';
import { AuditLog, UserRole } from '../types';
import { downloadCsv } from '../utils/exportUtils';

interface SecurityViewProps {
  twoFactorActive: boolean;
  onToggleTwoFactor: () => void;
  auditLogs: AuditLog[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onClearMockData?: () => void;
}

export function SecurityView({
  twoFactorActive,
  onToggleTwoFactor,
  auditLogs,
  currentRole,
  setCurrentRole,
  onClearMockData,
}: SecurityViewProps) {
  const [logFilter, setLogFilter] = useState<string>('all');
  const [searchLog, setSearchLog] = useState<string>('');
  const [testOtp, setTestOtp] = useState<string>('');
  const [otpVerified, setOtpVerified] = useState<boolean | null>(null);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (logFilter !== 'all' && log.category !== logFilter) return false;
      if (searchLog.trim()) {
        const term = searchLog.toLowerCase();
        return (
          log.action.toLowerCase().includes(term) ||
          log.user.toLowerCase().includes(term) ||
          log.details.toLowerCase().includes(term) ||
          log.ip.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [auditLogs, logFilter, searchLog]);

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (testOtp.length === 6) {
      setOtpVerified(true);
      setTimeout(() => setOtpVerified(null), 4000);
    } else {
      setOtpVerified(false);
    }
  };

  const exportAuditLogsCsv = () => {
    const headers = ['ID', 'Data/Hora', 'Usuário', 'Perfil', 'Ação', 'Categoria', 'Detalhes', 'Endereço IP'];
    const rows = auditLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.user}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.category}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ip}"`,
    ].join(';'));
    const content = [headers.join(';'), ...rows].join('\r\n');
    downloadCsv(`melzinha-auditoria-${new Date().toISOString().slice(0, 10)}.csv`, content);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-slate-900 text-white rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-display text-slate-900">
              Segurança, 2FA & Rastreabilidade de Acessos
            </h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Conformidade LGPD, controle centralizado de papéis (RBAC), logs auditáveis em tempo real e dupla autenticação.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAuditLogsCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            title="Exportar trilha de auditoria completa"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Logs</span>
          </button>
        </div>
      </div>

      {/* Grid: 2FA Card + Compliance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 2FA Configuration (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-amber-100 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Autenticação de Dois Fatores (2FA)
                </h3>
                <p className="text-xs text-slate-700">
                  Protege acessos administrativos e financeiros da empresa
                </p>
              </div>
            </div>

            <button
              id="btn-toggle-2fa-main"
              onClick={onToggleTwoFactor}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                twoFactorActive
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {twoFactorActive ? '✅ Ativado' : '⭕ Desativado'}
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Ao ativar o 2FA, colaboradores de cargos de coordenação e financeiro precisam fornecer o código de 6 dígitos gerado em aplicativos autenticadores (como Google Authenticator ou 1Password).
          </p>

          {/* Test Token Box */}
          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/70 space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              Simulador de Token de Segurança (TOTP):
            </span>

            <form onSubmit={handleVerifyOtp} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Ex: 849201"
                value={testOtp}
                onChange={(e) => setTestOtp(e.target.value.replace(/\D/g, ''))}
                className="w-32 px-3 py-1.5 text-center tracking-widest font-mono text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Validar Token
              </button>
            </form>

            {otpVerified === true && (
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Token válido! Identidade confirmada com sucesso.
              </p>
            )}
            {otpVerified === false && (
              <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Código inválido. Digite 6 dígitos numéricos.
              </p>
            )}
          </div>
        </div>

        {/* Role-Based Permissions (RBAC) (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-amber-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Controle de Permissões (RBAC)
                </h3>
                <p className="text-xs text-slate-700">
                  Perfil ativo atual:{' '}
                  <strong className="text-slate-900 uppercase">{currentRole}</strong>
                </p>
              </div>
            </div>

            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-800"
            >
              <option value="admin">Admin Geral</option>
              <option value="coordenador">Coordenador</option>
              <option value="recreador">Recreador</option>
              <option value="atendimento">Atendimento</option>
            </select>
          </div>

          <div className="text-xs space-y-2">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-800">Agendar & Editar Festas</span>
              <span className="font-bold text-emerald-700">
                {currentRole !== 'recreador' ? '✅ Permitido' : '❌ Somente Leitura'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-800">Relatórios Financeiros & Lucro</span>
              <span className="font-bold text-emerald-700">
                {['admin', 'coordenador'].includes(currentRole) ? '✅ Liberado' : '❌ Restrito'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-800">Confirmação de Escala Própria</span>
              <span className="font-bold text-emerald-700">✅ Liberado para Todos</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-800">Exportação de Dados e Planilhas</span>
              <span className="font-bold text-emerald-700">
                {currentRole === 'admin' ? '✅ Liberado Total' : '⚠️ Supervisionado'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Production Database Sanitization & Readiness Card (Admin only) */}
      {currentRole === 'admin' && onClearMockData && (
        <div className="bg-white p-5 rounded-3xl border border-rose-200/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Sanitização de Dados • Ambiente de Produção Limpo
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                Seu sistema está pronto para uso operacional real sem dados de demonstração. Caso deseje redefinir e garantir que nenhuma informação de teste resida no banco de dados local, utilize a limpeza de dados abaixo.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Tem certeza que deseja zerar os dados de teste e iniciar um banco de dados totalmente limpo para produção?')) {
                onClearMockData();
              }
            }}
            className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors whitespace-nowrap"
          >
            Zerar Dados & Iniciar Produção
          </button>
        </div>
      )}

      {/* Real-time Audit Logs & Traceability Table */}
      <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              Trilha de Auditoria & Rastreabilidade de Operações
            </h3>
            <p className="text-xs text-slate-700">
              Registro imutável de todas as ações de agendamento, escalas, alterações financeiras e logins.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por usuário ou ação..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 placeholder:text-slate-700"
              />
            </div>

            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none font-medium text-slate-700"
            >
              <option value="all">Todas Categorias</option>
              <option value="agendamento">Agendamentos</option>
              <option value="escala">Escalas</option>
              <option value="financeiro">Financeiro</option>
              <option value="segurança">Segurança</option>
              <option value="exportação">Exportações</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="p-3">Data / Hora</th>
                <th className="p-3">Usuário & Perfil</th>
                <th className="p-3">Ação</th>
                <th className="p-3">Detalhes do Registro</th>
                <th className="p-3">IP de Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nenhum registro de auditoria encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 text-slate-700 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {log.user}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 leading-relaxed max-w-md">
                      {log.details}
                    </td>
                    <td className="p-3 text-slate-700 font-mono text-[11px]">
                      {log.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
