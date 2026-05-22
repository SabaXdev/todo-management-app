import { Routes } from '@angular/router';
import { AppRoute } from './core/enums/app-route.enum';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: AppRoute.Dashboard,
  },
  {
    path: AppRoute.Login,
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: AppRoute.Register,
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/protected-layout.component').then(
        (m) => m.ProtectedLayoutComponent,
      ),
    children: [
      {
        path: AppRoute.Dashboard,
        loadComponent: () =>
          import('./features/todos/todo-list/todo-list.component').then(
            (m) => m.TodoListComponent,
          ),
      },
      {
        path: `${AppRoute.Todos}/${AppRoute.TodoNew}`,
        loadComponent: () =>
          import('./features/todos/todo-form/todo-form.component').then(
            (m) => m.TodoFormComponent,
          ),
      },
      {
        path: `${AppRoute.Todos}/:id`,
        loadComponent: () =>
          import('./features/todos/todo-form/todo-form.component').then(
            (m) => m.TodoFormComponent,
          ),
      },
      {
        path: AppRoute.Profile,
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: AppRoute.Dashboard },
];
