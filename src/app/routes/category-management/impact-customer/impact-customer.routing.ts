import { RouterModule, Routes } from '@angular/router';
import { ImpactCustomerComponent } from './impact-customer.component';

const routes: Routes = [
  {
    path: '',
    component: ImpactCustomerComponent
  },
];

export const ImpactCustomerRoutes = RouterModule.forChild(routes);
