import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
    data: { animation: 'login' },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then((m) => m.RegisterComponent),
    data: { animation: 'register' },
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
    data: { animation: 'dashboard' },
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./transactions/transactions.component').then(
        (m) => m.TransactionsComponent,
      ),
    canActivate: [authGuard],
    data: { animation: 'transactions' },
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories/categories.component').then(
        (m) => m.CategoriesComponent,
      ),
    canActivate: [authGuard],
    data: { animation: 'categories' },
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
    data: { animation: 'profile' },
  },
  { path: '**', redirectTo: 'login' },
];
