import { Routes, RouterModule } from '@angular/router';
import { ImpactComponent } from './impact.component';

const routes: Routes = [
  {
    path: '',
    component: ImpactComponent
  },
];

export const ImpactRoutes = RouterModule.forChild(routes);
