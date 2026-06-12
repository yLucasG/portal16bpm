import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  private readonly _session = signal<Session | null>(null);
  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => !!this._session());

  constructor() {
    this.supabase.client.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
    });

    this.supabase.client.auth.onAuthStateChange((_, session) => {
      this._session.set(session);
    });
  }

  signIn(email: string, password: string) {
    return this.supabase.client.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    await this.supabase.client.auth.signOut();
    this.router.navigate(['/login']);
  }
}
