// Cores estáticas para Tailwind scanner (avatares):
// bg-indigo-500 bg-blue-500 bg-violet-500 bg-teal-500
// bg-rose-500 bg-amber-500 bg-emerald-500 bg-cyan-500

import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { EscalaEntrada, EscalaService } from '../../core/services/escala.service';

const SERVICOS = [
  'Fiscal de POG manhã',
  'Fiscal de POG tarde',
  'Monitoramento',
  'Operações dia',
  'Operações noite',
  'Combate ao MVI',
  'Fecha batalhão',
  'Impacto Integrado',
  'Expediente',
  'Outros',
] as const;

const AVATAR_CORES = [
  'bg-indigo-500', 'bg-blue-500', 'bg-violet-500', 'bg-teal-500',
  'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500',
];

const DIAS  = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

@Component({
  selector: 'app-escala',
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-28">

      <!-- ── HEADER ─────────────────────────────────────── -->
      <div class="bg-white border-b border-gray-100 px-4 pt-5 pb-4 sticky top-0 z-20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Escala do dia</p>
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
          @for (_ of [1,2,3]; track $index) {
            <div class="bg-white rounded-2xl h-[72px] animate-pulse border border-gray-100"></div>
          }
        } @else if (entradas().length === 0) {
          <div class="text-center py-16">
            <svg class="w-14 h-14 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p class="text-sm font-bold text-gray-400">Nenhum serviço registrado neste dia</p>
            <p class="text-xs text-gray-300 mt-1">Toque no botão abaixo para registrar o seu.</p>
          </div>
        } @else {
          @for (e of entradas(); track e.id) {
            <div class="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 shadow-sm">
              <!-- Avatar -->
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
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
              <!-- Deletar (apenas próprias entradas) -->
              @if (e.usuario_id === usuarioId()) {
                <button (click)="excluir(e.id)"
                        class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all flex-shrink-0">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              }
            </div>
          }
        }

      </div>
    </div>

    <!-- ── FAB ────────────────────────────────────────── -->
    <div class="fixed bottom-[72px] right-4 z-30">
      <button (click)="abrirModal()"
              class="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-indigo-300/60 active:scale-95 transition-all font-bold text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
        Meu serviço
      </button>
    </div>

    <!-- ── MODAL ──────────────────────────────────────── -->
    @if (modalAberto()) {
      <div class="fixed inset-0 z-[60] flex items-end justify-center"
           style="background:rgba(15,23,42,0.80);backdrop-filter:blur(4px)"
           (click)="fecharModal()">
        <div class="bg-white w-full rounded-t-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
             (click)="$event.stopPropagation()">

          <!-- Handle + título -->
          <div class="flex-shrink-0 pt-3 px-5">
            <div class="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4"></div>
            <div class="flex items-center justify-between mb-0.5">
              <h2 class="text-lg font-black text-gray-900">Registrar Serviço</h2>
              <button (click)="fecharModal()"
                      class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <p class="text-xs text-gray-400 mb-4">
              {{ nomeDiaSemana() }}, {{ dataAtual().getDate() }} de {{ nomeMes() }}
            </p>
          </div>

          <div class="overflow-y-auto flex-1 px-5 pb-8">
            <div class="space-y-4">

              <!-- Seleção de serviço -->
              <div>
                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Selecione o serviço *
                </label>
                <div class="space-y-2">
                  @for (s of servicos; track s) {
                    <button type="button"
                            (click)="form.servico = s"
                            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all active:scale-[0.98]"
                            [class]="form.servico === s
                              ? 'border-indigo-400 bg-indigo-50'
                              : 'border-gray-200 bg-white'">
                      <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                           [class]="form.servico === s ? 'border-indigo-500' : 'border-gray-300'">
                        @if (form.servico === s) {
                          <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                        }
                      </div>
                      <span class="text-sm font-semibold"
                            [class]="form.servico === s ? 'text-indigo-700' : 'text-gray-700'">{{ s }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Campo livre se "Outros" selecionado -->
              @if (form.servico === 'Outros') {
                <div>
                  <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Descreva o serviço *
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="form.servicoCustom"
                    name="servicoCustom"
                    placeholder="Ex: Diligência externa"
                    maxlength="80"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-gray-300"
                  />
                </div>
              }

              <!-- Horários -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Hora início <span class="normal-case font-normal text-gray-300">(opcional)</span>
                  </label>
                  <input
                    type="time"
                    [(ngModel)]="form.hora_inicio"
                    name="hora_inicio"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Hora fim <span class="normal-case font-normal text-gray-300">(opcional)</span>
                  </label>
                  <input
                    type="time"
                    [(ngModel)]="form.hora_fim"
                    name="hora_fim"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              @if (erroForm()) {
                <p class="text-xs text-red-500 font-semibold">{{ erroForm() }}</p>
              }

              <button
                (click)="salvar()"
                [disabled]="salvando() || !form.servico || (form.servico === 'Outros' && !form.servicoCustom.trim())"
                class="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold active:bg-indigo-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                @if (salvando()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Salvando...
                } @else {
                  Registrar
                }
              </button>

            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class Escala implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly escalaService = inject(EscalaService);

  readonly servicos = SERVICOS;

  readonly dataAtual  = signal(new Date());
  readonly entradas   = signal<EscalaEntrada[]>([]);
  readonly carregando = signal(false);
  readonly modalAberto = signal(false);
  readonly salvando   = signal(false);
  readonly erroForm   = signal('');

  private readonly session = computed(() => this.auth.session());
  readonly usuarioId  = computed(() => this.session()?.user?.id ?? '');
  private readonly usuarioNome = computed(() =>
    this.session()?.user?.user_metadata?.['nome'] ?? 'Usuário'
  );

  form = { servico: '', servicoCustom: '', hora_inicio: '', hora_fim: '' };

  readonly nomeMes       = computed(() => MESES[this.dataAtual().getMonth()]);
  readonly nomeDiaSemana = computed(() => DIAS[this.dataAtual().getDay()]);

  constructor() {
    effect(() => {
      document.body.classList.toggle('body-modal-open', this.modalAberto());
    });
  }

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
    const { data } = await this.escalaService.buscarDia(this.dataKey());
    this.entradas.set((data as EscalaEntrada[]) ?? []);
    this.carregando.set(false);
  }

  abrirModal(): void {
    this.form = { servico: '', servicoCustom: '', hora_inicio: '', hora_fim: '' };
    this.erroForm.set('');
    this.modalAberto.set(true);
  }

  fecharModal(): void { this.modalAberto.set(false); }

  async salvar(): Promise<void> {
    if (!this.form.servico) return;
    if (this.form.servico === 'Outros' && !this.form.servicoCustom.trim()) return;
    this.salvando.set(true);
    this.erroForm.set('');

    const servicoFinal = this.form.servico === 'Outros'
      ? this.form.servicoCustom.trim()
      : this.form.servico;

    const { error } = await this.escalaService.inserir({
      usuario_id:   this.usuarioId(),
      usuario_nome: this.usuarioNome(),
      servico:      servicoFinal,
      data_escala:  this.dataKey(),
      hora_inicio:  this.form.hora_inicio || null,
      hora_fim:     this.form.hora_fim    || null,
    });

    if (error) {
      this.erroForm.set('Erro ao registrar. Tente novamente.');
    } else {
      await this.carregar();
      this.fecharModal();
    }
    this.salvando.set(false);
  }

  async excluir(id: string): Promise<void> {
    this.entradas.update(list => list.filter(e => e.id !== id));
    await this.escalaService.excluir(id);
  }

  // Helpers
  private dataKey(): string {
    const d = this.dataAtual();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  avatarCor(nome: string): string {
    return AVATAR_CORES[nome.charCodeAt(0) % AVATAR_CORES.length];
  }

  hm(hora: string): string {
    return hora.substring(0, 5); // "08:30:00" → "08:30"
  }
}
