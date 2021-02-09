import { Routes, RouterModule } from '@angular/router';
import { ViettelpayConnectComponent } from './viettelpay-connect.component';

const routes: Routes = [
  {
    path: '',
    component: ViettelpayConnectComponent
  },
];

export const ViettelpayConnectRoutes = RouterModule.forChild(routes);
