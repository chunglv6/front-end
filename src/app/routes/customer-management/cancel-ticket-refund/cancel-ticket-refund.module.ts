import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CancelTicketRefundComponent } from './cancel-ticket-refund.component';
import { CancelTicketRefundRoutes } from './cancel-ticket-refund.routing';
import { SharedModule } from '@app/shared';
import { CancelDetailComponent } from './cancel-detail/cancel-detail.component';
import { RequiedRefundComponent } from './requied-refund/requied-refund.component';

@NgModule({
  imports: [CommonModule, CancelTicketRefundRoutes, SharedModule],
  declarations: [CancelTicketRefundComponent, CancelDetailComponent, RequiedRefundComponent],
})
export class CancelTicketRefundModule {}
