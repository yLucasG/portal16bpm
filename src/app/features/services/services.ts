import { Component } from '@angular/core';

@Component({
  selector: 'app-services',
  template: `
    <div class="px-4 pt-6 pb-24">
      <h1 class="text-xl font-bold text-gray-900 mb-1">Serviços</h1>
      <p class="text-sm text-gray-500 mb-6">Ferramentas disponíveis</p>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center gap-3 active:scale-95 transition-transform cursor-pointer">
          <span class="text-4xl">✅</span>
          <span class="text-sm font-semibold text-gray-700">Checklists</span>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center gap-3 active:scale-95 transition-transform cursor-pointer">
          <span class="text-4xl">📊</span>
          <span class="text-sm font-semibold text-gray-700">Relatórios</span>
        </div>
      </div>
    </div>
  `,
})
export class Services {}
