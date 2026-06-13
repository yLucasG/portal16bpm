import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../core/services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  const { data } = await supabase.client.auth.getSession();

  if (!data.session) {
    return router.createUrlTree(['/login']);
  }

  // If the user navigates away from the first-access modal without changing
  // their password, kick them out so the dashboard cannot be accessed.
  if (data.session.user.user_metadata?.['is_first_access'] === true) {
    await supabase.client.auth.signOut();
    return router.createUrlTree(['/login']);
  }

  return true;
};
