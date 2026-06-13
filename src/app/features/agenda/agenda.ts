import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AgendaEvento, AgendaService } from '../../core/services/agenda.service';

// Cores estáticas para Tailwind scanner:
// bg-blue-500  bg-blue-100  text-blue-700  border-blue-200
// bg-red-500   bg-red-100   text-red-700   border-red-200
// bg-green-500 bg-green-100 text-green-700 border-green-200

type TagCor = 'blue' | 'red' | 'green';

const TAG: Record<TagCor, { label: string; dot: string; badge: string; border: string }> = {
  blue:  { label: 'Escala',    dot: 'bg-blue-500',  badge: 'bg-blue-100 text-blue-700',  border: 'border-blue-200'  },
  red:   { label: 'Prazo/IPM', dot: 'bg-red-500',   badge: 'bg-red-100 text-red-700',    border: 'border-red-200'   },
  green: { label: 'Rotina',    dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', border: 'border-green-200' },
};

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

@Component({
  selector: 'app-agenda',
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-24">

      <!-- ── HEADER ───────────────────────────────── -->
      <div class="bg-white border-b border-gray-100 px-4 pt-5 pb-4 sticky top-0 z-20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Agenda</p>
            <h1 class="text-lg font-black text-gray-900 tracking-tight mt-0.5">
              {{ nomeMes() }} {{ anoAtual() }}
            </h1>
          </div>
          <div class="flex items-center gap-2">
            <button (click)="navMes(-1)"
                    class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button (click)="irParaHoje()"
                    class="px-3 h-9 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold active:bg-indigo-100 transition-colors">
              Hoje
            </button>
            <button (click)="navMes(1)"
                    class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Cabeçalho dos dias da semana -->
        <div class="grid grid-cols-7 mt-4 mb-1">
          @for (d of diasSemana; track d) {
            <div class="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wide py-1">
              {{ d }}
            </div>
          }
        </div>
      </div>

      <!-- ── GRID DO CALENDÁRIO ───────────────────── -->
      <div class="px-3 pt-3">
        @if (carregando()) {
          <div class="grid grid-cols-7 gap-1">
            @for (_ of placeholder; track $index) {
              <div class="aspect-square rounded-xl bg-gray-100 animate-pulse"></div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-7 gap-1">
            @for (celula of diasDoMes(); track $index) {
              @if (celula === null) {
                <div></div>
              } @else {
                <button
                  (click)="selecionarDia(celula)"
                  class="aspect-square rounded-xl flex flex-col items-center justify-start pt-1.5 pb-1 px-1 transition-all active:scale-95 relative"
                  [class]="getCelulaClasse(celula)"
                >
                  <span class="text-xs font-bold leading-none">{{ celula }}</span>
                  <!-- Bolinhas de eventos -->
                  @if (eventosNoDia(celula).length > 0) {
                    <div class="flex gap-0.5 mt-1 flex-wrap justify-center">
                      @for (ev of eventosNoDia(celula).slice(0, 3); track ev.id) {
                        <div class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                             [class]="tag(ev.tag_cor).dot"></div>
                      }
                    </div>
                  }
                </button>
              }
            }
          </div>
        }

        <!-- Banner: tabela não existe no Supabase -->
        @if (erroCarregamento()) {
          <div class="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div>
              <p class="text-sm font-bold text-amber-800">Configuração pendente</p>
              <p class="text-xs text-amber-700 mt-0.5 leading-relaxed">
                A tabela <strong>agenda</strong> ainda não existe no Supabase.
                Execute o SQL de criação no painel do Supabase para ativar este módulo.
              </p>
            </div>
          </div>
        }

        <!-- Legenda -->
        <div class="flex items-center gap-4 justify-center mt-5 pb-2">
          @for (entry of legendaEntries; track entry[0]) {
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full" [class]="entry[1].dot"></div>
              <span class="text-[10px] font-semibold text-gray-400">{{ entry[1].label }}</span>
            </div>
          }
        </div>
      </div>

    </div>

    <!-- ══════════════════════════════════════════
         MODAL — Dia selecionado
    ══════════════════════════════════════════ -->
    @if (diaSelecionado() !== null) {
      <div class="fixed inset-0 z-[60] flex items-end justify-center"
           style="background:rgba(15,23,42,0.80);backdrop-filter:blur(4px)"
           (click)="fecharModal()">
        <div class="bg-white w-full rounded-t-3xl overflow-hidden shadow-2xl max-h-[88vh] flex flex-col"
             (click)="$event.stopPropagation()">

          <!-- Handle + cabeçalho -->
          <div class="flex-shrink-0 pt-3 pb-0 px-5">
            <div class="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4"></div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  {{ nomeMes() }} · {{ anoAtual() }}
                </p>
                <h2 class="text-xl font-black text-gray-900 mt-0.5">
                  {{ diaSelecionado() }} de {{ nomeMes() }}
                </h2>
              </div>
              <button (click)="fecharModal()"
                      class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Abas -->
            <div class="flex bg-gray-100 rounded-xl p-1 gap-1 mb-4">
              <button (click)="abaModal.set('lista')"
                      class="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                      [class]="abaModal() === 'lista' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'">
                Eventos ({{ eventosHoje().length }})
              </button>
              <button (click)="abaModal.set('novo')"
                      class="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                      [class]="abaModal() === 'novo' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'">
                + Novo Evento
              </button>
            </div>
          </div>

          <!-- Conteúdo da aba: LISTA -->
          @if (abaModal() === 'lista') {
            <div class="overflow-y-auto flex-1 px-5 pb-6">
              @if (eventosHoje().length === 0) {
                <div class="text-center py-10">
                  <svg class="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p class="text-sm font-semibold text-gray-400">Nenhum evento neste dia</p>
                  <button (click)="abaModal.set('novo')"
                          class="mt-3 text-xs font-bold text-indigo-600 underline">
                    Adicionar evento
                  </button>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (ev of eventosHoje(); track ev.id) {
                    <div class="rounded-2xl border p-4" [class]="tag(ev.tag_cor).border">
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            @if (ev.hora_evento) {
                              <span class="text-xs font-black text-gray-500 font-mono">
                                {{ ev.hora_evento }}{{ ev.hora_fim ? ' às ' + ev.hora_fim : '' }}
                              </span>
                            }
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md" [class]="tag(ev.tag_cor).badge">
                              {{ tag(ev.tag_cor).label }}
                            </span>
                          </div>
                          <p class="text-sm font-bold text-gray-800 leading-snug">{{ ev.titulo }}</p>
                          @if (ev.descricao) {
                            <p class="text-xs text-gray-500 mt-1 leading-relaxed">{{ ev.descricao }}</p>
                          }
                          @if (ev.notificar_wpp && ev.telefone_wpp) {
                            <div class="flex items-center gap-1 mt-2">
                              <svg class="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              <span class="text-[10px] text-green-600 font-semibold">{{ ev.telefone_wpp }}</span>
                            </div>
                          }
                        </div>
                        <button (click)="excluir(ev.id)"
                                class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all flex-shrink-0">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Conteúdo da aba: NOVO EVENTO -->
          @if (abaModal() === 'novo') {
            <div class="overflow-y-auto flex-1 px-5 pb-6">
              <div class="space-y-3">

                <!-- Título -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Título *</label>
                  <input
                    type="text"
                    [(ngModel)]="form.titulo"
                    name="titulo"
                    placeholder="Ex: IPM nº 123 — prazo final"
                    maxlength="120"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-300"
                  />
                </div>

                <!-- Descrição -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descrição</label>
                  <textarea
                    [(ngModel)]="form.descricao"
                    name="descricao"
                    rows="2"
                    placeholder="Detalhes adicionais..."
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-300 resize-none"
                  ></textarea>
                </div>

                <!-- Hora início + Hora fim -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Hora Início</label>
                    <input
                      type="time"
                      [(ngModel)]="form.hora"
                      name="hora"
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Hora Final <span class="text-gray-300 normal-case font-normal">(opcional)</span></label>
                    <input
                      type="time"
                      [(ngModel)]="form.hora_fim"
                      name="hora_fim"
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <!-- Categoria -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Categoria</label>
                  <select
                    [(ngModel)]="form.tag_cor"
                    name="tag_cor"
                    class="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  >
                    <option value="blue">Escala</option>
                    <option value="red">Prazo / IPM</option>
                    <option value="green">Rotina</option>
                  </select>
                </div>

                <!-- Aviso WhatsApp toggle -->
                <div class="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold text-gray-700">Avisar no WhatsApp</p>
                      <p class="text-[10px] text-gray-400 mt-0.5">Pronto para automação futura</p>
                    </div>
                    <!-- Toggle switch -->
                    <button
                      type="button"
                      (click)="form.avisar_whatsapp = !form.avisar_whatsapp"
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                      [class]="form.avisar_whatsapp ? 'bg-green-500' : 'bg-gray-300'"
                    >
                      <span
                        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                        [class]="form.avisar_whatsapp ? 'translate-x-6' : 'translate-x-1'"
                      ></span>
                    </button>
                  </div>

                  @if (form.avisar_whatsapp) {
                    <div class="mt-3">
                      <input
                        type="tel"
                        [(ngModel)]="form.telefone_whatsapp"
                        name="telefone_whatsapp"
                        placeholder="Ex: 81999999999"
                        class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-300"
                      />
                    </div>
                  }
                </div>

                @if (erroForm()) {
                  <p class="text-xs text-red-500 font-semibold">{{ erroForm() }}</p>
                }

                <!-- Botão salvar -->
                <button
                  (click)="salvar()"
                  [disabled]="salvando() || !form.titulo.trim()"
                  class="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold active:bg-indigo-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  @if (salvando()) {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Salvando...
                  } @else {
                    Salvar Evento
                  }
                </button>

              </div>
            </div>
          }

        </div>
      </div>
    }
  `,
})
export class Agenda implements OnInit {
  private readonly auth         = inject(AuthService);
  private readonly agendaService = inject(AgendaService);

  readonly diasSemana  = DIAS_SEMANA;
  readonly legendaEntries = Object.entries(TAG) as [TagCor, typeof TAG[TagCor]][];
  readonly placeholder = Array(35);

  private readonly user    = computed(() => this.auth.session()?.user ?? null);
  private readonly userId  = computed(() => this.user()?.id ?? '');

  readonly mesAtual  = signal(new Date().getMonth());
  readonly anoAtual  = signal(new Date().getFullYear());
  readonly eventos   = signal<AgendaEvento[]>([]);
  readonly carregando = signal(false);
  readonly erroCarregamento = signal('');

  readonly diaSelecionado = signal<number | null>(null);
  readonly abaModal       = signal<'lista' | 'novo'>('lista');
  readonly salvando       = signal(false);
  readonly erroForm       = signal('');

  form = {
    titulo: '',
    descricao: '',
    hora: '',
    hora_fim: '',
    tag_cor: 'blue' as TagCor,
    avisar_whatsapp: false,
    telefone_whatsapp: '',
  };

  private readonly hoje = new Date();

  readonly nomeMes = computed(() => MESES[this.mesAtual()]);

  readonly diasDoMes = computed(() => {
    const ano = this.anoAtual();
    const mes = this.mesAtual();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias   = new Date(ano, mes + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < primeiroDia; i++) cells.push(null);
    for (let d = 1; d <= totalDias; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  });

  private readonly eventosPorDia = computed(() => {
    const map = new Map<string, AgendaEvento[]>();
    for (const ev of this.eventos()) {
      const list = map.get(ev.data_evento) ?? [];
      list.push(ev);
      map.set(ev.data_evento, list);
    }
    return map;
  });

  readonly eventosHoje = computed(() => {
    const dia = this.diaSelecionado();
    if (dia === null) return [];
    return this.eventosPorDia().get(this.diaKey(dia)) ?? [];
  });

  constructor() {
    effect(() => {
      if (this.diaSelecionado() !== null) {
        document.body.classList.add('body-modal-open');
      } else {
        document.body.classList.remove('body-modal-open');
      }
    });
  }

  ngOnInit(): void {
    this.carregarMes();
  }

  // ── Navegação ──────────────────────────────────────────────────
  navMes(delta: number): void {
    let mes = this.mesAtual() + delta;
    let ano = this.anoAtual();
    if (mes < 0)  { mes = 11; ano--; }
    if (mes > 11) { mes = 0;  ano++; }
    this.mesAtual.set(mes);
    this.anoAtual.set(ano);
    this.carregarMes();
  }

  irParaHoje(): void {
    this.mesAtual.set(this.hoje.getMonth());
    this.anoAtual.set(this.hoje.getFullYear());
    this.carregarMes();
  }

  // ── Carregamento ───────────────────────────────────────────────
  async carregarMes(): Promise<void> {
    const uid = this.userId();
    if (!uid) return;
    this.carregando.set(true);
    this.erroCarregamento.set('');
    const { data, error } = await this.agendaService.buscarMes(uid, this.anoAtual(), this.mesAtual());
    if (error) {
      this.erroCarregamento.set('tabela_inexistente');
    } else {
      this.eventos.set((data as AgendaEvento[]) ?? []);
    }
    this.carregando.set(false);
  }

  // ── Modal ──────────────────────────────────────────────────────
  selecionarDia(dia: number): void {
    this.diaSelecionado.set(dia);
    this.abaModal.set('lista');
    this.resetForm();
  }

  fecharModal(): void {
    this.diaSelecionado.set(null);
    this.erroForm.set('');
    this.resetForm();
  }

  private resetForm(): void {
    this.form = { titulo: '', descricao: '', hora: '', hora_fim: '', tag_cor: 'blue', avisar_whatsapp: false, telefone_whatsapp: '' };
  }

  // ── CRUD ──────────────────────────────────────────────────────
  async salvar(): Promise<void> {
    if (!this.form.titulo.trim()) return;
    this.salvando.set(true);
    this.erroForm.set('');

    const { error } = await this.agendaService.inserir({
      usuario_id:    this.userId(),
      titulo:        this.form.titulo.trim(),
      descricao:     this.form.descricao.trim(),
      data_evento:   this.diaKey(this.diaSelecionado()!),
      hora_evento:   this.form.hora || null,
      hora_fim:      this.form.hora_fim.trim() || null,
      tag_cor:       this.form.tag_cor,
      notificar_wpp: this.form.avisar_whatsapp,
      telefone_wpp:  this.form.telefone_whatsapp.trim(),
    });

    if (error) {
      this.erroForm.set('Erro ao salvar. Tente novamente.');
    } else {
      await this.carregarMes();
      this.abaModal.set('lista');
      this.resetForm();
    }
    this.salvando.set(false);
  }

  async excluir(id: string): Promise<void> {
    this.eventos.update(ev => ev.filter(e => e.id !== id));
    await this.agendaService.excluir(id);
  }

  // ── Helpers ───────────────────────────────────────────────────
  diaKey(dia: number): string {
    const m = String(this.mesAtual() + 1).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    return `${this.anoAtual()}-${m}-${d}`;
  }

  eventosNoDia(dia: number): AgendaEvento[] {
    return this.eventosPorDia().get(this.diaKey(dia)) ?? [];
  }

  tag(cor: string) {
    return TAG[(cor as TagCor)] ?? TAG['blue'];
  }

  getCelulaClasse(dia: number): string {
    const isHoje = dia === this.hoje.getDate()
      && this.mesAtual() === this.hoje.getMonth()
      && this.anoAtual() === this.hoje.getFullYear();
    const isSelecionado = dia === this.diaSelecionado();

    if (isSelecionado) return 'bg-indigo-600 text-white';
    if (isHoje)        return 'bg-indigo-50 text-indigo-700 font-black ring-2 ring-indigo-300';
    return 'bg-white text-gray-700 hover:bg-gray-50';
  }
}
