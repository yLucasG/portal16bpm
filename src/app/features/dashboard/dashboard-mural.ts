import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  categoryCls: string;
  borderCls: string;
  summary: string;
  urgent: boolean;
}

// Tailwind classes usadas nas classes dinâmicas abaixo (garante detecção no scan)
// border-l-blue-500 border-l-indigo-500 border-l-amber-500 border-l-slate-400
// bg-blue-50 border-blue-200 text-blue-700
// bg-indigo-50 border-indigo-200 text-indigo-700
// bg-amber-50 border-amber-200 text-amber-700
// bg-slate-100 border-slate-200 text-slate-600

const NEWS: NewsItem[] = [
  {
    id: 1,
    title: 'Foco na Operação Patrulha do Bairro',
    date: 'Hoje',
    category: 'Operacional',
    borderCls: 'border-l-blue-500',
    categoryCls: 'bg-blue-50 border border-blue-200 text-blue-700',
    summary:
      'Atenção redobrada na saturação do centro comercial e monitoramento das praças. Efetivo deve manter postura ativa e visível durante todo o turno.',
    urgent: true,
  },
  {
    id: 2,
    title: 'Reunião de Planejamento Operacional — Semana 25',
    date: 'Ontem',
    category: 'Planejamento',
    borderCls: 'border-l-indigo-500',
    categoryCls: 'bg-indigo-50 border border-indigo-200 text-indigo-700',
    summary:
      'O planejamento das ações da próxima semana ocorrerá conforme diretriz da DPO. Todos os Ofcs. de Operações devem participar e apresentar relatório de turno.',
    urgent: false,
  },
  {
    id: 3,
    title: 'Alerta: Elevação de CVP na Área do Bairro do Recife',
    date: '10 Jun',
    category: 'Inteligência',
    borderCls: 'border-l-amber-500',
    categoryCls: 'bg-amber-50 border border-amber-200 text-amber-700',
    summary:
      'Indicadores apontam aumento de roubos a ônibus e ao comércio. Acionar ROCAM nas ocorrências e saturar pontos críticos identificados no mapa de calor.',
    urgent: true,
  },
  {
    id: 4,
    title: 'Escala de Serviço — Mês de Junho Publicada',
    date: '08 Jun',
    category: 'Administração',
    borderCls: 'border-l-slate-400',
    categoryCls: 'bg-slate-100 border border-slate-200 text-slate-600',
    summary:
      'A escala mensal de junho foi publicada. Verificar no Livro de Partes as alterações e inclusões aprovadas pela Administração do Batalhão.',
    urgent: false,
  },
];

