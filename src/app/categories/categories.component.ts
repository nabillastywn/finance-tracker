import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../services/category.service';
import { ToastService } from '../services/toast.service';
import { Category } from '../models/category.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LoadingService } from '../services/loading.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private loadingService = inject(LoadingService);

  categories: Category[] = [];
  showModal = false;
  isEditing = false;
  editingId = '';
  loading = false;

  form = this.fb.group({
    name: ['', Validators.required],
    type: ['expense', Validators.required],
  });

  ngOnInit() {
    this.loadingService.show();
    let firstLoad = true;

    this.categoryService.getCategories().subscribe((data) => {
      this.categories = data;
      if (firstLoad) {
        this.loadingService.hide();
        firstLoad = false;
      }
    });
  }

  get incomeCategories() {
    return this.categories.filter(
      (c) => c.type === 'income' || c.type === 'both',
    );
  }

  get expenseCategories() {
    return this.categories.filter(
      (c) => c.type === 'expense' || c.type === 'both',
    );
  }

  openAddModal() {
    this.isEditing = false;
    this.editingId = '';
    this.form.reset({ type: 'expense' });
    this.showModal = true;
  }

  openEditModal(c: Category) {
    this.isEditing = true;
    this.editingId = c.id!;
    this.form.setValue({ name: c.name, type: c.type });
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
      const data = {
        name: this.form.value.name!,
        type: this.form.value.type as 'income' | 'expense' | 'both',
      };
      if (this.isEditing) {
        await this.categoryService.updateCategory(this.editingId, data);
        this.toast.show('Kategori berhasil diperbarui!');
      } else {
        await this.categoryService.addCategory(data);
        this.toast.show('Kategori berhasil ditambahkan!');
      }
      this.closeModal();
    } finally {
      this.loading = false;
      this.loadingService.hide();
    }
  }

  async deleteCategory(id: string) {
    if (!confirm('Hapus kategori ini?')) return;
    this.loadingService.show();
    await this.categoryService.deleteCategory(id);
    this.toast.show('Kategori berhasil dihapus!');
    this.loadingService.hide();
  }
}
