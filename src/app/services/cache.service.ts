import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private transactions: Transaction[] | null = null;
  private categories: Category[] | null = null;

  getTransactions() {
    return this.transactions;
  }
  getCategories() {
    return this.categories;
  }

  setTransactions(data: Transaction[]) {
    this.transactions = data;
  }
  setCategories(data: Category[]) {
    this.categories = data;
  }

  clearTransactions() {
    this.transactions = null;
  }
  clearCategories() {
    this.categories = null;
  }

  clearAll() {
    this.transactions = null;
    this.categories = null;
  }
}
