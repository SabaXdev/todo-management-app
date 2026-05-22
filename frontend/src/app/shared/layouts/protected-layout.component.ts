import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'app-protected-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-navbar></app-navbar>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class ProtectedLayoutComponent {}
