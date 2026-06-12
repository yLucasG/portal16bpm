import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChecklistItem, SERVICES, ServiceDef } from '../services.data';

interface ChecklistGroup {
  category: string;
  items: ChecklistItem[];
}

const ESSENTIAL_LINKS = [
  {
    label: 'Portal PMPE',
    url: 'https://portalpmpe.sistemas.pm.pe.gov.br/login',
    img: 'portalpmpe.png',
  },
  {
    label: 'Autovision SDS',
    url: 'https://www.autovision.com.br/sds/index.php',
    img: 'autovision.png',
  },
  {
    label: 'Power BI SDS',
    url: 'https://powerbi.pe.gov.br/relatorios/browse/SDS/GGACE',
    img: 'powerbi.png',
  },
];

@Component({
  selector: 'app-service-detail',
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
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-0.5">
            Serviços
          </p>
          <p class="font-bold text-gray-900 text-sm leading-tight truncate">
            {{ service()?.name }}
          </p>
        </div>
        @if (completedCount() > 0) {
          <button
            (click)="resetAll()"
            class="text-xs text-gray-400 font-medium px-3 py-1.5 rounded-lg bg-gray-50 active:bg-gray-100 transition-colors flex-shrink-0"
          >
            Limpar
          </button>
        }
      </div>

      <!-- Progress bar section -->
      <div class="bg-white px-4 pt-4 pb-5 border-b border-gray-100">
        <div class="flex items-center justify-between mb-2.5">
          <div>
            <p class="text-sm font-semibold text-gray-700">Progresso do serviço</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ today }}</p>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold leading-none"
               [class.text-green-500]="progress() === 100"
               [class.text-indigo-600]="progress() < 100">
              {{ completedCount() }}<span class="text-sm font-medium text-gray-300">/{{ totalCount() }}</span>
            </p>
            <p class="text-[10px] text-gray-400 mt-0.5">concluídos</p>
          </div>
        </div>

        <!-- Bar -->
        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out"
            [class.bg-green-500]="progress() === 100"
            [class.bg-indigo-500]="progress() < 100"
            [style.width.%]="progress()"
          ></div>
        </div>

        @if (progress() === 100) {
          <p class="text-center text-xs font-semibold text-green-500 mt-2.5">
            ✓ Todos os itens concluídos!
          </p>
        }
      </div>

      <!-- Body content -->
      <div class="px-4 pt-5 space-y-5">

        <!-- Sistemas Essenciais card -->
        <div class="rounded-2xl overflow-hidden shadow-sm border border-indigo-100">
          <!-- Card header -->
          <div class="bg-indigo-600 px-4 py-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="text-sm font-bold text-white tracking-tight">Sistemas Essenciais</span>
            <svg class="w-3.5 h-3.5 text-indigo-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>

          <!-- Links grid -->
          <div class="bg-white p-3 grid grid-cols-3 gap-2">
            @for (link of essentialLinks; track link.label) {
              <a
                [href]="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 active:bg-indigo-50 active:scale-95 transition-all"
              >
                <img [src]="link.img" [alt]="link.label"
                     class="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                <span class="text-[10px] font-semibold text-gray-600 text-center leading-tight">
                  {{ link.label }}
                </span>
              </a>
            }
          </div>
        </div>

        <!-- Checklist groups -->
        @for (group of groupedItems(); track group.category) {
          <div>
            <!-- Category label -->
            <div class="flex items-center gap-2 mb-2">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {{ group.category }}
              </p>
              <div class="flex-1 h-px bg-gray-100"></div>
              <span class="text-[10px] font-semibold text-gray-300">
                {{ countCheckedInGroup(group.items) }}/{{ group.items.length }}
              </span>
            </div>

            <!-- Items card -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              @for (item of group.items; track item.id) {
                <button
                  (click)="toggle(item.id)"
                  class="w-full flex items-center gap-3.5 px-4 py-3.5 text-left active:bg-gray-50 transition-colors"
                >
                  <!-- Custom circular checkbox -->
                  <div
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    [class.bg-green-500]="checked()[item.id]"
                    [class.border-green-500]="checked()[item.id]"
                    [class.border-gray-200]="!checked()[item.id]"
                  >
                    @if (checked()[item.id]) {
                      <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    }
                  </div>

                  <!-- Label -->
                  <span
                    class="text-sm flex-1 leading-snug transition-colors duration-200"
                    [class.text-gray-700]="!checked()[item.id]"
                    [class.text-gray-300]="checked()[item.id]"
                    [class.line-through]="checked()[item.id]"
                  >
                    {{ item.label }}
                  </span>
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ServiceDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly essentialLinks = ESSENTIAL_LINKS;

  service = signal<ServiceDef | null>(null);
  checked = signal<Record<string, boolean>>({});

  readonly completedCount = computed(() =>
    Object.values(this.checked()).filter(Boolean).length
  );
  readonly totalCount = computed(() => this.service()?.checklistItems.length ?? 0);
  readonly progress = computed(() =>
    this.totalCount() > 0 ? (this.completedCount() / this.totalCount()) * 100 : 0
  );

  readonly groupedItems = computed((): ChecklistGroup[] => {
    const svc = this.service();
    if (!svc) return [];
    const map = new Map<string, ChecklistItem[]>();
    for (const item of svc.checklistItems) {
      const group = map.get(item.category) ?? [];
      group.push(item);
      map.set(item.category, group);
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  });

  readonly today = new Date()
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^./, c => c.toUpperCase());

  private storageKey = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const svc = SERVICES.find(s => s.id === id);
    if (!svc) {
      this.router.navigate(['/services']);
      return;
    }
    this.service.set(svc);

    const date = new Date().toISOString().split('T')[0];
    this.storageKey = `checklist_${id}_${date}`;

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) this.checked.set(JSON.parse(saved));
    } catch {
      // localStorage unavailable — state won't persist
    }
  }

  toggle(itemId: string): void {
    const updated = { ...this.checked(), [itemId]: !this.checked()[itemId] };
    this.checked.set(updated);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  resetAll(): void {
    this.checked.set({});
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // ignore
    }
  }

  countCheckedInGroup(items: ChecklistItem[]): number {
    const state = this.checked();
    return items.filter(i => state[i.id]).length;
  }
}
