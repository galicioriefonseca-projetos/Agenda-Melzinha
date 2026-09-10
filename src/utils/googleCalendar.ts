import { Party, Recreador } from '../types';

/**
 * Formats a date string (YYYY-MM-DD) and time string (HH:MM) into Google Calendar date format (YYYYMMDDTHHmmss)
 */
export function formatGoogleCalendarDateTime(dateStr: string, timeStr: string): string {
  const cleanDate = dateStr.replace(/-/g, '');
  const cleanTime = (timeStr || '14:00').replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

/**
 * Generates a direct Google Calendar Web URL with pre-filled details, location, and recreadores.
 */
export function generateGoogleCalendarUrl(party: Party, staffList: Recreador[]): string {
  const startDateTime = formatGoogleCalendarDateTime(party.date, party.startTime);
  const endDateTime = formatGoogleCalendarDateTime(party.date, party.endTime);
  const datesParam = `${startDateTime}/${endDateTime}`;

  const assignedNames = party.recreadoresAssigned
    .map(assigned => {
      const rec = staffList.find(s => s.id === assigned.recreadorId);
      return rec ? `${rec.artisticName} (${assigned.role})` : assigned.role;
    })
    .join(', ');

  const title = `🎉 Festa ${party.childName} (${party.childAge} anos) - Melzinha & Cia`;

  const details = [
    `FESTA INFANTIL - MELZINHA & CIA`,
    `Código: ${party.code}`,
    `Aniversariante: ${party.childName} (${party.childAge} anos)`,
    `Tema: ${party.theme}`,
    `Pacote: ${party.packageType}`,
    `Responsável: ${party.clientName} (Tel: ${party.clientPhone})`,
    `Equipe Escalada: ${assignedNames || 'A definir'}`,
    `Valor: R$ ${party.totalPrice.toFixed(2)} (Sinal: R$ ${party.depositPaid.toFixed(2)} | Restante: R$ ${party.remainingBalance.toFixed(2)})`,
    party.notes ? `Observações: ${party.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const location = `${party.locationAddress}, ${party.locationNeighborhood}, ${party.locationCity}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: datesParam,
    details: details,
    location: location,
    ctz: 'America/Sao_Paulo',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and triggers download of a standardized .ics iCalendar file for Google Calendar / Apple Calendar
 */
export function downloadIcsFile(party: Party, staffList: Recreador[]): void {
  const startDateTime = formatGoogleCalendarDateTime(party.date, party.startTime);
  const endDateTime = formatGoogleCalendarDateTime(party.date, party.endTime);

  const assignedNames = party.recreadoresAssigned
    .map(assigned => {
      const rec = staffList.find(s => s.id === assigned.recreadorId);
      return rec ? `${rec.artisticName} (${assigned.role})` : assigned.role;
    })
    .join(', ');

  const location = `${party.locationAddress}, ${party.locationNeighborhood}, ${party.locationCity}`.replace(/,/g, '\\,');
  const summary = `🎉 Festa ${party.childName} (${party.childAge} anos) - Melzinha & Cia`;
  const description = `Festa Melzinha & Cia - Código: ${party.code}\\nTema: ${party.theme}\\nCliente: ${party.clientName} (${party.clientPhone})\\nEquipe: ${assignedNames}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Melzinha e Cia//Gestao de Festas v1.0//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${party.id}-${Date.now()}@melzinha-e-cia.app`,
    `DTSTAMP:${formatGoogleCalendarDateTime(new Date().toISOString().slice(0, 10), '12:00')}Z`,
    `DTSTART:${startDateTime}`,
    `DTEND:${endDateTime}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Festa-${party.code}-${party.childName}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
