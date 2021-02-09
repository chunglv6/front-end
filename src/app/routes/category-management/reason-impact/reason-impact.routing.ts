import { ReasonImpactComponent } from './reason-impact.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ReasonImpactComponent
  },
];

export const ReasonImpactRoutes = RouterModule.forChild(routes);
