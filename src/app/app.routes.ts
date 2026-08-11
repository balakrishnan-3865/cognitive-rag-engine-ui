import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'workspace',
        loadComponent: () =>
          import('./features/workspace/workspace.component').then((m) => m.WorkspaceComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'workspace' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
