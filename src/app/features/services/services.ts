import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SERVICES, ServiceDef } from './services.data';

@Component({
  selector: 'app-services',
  imports: [RouterLink],
  template: `
    <div class="px-4 pt-6 pb-24">

      <!-- Page header -->
      <div class="mb-6">
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">Serviços</h1>
        <p class="text-sm text-gray-400 mt-0.5">{{ today }}</p>
      </div>

      <!-- ── SERVIÇOS DO DIA ─────────────────────────── -->
      <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        Serviço do dia
      </p>

      <div class="space-y-3">
        @for (service of services; track service.id) {
          <button
            (click)="navigate(service.id)"
            class="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
          >
            <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl flex-shrink-0 select-none">
              {{ service.emoji }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 text-sm leading-snug">{{ service.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5 leading-snug">{{ service.subtitle }}</p>
              <div class="flex items-center gap-1 mt-2">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                <span class="text-xs text-indigo-500 font-medium">
                  {{ service.checklistItems.length }} itens no checklist
                </span>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        }
      </div>

      <!-- ── FERRAMENTAS ──────────────────────────────── -->
      <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-7 mb-3">
        Ferramentas
      </p>

      <div class="space-y-3">

      <!-- Card: Checklists Operacionais -->
      <a
        routerLink="/checklists"
        class="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 active:scale-[0.98] transition-transform"
      >
        <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 text-sm leading-snug">Checklists Operacionais</p>
          <p class="text-xs text-gray-400 mt-0.5">Passos do serviço com persistência</p>
          <div class="flex items-center gap-1 mt-2">
            <div class="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
            <span class="text-xs text-indigo-500 font-medium">Salvo automaticamente</span>
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </a>

      <!-- Card: Relatórios de Serviço -->
      <a
        routerLink="/reports"
        class="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 active:scale-[0.98] transition-transform"
      >
        <!-- Ícone com gradiente verde WhatsApp -->
        <div class="w-12 h-12 rounded-xl bg-[#e9fdf1] flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 text-sm leading-snug">Relatórios de Serviço</p>
          <p class="text-xs text-gray-400 mt-0.5">Gerar e enviar via WhatsApp</p>
          <div class="flex items-center gap-1 mt-2">
            <div class="w-1.5 h-1.5 rounded-full bg-green-400"></div>
            <span class="text-xs text-green-500 font-medium">3 tipos de relatório</span>
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </a>

      </div><!-- /space-y-3 ferramentas -->

      <p class="text-center text-xs text-gray-300 mt-8">
        O progresso do checklist é salvo automaticamente por dia.
      </p>
    </div>
  `,
})
export class Services {
  private readonly router = inject(Router);

  readonly services: ServiceDef[] = SERVICES;

  readonly today = new Date()
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/^./, c => c.toUpperCase());

  navigate(id: string) {
    this.router.navigate(['/services', id]);
  }
}
