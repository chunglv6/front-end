import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateCancelTicketNoRefundComponent } from './update-cancel-ticket-no-refund.component';
import { UpdateCancelTicketNoRefundRoutes } from './update-cancel-ticket-no-refund.routing';
import { SharedModule } from '@app/shared';

@NgModule({
  imports: [
    CommonModule,
    UpdateCancelTicketNoRefundRoutes,
    SharedModule
  ],
  declarations: [UpdateCancelTicketNoRefundComponent]
})
export class UpdateCancelTicketNoRefundModule { }
