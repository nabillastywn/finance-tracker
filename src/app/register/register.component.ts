import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.services';
import { ToastService } from '../services/toast.service';
import { LoadingService } from '../services/loading.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private loadingService = inject(LoadingService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  errorMessage = '';
  loading = false;
  successMessage = '';

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.loadingService.show();
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await this.authService.register(
        this.form.value.email!,
        this.form.value.password!,
      );
      this.successMessage =
        'Pendaftaran berhasil! Cek email kamu untuk verifikasi, lalu login.';
      this.form.reset();
    } catch (e: any) {
      this.errorMessage = 'Gagal mendaftar. Email mungkin sudah digunakan.';
    } finally {
      this.loading = false;
      this.loadingService.hide();
    }
  }
}
