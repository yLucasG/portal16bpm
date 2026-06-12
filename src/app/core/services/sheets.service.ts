import { inject, Injectable, computed, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ── Interfaces ──────────────────────────────────────────────────────
export interface SheetRow {
  tipo: string; nome: string; quantidade: string; local: string; status: string;
  [key: string]: string;
}

export interface MviRow {
  data: string; vitima: string; local: string; preso: string; motivo: string; status: string;
  [key: string]: string;
}

export interface ProducaoRow {
  categoria: string; quantidade: string; meta: string; unidade: string;
  [key: string]: string;
}

// ── URLs ────────────────────────────────────────────────────────────
const BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwRRYDLSnJODf2t2UQPBPsbb4sHQ5fZvT6_p04Z25EnT_dG0MbyYZx0E3bqFX__05ch_CPqSPClCvY/pub';

// GIDs — preencher os null com os GIDs das novas abas após publicar
const GIDS: Record<string, number | null> = {
  Dados_Portal: 100,   // aba 'Dados_Portal'   — já configurada
  MVI:          null,  // aba 'Dados_MVI'       → preencher GID
  Producao:     null,  // aba 'Dados_Producao'  → preencher GID
};

const csvUrl = (gid: number) => `${BASE}?gid=${gid}&single=true&output=csv`;

@Injectable({ providedIn: 'root' })
export class SheetsService {
  private readonly http = inject(HttpClient);

  // ── Sinais ────────────────────────────────────────────────────────
  readonly dados         = signal<SheetRow[]>([]);
  readonly mviDados      = signal<MviRow[]>([]);
  readonly producaoDados = signal<ProducaoRow[]>([]);

  // ── Computeds: Dados_Portal ──────────────────────────────────────
  readonly operacoesAtivas = computed(() =>
    this.dados().filter(d => d.tipo === 'Operacao' && d.status?.toLowerCase().startsWith('ativ'))
  );
  readonly viaturas    = computed(() => this.dados().filter(d => d.tipo === 'Viatura'));
  readonly efetivo     = computed(() => this.dados().filter(d => d.tipo === 'Efetivo'));
  readonly viaturasAtivas = computed(() =>
    this.viaturas().filter(d => !d.status?.toLowerCase().startsWith('baix')).length
  );
  readonly viaturasTotal  = computed(() => this.viaturas().length);
  readonly efetivoTotal   = computed(() =>
    this.efetivo().reduce((sum, r) => sum + (Number(r.quantidade?.replace(',', '.')) || 0), 0)
  );

  // ── Computeds: MVI ───────────────────────────────────────────────
  readonly mvisAtivos = computed(() =>
    this.mviDados().filter(r => r.status?.toLowerCase() !== 'arquivado')
  );
  readonly mvisPresos = computed(() =>
    this.mvisAtivos().filter(r => r.preso?.toLowerCase().startsWith('s')).length
  );

  // ── Computeds: Produção ─────────────────────────────────────────
  readonly producaoMetas = computed(() => {
    const items = this.producaoDados();
    if (!items.length) return { total: 0, atingidas: 0 };
    const atingidas = items.filter(r => {
      const qtd  = Number(r.quantidade?.replace(',', '.')) || 0;
      const meta = Number(r.meta?.replace(',', '.'))      || 0;
      return meta > 0 && qtd >= meta;
    }).length;
    return { total: items.length, atingidas };
  });

  // ── Busca todas as abas ──────────────────────────────────────────
  async buscarTodos(): Promise<void> {
    await this.fetchAba('Dados_Portal', this.dados);
    const paralelas: Promise<void>[] = [];
    if (GIDS['MVI']      !== null) paralelas.push(this.fetchAba('MVI',      this.mviDados      as WritableSignal<any[]>));
    if (GIDS['Producao'] !== null) paralelas.push(this.fetchAba('Producao', this.producaoDados  as WritableSignal<any[]>));
    if (paralelas.length) await Promise.allSettled(paralelas);
  }

  private async fetchAba(tab: string, target: WritableSignal<any[]>): Promise<void> {
    const gid = GIDS[tab];
    if (gid === null) return;
    const csv = await firstValueFrom(this.http.get(csvUrl(gid), { responseType: 'text' }));
    target.set(this.parseCsv(csv));
  }

  private parseCsv(csv: string): Record<string, string>[] {
    const lines = csv.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const values = this.splitLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
      return row;
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
