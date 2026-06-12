import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface ModuleMeta {
  name: string;
  emoji: string;
  tagline: string;
}

// Mapa de ID de rota → metadados exibidos no placeholder
const MODULE_META: Record<string, ModuleMeta> = {
  'material-belico': {
    name: 'Material Bélico',
    emoji: '🛡️',
    tagline: 'Gestão e controle de armamento, munição e equipamentos táticos do 16º BPM.',
  },
  almoxarifado: {
    name: 'Almoxarifado',
    emoji: '📦',
    tagline: 'Controle de estoque, requisições e distribuição de materiais do batalhão.',
  },
  '1a-cia': {
    name: '1ª Companhia',
    emoji: '🎖️',
    tagline: 'Gestão operacional, efetivo e ocorrências da 1ª Companhia do 16º BPM.',
  },
  '2a-cia': {
    name: '2ª Companhia',
    emoji: '🎖️',
    tagline: 'Gestão operacional, efetivo e ocorrências da 2ª Companhia do 16º BPM.',
  },
  '3a-cia': {
    name: '3ª Companhia',
    emoji: '🎖️',
    tagline: 'Gestão operacional, efetivo e ocorrências da 3ª Companhia do 16º BPM.',
  },
  sstran: {
    name: 'SSTran',
    emoji: '🚦',
    tagline: 'Seção de Segurança de Trânsito — gestão de operações e controle de veículos.',
  },
  inteligencia: {
    name: 'Inteligência',
    emoji: '🔍',
    tagline: 'Seção de Inteligência do 16º BPM — análise, dados e informações estratégicas.',
  },
  p1: {
    name: 'P1 — Pessoal',
    emoji: '🪪',
    tagline: 'Seção de Pessoal — gestão de efetivo, escalas, fichas funcionais e promoções do 16º BPM.',
  },
  p3: {
    name: 'P3 — Operações',
    emoji: '🗺️',
    tagline: 'Seção de Operações — planejamento tático, ordens de operações e coordenação de ações policiais.',
  },
  p4: {
    name: 'P4 — Logística',
    emoji: '🚛',
    tagline: 'Seção de Logística — controle de frota, suprimentos, manutenção e recursos materiais.',
  },
  arquivo: {
    name: 'Arquivo',
    emoji: '🗂️',
    tagline: 'Arquivo Geral do 16º BPM — gestão de documentos, boletins, ofícios e registros históricos.',
  },
};

const FALLBACK: ModuleMeta = {
  name: 'Módulo',
  emoji: '🔧',
  tagline: 'Este módulo está sendo preparado para uso operacional.',
};

@Component({
  selector: 'app-module-placeholder',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 pb-24">

      <!-- HEADER DARK (consistente com dashboard) -->
      <div class="bg-gradient-to-br from-slate-900 to-blue-950 px-4 pt-6 pb-10 rounded-b-3xl">
        <div class="flex items-center gap-3 pt-1 mb-8">
          <a routerLink="/dashboard"
             class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 active:bg-white/20 transition-colors flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <p class="text-blue-400 text-[9px] font-bold uppercase tracking-[0.18em] leading-none">16º BPM</p>
            <p class="text-white text-xs font-semibold leading-tight mt-0.5">Batalhão Frei Caneca</p>
          </div>
        </div>

        <!-- Emoji + nome do módulo -->
        <div class="text-center">
          <div class="text-5xl mb-4 select-none">{{ meta().emoji }}</div>
          <h1 class="text-white text-2xl font-black tracking-tight">{{ meta().name }}</h1>
          <p class="text-slate-400 text-xs mt-2 max-w-xs mx-auto leading-relaxed">{{ meta().tagline }}</p>
        </div>
      </div>

      <!-- CONTEÚDO -->
      <div class="px-4 pt-6 space-y-4">

        <!-- Card "Em desenvolvimento" -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 text-center">

          <!-- Ícone de construção -->
          <div class="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/>
            </svg>
          </div>

          <!-- Badge -->
          <div class="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1 mb-4">
            <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
            <span class="text-amber-700 text-[10px] font-bold uppercase tracking-widest">Em Desenvolvimento</span>
          </div>

          <!-- Mensagem -->
          <p class="text-slate-800 font-bold text-base leading-snug mb-2">
            Módulo {{ meta().name }}<br>em desenvolvimento
          </p>
          <p class="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
            Em breve estará disponível para gestão e consulta pelos oficiais do 16º BPM.
          </p>
        </div>

        <!-- Card informativo -->
        <div class="bg-white rounded-2xl border border-slate-200 p-4">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800 mb-0.5">Sobre este módulo</p>
              <p class="text-xs text-slate-500 leading-relaxed">{{ meta().tagline }}</p>
            </div>
          </div>
        </div>

        <!-- Botão voltar -->
        <a
          routerLink="/dashboard"
          class="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm active:bg-slate-50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Voltar ao Início
        </a>

      </div>
    </div>
  `,
})
export class ModulePlaceholder implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly meta = signal<ModuleMeta>(FALLBACK);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.meta.set(MODULE_META[id] ?? { ...FALLBACK, name: id });
  }
}
