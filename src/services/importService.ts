import * as XLSX from 'xlsx';
import type { GuestImportRow } from './guestService';

export type ImportParseResult =
  | { ok: true; headers: string[]; rows: GuestImportRow[] }
  | { ok: false; error: string; details?: string[] };

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function isHeaderLike(value: string): boolean {
  const normalized = normalizeText(value);
  return ['nome', 'responsavel', 'convidado', 'responsaveldoevento'].includes(normalized);
}

function isNameLike(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (isHeaderLike(trimmed)) return false;
  return trimmed.length >= 2;
}

function rowFirstCell(row: unknown[]): string {
  const first = row.find((cell) => String(cell ?? '').trim() !== '');
  return String(first ?? '').trim();
}

function parseTextLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSpreadsheetRows(rows: unknown[][]): string[] {
  const names: string[] = [];
  for (const row of rows) {
    const firstCell = rowFirstCell(row);
    if (!firstCell) continue;
    if (isHeaderLike(firstCell) && names.length === 0) continue;
    if (isNameLike(firstCell)) {
      names.push(firstCell);
    }
  }
  return names;
}

export async function parseGuestImportFile(file: File): Promise<ImportParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const textLike = new Set(['txt', 'csv', 'tsv', 'md', 'log']);
  const spreadsheetLike = new Set(['xlsx', 'xls', 'xlsm', 'xlsb']);

  try {
    if (textLike.has(ext ?? '') || (!ext && file.type.startsWith('text/'))) {
      const lines = parseTextLines(await file.text());
      const names = lines.filter(isNameLike);
      if (names.length === 0) {
        return { ok: false, error: 'Não encontramos nomes válidos no arquivo.' };
      }
      return {
        ok: true,
        headers: ['Nome'],
        rows: names.map((name) => ({ responsibleName: name })),
      };
    }

    if (spreadsheetLike.has(ext ?? '')) {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        return { ok: false, error: 'Não encontramos nenhuma aba na planilha.' };
      }

      const sheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
      const names = parseSpreadsheetRows(rawRows);
      if (names.length === 0) {
        return { ok: false, error: 'Não encontramos nomes válidos na planilha.' };
      }
      return {
        ok: true,
        headers: ['Nome'],
        rows: names.map((name) => ({ responsibleName: name })),
      };
    }

    const fallbackText = await file.text();
    const lines = parseTextLines(fallbackText);
    const names = lines.filter(isNameLike);
    if (names.length === 0) {
      return { ok: false, error: 'Formato de arquivo não suportado. Envie uma lista de nomes em texto ou planilha.' };
    }

    return {
      ok: true,
      headers: ['Nome'],
      rows: names.map((name) => ({ responsibleName: name })),
    };
  } catch {
    return { ok: false, error: 'Não foi possível ler o arquivo. Tente novamente com uma lista simples de nomes.' };
  }
}
