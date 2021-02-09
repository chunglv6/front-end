import { Routes, RouterModule } from '@angular/router';
import { ChangeCardRfidComponent } from './change-card-rfid.component';

const routes: Routes = [
  {
    path: '',
    component: ChangeCardRfidComponent
  }
];

export const ChangeCardRfidRoutes = RouterModule.forChild(routes);
