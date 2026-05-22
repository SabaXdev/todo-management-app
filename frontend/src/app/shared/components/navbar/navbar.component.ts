import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AppRoute } from '../../../core/enums/app-route.enum';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a
          [routerLink]="['/', appRoute.Dashboard]"
          class="flex items-center gap-2 text-base font-semibold text-slate-900"
        >
          <span class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          Taskly
        </a>

        <!-- Mobile menu toggle -->
        <button
          type="button"
          class="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          (click)="mobileOpen.set(!mobileOpen())"
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Desktop links -->
        <div class="hidden items-center gap-6 md:flex">
          <a
            [routerLink]="['/', appRoute.Dashboard]"
            routerLinkActive="text-brand-700"
            class="text-sm font-medium text-slate-600 hover:text-slate-900"
          >Dashboard</a>
          <a
            [routerLink]="['/', appRoute.Profile]"
            routerLinkActive="text-brand-700"
            class="text-sm font-medium text-slate-600 hover:text-slate-900"
          >Profile</a>

          @if (currentUser(); as user) {
            <span class="text-sm text-slate-500">{{ user.name }}</span>
          }

          <button type="button" class="btn-secondary" (click)="logout()">
            Sign out
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileOpen()) {
        <div class="border-t border-slate-200 px-4 py-3 md:hidden">
          <div class="flex flex-col gap-3">
            <a
              [routerLink]="['/', appRoute.Dashboard]"
              routerLinkActive="text-brand-700"
              class="text-sm font-medium text-slate-700"
              (click)="mobileOpen.set(false)"
            >Dashboard</a>
            <a
              [routerLink]="['/', appRoute.Profile]"
              routerLinkActive="text-brand-700"
              class="text-sm font-medium text-slate-700"
              (click)="mobileOpen.set(false)"
            >Profile</a>
            @if (currentUser(); as user) {
              <span class="text-sm text-slate-500">Signed in as {{ user.name }}</span>
            }
            <button type="button" class="btn-secondary w-full" (click)="logout()">
              Sign out
            </button>
          </div>
        </div>
      }
    </nav>
  `,
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly appRoute = AppRoute;
  readonly currentUser = this.authService.currentUser;
  readonly mobileOpen = signal(false);

  logout(): void {
    this.authService.logout();
    this.mobileOpen.set(false);
    this.router.navigate([`/${AppRoute.Login}`]);
  }
}
