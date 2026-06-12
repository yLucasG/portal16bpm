import { Component, computed, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OPERATIONAL_CHECKLISTS, OperationalChecklist } from './checklist.data';

const STORAGE_PREFIX = 'op-checklist_';

@Component({
  selector: 'app-service-checklist',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 pb-28">

      <!-- STICKY HEADER -->
      <div class="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <a routerLink="/services"
           class="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 active:bg-gray-100 transition-colors flex-shrink-0">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Serviços</p>
          <p class="font-bold text-gray-900 text-sm leading-tight">Checklists Operacionais</p>
        </div>

        <!-- Badge de progresso -->
        <div
          class="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold tabular-nums transition-colors"
          [class.bg-green-100]="progress() === 100"
          [class.text-green-700]="progress() === 100"
          [class.bg-indigo-50]="progress() < 100"
          [class.text-indigo-600]="progress() < 100"
        >
          {{ completedCount() }}/{{ totalCount() }}
        </div>
      </div>

      <div class="px-4 pt-5 space-y-5">

        <!-- SELETOR DE SERVIÇO (aparece só se houver mais de um) -->
        @if (checklists.length > 1) {
          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Tipo de Serviço
            </label>
            <div class="relative">
              <select
                (change)="onServiceChange($event)"
                class="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none pr-10"
              >
                @for (c of checklists; track c.serviceId) {
                  <option [value]="c.serviceId" [selected]="c.serviceId === activeServiceId()">
                    {{ c.emoji }} {{ c.serviceName }}
                  </option>
                }
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </div>
        }

        <!-- CARD DO SERVIÇO ATIVO -->
        @if (activeChecklist(); as checklist) {

          <!-- Header do serviço -->
          <div class="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
            <span class="text-2xl select-none">{{ checklist.emoji }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-900 text-sm leading-snug">{{ checklist.serviceName }}</p>
              <p class="text-[11px] text-gray-400 mt-0.5">Checklist de assunção de serviço</p>
            </div>
          </div>

          <!-- BARRA DE PROGRESSO -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
            <div class="flex items-center justify-between mb-2.5">
              <p class="text-xs font-semibold text-gray-600">Progresso</p>
              <p class="text-xs font-bold"
                 [class.text-green-500]="progress() === 100"
                 [class.text-indigo-600]="progress() < 100">
                {{ completedCount() }} de {{ totalCount() }} concluídos
              </p>
            </div>

            <!-- Barra linear -->
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                class="h-full rounded-full transition-all duration-500 ease-out"
                [class.bg-green-500]="progress() === 100"
                [class.bg-indigo-500]="progress() < 100"
                [style.width.%]="progress()"
              ></div>
            </div>

            <!-- Dots indicadores por passo -->
            <div class="flex gap-2">
              @for (step of checklist.steps; track step.id; let i = $index) {
                <div
                  class="flex-1 h-1.5 rounded-full transition-all duration-300"
                  [class.bg-green-400]="checked()[step.id]"
                  [class.bg-gray-200]="!checked()[step.id]"
                ></div>
              }
            </div>

            @if (progress() === 100) {
              <p class="text-center text-xs font-bold text-green-500 mt-3">
                ✓ Todos os passos concluídos!
              </p>
            }
          </div>

          <!-- LISTA DE PASSOS -->
          <div>
            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Passos do serviço
            </p>

            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              @for (step of checklist.steps; track step.id; let i = $index) {
                <button
                  (click)="toggle(step.id)"
                  class="w-full flex items-start gap-4 px-4 py-4 text-left active:bg-gray-50 transition-colors"
                >
                  <!-- Círculo numerado / check -->
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 font-bold text-sm"
                    [class.bg-green-500]="checked()[step.id]"
                    [class.text-white]="checked()[step.id]"
                    [class.bg-gray-100]="!checked()[step.id]"
                    [class.text-gray-500]="!checked()[step.id]"
                  >
                    @if (checked()[step.id]) {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    } @else {
                      {{ i + 1 }}
                    }
                  </div>

                  <!-- Texto do passo -->
                  <div class="flex-1 min-w-0 py-0.5">
                    <p
                      class="text-sm leading-snug transition-all duration-200"
                      [class.text-gray-800]="!checked()[step.id]"
                      [class.font-medium]="!checked()[step.id]"
                      [class.text-gray-300]="checked()[step.id]"
                      [class.line-through]="checked()[step.id]"
                    >
                      {{ step.label }}
                    </p>
                    <p class="text-[10px] font-semibold mt-1 transition-colors"
                       [class.text-indigo-400]="!checked()[step.id]"
                       [class.text-gray-200]="checked()[step.id]">
                      Passo {{ i + 1 }}
                    </p>
                  </div>

                  <!-- Indicador de estado no lado direito -->
                  <div class="flex-shrink-0 mt-1.5">
                    @if (checked()[step.id]) {
                      <span class="text-[10px] font-bold text-green-400">FEITO</span>
                    } @else {
                      <div class="w-5 h-5 rounded-full border-2 border-gray-200"></div>
                    }
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- NOTA DE PERSISTÊNCIA -->
          <div class="flex items-start gap-2 px-1">
            <svg class="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-[11px] text-gray-400 leading-relaxed">
              O progresso é salvo automaticamente no dispositivo. Se fechar o app e voltar durante o turno, os itens marcados continuarão salvos.
            </p>
          </div>

          <!-- BOTÃO ZERAR CHECKLIST -->
          @if (completedCount() > 0) {
            <button
              (click)="reset()"
              class="w-full py-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-red-200 text-red-400 font-semibold text-sm active:bg-red-50 active:border-red-300 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Zerar Checklist para o próximo serviço
            </button>
          }

        }

      </div>
    </div>
  `,
})
export class ServiceChecklist implements OnInit {
  readonly checklists = OPERATIONAL_CHECKLISTS;

  // Signal do ID de serviço selecionado
  private readonly _activeServiceId = signal(OPERATIONAL_CHECKLISTS[0]?.serviceId ?? '');
  readonly activeServiceId = this._activeServiceId.asReadonly();

  // Signal do mapa de itens marcados { stepId: boolean }
  private readonly _checked = signal<Record<string, boolean>>({});
  readonly checked = this._checked.asReadonly();

  // Computed: checklist ativo
  readonly activeChecklist = computed<OperationalChecklist | null>(
    () => this.checklists.find(c => c.serviceId === this._activeServiceId()) ?? null
  );

  // Computed: contadores e progresso
  readonly totalCount = computed(() => this.activeChecklist()?.steps.length ?? 0);
  readonly completedCount = computed(() =>
    Object.values(this._checked()).filter(Boolean).length
  );
  readonly progress = computed(() =>
    this.totalCount() > 0 ? (this.completedCount() / this.totalCount()) * 100 : 0
  );

  ngOnInit(): void {
    this.loadFromStorage(this._activeServiceId());
  }

  onServiceChange(event: Event): void {
    const serviceId = (event.target as HTMLSelectElement).value;
    this._activeServiceId.set(serviceId);
    this.loadFromStorage(serviceId);
  }

  toggle(stepId: string): void {
    const updated = { ...this._checked(), [stepId]: !this._checked()[stepId] };
    this._checked.set(updated);
    this.saveToStorage(updated);
  }

  reset(): void {
    this._checked.set({});
    try {
      localStorage.removeItem(STORAGE_PREFIX + this._activeServiceId());
    } catch {
      // localStorage indisponível — state-only reset
    }
  }

  private loadFromStorage(serviceId: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + serviceId);
      this._checked.set(raw ? JSON.parse(raw) : {});
    } catch {
      this._checked.set({});
    }
  }

  private saveToStorage(state: Record<string, boolean>): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + this._activeServiceId(), JSON.stringify(state));
    } catch {
      // localStorage cheio ou indisponível — ignora silenciosamente
    }
  }
}
