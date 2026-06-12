import { inject, Injectable, computed, signal, WritableSignal } from '@angular/core';
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

const BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwRRYDLSnJODf2t2UQPBPsbb4sHQ5fZvT6_p04Z25EnT_dG0MbyYZx0E3bqFX__05ch_CPqSPClCvY/pub';

// GIDs de cada aba — Giovanni atualiza os `null` com os GIDs corretos
// após publicar cada aba via: Arquivo → Publicar na Web → CSV
const GIDS: Record<string, number | null> = {
  Resumo_Sistema: 100,   // aba 'Resumo_Sistema' — já configurada
  Operacoes:      null,  // aba 'Operações'  → substituir pelo GID correto
  Viaturas:       null,  // aba 'Viaturas'   → substituir pelo GID correto
  Efetivo:        null,  // aba 'Efetivo'    → substituir pelo GID correto
};

const csvUrl = (gid: number) => `${BASE}?gid=${gid}&single=true&output=csv`;

@Injectable({ providedIn: 'root' })
export class SheetsService {
  private readonly http = inject(HttpClient);

  // ── Aba Resumo_Sistema (sempre carregada) ───────────────────────
  readonly dados = signal<SheetRow[]>([]);

  // ── Abas de detalhe (populadas se GID estiver configurado acima) ─
  private readonly _operacoesDetalhe = signal<SheetRow[]>([]);
  private readonly _viaturasDetalhe  = signal<SheetRow[]>([]);
  private readonly _efetivoDetalhe   = signal<SheetRow[]>([]);

  // ── Computed: usa aba dedicada se GID configurado, senão filtra do resumo ──
  readonly operacoesAtivas = computed(() => {
    const src = GIDS['Operacoes'] !== null
      ? this._operacoesDetalhe()
      : this.dados().filter(d => d.tipo === 'Operacao');
    return src.filter(d => d.status?.toLowerCase().startsWith('ativ'));
  });

  readonly viaturas = computed(() =>
    GIDS['Viaturas'] !== null
      ? this._viaturasDetalhe()
      : this.dados().filter(d => d.tipo === 'Viatura')
  );

  readonly efetivo = computed(() =>
    GIDS['Efetivo'] !== null
      ? this._efetivoDetalhe()
      : this.dados().filter(d => d.tipo === 'Efetivo')
  );

  readonly viaturasAtivas = computed(() =>
    this.viaturas().filter(d => !d.status?.toLowerCase().startsWith('baix')).length
  );

  readonly viaturasTotal = computed(() => this.viaturas().length);

  readonly efetivoTotal = computed(() =>
    this.efetivo().reduce((sum, r) => sum + (Number(r.quantidade?.replace(',', '.')) || 0), 0)
  );

  // ── Busca Resumo_Sistema + abas de detalhe configuradas ─────────
  async buscarTodos(): Promise<void> {
    await this.fetchAba('Resumo_Sistema', this.dados);

    const paralelas: Promise<void>[] = [];
    if (GIDS['Operacoes'] !== null) paralelas.push(this.fetchAba('Operacoes', this._operacoesDetalhe));
    if (GIDS['Viaturas']  !== null) paralelas.push(this.fetchAba('Viaturas',  this._viaturasDetalhe));
    if (GIDS['Efetivo']   !== null) paralelas.push(this.fetchAba('Efetivo',   this._efetivoDetalhe));
    if (paralelas.length) await Promise.allSettled(paralelas);
  }

  private async fetchAba(tab: string, target: WritableSignal<SheetRow[]>): Promise<void> {
    const gid = GIDS[tab];
    if (gid === null) return;
    const csv = await firstValueFrom(this.http.get(csvUrl(gid), { responseType: 'text' }));
    target.set(this.parseCsv(csv));
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
