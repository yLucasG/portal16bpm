import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AgendaEvento, AgendaService } from '../../core/services/agenda.service';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

@Component({
  selector: 'app-meu-perfil',
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-24">

      <!-- ── HEADER ─────────────────────────────────────── -->
      <div class="bg-white border-b border-gray-100 px-4 pt-5 pb-4 sticky top-0 z-20">
        <div class="flex items-center gap-3 mb-3">
          <button (click)="voltar()"
                  class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200 flex-shrink-0">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Meu Perfil</p>
            <h1 class="text-lg font-black text-gray-900 tracking-tight mt-0.5">{{ nomeUsuario() }}</h1>
          </div>
        </div>
        <!-- Navegação de mês -->
        <div class="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
          <button (click)="navMes(-1)"
                  class="w-8 h-8 rounded-lg bg-white flex items-center justify-center active:bg-gray-100 shadow-sm">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <p class="text-sm font-bold text-gray-700">{{ nomeMes() }} {{ anoAtual() }}</p>
          <button (click)="navMes(1)"
                  class="w-8 h-8 rounded-lg bg-white flex items-center justify-center active:bg-gray-100 shadow-sm">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="px-4 pt-4 space-y-5">

        @if (carregando()) {
          @for (_ of [1,2,3]; track $index) {
            <div class="bg-white rounded-2xl h-24 animate-pulse border border-gray-100"></div>
          }
        } @else {

          <!-- ── RESUMO ──────────────────────────────────── -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p class="text-3xl font-black text-gray-900">{{ servicosTirados().length }}</p>
              <p class="text-xs font-semibold text-gray-400 mt-1 leading-snug">
                {{ servicosTirados().length === 1 ? 'serviço tirado' : 'serviços tirados' }}
              </p>
              <p class="text-[10px] text-gray-300 mt-0.5">no mês</p>
            </div>
            <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p class="text-xl font-black text-emerald-600 leading-tight">{{ brl(totalExtras()) }}</p>
              <p class="text-xs font-semibold text-gray-400 mt-1 leading-snug">extras no mês</p>
              <p class="text-[10px] text-gray-300 mt-0.5">
                {{ brl(extrasPassados()) }} real · {{ brl(extrasFuturos()) }} prev.
              </p>
            </div>
          </div>

          <!-- ── RENTABILIDADE EXTRA ─────────────────────── -->
          @if (servicosExtras().length > 0) {
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Rentabilidade Extra
              </p>
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <!-- Barra de totais -->
                <div class="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                  <div>
                    <p class="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Total previsto</p>
                    <p class="text-lg font-black text-orange-600">{{ brl(totalExtras()) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Realizado</p>
                    <p class="text-lg font-black text-emerald-600">{{ brl(extrasPassados()) }}</p>
                  </div>
                </div>
                <!-- Lista de serviços extras -->
                <div class="divide-y divide-gray-50">
                  @for (ev of servicosExtras(); track ev.id) {
                    <div class="px-4 py-3 flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                           [class]="isPastOrToday(ev.data_evento) ? 'bg-emerald-100' : 'bg-gray-100'">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                             [class]="isPastOrToday(ev.data_evento) ? 'text-emerald-500' : 'text-gray-400'">
                          @if (isPastOrToday(ev.data_evento)) {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                          } @else {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          }
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-gray-800">{{ formatData(ev.data_evento) }}</p>
                        @if (ev.hora_evento) {
                          <p class="text-[11px] text-gray-400 font-mono">{{ hm(ev.hora_evento) }}</p>
                        }
                        @if (ev.titulo) {
                          <p class="text-[11px] text-gray-400 truncate">{{ ev.titulo }}</p>
                        }
                      </div>
                      <div class="text-right flex-shrink-0">
                        <p class="text-sm font-black"
                           [class]="isPastOrToday(ev.data_evento) ? 'text-emerald-600' : 'text-gray-400'">
                          {{ ev.valor_extra ? brl(ev.valor_extra) : '–' }}
                        </p>
                        <p class="text-[10px] font-semibold"
                           [class]="isPastOrToday(ev.data_evento) ? 'text-emerald-400' : 'text-gray-300'">
                          {{ isPastOrToday(ev.data_evento) ? 'realizado' : 'previsto' }}
                        </p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- ── HISTÓRICO DE SERVIÇOS ───────────────────── -->
          <div>
            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Histórico de Serviços
            </p>

            @if (servicosTirados().length === 0) {
              <div class="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
                <p class="text-sm text-gray-400">Nenhum serviço registrado este mês.</p>
                <p class="text-xs text-gray-300 mt-1">
                  Adicione eventos com categoria <strong class="text-gray-400">Escala</strong> na Agenda.
                </p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (ev of servicosTirados(); track ev.id) {
                  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div class="flex items-start gap-3">
                      <div class="flex-1 min-w-0">
                        <!-- Data e horário -->
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                          <span class="text-[11px] font-black text-blue-500 font-mono">
                            {{ formatData(ev.data_evento) }}
                          </span>
                          @if (ev.hora_evento) {
                            <span class="text-[11px] text-gray-400 font-mono">
                              {{ hm(ev.hora_evento) }}{{ ev.hora_fim ? ' → ' + hm(ev.hora_fim) : '' }}
                            </span>
                          }
                        </div>
                        <!-- Título do serviço -->
                        <p class="text-sm font-black text-gray-800 leading-snug">{{ ev.titulo }}</p>
                        <!-- Mike (se registrado) -->
                        @if (ev.ocorrencia_mike) {
                          <div class="flex items-center gap-1.5 mt-2">
                            <svg class="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <span class="text-xs font-bold text-indigo-600">Mike: {{ ev.ocorrencia_mike }}</span>
                          </div>
                        }
                      </div>
                      <!-- Botão ocorrência -->
                      <button (click)="abrirModalMike(ev)"
                              class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                              [class]="ev.ocorrencia_mike
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'bg-gray-100 text-gray-500'">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                        </svg>
                        {{ ev.ocorrencia_mike ? 'Editar' : 'Ocorrência' }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

        } <!-- /else carregando -->
      </div>
    </div>

    <!-- ── MODAL MIKE ──────────────────────────────────── -->
    @if (eventoSelecionado()) {
      <div class="fixed inset-0 z-[60] flex items-end justify-center"
           style="background:rgba(15,23,42,0.80);backdrop-filter:blur(4px)"
           (click)="fecharModal()">
        <div class="bg-white w-full rounded-t-3xl shadow-2xl"
             (click)="$event.stopPropagation()">
          <div class="pt-3 px-5 pb-8">
            <div class="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4"></div>
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-base font-black text-gray-900">Registrar Ocorrência</h2>
              <button (click)="fecharModal()"
                      class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <p class="text-xs text-gray-400 mb-5">
              {{ eventoSelecionado()!.titulo }} · {{ formatData(eventoSelecionado()!.data_evento) }}
            </p>

            <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Número do Mike
            </label>
            <input
              type="text"
              [(ngModel)]="mikeInput"
              name="mike"
              placeholder="Ex: 003/2026"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-gray-300 mb-4"
            />

            @if (erroMike()) {
              <p class="text-xs text-red-500 font-semibold mb-3">{{ erroMike() }}</p>
            }

            <button
              (click)="salvarMike()"
              [disabled]="salvandoMike() || !mikeInput.trim()"
              class="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold active:bg-indigo-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              @if (salvandoMike()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Salvando...
              } @else {
                Salvar
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class MeuPerfil implements OnInit {
  private readonly auth         = inject(AuthService);
  private readonly agendaService = inject(AgendaService);
  private readonly router       = inject(Router);

  readonly mesAtual  = signal(new Date().getMonth());
  readonly anoAtual  = signal(new Date().getFullYear());
  readonly eventos   = signal<AgendaEvento[]>([]);
  readonly carregando = signal(false);

  readonly eventoSelecionado = signal<AgendaEvento | null>(null);
  mikeInput = '';
  readonly salvandoMike = signal(false);
  readonly erroMike     = signal('');

  private readonly session = computed(() => this.auth.session());
  readonly nomeUsuario = computed(() =>
    this.session()?.user?.user_metadata?.['nome'] ?? 'Usuário'
  );
  private readonly userId = computed(() => this.session()?.user?.id ?? '');

  readonly nomeMes = computed(() => MESES[this.mesAtual()]);

  // "hoje" como string YYYY-MM-DD calculado uma vez na criação do componente
  private readonly hojeStr = (() => {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
  })();

  // Serviços tirados: Escala (blue) já passados ou hoje
  readonly servicosTirados = computed(() =>
    this.eventos()
      .filter(e => e.tag_cor === 'blue' && e.data_evento <= this.hojeStr)
      .sort((a, b) => b.data_evento.localeCompare(a.data_evento))
  );

  // Serviços extras: tag orange (todos do mês, passados e futuros)
  readonly servicosExtras = computed(() =>
    this.eventos()
      .filter(e => e.tag_cor === 'orange')
      .sort((a, b) => a.data_evento.localeCompare(b.data_evento))
  );

  readonly extrasPassados = computed(() =>
    this.servicosExtras()
      .filter(e => e.data_evento <= this.hojeStr)
      .reduce((s, e) => s + (e.valor_extra ?? 0), 0)
  );

  readonly extrasFuturos = computed(() =>
    this.servicosExtras()
      .filter(e => e.data_evento > this.hojeStr)
      .reduce((s, e) => s + (e.valor_extra ?? 0), 0)
  );

  readonly totalExtras = computed(() => this.extrasPassados() + this.extrasFuturos());

  constructor() {
    effect(() => {
      document.body.classList.toggle('body-modal-open', !!this.eventoSelecionado());
    });
  }

  ngOnInit(): void { this.carregar(); }

  navMes(delta: number): void {
    let mes = this.mesAtual() + delta;
    let ano = this.anoAtual();
    if (mes < 0)  { mes = 11; ano--; }
    if (mes > 11) { mes = 0;  ano++; }
    this.mesAtual.set(mes);
    this.anoAtual.set(ano);
    this.carregar();
  }

  async carregar(): Promise<void> {
    const uid = this.userId();
    if (!uid) return;
    this.carregando.set(true);
    const { data } = await this.agendaService.buscarMes(uid, this.anoAtual(), this.mesAtual());
    this.eventos.set((data as AgendaEvento[]) ?? []);
    this.carregando.set(false);
  }

  isPastOrToday(dataEvento: string): boolean {
    return dataEvento <= this.hojeStr;
  }

  abrirModalMike(ev: AgendaEvento): void {
    this.eventoSelecionado.set(ev);
    this.mikeInput = ev.ocorrencia_mike ?? '';
    this.erroMike.set('');
  }

  fecharModal(): void {
    this.eventoSelecionado.set(null);
    this.mikeInput = '';
  }

  async salvarMike(): Promise<void> {
    const ev = this.eventoSelecionado();
    if (!ev || !this.mikeInput.trim()) return;
    this.salvandoMike.set(true);
    this.erroMike.set('');

    const { error } = await this.agendaService.atualizarOcorrencia(ev.id, this.mikeInput.trim());

    if (error) {
      this.erroMike.set('Erro ao salvar. Tente novamente.');
    } else {
      const mike = this.mikeInput.trim();
      this.eventos.update(list =>
        list.map(e => e.id === ev.id ? { ...e, ocorrencia_mike: mike } : e)
      );
      this.fecharModal();
    }
    this.salvandoMike.set(false);
  }

  voltar(): void { this.router.navigate(['/services']); }

  formatData(d: string): string {
    const [, m, day] = d.split('-');
    return `${day}/${m}`;
  }

  hm(hora: string): string { return hora.substring(0, 5); }

  brl(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
