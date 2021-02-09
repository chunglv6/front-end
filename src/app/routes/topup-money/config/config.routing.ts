import { Routes, RouterModule } from '@angular/router';
import { ConfigComponent } from './config.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigComponent
  },
];

export const TopupMoneyConfigRoutes = RouterModule.forChild(routes);
