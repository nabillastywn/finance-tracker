import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.services';
import { ToastService } from '../services/toast.service';
import { LoadingService } from '../services/loading.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private loadingService = inject(LoadingService);

  showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  errorMessage = '';
  loading = false;

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.loadingService.show();
    this.errorMessage = '';
    try {
      const credential = await this.authService.login(
        this.form.value.email!,
        this.form.value.password!,
      );
      if (!credential.user.emailVerified) {
        await this.authService.logout();
        this.errorMessage = 'Email belum diverifikasi. Cek inbox kamu.';
        return;
      }
      this.toast.show('Selamat datang kembali!');
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.errorMessage = 'Email atau password salah.';
    } finally {
      this.loading = false;
      this.loadingService.hide();
    }
  }
}
