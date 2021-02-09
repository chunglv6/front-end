import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from '@app/shared/components/sessions/404.component';
import { PropertyResolver } from '@app/shared/services/property.resolver';
import { environment } from '@env/environment';
import { AdminLayoutComponent } from '../theme/admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterServicesComponent } from './register-services/register-services.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        resolve: {
          props: PropertyResolver,
        },
        data: {
          title: 'menu.dashboard',
        },
      },
      {
        path: 'register-services',
        component: RegisterServicesComponent
      },
      {
        path: 'customer-management',
        loadChildren: () =>
          import('./customer-management/customer-management.module').then(
            m => m.CustomerManagementModule
          ),
        data: {
          title: 'menu.customer-management',
        },
      },
      {
        path: 'contract-management',
        loadChildren: () =>
          import('./contract-management/contract-management.module').then(
            m => m.ContractManagementModule
          ),
        data: {
          title: 'menu.contract-management',
        },
      },
      {
        path: 'briefcase',
        loadChildren: () => import('./briefcase/briefcase.module').then(m => m.BriefcaseModule),
        data: {
          title: 'menu.briefcase',
        },
      },
      {
        path: 'policy',
        loadChildren: () => import('./policy/policy.module').then(m => m.PolicyModule),
        data: {
          title: 'menu.policy',
        },
      },
      {
        path: 'search-information',
        loadChildren: () =>
          import('./search-information/search-information.module').then(
            m => m.SearchInformationModule
          ),
        data: {
          title: 'menu.search-info',
        },
      },
      {
        path: 'special-vehicle-management',
        loadChildren: () =>
          import('./special-vehicle-management/special-vehicle-management.module').then(
            m => m.SpecialVehicleManagementModule
          ),
        data: {
          title: 'menu.special-vehicle-management',
        },
      },
      {
        path: 'category-management',
        loadChildren: () =>
          import('./category-management/category-management.module').then(
            m => m.CategoryManagementModule
          ),
        data: {
          title: 'menu.category',
        },
      },
      {
        path: 'topup-money',
        loadChildren: () =>
          import('./topup-money/topup-money.module').then(
            m => m.TopupMoneyModule
          ),
        data: {
          title: 'menu.topup-money',
        },
      },
    ],
  },
  {
    path: '**',
    redirectTo: '404',
  },
  {
    path: '404',
    component: Error404Component,
    data: { title: 'page.404' },
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
    }),
  ],
  exports: [RouterModule]
})
export class RoutesRoutingModule { }
