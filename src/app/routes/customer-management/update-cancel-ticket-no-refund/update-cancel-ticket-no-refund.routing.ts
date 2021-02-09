import { Routes, RouterModule } from '@angular/router';
import { UpdateCancelTicketNoRefundComponent } from './update-cancel-ticket-no-refund.component';

const routes: Routes = [
  {
    path: '',
    component: UpdateCancelTicketNoRefundComponent,
  },
];

// tslint:disable-next-line: variable-name
export const UpdateCancelTicketNoRefundRoutes = RouterModule.forChild(routes);
