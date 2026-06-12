import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { BottomNav } from './shared/components/bottom-nav/bottom-nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNav],
  template: `
    <main class="min-h-screen">
      <router-outlet />
    </main>
    @if (auth.isAuthenticated()) {
      <app-bottom-nav />
    }
  `,
})
export class App {
  readonly auth = inject(AuthService);
}
