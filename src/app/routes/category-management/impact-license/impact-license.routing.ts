import { ImpactLicenseComponent } from './impact-license.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ImpactLicenseComponent
  },
];

export const ImpactLicenseRoutes = RouterModule.forChild(routes);
