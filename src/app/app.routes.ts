import { Route } from '@angular/router';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { AuthGuard } from '@core/guard/auth.guard';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { Page404Component } from './authentication/page404/page404.component';
import { Role } from '@core';

export const APP_ROUTE: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: '/authentication/signin', pathMatch: 'full' },
      // { path: '', redirectTo: '/authentication/landingPage', pathMatch: 'full' },
             
      {
        path: 'ui',
        loadChildren: () => import('./ui/ui.routes').then((m) => m.UI_ROUTE),
      },
      {
        path: 'common',
        loadChildren: () => import('./common/view-profile.route').then((m) => m.Common_Route),
      },
      {
        path: 'mnf',
        canActivate:[AuthGuard],
        data:{role:Role.Manufacture},
        loadChildren: () =>
          import('./manufacturer/manufacturer.routes').then((m) => m.M_Auth),
      },
      {
        path: 'wholesaler',
        loadChildren: () =>
          import('./wholseller/wholseller.routes').then((m) => m.R_Auth),
      },
      {
        path: 'retailer',
        loadChildren: () =>
          import('./retailer/retailer.routes').then((m) => m.Retailer_Route),
      },
    ],
  },
  {
    path: 'authentication',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./authentication/auth.routes').then((m) => m.AUTH_ROUTE),
  },
  { path: '**', component: Page404Component },
];
