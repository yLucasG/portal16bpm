import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';

// ─── Ícone "olho" (reutilizado em 4 botões show/hide) ────────────────────────
const EYE_SVG = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0
  8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5
  12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>`;

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `

    <!-- ══════════════════════ TELA DE LOGIN ══════════════════════ -->
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <div class="w-full max-w-sm">

        <!-- Cabeçalho institucional -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-white text-xl font-black tracking-tighter">16</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Portal 16BPM</h1>
          <p class="text-gray-400 text-xs mt-1 font-medium uppercase tracking-widest">SDS · PMPE · Batalhão Frei Caneca</p>
        </div>

        <!-- Formulário de login -->
        <form (ngSubmit)="onSubmit()"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">

          <!-- Campo Matrícula -->
          <div>
            <label for="mat" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Matrícula
            </label>
            <input
              id="mat"
              type="text"
              [(ngModel)]="matricula"
              name="matricula"
              required
              placeholder="Ex: 132338-5"
              inputmode="numeric"
              autocomplete="username"
              class="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p class="text-[10px] text-gray-300 mt-1">Com ou sem hífen — somente os números serão usados.</p>
          </div>

          <!-- Campo Senha -->
          <div>
            <label for="sen" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Senha
            </label>
            <div class="relative">
              <input
                id="sen"
                [type]="showSenha() ? 'text' : 'password'"
                [(ngModel)]="senha"
                name="senha"
                required
                placeholder="••••••"
                autocomplete="current-password"
                class="w-full px-4 py-3.5 pr-11 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button type="button"
                      (click)="showSenha.set(!showSenha())"
                      class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 active:text-gray-600">
                <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     [innerHTML]="eyeSvg"></svg>
              </button>
            </div>
          </div>

          <!-- Erro de autenticação -->
          @if (loginErro()) {
            <div class="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-3">
              <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874
                  1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              {{ loginErro() }}
            </div>
          }

          <!-- Botão entrar -->
          <button
            type="submit"
            [disabled]="loginLoading()"
            class="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-md shadow-indigo-200"
          >
            {{ loginLoading() ? 'Verificando...' : 'Entrar' }}
          </button>

          <!-- Texto de recuperação de senha (discreto, informativo) -->
          <p class="text-center text-[11px] text-gray-400 leading-relaxed pt-1">
            Esqueceu a senha? Solicite a redefinição diretamente ao
            <span class="font-semibold text-gray-500">Oficial Administrador do Sistema</span>.
          </p>

        </form>

      </div>
    </div>

    <!-- ══════════════════ MODAL PRIMEIRO ACESSO ══════════════════ -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
           style="background:rgba(15,23,42,0.88);backdrop-filter:blur(6px)">

        <div class="bg-white w-full sm:max-w-sm sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">

          <!-- Header do modal -->
          <div class="bg-gradient-to-br from-slate-900 to-indigo-950 px-6 pt-8 pb-7 text-center">
            <div class="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-900/50">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25
                  v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0
                  002.25 2.25z"/>
              </svg>
            </div>
            <h2 class="text-white text-lg font-bold">Primeiro Acesso</h2>
            <p class="text-slate-400 text-xs mt-1.5 max-w-xs mx-auto leading-relaxed">
              Por segurança, você deve definir uma senha pessoal antes de continuar.
            </p>
          </div>

          <!-- Corpo do modal (form separado, fora do form de login) -->
          <form (ngSubmit)="onUpdatePassword()" class="p-6 space-y-4">

            <!-- Nova senha -->
            <div>
              <label for="np" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Nova Senha
              </label>
              <div class="relative">
                <input
                  id="np"
                  [type]="showNovaSenha() ? 'text' : 'password'"
                  [(ngModel)]="novaSenha"
                  name="novaSenha"
                  required
                  placeholder="Mínimo 6 caracteres"
                  autocomplete="new-password"
                  class="w-full px-4 py-3.5 pr-11 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button type="button"
                        (click)="showNovaSenha.set(!showNovaSenha())"
                        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       [innerHTML]="eyeSvg"></svg>
                </button>
              </div>
            </div>

            <!-- Confirmar senha -->
            <div>
              <label for="cp" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Confirmar Senha
              </label>
              <div class="relative">
                <input
                  id="cp"
                  [type]="showConfirmarSenha() ? 'text' : 'password'"
                  [(ngModel)]="confirmarSenha"
                  name="confirmarSenha"
                  required
                  placeholder="Repita a nova senha"
                  autocomplete="new-password"
                  class="w-full px-4 py-3.5 pr-11 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button type="button"
                        (click)="showConfirmarSenha.set(!showConfirmarSenha())"
                        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       [innerHTML]="eyeSvg"></svg>
                </button>
              </div>
            </div>

            <!-- Erro do modal -->
            @if (primeiroAcessoErro()) {
              <div class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-3">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                </svg>
                {{ primeiroAcessoErro() }}
              </div>
            }

            <!-- Botão confirmar -->
            <button
              type="submit"
              [disabled]="primeiroAcessoLoading()"
              class="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {{ primeiroAcessoLoading() ? 'Salvando...' : 'Definir Senha e Entrar' }}
            </button>

            <p class="text-center text-[10px] text-gray-400 leading-relaxed">
              Esta senha substituirá a senha temporária fornecida pelo administrador.
            </p>

          </form>
        </div>
      </div>
    }
  `,
})
export class Login {
  private readonly auth    = inject(AuthService);
  private readonly supabase = inject(SupabaseService);
  private readonly router  = inject(Router);

  // SVG do ícone de olho para reutilização via [innerHTML]
  // (conteúdo inerte — não contém interpolações de usuário)
  readonly eyeSvg = EYE_SVG;

  // ── Login ──────────────────────────────────────────────────────
  matricula = '';
  senha     = '';
  showSenha     = signal(false);
  loginLoading  = signal(false);
  loginErro     = signal('');

  // ── Modal de primeiro acesso ───────────────────────────────────
  showModal          = signal(false);
  novaSenha          = '';
  confirmarSenha     = '';
  showNovaSenha      = signal(false);
  showConfirmarSenha = signal(false);
  primeiroAcessoLoading = signal(false);
  primeiroAcessoErro    = signal('');

  // ── Login: monta e-mail a partir da matrícula ─────────────────
  async onSubmit(): Promise<void> {
    this.loginLoading.set(true);
    this.loginErro.set('');

    const matriculaLimpa = this.matricula.replace(/\D/g, '');
    const email = `${matriculaLimpa}@portal16bpm.com`;

    const { data, error } = await this.auth.signIn(email, this.senha);

    if (error) {
      this.loginErro.set('Matrícula ou senha inválidos. Tente novamente.');
    } else if (data?.user?.user_metadata?.['is_first_access'] === true) {
      this.showModal.set(true);          // trava até definir nova senha
    } else {
      this.router.navigate(['/dashboard']);
    }

    this.loginLoading.set(false);
  }

  // ── Primeiro acesso: atualiza senha e desmarca a flag ─────────
  async onUpdatePassword(): Promise<void> {
    this.primeiroAcessoErro.set('');

    if (this.novaSenha.length < 6) {
      this.primeiroAcessoErro.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (this.novaSenha !== this.confirmarSenha) {
      this.primeiroAcessoErro.set('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    this.primeiroAcessoLoading.set(true);

    const { error } = await this.supabase.client.auth.updateUser({
      password: this.novaSenha,
      data: { is_first_access: false },
    });

    if (error) {
      this.primeiroAcessoErro.set('Não foi possível salvar a nova senha. Tente novamente.');
    } else {
      this.showModal.set(false);
      this.router.navigate(['/dashboard']);
    }

    this.primeiroAcessoLoading.set(false);
  }

}
