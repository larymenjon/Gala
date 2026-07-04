import { useState } from 'react';
import type { Guest, GuestStatus } from '../types';
import StatusBadge from './StatusBadge';
import CopyLinkButton from './CopyLinkButton';
import { publicRsvpUrl } from '../utils/slug';
import { formatDateTime } from '../utils/format';
import { formatPhoneForWhatsApp } from '../utils/format';

const FILTERS: { value: GuestStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'confirmado', label: 'Confirmados' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'recusado', label: 'Recusados' },
];

export default function GuestTable({ guests, onDelete }: { guests: Guest[]; onDelete: (guest: Guest) => void }) {
  const [filter, setFilter] = useState<GuestStatus | 'todos'>('todos');
  const filtered = filter === 'todos' ? guests : guests.filter((g) => g.status === filter);

  return (
    <div className="bg-white rounded-2xl border border-ink/8 shadow-soft overflow-hidden">
      <div className="flex items-center gap-1.5 px-5 pt-4 pb-1 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.value ? 'bg-ink text-cream' : 'text-ink/50 hover:bg-ink/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-ink/40">
          Nenhum convidado {filter !== 'todos' ? `com status "${FILTERS.find((f) => f.value === filter)?.label.toLowerCase()}"` : 'cadastrado'} ainda.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink/40 uppercase tracking-wide border-y border-ink/8">
                <th className="px-5 py-3 font-medium">Convidado</th>
                <th className="px-5 py-3 font-medium">Participantes</th>
                <th className="px-5 py-3 font-medium">Telefone</th>
                <th className="px-5 py-3 font-medium">Previsto</th>
                <th className="px-5 py-3 font-medium">Confirmado</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Resposta</th>
                <th className="px-5 py-3 font-medium">Link</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                  <td className="px-5 py-3.5 font-medium text-ink">{g.responsibleName}</td>
                  <td className="px-5 py-3.5 text-ink/65">
                    {g.attendees?.length ? (
                      <div className="space-y-1">
                        {g.attendees.map((attendee) => (
                          <div key={`${g.id}-${attendee.name}-${attendee.type}`} className="flex items-center gap-2">
                            <span className="font-medium text-ink">{attendee.name}</span>
                            <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] uppercase tracking-wide text-ink/50">
                              {attendee.type === 'child' ? 'Criança' : 'Adulto'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-ink/40">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-ink/60">
                    <a
                      className="hover:text-ink underline decoration-ink/20 underline-offset-2"
                      href={`https://wa.me/${formatPhoneForWhatsApp(g.phone)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {g.phone}
                    </a>
                  </td>
                  <td className="px-5 py-3.5 text-ink/60">{g.expectedPeople}</td>
                  <td className="px-5 py-3.5 text-ink/60">{g.status === 'confirmado' ? g.confirmedPeople || g.attendees?.length || '—' : '—'}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={g.status} /></td>
                  <td className="px-5 py-3.5 text-ink/45 text-xs">{formatDateTime(g.respondedAt)}</td>
                  <td className="px-5 py-3.5"><CopyLinkButton url={publicRsvpUrl(g.slug)} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => onDelete(g)} className="text-ink/30 hover:text-rose transition-colors text-xs">
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
