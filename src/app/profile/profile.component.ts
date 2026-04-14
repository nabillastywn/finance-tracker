import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  Auth,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from '@angular/fire/auth';
import { ToastService } from '../services/toast.service';
import { LoadingService } from '../services/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private auth = inject(Auth);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  user = this.auth.currentUser;
  showDeleteModal = false;
  loadingProfile = false;
  loadingDelete = false;

  profileForm = this.fb.group({
    displayName: ['', Validators.required],
  });

  deleteForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit() {
    this.profileForm.patchValue({
      displayName: this.user?.displayName ?? '',
    });
  }

  get avatarLetter() {
    const name = this.user?.displayName;
    const email = this.user?.email;
    return (name?.[0] ?? email?.[0] ?? '?').toUpperCase();
  }

  async updateProfile() {
    if (this.profileForm.invalid) return;
    this.loadingProfile = true;
    this.loadingService.show();
    try {
      await updateProfile(this.user!, {
        displayName: this.profileForm.value.displayName!,
      });
      this.user = this.auth.currentUser;
      this.toast.show('Profil berhasil diperbarui!');
    } catch (e) {
      this.toast.show('Gagal memperbarui profil.', 'error');
    } finally {
      this.loadingProfile = false;
      this.loadingService.hide();
    }
  }

  openDeleteModal() {
    this.deleteForm.reset();
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  async deleteAccount() {
    if (this.deleteForm.invalid) return;
    this.loadingDelete = true;
    this.loadingService.show();
    try {
      const credential = EmailAuthProvider.credential(
        this.user!.email!,
        this.deleteForm.value.password!,
      );
      await reauthenticateWithCredential(this.user!, credential);
      await deleteUser(this.user!);
      this.toast.show('Akun berhasil dihapus.');
      this.router.navigate(['/login']);
    } catch (e) {
      this.toast.show('Password salah atau sesi habis.', 'error');
    } finally {
      this.loadingDelete = false;
      this.loadingService.hide();
    }
  }
}
