import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  authState,
  User,
  sendEmailVerification,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { CacheService } from './cache.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private cache = inject(CacheService);

  get currentUser$(): Observable<User | null> {
    return authState(this.auth);
  }

  async register(email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password,
    );
    await sendEmailVerification(credential.user);
    await signOut(this.auth);
    return credential;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    this.cache.clearAll();
    return signOut(this.auth);
  }
}
