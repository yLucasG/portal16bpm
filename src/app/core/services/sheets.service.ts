import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ─── URLs dos CSVs publicados do Google Sheets ───────────────────────────────
export const SHEETS_CSV_URLS = {
  resumo: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwRRYDLSnJODf2t2UQPBPsbb4sHQ5fZvT6_p04Z25EnT_dG0MbyYZx0E3bqFX__05ch_CPqSPClCvY/pub?gid=3&single=true&output=csv',
  efetivo: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwRRYDLSnJODf2t2UQPBPsbb4sHQ5fZvT6_p04Z25EnT_dG0MbyYZx0E3bqFX__05ch_CPqSPClCvY/pub?gid=4&single=true&output=csv',
  viaturas: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwRRYDLSnJODf2t2UQPBPsbb4sHQ5fZvT6_p04Z25EnT_dG0MbyYZx0E3bqFX__05ch_CPqSPClCvY/pub?gid=5&single=true&output=csv',
  operacoes: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwRRYDLSnJODf2t2UQPBPsbb4sHQ5fZvT6_p04Z25EnT_dG0MbyYZx0E3bqFX__05ch_CPqSPClCvY/pub?gid=6&single=true&output=csv'
};

export interface SheetRow {
  [key: string]: string;
}

export interface OperationalData {
  resumo: SheetRow[];
  efetivo: SheetRow[];
  viaturas: SheetRow[];
  operacoes: SheetRow[];
}

@Injectable({ providedIn: 'root' })
export class SheetsService {
  private readonly http = inject(HttpClient);

  async buscarDados(): Promise<OperationalData> {
    const result: OperationalData = {
      resumo: [],
      efetivo: [],
      viaturas: [],
      operacoes: []
    };

    try {
      const [resumo, efetivo, viaturas, operacoes] = await Promise.all([
        this.fetchSheet(SHEETS_CSV_URLS.resumo),
        this.fetchSheet(SHEETS_CSV_URLS.efetivo),
        this.fetchSheet(SHEETS_CSV_URLS.viaturas),
        this.fetchSheet(SHEETS_CSV_URLS.operacoes),
      ]);

      result.resumo = resumo;
      result.efetivo = efetivo;
      result.viaturas = viaturas;
      result.operacoes = operacoes;
    } catch (err) {
      console.warn('[SheetsService] Falha ao buscar dados (alguma aba falhou):', err);
      throw err;
    }

    return result;
  }

  private async fetchSheet(url: string): Promise<SheetRow[]> {
    if (!url || url.startsWith('COLE_AQUI')) {
      return [];
    }
    try {
      const csv = await firstValueFrom(
        this.http.get(url, { responseType: 'text' }),
      );
      return this.parseCsv(csv);
    } catch (err) {
      console.warn(`[SheetsService] Falha ao buscar CSV da url ${url}:`, err);
      throw err;
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
        const row: SheetRow = {};
        headers.forEach((h, i) => {
          row[h] = values[i] ?? '';
        });
        return row;
      });
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
