import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 class="text-2xl font-semibold text-slate-900">Profile</h1>
      <p class="text-sm text-slate-500">Your account information.</p>

      @if (currentUser(); as user) {
        <div class="card mt-6 p-6">
          <dl class="divide-y divide-slate-100">
            <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt class="text-sm font-medium text-slate-600">Name</dt>
              <dd class="text-sm text-slate-900 sm:col-span-2">{{ user.name }}</dd>
            </div>
            <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt class="text-sm font-medium text-slate-600">Email</dt>
              <dd class="text-sm text-slate-900 sm:col-span-2">{{ user.email }}</dd>
            </div>
            <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt class="text-sm font-medium text-slate-600">Member since</dt>
              <dd class="text-sm text-slate-900 sm:col-span-2">
                {{ user.createdAt | date: 'mediumDate' }}
              </dd>
            </div>
          </dl>
        </div>
      } @else {
        <app-loading-spinner label="Loading your profile…"></app-loading-spinner>
      }
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  readonly currentUser = this.authService.currentUser;

  ngOnInit(): void {
    this.authService.refreshCurrentUser().subscribe({ error: () => {} });
  }
}
