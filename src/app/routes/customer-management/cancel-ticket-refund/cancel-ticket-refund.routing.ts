import { Routes, RouterModule } from '@angular/router';
import { CancelTicketRefundComponent } from './cancel-ticket-refund.component';

const routes: Routes = [
  {
    path: '',
    component: CancelTicketRefundComponent,
  },
];

// tslint:disable-next-line: variable-name
export const CancelTicketRefundRoutes = RouterModule.forChild(routes);
