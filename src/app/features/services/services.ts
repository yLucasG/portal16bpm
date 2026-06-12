import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SERVICES, ServiceDef } from './services.data';

@Component({
  selector: 'app-services',
  template: `
    <div class="px-4 pt-6 pb-24">

      <!-- Page header -->
      <div class="mb-6">
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">Serviços</h1>
        <p class="text-sm text-gray-400 mt-0.5">{{ today }}</p>
      </div>

      <!-- Section label -->
      <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        Selecione o serviço do dia
      </p>

      <!-- Service cards -->
      <div class="space-y-3">
        @for (service of services; track service.id) {
          <button
            (click)="navigate(service.id)"
            class="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
          >
            <!-- Icon -->
            <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl flex-shrink-0 select-none">
              {{ service.emoji }}
            </div>

            <!-- Text -->
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

            <!-- Chevron -->
            <svg class="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        }
      </div>

      <!-- Footer note -->
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
