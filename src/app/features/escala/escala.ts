// Cores estáticas para Tailwind scanner (avatares):
// bg-indigo-500 bg-blue-500 bg-violet-500 bg-teal-500
// bg-rose-500 bg-amber-500 bg-emerald-500 bg-cyan-500

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { EscaladoItem, EscalaService } from '../../core/services/escala.service';

const AVATAR_CORES = [
  'bg-indigo-500', 'bg-blue-500', 'bg-violet-500', 'bg-teal-500',
  'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500',
];

const DIAS  = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

@Component({
  selector: 'app-escala',
  imports: [],
  template: `
    <div class="min-h-screen bg-gray-50 pb-24">

      <!-- ── HEADER ─────────────────────────────────────── -->
      <div class="bg-white border-b border-gray-100 px-4 pt-5 pb-4 sticky top-0 z-20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Serviço do dia</p>
            <h1 class="text-lg font-black text-gray-900 tracking-tight mt-0.5">
              {{ nomeDiaSemana() }}, {{ dataAtual().getDate() }} de {{ nomeMes() }}
            </h1>
          </div>
          <div class="flex items-center gap-2">
            <button (click)="navDia(-1)"
                    class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button (click)="irParaHoje()"
                    class="px-3 h-9 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold active:bg-indigo-100 transition-colors">
              Hoje
            </button>
            <button (click)="navDia(1)"
                    class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- ── LISTA ──────────────────────────────────────── -->
      <div class="px-4 pt-4 space-y-3">

        @if (carregando()) {
          @for (_ of [1,2,3,4]; track $index) {
            <div class="bg-white rounded-2xl h-[72px] animate-pulse border border-gray-100"></div>
          }
        } @else if (entradas().length === 0) {
          <div class="text-center py-16">
            <svg class="w-14 h-14 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p class="text-sm font-bold text-gray-400">Nenhuma escala registrada neste dia</p>
            <p class="text-xs text-gray-300 mt-1 leading-relaxed">
              Registre seu serviço na aba <strong class="text-gray-400">Agenda</strong> com a categoria <strong class="text-gray-400">Escala</strong>.
            </p>
          </div>
        } @else {
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest pb-1">
            {{ entradas().length }} {{ entradas().length === 1 ? 'escalado' : 'escalados' }}
          </p>
          @for (e of entradas(); track e.id) {
            <div class="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 shadow-sm">
              <!-- Avatar -->
              <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                   [class]="avatarCor(e.usuario_nome)">
                {{ e.usuario_nome.charAt(0).toUpperCase() }}
              </div>
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-[11px] font-bold text-gray-400 leading-none truncate">{{ e.usuario_nome }}</p>
                <p class="text-sm font-black text-gray-800 leading-snug mt-0.5 truncate">{{ e.servico }}</p>
                @if (e.hora_inicio) {
                  <p class="text-[11px] text-indigo-500 font-mono font-semibold mt-0.5">
                    {{ hm(e.hora_inicio) }}{{ e.hora_fim ? ' → ' + hm(e.hora_fim) : '' }}
                  </p>
                } @else {
                  <p class="text-[11px] text-gray-300 mt-0.5">sem horário definido</p>
                }
              </div>
            </div>
          }
        }

        @if (erro()) {
          <div class="mt-2 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-700">
            Não foi possível carregar as escalas. Verifique se a função SQL foi criada no Supabase.
          </div>
        }

      </div>
    </div>
  `,
})
export class Escala implements OnInit {
  private readonly escalaService = inject(EscalaService);

  readonly dataAtual  = signal(new Date());
  readonly entradas   = signal<EscaladoItem[]>([]);
  readonly carregando = signal(false);
  readonly erro       = signal(false);

  readonly nomeMes       = computed(() => MESES[this.dataAtual().getMonth()]);
  readonly nomeDiaSemana = computed(() => DIAS[this.dataAtual().getDay()]);

  ngOnInit(): void { this.carregar(); }

  navDia(delta: number): void {
    const d = new Date(this.dataAtual());
    d.setDate(d.getDate() + delta);
    this.dataAtual.set(d);
    this.carregar();
  }

  irParaHoje(): void {
    this.dataAtual.set(new Date());
    this.carregar();
  }

  async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(false);
    const { data, error } = await this.escalaService.buscarEscaladosDia(this.dataKey());
    if (error) {
      this.erro.set(true);
      this.entradas.set([]);
    } else {
      this.entradas.set((data as EscaladoItem[]) ?? []);
    }
    this.carregando.set(false);
  }

  private dataKey(): string {
    const d = this.dataAtual();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  avatarCor(nome: string): string {
    return AVATAR_CORES[nome.charCodeAt(0) % AVATAR_CORES.length];
  }

  hm(hora: string): string {
    return hora.substring(0, 5);
  }
}
