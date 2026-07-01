import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EventItem, Guest } from '../types';
import { formatDateTime } from './format';

function reportRows(guests: Guest[]) {
  return guests.map((g) => ({
    'Convidado': g.responsibleName,
    'Telefone': g.phone,
    'Qtd. prevista': g.expectedPeople,
    'Qtd. confirmada': g.status === 'confirmado' ? g.confirmedPeople : 0,
    'Status': g.status === 'confirmado' ? 'Confirmado' : g.status === 'recusado' ? 'Recusado' : 'Pendente',
    'Data da resposta': formatDateTime(g.respondedAt),
  }));
}

export function exportGuestsToCsv(event: EventItem, guests: Guest[]) {
  const rows = reportRows(guests);
  const csv = Papa.unparse(rows);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `convidados-${event.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportGuestsToPdf(event: EventItem, guests: Guest[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(event.name, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Relatório de convidados — gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 25);

  const rows = reportRows(guests);
  autoTable(doc, {
    startY: 32,
    head: [Object.keys(rows[0] ?? {})],
    body: rows.map((r) => Object.values(r).map(String)),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 28, 24] },
  });

  doc.save(`convidados-${event.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}
