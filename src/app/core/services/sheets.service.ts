import { inject, Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SheetRow {
  tipo: string;
  nome: string;
  quantidade: string;
  local: string;
  status: string;
  [key: string]: string;
}

// Aba 'Dados_Portal' — única aba da planilha
// Publicar via: Arquivo → Publicar na Web → Dados_Portal → CSV
const DADOS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwRRYDLSnJODf2t2UQPBPsbb4sHQ5fZvT6_p04Z25EnT_dG0MbyYZx0E3bqFX__05ch_CPqSPClCvY/pub?gid=100&single=true&output=csv';

@Injectable({ providedIn: 'root' })
export class SheetsService {
  private readonly http = inject(HttpClient);

  // Todos os dados da aba Dados_Portal
  readonly dados = signal<SheetRow[]>([]);

  // Operações com status Ativo → tags no header + modal
  readonly operacoesAtivas = computed(() =>
    this.dados().filter(d => d.tipo === 'Operacao' && d.status?.toLowerCase().startsWith('ativ'))
  );

  // Viaturas → modal de viaturas
  readonly viaturas = computed(() => this.dados().filter(d => d.tipo === 'Viatura'));

  // Efetivo → modal de efetivo
  readonly efetivo = computed(() => this.dados().filter(d => d.tipo === 'Efetivo'));

  // Contadores para os cards do dashboard
  readonly viaturasAtivas = computed(() =>
    this.viaturas().filter(d => !d.status?.toLowerCase().startsWith('baix')).length
  );

  readonly viaturasTotal = computed(() => this.viaturas().length);

  readonly efetivoTotal = computed(() =>
    this.efetivo().reduce((sum, r) => sum + (Number(r.quantidade?.replace(',', '.')) || 0), 0)
  );

  async buscarTodos(): Promise<void> {
    const csv = await firstValueFrom(
      this.http.get(DADOS_URL, { responseType: 'text' })
    );
    this.dados.set(this.parseCsv(csv));
  }

  private parseCsv(csv: string): SheetRow[] {
    const lines = csv.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const values = this.splitLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
      return {
        tipo:       row['tipo']       || '',
        nome:       row['nome']       || '',
        quantidade: row['quantidade'] || '',
        local:      row['local']      || '',
        status:     row['status']     || '',
        ...row,
      } as SheetRow;
    });
  }

  private splitLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
      else { current += char; }
    }
    result.push(current.trim());
    return result;
  }
}
