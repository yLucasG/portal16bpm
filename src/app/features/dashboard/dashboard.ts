import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="px-4 pt-6 pb-24">
      <h1 class="text-xl font-bold text-gray-900 mb-1">Mural de Notícias</h1>
      <p class="text-sm text-gray-500 mb-6">Acompanhe as últimas atualizações</p>

      <div class="space-y-4">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">A</div>
            <div>
              <p class="text-sm font-semibold text-gray-800">Administração</p>
              <p class="text-xs text-gray-400">Hoje</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">Bem-vindo ao Portal 16BPM. As publicações aparecerão aqui.</p>
        </div>
      </div>
    </div>
  `,
})
export class Dashboard {}
