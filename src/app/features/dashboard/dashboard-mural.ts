import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Noticia, NoticiasService } from '../../core/services/noticias.service';
import { SheetRow, SheetsService } from '../../core/services/sheets.service';

// Avatar colors — full strings aqui garantem detecção pelo scanner do Tailwind v4:
// bg-blue-500 bg-indigo-500 bg-violet-500 bg-teal-500 bg-emerald-500 bg-amber-500
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-amber-500',
];

const MASTER_ADMIN_EMAIL = '1263722@portal16bpm.com';

@Component({
  selector: 'app-dashboard-mural',
  imports: [RouterLink, FormsModule, DecimalPipe],
  template: `
    <div class="min-h-screen bg-gray-50 pb-24">

      <!-- ════════════════════════════════════════════════════════
           HEADER — Painel de Comando
      ════════════════════════════════════════════════════════ -->
      <div class="bg-gradient-to-br from-slate-900 to-blue-950 px-4 pt-6 pb-10 rounded-b-3xl">

        <div class="flex items-center justify-between mb-7">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/50">
              <span class="text-white text-sm font-black tracking-tight">16</span>
            </div>
            <div>
              <p class="text-blue-400 text-[9px] font-bold uppercase tracking-[0.18em] leading-none">16º BPM</p>
              <p class="text-white text-xs font-semibold leading-tight mt-0.5">Batalhão Frei Caneca</p>
            </div>
          </div>
          <p class="text-slate-300 text-[11px] font-medium">{{ today }}</p>
        </div>

        <div class="mb-3">
          <p class="text-slate-400 text-sm font-medium leading-none">{{ greeting }},</p>
          <h1 class="text-white text-[28px] font-black tracking-tight leading-tight mt-1">
            {{ userNome() }}
          </h1>
        </div>
        <p class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
          SDS · PMPE · DPO · DIM · 16º BPM
        </p>

        <div class="flex items-center gap-2 mt-4 flex-wrap">
          <!-- Portal Ativo com dot pulsante -->
          <div class="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span class="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Portal Ativo</span>
          </div>

          <!-- Tags de operações vindas do Google Sheets -->
          @for (op of sheetsService.operacoesAtivas(); track op.nome) {
            <button
              (click)="abrirOperacao(op)"
              class="flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 rounded-lg px-3 py-1.5 active:scale-95 transition-transform"
            >
              <svg class="w-3 h-3 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span class="text-blue-200 text-[10px] font-bold uppercase tracking-wider max-w-[110px] truncate">
                {{ op.nome }}
              </span>
            </button>
          }
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════
           CONTEÚDO
      ════════════════════════════════════════════════════════ -->
      <div class="px-4 pt-5 space-y-6">

        @if (sheetsErro()) {
          <div class="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div>
              <p class="text-sm font-bold text-red-800">Aviso do Sistema Operacional</p>
              <p class="text-xs text-red-600 mt-0.5">{{ sheetsErro() }}</p>
            </div>
          </div>
        }

        <!-- ── INDICADORES RÁPIDOS ─────────────────────────── -->
        <div>
          <div class="flex items-baseline justify-between mb-3">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Indicadores</p>
            <span class="text-[10px] text-slate-300 font-medium">2º Trimestre · 2026</span>
          </div>
          <div class="grid grid-cols-2 gap-3">

            <!-- CARD MVIs DA SEMANA — clicável -->
            <button
              (click)="showMviModal.set(true)"
              class="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-red-400 p-4 text-left active:scale-95 transition-transform w-full"
            >
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">MVIs</p>
                  <p class="text-[9px] text-slate-300 mt-0.5">Esta semana</p>
                </div>
                <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <p class="text-[22px] font-black leading-none mb-2.5"
                 [class]="sheetsService.mvisAtivos().length > 0 ? 'text-red-500' : 'text-slate-300'">
                {{ sheetsService.mvisAtivos().length > 0 ? sheetsService.mvisAtivos().length : '—' }}
              </p>
              <div class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full"
                     [class]="sheetsService.mvisAtivos().length > 0 ? 'bg-red-400' : 'bg-slate-300'"></div>
                <span class="text-[10px] font-bold uppercase tracking-wide"
                      [class]="sheetsService.mvisAtivos().length > 0 ? 'text-red-600' : 'text-slate-400'">
                  {{ sheetsService.mvisAtivos().length > 0 ? (sheetsService.mvisPresos() + ' preso(s)') : 'Sem dados' }}
                </span>
              </div>
            </button>

            <!-- CARD PRODUÇÃO — clicável -->
            <button
              (click)="showProducaoModal.set(true)"
              class="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-indigo-400 p-4 text-left active:scale-95 transition-transform w-full"
            >
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Produção</p>
                  <p class="text-[9px] text-slate-300 mt-0.5">Este mês</p>
                </div>
                <svg class="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <p class="text-[22px] font-black leading-none mb-2.5"
                 [class]="sheetsService.producaoMetas().total > 0 ? 'text-indigo-500' : 'text-slate-300'">
                @if (sheetsService.producaoMetas().total > 0) {
                  {{ sheetsService.producaoMetas().atingidas }}/{{ sheetsService.producaoMetas().total }}
                } @else {
                  —
                }
              </p>
              <div class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full"
                     [class]="sheetsService.producaoMetas().total > 0 ? 'bg-indigo-400' : 'bg-slate-300'"></div>
                <span class="text-[10px] font-bold uppercase tracking-wide"
                      [class]="sheetsService.producaoMetas().total > 0 ? 'text-indigo-600' : 'text-slate-400'">
                  {{ sheetsService.producaoMetas().total > 0 ? 'Metas atingidas' : 'Sem dados' }}
                </span>
              </div>
            </button>

            <!-- CARD VIATURAS — clicável -->
            <button
              (click)="showViaturaModal.set(true)"
              class="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-amber-400 p-4 text-left active:scale-95 transition-transform w-full"
            >
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
              <p class="text-[22px] font-black text-amber-500 leading-none mb-2.5">
                {{ sheetsService.viaturasAtivas() }} / {{ sheetsService.viaturasTotal() }}
              </p>
              <div class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                <span class="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                  {{ sheetsService.viaturasTotal() > 0 ? 'Ver detalhes' : 'Sem dados' }}
                </span>
              </div>
            </button>

            <!-- CARD EFETIVO — clicável -->
            <button
              (click)="showEfetivoModal.set(true)"
              class="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-blue-400 p-4 text-left active:scale-95 transition-transform w-full"
            >
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
              <p class="text-[22px] font-black text-blue-500 leading-none mb-2.5">
                {{ sheetsService.efetivoTotal() }} PMs
              </p>
              <div class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                  {{ sheetsService.efetivoTotal() > 0 ? 'Ver detalhes' : 'Sem dados' }}
                </span>
              </div>
            </button>

          </div>
        </div>

        <!-- ── FEED DE NOTÍCIAS / PUBLICAR ────────────────────── -->
        <div>
          <div class="flex items-baseline justify-between mb-3">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mural de Alertas</p>
            <span class="text-[10px] text-slate-300 font-medium">{{ feed().length }} publicação(ões)</span>
          </div>

          <!-- Formulário de publicação -->
          <div class="bg-white rounded-2xl border border-slate-200 p-4 mb-4">

            <!-- Cabeçalho do form -->
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                   [class]="avatarColor(userId())">
                {{ userNome()[0]?.toUpperCase() }}
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800 leading-none">{{ userNome() }}</p>
                <p class="text-[10px] text-slate-400 mt-0.5">Publicar para o 16º BPM</p>
              </div>
            </div>

            <!-- Campos -->
            <div class="space-y-2">
              <input
                type="text"
                [(ngModel)]="titulo"
                name="titulo"
                placeholder="Título do alerta ou lembrete..."
                maxlength="120"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-400"
              />
              <textarea
                [(ngModel)]="conteudo"
                name="conteudo"
                rows="3"
                placeholder="Descreva o aviso, lembrete ou diretriz em detalhes..."
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            <!-- Erro de publicação -->
            @if (erroForm()) {
              <p class="text-xs text-red-500 mt-2">{{ erroForm() }}</p>
            }

            <!-- Botão publicar -->
            <div class="flex justify-end mt-3">
              <button
                (click)="publicarNoticia()"
                [disabled]="publicando() || !titulo.trim() || !conteudo.trim()"
                class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95 disabled:opacity-40 transition-all"
              >
                @if (publicando()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
                  </svg>
                }
                {{ publicando() ? 'Publicando...' : 'Publicar Alerta' }}
              </button>
            </div>
          </div>

          <!-- Estado: carregando -->
          @if (feedLoading()) {
            <div class="space-y-3">
              @for (_ of [1, 2]; track $index) {
                <div class="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-9 h-9 rounded-full bg-slate-200"></div>
                    <div class="space-y-1.5 flex-1">
                      <div class="h-3 bg-slate-200 rounded w-1/3"></div>
                      <div class="h-2 bg-slate-100 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div class="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div class="h-3 bg-slate-100 rounded w-full mb-1"></div>
                  <div class="h-3 bg-slate-100 rounded w-4/5"></div>
                </div>
              }
            </div>
          }

          <!-- Estado: erro -->
          @if (!feedLoading() && feedErro()) {
            <div class="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <svg class="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              <p class="text-sm font-semibold text-red-700 mb-1">Erro ao carregar publicações</p>
              <p class="text-xs text-red-500 mb-3">{{ feedErro() }}</p>
              <button (click)="carregarNoticias()"
                      class="text-xs font-bold text-red-600 underline">Tentar novamente</button>
            </div>
          }

          <!-- Estado: sem publicações -->
          @if (!feedLoading() && !feedErro() && feed().length === 0) {
            <div class="bg-white border border-slate-200 rounded-2xl p-6 text-center">
              <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
              </svg>
              <p class="text-sm font-semibold text-slate-500">Nenhuma publicação ainda</p>
              <p class="text-xs text-slate-400 mt-1">Seja o primeiro a publicar um alerta para o batalhão.</p>
            </div>
          }

          <!-- Lista de notícias -->
          @if (!feedLoading() && !feedErro() && feed().length > 0) {
            <div class="space-y-3">
              @for (item of feed(); track item.id) {
                <div class="bg-white rounded-2xl border border-slate-200 p-4">

                  <!-- Header do card -->
                  <div class="flex items-start justify-between mb-3">

                    <!-- Avatar + autor + data -->
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                           [class]="avatarColor(item.autor_id)">
                        {{ item.autor_nome[0]?.toUpperCase() }}
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-bold text-slate-800 leading-none truncate">{{ item.autor_nome }}</p>
                        <p class="text-[10px] text-slate-400 mt-0.5">{{ formatarData(item.created_at) }}</p>
                      </div>
                    </div>

                    <!-- Botão excluir (RBAC: autor ou master admin) -->
                    @if (podeExcluir(item)) {
                      <button
                        (click)="excluirNoticia(item.id)"
                        class="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all flex-shrink-0 ml-2"
                        title="Excluir publicação"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    }
                  </div>

                  <!-- Título -->
                  <p class="text-sm font-bold text-slate-800 leading-snug mb-1.5">{{ item.titulo }}</p>

                  <!-- Conteúdo -->
                  <p class="text-xs text-slate-500 leading-relaxed">{{ item.conteudo }}</p>

                </div>
              }
            </div>
          }
        </div>

        <!-- ── MÓDULOS DO BATALHÃO ─────────────────────────── -->
        <div>
          <div class="flex items-baseline justify-between mb-3">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Módulos do Batalhão</p>
            <span class="text-[10px] text-slate-300 font-medium">16º BPM</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">

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

            <!-- P1 — Pessoal -->
            <a routerLink="/modules/p1"
               class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <div class="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/>
                </svg>
              </div>
              <p class="text-[11px] font-semibold text-slate-700 text-center leading-tight">P1 — Pessoal</p>
            </a>

            <!-- P3 — Operações -->
            <a routerLink="/modules/p3"
               class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <div class="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
                <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
                </svg>
              </div>
              <p class="text-[11px] font-semibold text-slate-700 text-center leading-tight">P3 — Operações</p>
            </a>

            <!-- P4 — Logística -->
            <a routerLink="/modules/p4"
               class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <div class="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>
                </svg>
              </div>
              <p class="text-[11px] font-semibold text-slate-700 text-center leading-tight">P4 — Logística</p>
            </a>

            <!-- Arquivo -->
            <a routerLink="/modules/arquivo"
               class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <div class="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center">
                <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
                </svg>
              </div>
              <p class="text-[11px] font-semibold text-slate-700 text-center leading-tight">Arquivo</p>
            </a>

          </div>
        </div>

        <!-- Rodapé -->
        <div class="flex items-center gap-3 py-2">
          <div class="flex-1 h-px bg-slate-200"></div>
          <p class="text-[10px] text-slate-300 font-semibold uppercase tracking-widest text-center">
            16º BPM · Segurança, Paz e Ordem
          </p>
          <div class="flex-1 h-px bg-slate-200"></div>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════
         MODAL — MVIs da Semana
    ══════════════════════════════════════════ -->
    @if (showMviModal()) {
      <div class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
           style="background:rgba(15,23,42,0.88);backdrop-filter:blur(6px)"
           (click)="showMviModal.set(false)">
        <div class="bg-white w-full sm:max-w-sm sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="bg-gradient-to-br from-red-600 to-rose-700 px-5 pt-6 pb-5 flex items-center gap-3 flex-shrink-0">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <p class="text-white font-bold text-base leading-none">MVIs da Semana</p>
              <p class="text-rose-200 text-xs mt-0.5">
                {{ sheetsService.mvisAtivos().length }} caso(s) · {{ sheetsService.mvisPresos() }} preso(s)
              </p>
            </div>
          </div>

          <!-- Lista -->
          <div class="overflow-y-auto flex-1">
            @if (sheetsService.mvisAtivos().length === 0) {
              <div class="p-8 text-center">
                <svg class="w-10 h-10 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm font-semibold text-slate-400">Nenhum MVI registrado</p>
                <p class="text-xs text-slate-300 mt-1">Preencha a aba Dados_MVI na planilha</p>
              </div>
            } @else {
              <div class="divide-y divide-slate-100">
                @for (mvi of sheetsService.mvisAtivos(); track $index) {
                  <div class="px-5 py-4">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-slate-800 leading-snug truncate">{{ mvi['vitima'] || '—' }}</p>
                        <p class="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <span class="truncate">{{ mvi['local'] || '—' }}</span>
                        </p>
                      </div>
                      <!-- Badge preso -->
                      @if (mvi['preso']?.toLowerCase()?.startsWith('s')) {
                        <span class="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                          Preso
                        </span>
                      } @else {
                        <span class="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-red-100 text-red-600 uppercase tracking-wide">
                          Em aberto
                        </span>
                      }
                    </div>
                    <!-- Motivo + data -->
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            [style.background]="getMotivoColor(mvi['motivo']).bg"
                            [style.color]="getMotivoColor(mvi['motivo']).text">
                        {{ mvi['motivo'] || 'Não informado' }}
                      </span>
                      @if (mvi['data']) {
                        <span class="text-[10px] text-slate-400">{{ mvi['data'] }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="p-4 flex-shrink-0 border-t border-slate-100">
            <button (click)="showMviModal.set(false)"
                    class="w-full py-3 border-2 border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl active:bg-slate-50 transition-colors">
              Fechar
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ══════════════════════════════════════════
         MODAL — Produção do Mês
    ══════════════════════════════════════════ -->
    @if (showProducaoModal()) {
      <div class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
           style="background:rgba(15,23,42,0.88);backdrop-filter:blur(6px)"
           (click)="showProducaoModal.set(false)">
        <div class="bg-white w-full sm:max-w-sm sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="bg-gradient-to-br from-indigo-600 to-violet-700 px-5 pt-6 pb-5 flex items-center gap-3 flex-shrink-0">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div>
              <p class="text-white font-bold text-base leading-none">Produção do Mês</p>
              <p class="text-indigo-200 text-xs mt-0.5">
                {{ sheetsService.producaoMetas().atingidas }}/{{ sheetsService.producaoMetas().total }} metas atingidas
              </p>
            </div>
          </div>

          <!-- Lista -->
          <div class="overflow-y-auto flex-1">
            @if (sheetsService.producaoDados().length === 0) {
              <div class="p-8 text-center">
                <svg class="w-10 h-10 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10"/>
                </svg>
                <p class="text-sm font-semibold text-slate-400">Sem dados de produção</p>
                <p class="text-xs text-slate-300 mt-1">Preencha a aba Dados_Producao na planilha</p>
              </div>
            } @else {
              <div class="p-4 space-y-3">
                @for (item of sheetsService.producaoDados(); track $index) {
                  <div class="bg-slate-50 rounded-2xl p-4">
                    <div class="flex items-center justify-between mb-2">
                      <p class="text-sm font-bold text-slate-800 leading-none">{{ item['categoria'] || '—' }}</p>
                      <div class="flex items-center gap-1.5">
                        <span class="text-sm font-black"
                              [style.color]="getProducaoColor(item)">
                          {{ item['quantidade'] || '0' }}
                        </span>
                        @if (item['meta'] && item['meta'] !== '0') {
                          <span class="text-xs text-slate-400">/ {{ item['meta'] }} {{ item['unidade'] || '' }}</span>
                        } @else {
                          <span class="text-xs text-slate-400">{{ item['unidade'] || '' }}</span>
                        }
                      </div>
                    </div>
                    @if (item['meta'] && item['meta'] !== '0') {
                      <!-- Barra de progresso vs meta -->
                      <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500"
                             [style.width]="getProducaoProgress(item) + '%'"
                             [style.background]="getProducaoColor(item)">
                        </div>
                      </div>
                      <div class="flex items-center justify-between mt-1.5">
                        <span class="text-[10px] text-slate-400">Meta: {{ item['meta'] }} {{ item['unidade'] || '' }}</span>
                        <span class="text-[10px] font-bold"
                              [style.color]="getProducaoColor(item)">
                          {{ getProducaoProgress(item) | number:'1.0-0' }}%
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="p-4 flex-shrink-0 border-t border-slate-100">
            <button (click)="showProducaoModal.set(false)"
                    class="w-full py-3 border-2 border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl active:bg-slate-50 transition-colors">
              Fechar
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ══════════════════════════════════════════
         MODAL — Operação (tag clicada no header)
    ══════════════════════════════════════════ -->
    @if (modalOperacao(); as op) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center px-4"
           style="background:rgba(15,23,42,0.88);backdrop-filter:blur(6px)"
           (click)="modalOperacao.set(null)">
        <div class="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="bg-gradient-to-br from-slate-900 to-blue-950 px-6 pt-8 pb-6 text-center">
            <div class="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h2 class="text-white text-base font-bold leading-tight">{{ op['nome'] }}</h2>
            <p class="text-blue-300 text-[10px] font-bold uppercase tracking-widest mt-1">Operação em Curso</p>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-3">
            <div class="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3.5">
              <div class="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Área / Cia</p>
                <p class="text-sm font-semibold text-slate-800 mt-0.5">{{ op['area'] || op['cia'] || op['local'] || 'Não informado' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 bg-blue-50 rounded-2xl px-4 py-3.5">
              <div class="w-8 h-8 rounded-xl bg-blue-200 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-[10px] font-bold text-blue-500 uppercase tracking-wider leading-none">PMs Empenhados</p>
                <p class="text-sm font-black text-blue-800 mt-0.5">{{ op['pms'] || op['efetivo'] || op['quantidade'] || '0' }} PMs</p>
              </div>
            </div>
            <button (click)="modalOperacao.set(null)"
                    class="w-full py-3 border-2 border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl active:bg-slate-50 transition-colors">
              Fechar
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ══════════════════════════════════════════
         MODAL — Viaturas
    ══════════════════════════════════════════ -->
    @if (showViaturaModal()) {
      <div class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
           style="background:rgba(15,23,42,0.88);backdrop-filter:blur(6px)"
           (click)="showViaturaModal.set(false)">
        <div class="bg-white w-full sm:max-w-sm sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="bg-gradient-to-br from-amber-500 to-orange-600 px-5 pt-6 pb-5 flex items-center gap-3 flex-shrink-0">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l4.5-2.5"/>
              </svg>
            </div>
            <div>
              <p class="text-white font-bold text-base leading-none">Viaturas em Serviço</p>
              <p class="text-orange-100 text-xs mt-0.5">{{ sheetsService.viaturas().length }} viatura(s) lançada(s)</p>
            </div>
          </div>

          <!-- Lista -->
          <div class="overflow-y-auto flex-1">
            @if (sheetsService.viaturas().length === 0) {
              <div class="p-6 text-center text-slate-400 text-sm">
                Nenhum dado de viatura na planilha.
              </div>
            } @else {
              <div class="divide-y divide-slate-100">
                @for (v of sheetsService.viaturas(); track v['nome']) {
                  <div class="flex items-center gap-3 px-5 py-3.5">
                    <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l4.5-2.5"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-slate-800 font-mono">{{ v['nome'] }}</p>
                      <p class="text-xs text-slate-400 mt-0.5 truncate">{{ v['local'] || '—' }}</p>
                    </div>
                    <div class="flex items-center gap-1">
                      @if (v['status']?.toLowerCase() === 'baixada') {
                        <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <span class="text-[10px] text-red-600 font-semibold uppercase tracking-wide">Baixada</span>
                      } @else {
                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        <span class="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">Ativa</span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="p-4 flex-shrink-0 border-t border-slate-100">
            <button (click)="showViaturaModal.set(false)"
                    class="w-full py-3 border-2 border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl active:bg-slate-50 transition-colors">
              Fechar
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ══════════════════════════════════════════
         MODAL — Efetivo
    ══════════════════════════════════════════ -->
    @if (showEfetivoModal()) {
      <div class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
           style="background:rgba(15,23,42,0.88);backdrop-filter:blur(6px)"
           (click)="showEfetivoModal.set(false)">
        <div class="bg-white w-full sm:max-w-sm sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 pt-6 pb-5 flex items-center gap-3 flex-shrink-0">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-white font-bold text-base leading-none">Efetivo em Serviço</p>
              <p class="text-blue-200 text-xs mt-0.5">
                {{ sheetsService.efetivoTotal() > 0 ? sheetsService.efetivoTotal() + ' PM no total' : sheetsService.efetivo().length + ' linha(s)' }}
              </p>
            </div>
          </div>

          <!-- Lista -->
          <div class="overflow-y-auto flex-1">
            @if (sheetsService.efetivo().length === 0) {
              <div class="p-6 text-center text-slate-400 text-sm">
                Nenhum dado de efetivo na planilha.
              </div>
            } @else {
              <div class="divide-y divide-slate-100">
                @for (e of sheetsService.efetivo(); track $index) {
                  <div class="flex items-center gap-3 px-5 py-3.5">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-slate-800">{{ e['nome'] || '—' }}</p>
                      <p class="text-xs text-slate-400 mt-0.5 truncate">{{ e['local'] || '—' }}</p>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                      <span class="text-xs font-semibold text-slate-600">{{ e['quantidade'] || '0' }} PM(s)</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Total -->
              @if (sheetsService.efetivoTotal() > 0) {
                <div class="mx-4 my-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <span class="text-xs font-bold text-blue-600 uppercase tracking-wide">Total em serviço</span>
                  <span class="text-sm font-black text-blue-700">{{ sheetsService.efetivoTotal() }} PM</span>
                </div>
              }
            }
          </div>

          <!-- Footer -->
          <div class="p-4 flex-shrink-0 border-t border-slate-100">
            <button (click)="showEfetivoModal.set(false)"
                    class="w-full py-3 border-2 border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl active:bg-slate-50 transition-colors">
              Fechar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DashboardMural implements OnInit, OnDestroy {
  private readonly auth           = inject(AuthService);
  private readonly noticiasService = inject(NoticiasService);
  public readonly sheetsService  = inject(SheetsService);

  // ── Auth state ─────────────────────────────────────────────────
  private readonly user     = computed(() => this.auth.session()?.user ?? null);
  readonly userId           = computed(() => this.user()?.id ?? '');
  readonly userNome         = computed(() => this.user()?.user_metadata?.['nome'] ?? 'Oficial');
  private readonly isMaster = computed(() => this.user()?.email === MASTER_ADMIN_EMAIL);

  // ── Google Sheets ────────────────────────────────────────────────
  readonly sheetsErro = signal<string>('');

  // ── Modais ────────────────────────────────────────────────────────
  readonly modalOperacao    = signal<SheetRow | null>(null);
  readonly showViaturaModal = signal(false);
  readonly showEfetivoModal = signal(false);
  readonly showMviModal     = signal(false);
  readonly showProducaoModal = signal(false);

  private refreshInterval: any;

  // ── Feed ────────────────────────────────────────────────────────
  readonly feed        = signal<Noticia[]>([]);
  readonly feedLoading = signal(true);
  readonly feedErro    = signal('');

  // ── Formulário ──────────────────────────────────────────────────
  titulo   = '';
  conteudo = '';
  readonly publicando = signal(false);
  readonly erroForm   = signal('');

  // ── Saudação e data ─────────────────────────────────────────────
  readonly greeting = (() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Bom dia';
    if (h >= 12 && h < 18) return 'Boa tarde';
    return 'Boa noite';
  })();

  readonly today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).replace(/^./, c => c.toUpperCase());

  // ── Lifecycle ────────────────────────────────────────────────────
  constructor() {
    effect(() => {
      const isAnyModalOpen = this.showViaturaModal() || this.showEfetivoModal() || !!this.modalOperacao() || this.showMviModal() || this.showProducaoModal();
      if (isAnyModalOpen) {
        document.body.classList.add('body-modal-open');
      } else {
        document.body.classList.remove('body-modal-open');
      }
    });
  }

  ngOnInit(): void {
    this.carregarNoticias();
    this.carregarSheets();

    // Auto-refresh dos dados operacionais a cada 60 segundos
    this.refreshInterval = setInterval(() => {
      this.carregarSheets();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // ── Métodos ──────────────────────────────────────────────────────

  // ── Sheets ──────────────────────────────────────────────────────
  async carregarSheets(): Promise<void> {
    try {
      this.sheetsErro.set('');
      await this.sheetsService.buscarTodos();
    } catch (err) {
      this.sheetsErro.set('Não foi possível conectar com a planilha. Verifique sua conexão ou contate o administrador.');
    }
  }

  abrirOperacao(op: SheetRow): void {
    this.modalOperacao.set(op);
  }

  // ── Noticias ────────────────────────────────────────────────────
  async carregarNoticias(): Promise<void> {
    this.feedLoading.set(true);
    this.feedErro.set('');

    const { data, error } = await this.noticiasService.buscarNoticias();

    if (error) {
      this.feedErro.set(error.message ?? 'Erro ao carregar publicações.');
    } else {
      this.feed.set((data as Noticia[]) ?? []);
    }

    this.feedLoading.set(false);
  }

  async publicarNoticia(): Promise<void> {
    const tituloVal   = this.titulo.trim();
    const conteudoVal = this.conteudo.trim();
    if (!tituloVal || !conteudoVal) return;

    this.publicando.set(true);
    this.erroForm.set('');

    const { error } = await this.noticiasService.inserirNoticia(
      tituloVal,
      conteudoVal,
      this.userId(),
      this.userNome(),
    );

    if (error) {
      this.erroForm.set('Erro ao publicar. Verifique sua conexão e tente novamente.');
    } else {
      this.titulo   = '';
      this.conteudo = '';
      await this.carregarNoticias();
    }

    this.publicando.set(false);
  }

  async excluirNoticia(id: string): Promise<void> {
    // Optimistic: remove da lista imediatamente para feedback instantâneo
    this.feed.update(items => items.filter(n => n.id !== id));

    const { error } = await this.noticiasService.deletarNoticia(id);
    if (error) {
      // Reverte se falhar
      await this.carregarNoticias();
    }
  }

  /** Regra de negócio: autor da notícia OU master admin podem excluir. */
  podeExcluir(noticia: Noticia): boolean {
    return noticia.autor_id === this.userId() || this.isMaster();
  }

  /** Formata data relativa amigável em pt-BR. */
  formatarData(dateStr: string): string {
    const date    = new Date(dateStr);
    const diffMs  = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffH   = Math.floor(diffMs / 3_600_000);

    if (diffMin < 1)  return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin} min`;
    if (diffH   < 24) return `Há ${diffH}h`;
    if (diffH   < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  }

  /** Cor de avatar determinística a partir do ID do autor. */
  avatarColor(autorId: string): string {
    let hash = 0;
    for (let i = 0; i < autorId.length; i++) {
      hash = (hash + autorId.charCodeAt(i)) % AVATAR_COLORS.length;
    }
    return AVATAR_COLORS[hash];
  }

  /** Cor inline para badge de motivo do MVI — evita dependência do scanner Tailwind. */
  getMotivoColor(motivo: string): { bg: string; text: string } {
    const m = (motivo ?? '').toLowerCase();
    if (m.includes('fogo') || m.includes('arma de fogo')) return { bg: '#fef2f2', text: '#dc2626' };
    if (m.includes('branca') || m.includes('arma branca'))  return { bg: '#fff7ed', text: '#ea580c' };
    return { bg: '#f8fafc', text: '#64748b' };
  }

  /** Percentual de progresso de um item de produção vs meta (capped 100%). */
  getProducaoProgress(item: Record<string, string>): number {
    const qtd  = Number(item['quantidade']?.replace(',', '.')) || 0;
    const meta = Number(item['meta']?.replace(',', '.'))      || 0;
    if (meta <= 0) return 0;
    return Math.min((qtd / meta) * 100, 100);
  }

  /** Cor inline para barra de progresso de produção. */
  getProducaoColor(item: Record<string, string>): string {
    const pct = this.getProducaoProgress(item);
    if (pct >= 100) return '#22c55e';   // verde: meta atingida
    if (pct >= 60)  return '#f59e0b';   // âmbar: acima de 60%
    return '#6366f1';                   // indigo: abaixo de 60%
  }
}
