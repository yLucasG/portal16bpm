import { inject, Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwRRYDLSnJODf2t2UQPBPsbb4sHQ5fZvT6_p04Z25EnT_dG0MbyYZx0E3bqFX__05ch_CPqSPClCvY/pub?gid=100&single=true&output=csv';

export interface SheetRow {
  tipo: string;
  nome: string;
  quantidade: string;
  local: string;
  status: string;
  [key: string]: string;
}

@Injectable({ providedIn: 'root' })
export class SheetsService {
  private readonly http = inject(HttpClient);

  readonly dados = signal<SheetRow[]>([]);

  readonly viaturasAtivas = computed(() => this.dados().filter(d => d.tipo === 'Viatura' && d.status === 'Ativo').length);
  readonly viaturasTotal = computed(() => this.dados().filter(d => d.tipo === 'Viatura').length);
  readonly efetivoTotal = computed(() => this.dados().reduce((sum, item) => sum + (Number(item.quantidade.replace(',', '.')) || 0), 0));
  readonly operacoesAtivas = computed(() => this.dados().filter(d => d.tipo === 'Operacao' && d.status === 'Ativo'));

  async buscarDados(): Promise<void> {
    try {
      const csv = await firstValueFrom(
        this.http.get(SHEETS_CSV_URL, { responseType: 'text' })
      );
      const parsed = this.parseCsv(csv);
      console.table(parsed);
      this.dados.set(parsed);
    } catch (err) {
      console.warn('[SheetsService] Falha ao buscar CSV:', err);
      throw err;
    }
  }

  private parseCsv(csv: string): SheetRow[] {
    const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const result: SheetRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      const values = this.splitLine(line);
      const row: any = {};
      headers.forEach((h, index) => {
        row[h] = values[index] ?? '';
      });

      result.push({
        tipo: row['tipo'] || '',
        nome: row['nome'] || '',
        quantidade: row['quantidade'] || '',
        local: row['local'] || '',
        status: row['status'] || '',
        ...row
      });
    }

    return result;
  }

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
