import { Routes, RouterModule } from '@angular/router';
import { TopupComponent } from './topup.component';

const routes: Routes = [
  {
    path: '',
    component: TopupComponent
  },
];

export const TopupRoutes = RouterModule.forChild(routes);
