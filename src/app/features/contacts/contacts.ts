import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Contato {
  nome: string;
  numero: string;
  descricao?: string;
}

interface GrupoContatos {
  id: string;
  titulo: string;
  cor: 'red' | 'blue' | 'slate' | 'indigo';
  contatos: Contato[];
}

const GRUPOS: GrupoContatos[] = [
  {
    id: 'emergencias',
    titulo: 'Emergências',
    cor: 'red',
    contatos: [
      { nome: 'SAMU',                    numero: '192',          descricao: 'Serviço de Atendimento Móvel de Urgência' },
      { nome: 'Bombeiros',               numero: '193',          descricao: 'Corpo de Bombeiros Militar de PE' },
      { nome: 'Guarda Municipal Recife', numero: '153',          descricao: 'Guarda Municipal do Recife' },
      { nome: 'Conselho Tutelar Recife', numero: '8199488-6548', descricao: 'Conselho Tutelar' },
    ],
  },
  {
    id: 'funcionais-16bpm',
    titulo: 'Telefones Funcionais — 16°BPM',
    cor: 'blue',
    contatos: [
      { nome: 'Oficial de Operações',              numero: '81991294933', descricao: 'Oficial de Plantão' },
      { nome: 'Central de Rádio — Despachante',    numero: '81991299156', descricao: 'Rádio Operador Despachante' },
      { nome: 'Central de Rádio — Monitoramento',  numero: '81973427089', descricao: 'Rádio Operador Monitor' },
      { nome: 'Graduado de Dia',                   numero: '81991294005', descricao: 'Graduado de Serviço' },
    ],
  },
  {
    id: 'copom',
    titulo: 'COPOM dos Batalhões',
    cor: 'slate',
    contatos: [
      { nome: '1°BPM',  numero: '31811720' },
      { nome: '6°BPM',  numero: '31835450' },
      { nome: '11°BPM', numero: '31835474' },
      { nome: '12°BPM', numero: '31835392' },
      { nome: '13°BPM', numero: '31835438' },
      { nome: '16°BPM', numero: '31811791' },
      { nome: '17°BPM', numero: '31813606' },
      { nome: '18°BPM', numero: '31813546' },
      { nome: '19°BPM', numero: '31813573' },
      { nome: '20°BPM', numero: '31813591' },
      { nome: '26°BPM', numero: '31833636' },
    ],
  },
  {
    id: 'ciods',
    titulo: 'Despachante CIODS',
    cor: 'indigo',
    contatos: [
      { nome: 'Área 01', numero: '34128251', descricao: '16°BPM' },
      { nome: 'Área 02', numero: '34128252', descricao: '13°BPM' },
      { nome: 'Área 03', numero: '34128253', descricao: '19°BPM' },
      { nome: 'Área 04', numero: '34128254', descricao: '12°BPM' },
      { nome: 'Área 05', numero: '34128255', descricao: '11°BPM' },
      { nome: 'Área 06', numero: '34128256', descricao: '6°BPM' },
      { nome: 'Área 06', numero: '34128225', descricao: '25°BPM' },
      { nome: 'Área 07', numero: '34128257', descricao: '1°BPM' },
      { nome: 'Área 08', numero: '34128258', descricao: '17°BPM' },
      { nome: 'Área 08', numero: '34128250', descricao: '26°BPM' },
      { nome: 'Área 09', numero: '34128259', descricao: '20°BPM' },
      { nome: 'Área 10', numero: '34128260', descricao: '18°BPM' },
    ],
  },
];

type ColorKey = 'red' | 'blue' | 'slate' | 'indigo';

