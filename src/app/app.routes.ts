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
        path: 'documents',
        loadComponent: () =>
          import('./features/documents/documents.component').then((m) => m.DocumentsComponent),
      },
      {
        path: 'qa',
        loadComponent: () => import('./features/qa/qa.component').then((m) => m.QaComponent),
      },
      {
        path: 'assistant',
        loadComponent: () =>
          import('./features/assistant/assistant.component').then((m) => m.AssistantComponent),
      },
      {
        path: 'claims',
        loadComponent: () =>
          import('./features/claims/claims.component').then((m) => m.ClaimsComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'qa' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
