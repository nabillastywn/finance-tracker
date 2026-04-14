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
import { Observable, switchMap, of } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  getTransactions(): Observable<Transaction[]> {
    return authState(this.auth).pipe(
      switchMap((user) => {
        if (!user) return of([]);
        const ref = collection(this.firestore, 'transactions');
        const q = query(
          ref,
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
        );
        return collectionData(q, { idField: 'id' }) as Observable<
          Transaction[]
        >;
      }),
    );
  }

  addTransaction(data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) {
    const uid = this.auth.currentUser?.uid;
    const ref = collection(this.firestore, 'transactions');
    return addDoc(ref, {
      ...data,
      userId: uid,
      createdAt: new Date(),
    });
  }

  updateTransaction(id: string, data: Partial<Transaction>) {
    const ref = doc(this.firestore, 'transactions', id);
    return updateDoc(ref, { ...data });
  }

  deleteTransaction(id: string) {
    const ref = doc(this.firestore, 'transactions', id);
    return deleteDoc(ref);
  }
}
