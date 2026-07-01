import * as XLSX from 'xlsx';
import type { GuestImportRow } from './guestService';

export type ImportParseResult =
  | { ok: true; headers: string[]; rows: GuestImportRow[] }
  | { ok: false; error: string; details?: string[] };

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

const HEADER_ALIASES: Record<keyof GuestImportRow, string[]> = {
  responsibleName: ['nome', 'responsavel', 'responsaveldoevento', 'convidado', 'responsiblename'],
  phone: ['telefone', 'whatsapp', 'celular', 'phone'],
  expectedPeople: ['pessoas', 'quantidade', 'previstos', 'qtdpessoas', 'expectedpeople'],
};

function mapHeader(header: string): keyof GuestImportRow | null {
  const normalized = normalizeHeader(header);
  for (const [key, aliases] of Object.entries(HEADER_ALIASES) as Array<[keyof GuestImportRow, string[]]>) {
    if (aliases.includes(normalized)) return key;
  }
  return null;
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').replace(/[^\d.-]/g, '');
    return Number(normalized);
  }
  return NaN;
}

export async function parseGuestImportFile(file: File): Promise<ImportParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'xlsx' && ext !== 'csv') {
    return { ok: false, error: 'Envie um arquivo .xlsx ou .csv.' };
  }

  const workbook = ext === 'csv'
    ? XLSX.read(await file.text(), { type: 'string' })
    : XLSX.read(await file.arrayBuffer(), { type: 'array' });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { ok: false, error: 'A planilha está vazia.' };
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
  if (rawRows.length < 2) {
    return { ok: false, error: 'A planilha precisa ter cabeçalho e ao menos uma linha de dados.' };
  }

  const headerRow = rawRows[0].map((cell) => String(cell ?? '').trim());
  const headerMap = new Map<number, keyof GuestImportRow>();
  const seenRequired = new Set<keyof GuestImportRow>();
  headerRow.forEach((header, index) => {
    const mapped = mapHeader(header);
    if (mapped) {
      headerMap.set(index, mapped);
      seenRequired.add(mapped);
    }
  });

  const missing = Object.keys(HEADER_ALIASES)
    .filter((key) => !seenRequired.has(key as keyof GuestImportRow))
    .map((key) => {
      const aliases = HEADER_ALIASES[key as keyof GuestImportRow];
      return `${key === 'responsibleName' ? 'Nome' : key === 'phone' ? 'Telefone' : 'Pessoas'} (${aliases[0]})`;
    });

  if (missing.length > 0) {
    return {
      ok: false,
      error: 'A planilha não possui todas as colunas obrigatórias.',
      details: [`Faltam: ${missing.join(', ')}.`],
    };
  }

  const errors: string[] = [];
  const rows: GuestImportRow[] = [];

  for (let i = 1; i < rawRows.length; i += 1) {
    const row = rawRows[i];
    if (!row || row.every((cell) => String(cell ?? '').trim() === '')) continue;

    const values: Partial<GuestImportRow> = {};
    headerMap.forEach((mappedKey, columnIndex) => {
      const cell = row[columnIndex];
      if (mappedKey === 'expectedPeople') {
        values[mappedKey] = parseNumber(cell) as never;
      } else {
        values[mappedKey] = String(cell ?? '').trim() as never;
      }
    });

    const rowNumber = i + 1;
    const name = String(values.responsibleName ?? '').trim();
    const phone = String(values.phone ?? '').trim();
    const expectedPeople = Number(values.expectedPeople ?? NaN);
    if (!name || !phone || Number.isNaN(expectedPeople) || expectedPeople < 1) {
      errors.push(`Linha ${rowNumber}: confira nome, telefone e pessoas.`);
      continue;
    }

    rows.push({ responsibleName: name, phone, expectedPeople });
  }

  if (errors.length > 0) {
    return {
      ok: false,
      error: 'Encontramos linhas com problemas na planilha.',
      details: errors.slice(0, 8),
    };
  }

  if (rows.length === 0) {
    return { ok: false, error: 'Não encontramos linhas válidas para importar.' };
  }

  return { ok: true, headers: headerRow, rows };
}
