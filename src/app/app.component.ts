import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ToastComponent } from './toast/toast.component';
import { LoadingComponent } from './loading/loading.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { routeAnimation } from './animations/route.animation';
import { filter } from 'rxjs/operators';
import { Auth, authState } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastComponent,
    LoadingComponent,
    SidebarComponent,
    CommonModule,
  ],
  template: `
    <div class="app-shell">
      <app-sidebar *ngIf="showSidebar" />
      <div class="app-content" [class.with-sidebar]="showSidebar">
        <div [@routeAnimation]="getRouteState(outlet)">
          <router-outlet #outlet="outlet" />
        </div>
      </div>
    </div>
    <app-toast />
    <app-loading />
  `,
  animations: [routeAnimation],
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(Auth);
  showSidebar = false;

  private authRoutes = ['/login', '/register'];

  ngOnInit() {
    authState(this.auth).subscribe((user) => {
      const currentUrl = this.router.url;
      if (user && user.emailVerified && this.authRoutes.includes(currentUrl)) {
        this.router.navigate(['/dashboard']);
      }
    });

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.showSidebar = !this.authRoutes.includes(e.urlAfterRedirects);
      });
  }

  getRouteState(outlet: RouterOutlet) {
    if (!outlet.isActivated) return null;
    return (
      outlet.activatedRouteData?.['animation'] ??
      outlet.activatedRoute.snapshot.url[0]?.path ??
      null
    );
  }
}
