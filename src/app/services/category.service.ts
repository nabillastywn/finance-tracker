import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, switchMap, of, tap } from 'rxjs';
import { Category } from '../models/category.model';
import { CacheService } from './cache.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private cache = inject(CacheService);

  getCategories(): Observable<Category[]> {
    const cached = this.cache.getCategories();
    if (cached) return of(cached);

    return authState(this.auth).pipe(
      switchMap((user) => {
        if (!user) return of([]);
        const ref = collection(this.firestore, 'categories');
        const q = query(
          ref,
          where('userId', '==', user.uid),
          orderBy('name', 'asc'),
        );
        return (
          collectionData(q, { idField: 'id' }) as Observable<Category[]>
        ).pipe(tap((data) => this.cache.setCategories(data)));
      }),
    );
  }

  async addCategory(data: Omit<Category, 'id' | 'userId' | 'createdAt'>) {
    const uid = this.auth.currentUser?.uid;
    const ref = collection(this.firestore, 'categories');
    await addDoc(ref, { ...data, userId: uid, createdAt: new Date() });
    this.cache.clearCategories();
  }

  async updateCategory(id: string, data: Partial<Category>) {
    const ref = doc(this.firestore, 'categories', id);
    await updateDoc(ref, { ...data });
    this.cache.clearCategories();
  }

  async deleteCategory(id: string) {
    const ref = doc(this.firestore, 'categories', id);
    await deleteDoc(ref);
    this.cache.clearCategories();
  }
}
