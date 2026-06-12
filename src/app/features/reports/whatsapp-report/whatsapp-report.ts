import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

// ─── Textos fixos ────────────────────────────────────────────────────────────

const FOOTER_1 = `TEN CEL PM GRISI
Comandante do 16° BPM

MAJ PM EMANUELA
Subcomandante do 16° BPM

16° BPM - BATALHÃO FREI CANECA
Segurança, Paz e Ordem no Centro do Recife
"Polícia Militar de Pernambuco. Nossa Presença, Sua Segurança!"`;

const FOOTER_3 = `Ten Cel PM Grisi
Comandante

Maj PM Emanuela
Subcomandante

16° BPM - Segurança, paz e ordem no Centro do Recife!`;

const SERVICE_OPTIONS = [
  'OFICIAL DE OPERAÇÕES',
  'FISCAL DE DIA',
  'OFICIAL DE PLANTÃO',
  'SUBOFICIAL DE SERVIÇO',
  'SARGENTO DE SERVIÇO',
  'COMANDANTE DE PELOTÃO',
];

// ─── Classes Tailwind reutilizáveis ──────────────────────────────────────────

const FIELD_INPUT =
  'w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm ' +
  'text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 ' +
  'focus:border-transparent';

const FIELD_LABEL =
  'block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5';

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-whatsapp-report',
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-28">

      <!-- HEADER STICKY -->
      <div class="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <a routerLink="/services"
           class="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 active:bg-gray-100 transition-colors flex-shrink-0">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Serviços</p>
          <p class="font-bold text-gray-900 text-sm">Relatórios de Serviço</p>
        </div>
        <div class="ml-auto flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-lg">
          <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span class="text-[10px] font-semibold text-green-600">WhatsApp</span>
        </div>
      </div>

      <div class="px-4 pt-4 space-y-4 pb-6">

        <!-- ABAS (TABS) -->
        <div class="flex bg-gray-100 rounded-2xl p-1 gap-1">
          @for (tab of tabs; track tab.id) {
            <button
              (click)="activeTab.set(tab.id)"
              class="flex-1 py-2.5 px-1 rounded-xl text-[10px] font-semibold leading-tight text-center transition-all duration-200"
              [class.bg-white]="activeTab() === tab.id"
              [class.shadow-sm]="activeTab() === tab.id"
              [class.text-indigo-700]="activeTab() === tab.id"
              [class.text-gray-400]="activeTab() !== tab.id"
            >
              {{ tab.line1 }}<br>{{ tab.line2 }}
            </button>
          }
        </div>

        <!-- ════════════════════════════════════════════════════
             FORMULÁRIO 1 — Release de Ocorrência
        ════════════════════════════════════════════════════ -->
        @if (activeTab() === 1) {
          <form [formGroup]="form1" class="space-y-3">

            <!-- Banner do tipo -->
            <div class="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
              <span class="text-lg">📝</span>
              <div>
                <p class="text-xs font-bold text-indigo-700">Release de Ocorrência</p>
                <p class="text-[10px] text-indigo-400">Preencha os campos e envie pelo WhatsApp</p>
              </div>
            </div>

            <div>
              <label for="f1-titulo" [class]="labelCls">Título Principal</label>
              <input id="f1-titulo" type="text" formControlName="tituloPrincipal"
                     placeholder="Ex: PMPE PRENDE SUSPEITO DE ROUBO NO CENTRO DO RECIFE"
                     [class]="inputCls" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="f1-boepm" [class]="labelCls">BOEPM</label>
                <input id="f1-boepm" type="text" formControlName="boepm"
                       placeholder="000/2026" [class]="inputCls" />
              </div>
              <div>
                <label for="f1-boepc" [class]="labelCls">BOEPC</label>
                <input id="f1-boepc" type="text" formControlName="boepc"
                       placeholder="000/2026" [class]="inputCls" />
              </div>
            </div>

            <div>
              <label for="f1-datahora" [class]="labelCls">Data / Hora</label>
              <input id="f1-datahora" type="text" formControlName="dataHora"
                     placeholder="Ex: 12/06/2026 às 22h35" [class]="inputCls" />
            </div>

            <div>
              <label for="f1-local" [class]="labelCls">Local</label>
              <input id="f1-local" type="text" formControlName="local"
                     placeholder="Rua, número, bairro, município" [class]="inputCls" />
            </div>

            <div>
              <label for="f1-equipe" [class]="labelCls">Equipe Principal</label>
              <input id="f1-equipe" type="text" formControlName="equipePrincipal"
                     placeholder="Ex: Sd PM Silva e Sd PM Santos" [class]="inputCls" />
            </div>

            <div>
              <label for="f1-apoio" [class]="labelCls">Apoio</label>
              <input id="f1-apoio" type="text" formControlName="apoio"
                     placeholder="Ex: Ronda Tática / ROCAM" [class]="inputCls" />
            </div>

            <div>
              <label for="f1-relato" [class]="labelCls">Relato do Fato</label>
              <textarea id="f1-relato" formControlName="relatoFato" rows="4"
                        placeholder="Descreva o fato ocorrido em detalhes..."
                        [class]="inputCls + ' resize-none'"></textarea>
            </div>

            <div>
              <label for="f1-envolvidos" [class]="labelCls">Envolvidos</label>
              <textarea id="f1-envolvidos" formControlName="envolvidos" rows="3"
                        placeholder="Nome, RG, qualificação dos envolvidos..."
                        [class]="inputCls + ' resize-none'"></textarea>
            </div>

            <div>
              <label for="f1-objetos" [class]="labelCls">Objetos Apreendidos</label>
              <textarea id="f1-objetos" formControlName="objetosApreendidos" rows="2"
                        placeholder="Ex: 01 faca tipo peixeira, 01 aparelho celular..."
                        [class]="inputCls + ' resize-none'"></textarea>
            </div>

            <div>
              <label for="f1-resultado" [class]="labelCls">Resultado</label>
              <textarea id="f1-resultado" formControlName="resultado" rows="2"
                        placeholder="Ex: Suspeito conduzido ao DPO para lavratura de TC..."
                        [class]="inputCls + ' resize-none'"></textarea>
            </div>

          </form>
        }

        <!-- ════════════════════════════════════════════════════
             FORMULÁRIO 2 — Assunção de Serviço
        ════════════════════════════════════════════════════ -->
        @if (activeTab() === 2) {
          <form [formGroup]="form2" class="space-y-3">

            <div class="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
              <span class="text-lg">👮🏻‍♂️</span>
              <div>
                <p class="text-xs font-bold text-indigo-700">Assunção de Serviço</p>
                <p class="text-[10px] text-indigo-400">Comunicado formal de início de serviço</p>
              </div>
            </div>

            <div>
              <label for="f2-servico" [class]="labelCls">Tipo de Serviço</label>
              <div class="relative">
                <select id="f2-servico" formControlName="nomeServico"
                        [class]="inputCls + ' appearance-none pr-10 cursor-pointer'">
                  @for (opt of serviceOptions; track opt) {
                    <option [value]="opt">{{ opt }}</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label for="f2-data" [class]="labelCls">Data</label>
              <input id="f2-data" type="date" formControlName="data" [class]="inputCls" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="f2-hinicio" [class]="labelCls">Hora Início</label>
                <input id="f2-hinicio" type="time" formControlName="horaInicio" [class]="inputCls" />
              </div>
              <div>
                <label for="f2-hfim" [class]="labelCls">Hora Fim</label>
                <input id="f2-hfim" type="time" formControlName="horaFim" [class]="inputCls" />
              </div>
            </div>

            <div>
              <label for="f2-asp" [class]="labelCls">Nome do ASP PM</label>
              <input id="f2-asp" type="text" formControlName="nomeAspPm"
                     placeholder="Ex: 3° Ten PM João Silva" [class]="inputCls" />
            </div>

            <div>
              <label for="f2-fone" [class]="labelCls">Fone de Contato</label>
              <input id="f2-fone" type="tel" formControlName="foneContato"
                     placeholder="(81) 9 0000-0000" [class]="inputCls" />
            </div>

          </form>
        }

        <!-- ════════════════════════════════════════════════════
             FORMULÁRIO 3 — Release de Operação / Ação
        ════════════════════════════════════════════════════ -->
        @if (activeTab() === 3) {
          <form [formGroup]="form3" class="space-y-3">

            <div class="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
              <span class="text-lg">⚡</span>
              <div>
                <p class="text-xs font-bold text-indigo-700">Release de Operação / Ação</p>
                <p class="text-[10px] text-indigo-400">Comunicado de resultado de operação policial</p>
              </div>
            </div>

            <div>
              <label for="f3-titulo" [class]="labelCls">Título da Ação</label>
              <input id="f3-titulo" type="text" formControlName="tituloAcao"
                     placeholder="Ex: OPERAÇÃO CENTRO SEGURO" [class]="inputCls" />
            </div>

            <div>
              <label for="f3-contexto" [class]="labelCls">Data e Contexto da Ação</label>
              <textarea id="f3-contexto" formControlName="dataContexto" rows="4"
                        placeholder="Ex: No dia 12/06/2026, o 16° BPM realizou operação policial com o objetivo de..."
                        [class]="inputCls + ' resize-none'"></textarea>
            </div>

            <div>
              <label for="f3-resultados" [class]="labelCls">Resultados / Abordagens</label>
              <textarea id="f3-resultados" formControlName="resultadosAbordagens" rows="4"
                        placeholder="Ex: Foram realizadas 30 abordagens, 05 conduções ao DPO, 02 prisões em flagrante..."
                        [class]="inputCls + ' resize-none'"></textarea>
            </div>

            <div>
              <label for="f3-participantes" [class]="labelCls">Participantes</label>
              <textarea id="f3-participantes" formControlName="participantes" rows="3"
                        placeholder="Ex: 16° BPM (30 PM), BOPE (10 PM), ROCAM (08 PM)..."
                        [class]="inputCls + ' resize-none'"></textarea>
            </div>

          </form>
        }

        <!-- DIVISOR PRÉVIA -->
        <div class="flex items-center gap-3 pt-1">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Prévia do relatório
          </span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>

        <!-- PREVIEW TEXTAREA (readonly, atualiza em tempo real) -->
        <div class="relative">
          <textarea
            readonly
            [value]="preview()"
            rows="13"
            class="w-full px-4 py-4 bg-white border-2 border-dashed border-indigo-100 rounded-2xl text-xs text-gray-700 font-mono leading-relaxed resize-none focus:outline-none"
          ></textarea>
          <!-- Badge de tipo no canto superior -->
          <div class="absolute top-3 right-3 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1">
            <span class="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
              {{ tabs[activeTab() - 1].line1 }} {{ tabs[activeTab() - 1].line2 }}
            </span>
          </div>
        </div>

        <!-- BOTÃO WHATSAPP -->
        <button
          (click)="sendWhatsApp()"
          class="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 active:scale-[0.98] active:bg-[#1fba59] transition-all shadow-lg shadow-green-200"
        >
          <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Enviar via WhatsApp
        </button>

      </div>
    </div>
  `,
})
export class WhatsappReport {
  private readonly fb = inject(FormBuilder);

  // Classes compartilhadas expostas ao template via [class]
  readonly inputCls = FIELD_INPUT;
  readonly labelCls = FIELD_LABEL;

  readonly activeTab = signal<1 | 2 | 3>(1);

  readonly tabs = [
    { id: 1 as const, line1: 'Release de', line2: 'Ocorrência' },
    { id: 2 as const, line1: 'Assunção de', line2: 'Serviço' },
    { id: 3 as const, line1: 'Release de', line2: 'Operação' },
  ];

  readonly serviceOptions = SERVICE_OPTIONS;

  // ── Reactive Forms (nonNullable = sem null nos valores) ──────────────────

  readonly form1 = this.fb.nonNullable.group({
    tituloPrincipal: [''],
    boepm: [''],
    boepc: [''],
    dataHora: [''],
    local: [''],
    equipePrincipal: [''],
    apoio: [''],
    relatoFato: [''],
    envolvidos: [''],
    objetosApreendidos: [''],
    resultado: [''],
  });

  readonly form2 = this.fb.nonNullable.group({
    nomeServico: ['OFICIAL DE OPERAÇÕES'],
    data: [''],
    horaInicio: [''],
    horaFim: [''],
    nomeAspPm: [''],
    foneContato: [''],
  });

  readonly form3 = this.fb.nonNullable.group({
    tituloAcao: [''],
    dataContexto: [''],
    resultadosAbordagens: [''],
    participantes: [''],
  });

  // ── Bridge Observable → Signal (getRawValue garante tipo completo) ────────

  private readonly v1 = toSignal(
    this.form1.valueChanges.pipe(map(() => this.form1.getRawValue())),
    { initialValue: this.form1.getRawValue() },
  );

  private readonly v2 = toSignal(
    this.form2.valueChanges.pipe(map(() => this.form2.getRawValue())),
    { initialValue: this.form2.getRawValue() },
  );

  private readonly v3 = toSignal(
    this.form3.valueChanges.pipe(map(() => this.form3.getRawValue())),
    { initialValue: this.form3.getRawValue() },
  );

  // ── Preview gerado em tempo real ─────────────────────────────────────────

  readonly preview = computed(() => {
    switch (this.activeTab()) {

      case 1: {
        const v = this.v1();
        return (
          `SDS - PMPE - DPO - DIM - 16º BPM - BATALHÃO FREI CANECA\n\n` +
          `*${v.tituloPrincipal}*\n\n` +
          `BOEPM: ${v.boepm} | BOEPC: ${v.boepc}\n` +
          `DATA/HORA: ${v.dataHora} | LOCAL: ${v.local}\n` +
          `EQUIPE: ${v.equipePrincipal} | Apoio: ${v.apoio}\n\n` +
          `RELATO DO FATO: ${v.relatoFato}\n\n` +
          `ENVOLVIDO(S): ${v.envolvidos}\n\n` +
          `OBJETOS APREENDIDOS: ${v.objetosApreendidos}\n\n` +
          `RESULTADO: ${v.resultado}\n\n` +
          FOOTER_1
        );
      }

      case 2: {
        const v = this.v2();
        return (
          `SDS – PMPE – DPO - DIM – 16º BPM - BATALHÃO FREI CANECA\n\n` +
          `Boa noite!\nNo presente, assumindo o serviço:\n${v.nomeServico}\n\n` +
          `📅 DATA: ${this.formatDate(v.data)}\n` +
          `⏰ HORA: ${v.horaInicio} às ${v.horaFim}\n` +
          `👮🏻‍♂️ ASP PM ${v.nomeAspPm}\n` +
          `☎️ FONE: ${v.foneContato}`
        );
      }

      case 3: {
        const v = this.v3();
        return (
          `Release de operação/ação : SDS - PMPE - DPO - DIM - 16° BPM\n\n` +
          `${v.tituloAcao}\n\n` +
          `${v.dataContexto}\n\n` +
          `${v.resultadosAbordagens}\n\n` +
          `Participantes:\n${v.participantes}\n\n` +
          FOOTER_3
        );
      }
    }
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  private formatDate(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  sendWhatsApp(): void {
    const encoded = encodeURIComponent(this.preview());
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  }
}
