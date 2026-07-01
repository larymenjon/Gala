import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import { Field } from '../components/FormFields';
import { useEvents } from '../hooks/useEvents';
import * as importService from '../services/importService';
import * as guestService from '../services/guestService';

export default function ImportPage() {
  const { events, refresh } = useEvents();
  const fileRef = useRef<HTMLInputElement>(null);
  const [eventId, setEventId] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  const selectedEvent = useMemo(() => events.find((event) => event.id === eventId) ?? events[0], [events, eventId]);

  async function handleFile(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    setErrors([]);
    setResult('');

    if (!selectedEvent) {
      setErrors(['Crie ou selecione uma lista antes de importar.']);
      return;
    }

    setLoading(true);
    const parsed = await importService.parseGuestImportFile(file);
    if (!parsed.ok) {
      setLoading(false);
      setErrors([parsed.error, ...(parsed.details ?? [])]);
      return;
    }

    const importResult = await guestService.importGuestsToEvent(selectedEvent.id, parsed.rows);
    setLoading(false);
    setResult(
      `Importação concluída: ${importResult.imported} novos convidados adicionados, ${importResult.skippedDuplicates} duplicados ignorados e ${importResult.skippedInvalid} linhas inválidas descartadas.`
    );
    refresh();
  }

  function downloadTemplate() {
    const csv = 'Nome,Telefone,Pessoas\nMaria Souza,(11) 91234-5678,2\nJoão Lima,(11) 98765-4321,4\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo-importacao-gala.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminLayout
      title="Importar"
      description="Envie uma planilha Excel ou CSV e preencha a lista automaticamente."
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="bg-white rounded-2xl border border-ink/8 shadow-soft p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-xl font-medium">Importar Lista</h2>
              <p className="text-sm text-ink/50 mt-1">Aceita arquivos .xlsx e .csv.</p>
            </div>
            <FileSpreadsheet className="h-6 w-6 text-gold-dark" />
          </div>

          <div className="space-y-4">
            <Field label="Lista de destino">
              <select
                value={selectedEvent?.id ?? ''}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
              >
                {events.length === 0 ? (
                  <option value="">Nenhuma lista cadastrada</option>
                ) : (
                  events.map((event) => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))
                )}
              </select>
            </Field>

            <div className="rounded-2xl border border-dashed border-ink/15 bg-ink/[0.02] p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gold-dark" />
              <p className="mt-3 font-medium text-ink">Escolha a planilha para importar</p>
              <p className="text-sm text-ink/50 mt-1">Colunas obrigatórias: nome, telefone e pessoas.</p>
              <button
                type="button"
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-ink text-cream px-4 py-2.5 text-sm font-medium hover:bg-ink-light transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                Selecionar arquivo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              {fileName && <p className="mt-3 text-xs text-ink/45">Arquivo selecionado: {fileName}</p>}
            </div>

            {loading && (
              <div className="flex items-center gap-2 rounded-xl bg-gold/10 px-4 py-3 text-sm text-gold-dark">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando planilha...
              </div>
            )}

            {errors.length > 0 && (
              <div className="rounded-xl border border-rose/20 bg-rose/8 px-4 py-3">
                <div className="flex items-center gap-2 text-rose font-medium text-sm mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Não foi possível importar
                </div>
                <ul className="list-disc pl-5 text-sm text-ink/70 space-y-1">
                  {errors.map((error) => <li key={error}>{error}</li>)}
                </ul>
              </div>
            )}

            {result && (
              <div className="rounded-xl border border-sage/20 bg-sage/10 px-4 py-3 text-sm text-[#4F6650] flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                <span>{result}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="secondary" icon={<FileSpreadsheet className="h-4 w-4" />} onClick={downloadTemplate}>
                Baixar modelo
              </Button>
              <Button onClick={() => fileRef.current?.click()} icon={<Upload className="h-4 w-4" />}>
                Importar outra lista
              </Button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-ink/8 shadow-soft p-5">
            <h3 className="font-display text-lg font-medium mb-3">Como a importação funciona</h3>
            <ol className="space-y-3 text-sm text-ink/60">
              <li>1. Selecione a lista de destino.</li>
              <li>2. Envie um arquivo .xlsx ou .csv.</li>
              <li>3. O sistema valida os campos obrigatórios.</li>
              <li>4. Registros duplicados são ignorados automaticamente.</li>
            </ol>
          </div>

          <div className="bg-white rounded-2xl border border-ink/8 shadow-soft p-5">
            <h3 className="font-display text-lg font-medium mb-3">Estrutura esperada</h3>
            <div className="rounded-xl bg-ink/[0.03] p-4 text-sm text-ink/70 space-y-2">
              <p><strong>Nome</strong> ou <strong>Responsável</strong></p>
              <p><strong>Telefone</strong> ou <strong>WhatsApp</strong></p>
              <p><strong>Pessoas</strong> ou <strong>Quantidade</strong></p>
            </div>
          </div>
        </aside>
      </div>
    </AdminLayout>
  );
}
