import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map((user) => {
      if (user && user.emailVerified) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    }),
  );
};
