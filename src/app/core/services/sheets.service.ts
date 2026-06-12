import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ─── URL do CSV publicado do Google Sheets ────────────────────────────────────
// Para obter: Planilha → Arquivo → Publicar na Web → Selecionar aba →
//   Formato: Valores separados por vírgula (.csv) → Publicar → copiar link
//
// Estrutura esperada das colunas (3 colunas obrigatórias):
//   tipo  | nome                   | local
//   ------+------------------------+------------------
//   Operacao | Op. Patrulha do Bairro | Centro / 1ª Cia
//   Viatura  | GT16000               | Boa Vista
//   Efetivo  | 15 PM                 | Centro
//
// Linhas com tipo diferente de 'Operacao', 'Viatura' ou 'Efetivo' são ignoradas.
export const SHEETS_CSV_URL =
  'COLE_AQUI_A_URL_DO_CSV_PUBLICADO_DO_GOOGLE_SHEETS';

export interface SheetRow {
  tipo: string;
  nome: string;
  local: string;
  [key: string]: string;
}

@Injectable({ providedIn: 'root' })
export class SheetsService {
  private readonly http = inject(HttpClient);

  /** Busca o CSV e retorna um array de objetos com as colunas do cabeçalho. */
  async buscarDados(): Promise<SheetRow[]> {
    if (!SHEETS_CSV_URL || SHEETS_CSV_URL.startsWith('COLE_AQUI')) {
      return [];
    }
    try {
      const csv = await firstValueFrom(
        this.http.get(SHEETS_CSV_URL, { responseType: 'text' }),
      );
      return this.parseCsv(csv);
    } catch (err) {
      console.warn('[SheetsService] Falha ao buscar CSV:', err);
      return [];
    }
  }

  private parseCsv(csv: string): SheetRow[] {
    const lines = csv
      .trim()
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length < 2) return [];

    const headers = this.splitLine(lines[0]).map(h => h.toLowerCase());

    return lines
      .slice(1)
      .map(line => {
        const values = this.splitLine(line);
        const row: SheetRow = { tipo: '', nome: '', local: '' };
        headers.forEach((h, i) => {
          row[h] = values[i] ?? '';
        });
        return row;
      })
      .filter(row => row['tipo']?.trim().length > 0);
  }

  /** Divide uma linha CSV respeitando aspas duplas. */
  private splitLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
}