@Component({
  selector: 'app-dashboard-mural',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 pb-24">

      <!-- ════════════════════════════════════════════════════════
           HEADER — Painel de Comando
      ════════════════════════════════════════════════════════ -->
      <div class="bg-gradient-to-br from-slate-900 to-blue-950 px-4 pt-6 pb-10 rounded-b-3xl">

        <!-- Barra superior: badge + data -->
        <div class="flex items-center justify-between mb-7">
          <div class="flex items-center gap-3">
            <!-- Badge 16º BPM -->
            <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/50">
              <span class="text-white text-sm font-black tracking-tight">16</span>
            </div>
            <div>
              <p class="text-blue-400 text-[9px] font-bold uppercase tracking-[0.18em] leading-none">16º BPM</p>
              <p class="text-white text-xs font-semibold leading-tight mt-0.5">Batalhão Frei Caneca</p>
            </div>
          </div>

          <!-- Data atual -->
          <div class="text-right">
            <p class="text-slate-300 text-[11px] font-medium">{{ today }}</p>
          </div>
        </div>

        <!-- Saudação dinâmica -->
        <div class="mb-3">
          <p class="text-slate-400 text-sm font-medium leading-none">{{ greeting }},</p>
          <h1 class="text-white text-[28px] font-black tracking-tight leading-tight mt-1">Oficial</h1>
        </div>

        <!-- Cadeia hierárquica -->
        <p class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
          SDS · PMPE · DPO · DIM · 16º BPM
        </p>

        <!-- Status pills -->
        <div class="flex items-center gap-2 mt-4 flex-wrap">
          <div class="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            <span class="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Portal Ativo</span>
          </div>
          <div class="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-slate-400 text-[10px] font-semibold">Turno em andamento</span>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════
           CONTEÚDO
      ════════════════════════════════════════════════════════ -->
      <div class="px-4 pt-5 space-y-6">

        <!-- ── INDICADORES RÁPIDOS ────────────────────────────── -->
        <div>
          <div class="flex items-baseline justify-between mb-3">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Indicadores</p>
            <span class="text-[10px] text-slate-300 font-medium">2º Trimestre · 2026</span>
          </div>

          <div class="grid grid-cols-2 gap-3">

            <!-- META MVI -->
            <div class="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-emerald-400 p-4">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Meta MVI</p>
                  <p class="text-[9px] text-slate-300 mt-0.5">Trimestre</p>
                </div>
                <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <p class="text-[22px] font-black text-emerald-500 leading-none mb-2.5">↓ 68%</p>
              <div class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></div>
                <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Atingida</span>
              </div>
            </div>

            <!-- META CVP -->
            <div class="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-emerald-400 p-4">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Meta CVP</p>
                  <p class="text-[9px] text-slate-300 mt-0.5">Trimestre</p>
                </div>
                <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <p class="text-[22px] font-black text-emerald-500 leading-none mb-2.5">↓ 68%</p>
              <div class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></div>
                <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Atingida</span>
              </div>
            </div>

            <!-- VIATURAS ATIVAS -->
            <div class="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-amber-400 p-4">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Viaturas</p>
                  <p class="text-[9px] text-slate-300 mt-0.5">Ativas hoje</p>
                </div>
                <svg class="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l4.5-2.5"/>
                </svg>
              </div>
              <p class="text-[22px] font-black text-amber-500 leading-none mb-2.5">12/15</p>
              <div class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></div>
                <span class="text-[10px] font-bold text-amber-600 uppercase tracking-wide">80% disp.</span>
              </div>
            </div>

            <!-- EFETIVO EM SERVIÇO -->
            <div class="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-blue-400 p-4">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Efetivo</p>
                  <p class="text-[9px] text-slate-300 mt-0.5">Em serviço</p>
                </div>
                <svg class="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <p class="text-[22px] font-black text-blue-500 leading-none mb-2.5">24 PM</p>
              <div class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Escala OK</span>
              </div>
            </div>

          </div>
        </div>

        <!-- ── FEED DE NOTÍCIAS ───────────────────────────────── -->
        <div>
          <div class="flex items-baseline justify-between mb-3">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Diretrizes do Comando</p>
            <span class="text-[10px] text-slate-300 font-medium">{{ newsItems.length }} publicações</span>
          </div>

          <div class="space-y-3">
            @for (item of newsItems; track item.id) {

              <div class="bg-white rounded-2xl border border-slate-200 border-l-4 p-4"
                   [class]="item.borderCls">

                <!-- Badges + data -->
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  @if (item.urgent) {
                    <span class="px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-[9px] font-bold uppercase tracking-wider">
                      ● Urgente
                    </span>
                  }
                  <span class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                        [class]="item.categoryCls">
                    {{ item.category }}
                  </span>
                  <span class="ml-auto text-[10px] text-slate-400 font-medium flex-shrink-0">{{ item.date }}</span>
                </div>

                <!-- Título -->
                <p class="text-sm font-bold text-slate-800 leading-snug mb-1.5">{{ item.title }}</p>

                <!-- Resumo -->
                <p class="text-xs text-slate-500 leading-relaxed">{{ item.summary }}</p>

              </div>

            }
          </div>
        </div>

        <!-- ── MÓDULOS DO BATALHÃO ──────────────────────── -->
        <div>
          <div class="flex items-baseline justify-between mb-3">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Módulos do Batalhão</p>
            <span class="text-[10px] text-slate-300 font-medium">16º BPM</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">

            <!-- Material Bélico -->
            <a routerLink="/modules/material-belico"
               class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                </svg>
              </div>
              <p class="text-[11px] font-semibold text-slate-700 text-center leading-tight">Material Bélico</p>
            </a>

            <!-- Almoxarifado -->
            <a routerLink="/modules/almoxarifado"
               class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
                </svg>
              </div>
              <p class="text-[11px] font-semibold text-slate-700 text-center leading-tight">Almoxarifado</p>
            </a>

            <!-- 1ª Cia -->
            <a routerLink="/modules/1a-cia"
               class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
                </svg>
              </div>
              <p class="text-[11px] font-semibold text-slate-700 text-center leading-tight">1ª Cia</p>
            </a>

            <!-- 2ª Cia -->
            <a routerLink="/modules/2a-cia"
               class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
                </svg>
              </div>
              <p class="text-[11px] font-semibold text-slate-700 text-center leading-tight">2ª Cia</p>
            </a>

            <!-- 3ª Cia -->
            <a routerLink="/modules/3a-cia"
               class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <div class="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
                <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
                </svg>
              </div>
              <p class="text-[11px] font-semibold text-slate-700 text-center leading-tight">3ª Cia</p>
            </a>

            <!-- SSTran -->
            <a routerLink="/modules/sstran"
               class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <div class="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
                </svg>
              </div>
              <p class="text-[11px] font-semibold text-slate-700 text-center leading-tight">SSTran</p>
            </a>

            <!-- Inteligência -->
            <a routerLink="/modules/inteligencia"
               class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <div class="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <p class="text-[11px] font-semibold text-slate-700 text-center leading-tight">Inteligência</p>
            </a>

          </div>
        </div>

        <!-- Rodapé institucional -->
        <div class="flex items-center gap-3 py-2">
          <div class="flex-1 h-px bg-slate-200"></div>
          <p class="text-[10px] text-slate-300 font-semibold uppercase tracking-widest text-center">
            16º BPM · Segurança, Paz e Ordem
          </p>
          <div class="flex-1 h-px bg-slate-200"></div>
        </div>

      </div>
    </div>
  `,
})
export class DashboardMural {
  readonly newsItems: NewsItem[] = NEWS;

  readonly greeting = (() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Bom dia';
    if (h >= 12 && h < 18) return 'Boa tarde';
    return 'Boa noite';
  })();

  readonly today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).replace(/^./, c => c.toUpperCase());
}
