import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../services/transaction.service';
import { CategoryService } from '../services/category.service';
import { ToastService } from '../services/toast.service';
import { Transaction } from '../models/transaction.model';
import { Category } from '../models/category.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LoadingService } from '../services/loading.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private loadingService = inject(LoadingService);

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  categories: Category[] = [];
  showModal = false;
  isEditing = false;
  editingId = '';
  loading = false;
  filterType = 'all';
  filterCategory = 'all';
  isDataReady = false;

  form = this.fb.group({
    type: ['expense', Validators.required],
    amount: [null, [Validators.required, Validators.min(1)]],
    category: ['', Validators.required],
    description: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
  });

  ngOnInit() {
    this.loadingService.show();
    let firstLoad = true;

    this.transactionService.getTransactions().subscribe((data) => {
      this.transactions = data;
      this.applyFilter();
      this.isDataReady = true;
      if (firstLoad) {
        this.loadingService.hide();
        firstLoad = false;
      }
    });

    this.categoryService.getCategories().subscribe((data) => {
      this.categories = data;
    });
  }

  get filteredCategories() {
    const type = this.form.get('type')?.value;
    return this.categories.filter((c) => c.type === type || c.type === 'both');
  }

  applyFilter() {
    let result = [...this.transactions];
    if (this.filterType !== 'all')
      result = result.filter((t) => t.type === this.filterType);
    if (this.filterCategory !== 'all')
      result = result.filter((t) => t.category === this.filterCategory);
    this.filteredTransactions = result;
  }

  onFilterType(type: string) {
    this.filterType = type;
    this.applyFilter();
  }
  onFilterCategory(cat: string) {
    this.filterCategory = cat;
    this.applyFilter();
  }

  openAddModal() {
    this.isEditing = false;
    this.editingId = '';
    this.form.reset({
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    });
    this.showModal = true;
  }

  openEditModal(t: Transaction) {
    this.isEditing = true;
    this.editingId = t.id!;

    const raw = t.date as any;
    const date = raw?.toDate ? raw.toDate() : new Date(raw);
    const dateStr =
      date instanceof Date && !isNaN(date.getTime())
        ? date.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

    this.form.setValue({
      type: t.type,
      amount: t.amount as any,
      category: t.category,
      description: t.description,
      date: dateStr,
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.loadingService.show();
    try {
      const val = this.form.value;
      const data = {
        type: val.type as 'income' | 'expense',
        amount: Number(val.amount),
        category: val.category!.trim(),
        description: val.description!.trim(),
        date: new Date(val.date!),
      };
      if (this.isEditing) {
        await this.transactionService.updateTransaction(this.editingId, data);
        this.toast.show('Transaksi berhasil diperbarui!');
      } else {
        await this.transactionService.addTransaction(data);
        this.toast.show('Transaksi berhasil ditambahkan!');
      }
      this.closeModal();
    } finally {
      this.loading = false;
      this.loadingService.hide();
    }
  }

  async deleteTransaction(id: string) {
    if (!confirm('Hapus transaksi ini?')) return;
    this.loadingService.show();
    await this.transactionService.deleteTransaction(id);
    this.toast.show('Transaksi berhasil dihapus!');
    this.loadingService.hide();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
