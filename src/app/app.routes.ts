import { Route } from '@angular/router';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { AuthGuard } from '@core/guard/auth.guard';
import { SubscriptionGuard } from '@core/guard/subscription.guard';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { Page404Component } from './authentication/page404/page404.component';
import { Role } from '@core';
import { SA_Auth } from './super-admin/super-admin.routes';


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
        path: 'super',
        canActivate: [AuthGuard],
        data: { role: Role.Superadmin },
        loadChildren: () =>
          import('./super-admin/super-admin.routes').then((m) => SA_Auth),
      },
      {
        path: 'mnf',
        canActivate: [AuthGuard, SubscriptionGuard],
        canActivateChild: [SubscriptionGuard],
        data: {
          role: [
            Role.Manufacture,
            'rawMaterialManager',
            'finishedGoodsManager',
            'productManager',
            'orderManager'
          ]
        },
        loadChildren: () =>
          import('./manufacturer/manufacturer.routes').then((m) => m.M_Auth),
      },
      {
        path: 'wholesaler',
        canActivate: [AuthGuard, SubscriptionGuard],
        data: { role: [Role.Wholesaler] },
        loadChildren: () =>
          import('./wholseller/wholseller.routes').then((m) => m.R_Auth),
      },
      {
        path: 'retailer',
        canActivate: [AuthGuard, SubscriptionGuard],
        data: { role: [Role.Retailer] },
        loadChildren: () =>
          import('./retailer/retailer.routes').then((m) => m.Retailer_Route),
      },
      {
        path: 'cp',
        canActivate: [AuthGuard, SubscriptionGuard],
        data: { role: Role.ChannelPartner },
        loadChildren: () =>
          import('./channelPartner/channelPartner.routes').then((m) => m.CP_Auth),
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