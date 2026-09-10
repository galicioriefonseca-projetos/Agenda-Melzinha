import { Party, Recreador, Client } from '../types';

/**
 * Downloads a string as a CSV file with UTF-8 BOM so Excel opens accents cleanly.
 */
export function downloadCsv(filename: string, csvContent: string): void {
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports party list to CSV spreadsheet format.
 */
export function exportPartiesToCsv(parties: Party[], staffList: Recreador[]): void {
  const headers = [
    'Código',
    'Data',
    'Horário Início',
    'Horário Fim',
    'Aniversariante',
    'Idade',
    'Tema',
    'Pacote',
    'Cliente Responsável',
    'Telefone',
    'Endereço',
    'Bairro',
    'Cidade',
    'Nº Convidados',
    'Status',
    'Valor Total (R$)',
    'Sinal Pago (R$)',
    'Saldo Pendente (R$)',
    'Recreadores Escalados',
  ];

  const rows = parties.map(party => {
    const staffNames = party.recreadoresAssigned
      .map(a => {
        const staff = staffList.find(s => s.id === a.recreadorId);
        return staff ? `${staff.artisticName} (${a.role})` : a.role;
      })
      .join(' | ');

    return [
      `"${party.code}"`,
      `"${party.date}"`,
      `"${party.startTime}"`,
      `"${party.endTime}"`,
      `"${party.childName}"`,
      party.childAge,
      `"${party.theme}"`,
      `"${party.packageType}"`,
      `"${party.clientName}"`,
      `"${party.clientPhone}"`,
      `"${party.locationAddress}"`,
      `"${party.locationNeighborhood}"`,
      `"${party.locationCity}"`,
      party.guestCount,
      `"${party.status}"`,
      party.totalPrice.toFixed(2),
      party.depositPaid.toFixed(2),
      party.remainingBalance.toFixed(2),
      `"${staffNames}"`,
    ].join(';');
  });

  const csvContent = [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCsv(`melzinha-festas-${dateStr}.csv`, csvContent);
}

/**
 * Exports financial and team performance report to CSV.
 */
export function exportTeamFinancialReportToCsv(
  staffList: Recreador[],
  parties: Party[]
): void {
  const headers = [
    'Nome Artístico',
    'Nome Completo',
    'Telefone',
    'Especialidades',
    'Total de Festas Escaladas',
    'Cachê Total Acumulado (R$)',
    'Avaliação Média',
    'Status',
  ];

  const rows = staffList.map(staff => {
    let totalStaffEarned = 0;
    let partiesCount = 0;

    parties.forEach(party => {
      const assignment = party.recreadoresAssigned.find(a => a.recreadorId === staff.id);
      if (assignment && party.status !== 'cancelada') {
        partiesCount++;
        totalStaffEarned += assignment.fee;
      }
    });

    return [
      `"${staff.artisticName}"`,
      `"${staff.name}"`,
      `"${staff.phone}"`,
      `"${staff.specialties.join(', ')}"`,
      partiesCount,
      totalStaffEarned.toFixed(2),
      staff.rating.toFixed(1),
      staff.active ? '"Ativo"' : '"Inativo"',
    ].join(';');
  });

  const csvContent = [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCsv(`melzinha-desempenho-equipe-${dateStr}.csv`, csvContent);
}

/**
 * Triggers clean browser print dialog which exports directly to PDF.
 */
export function triggerPrintPdf(): void {
  window.print();
}