const COR: Record<ColorKey, { header: string; iconWrap: string; iconText: string; itemBg: string; itemText: string; callBg: string; callText: string }> = {
  red:    { header: 'bg-red-50 border-b border-red-100',    iconWrap: 'bg-red-100',    iconText: 'text-red-600',    itemBg: 'bg-red-50',    itemText: 'text-red-500',    callBg: 'bg-red-100',    callText: 'text-red-600'    },
  blue:   { header: 'bg-blue-50 border-b border-blue-100',  iconWrap: 'bg-blue-100',   iconText: 'text-blue-600',   itemBg: 'bg-blue-50',   itemText: 'text-blue-500',   callBg: 'bg-blue-100',   callText: 'text-blue-600'   },
  slate:  { header: 'bg-slate-50 border-b border-slate-100',iconWrap: 'bg-slate-100',  iconText: 'text-slate-600',  itemBg: 'bg-slate-50',  itemText: 'text-slate-500',  callBg: 'bg-slate-100',  callText: 'text-slate-600'  },
  indigo: { header: 'bg-indigo-50 border-b border-indigo-100',iconWrap:'bg-indigo-100',iconText: 'text-indigo-600', itemBg: 'bg-indigo-50', itemText: 'text-indigo-500', callBg: 'bg-indigo-100', callText: 'text-indigo-600' },
};

@Component({
  selector: 'app-contacts',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 pb-24">

      <!-- Sticky header -->
      <div class="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <a
          routerLink="/services"
          class="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 active:bg-gray-100 transition-colors flex-shrink-0"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Ferramentas</p>
          <p class="font-bold text-gray-900 text-sm leading-tight">Contatos Importantes</p>
        </div>
      </div>

      <!-- Body -->
      <div class="px-4 pt-5 space-y-4">

        @for (grupo of grupos; track grupo.id) {
          <div class="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

            <!-- Cabeçalho colapsável -->
            <button
              (click)="toggle(grupo.id)"
              [class]="c(grupo.cor).header + ' w-full flex items-center gap-3 px-4 py-3.5 text-left'"
            >
              <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                   [class]="c(grupo.cor).iconWrap">
                <svg class="w-4 h-4" [class]="c(grupo.cor).iconText" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>

              <div class="flex-1 min-w-0 text-left">
                <p class="text-sm font-bold text-gray-800 leading-none">{{ grupo.titulo }}</p>
                <p class="text-[10px] text-gray-400 mt-0.5">{{ grupo.contatos.length }} contatos</p>
              </div>

              <svg class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200"
                   [class.rotate-180]="aberto(grupo.id)"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Lista de contatos -->
            @if (aberto(grupo.id)) {
              <div class="bg-white divide-y divide-gray-50">
                @for (contato of grupo.contatos; track contato.numero + contato.nome) {
                  <a
                    [href]="telHref(contato.numero)"
                    class="flex items-center gap-3.5 px-4 py-3.5 active:bg-gray-50 transition-colors"
                  >
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                         [class]="c(grupo.cor).itemBg">
                      <svg class="w-4 h-4" [class]="c(grupo.cor).itemText" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                    </div>

                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-gray-800 leading-none">{{ contato.nome }}</p>
                      @if (contato.descricao) {
                        <p class="text-[10px] text-gray-400 mt-0.5 truncate">{{ contato.descricao }}</p>
                      }
                    </div>

                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span class="text-sm font-mono font-bold text-gray-700 tracking-tight">{{ contato.numero }}</span>
                      <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                           [class]="c(grupo.cor).callBg">
                        <svg class="w-3.5 h-3.5" [class]="c(grupo.cor).callText" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                      </div>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        }

        <p class="text-center text-xs text-gray-300 pt-2 pb-4">
          Toque no número para ligar diretamente
        </p>
      </div>
    </div>
  `,
})
export class Contacts {
  readonly grupos = GRUPOS;

  private readonly abertos = signal<Set<string>>(new Set(GRUPOS.map(g => g.id)));

  aberto(id: string): boolean {
    return this.abertos().has(id);
  }

  toggle(id: string): void {
    this.abertos.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  c(cor: ColorKey) {
    return COR[cor];
  }

  telHref(numero: string): string {
    return 'tel:' + numero.replace(/[^0-9]/g, '');
  }
}
