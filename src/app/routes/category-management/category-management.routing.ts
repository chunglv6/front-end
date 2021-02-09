import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ImpactComponent } from './impact/impact.component';
import { ReasonImpactComponent } from './reason-impact/reason-impact.component';
import { ImpactLicenseComponent } from './impact-license/impact-license.component';
import { ImpactCustomerComponent } from './impact-customer/impact-customer.component';

const routes: Routes = [
  {
    path: 'impact',
    component: ImpactComponent,
    data: {
      title: 'menu.category-management.impact'
    }
  },
  {
    path: 'reason-impact',
    component: ReasonImpactComponent,
    data: {
      title: 'menu.category-management.reason-impact'
    }
  },
  {
    path: 'customer-impact',
    component: ImpactLicenseComponent,
    data: {
      title: 'menu.category-management.customer-impact'
    }
  },
  {
    path: 'license-impact',
    component: ImpactCustomerComponent,
    data: {
      title: 'menu.category-management.license-impact'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class CategoryManagementRoutingModule { }
