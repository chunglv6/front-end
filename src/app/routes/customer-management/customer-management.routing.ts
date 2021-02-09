import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CustomerRegisterComponent } from './customer-register/customer-register.component';
import { ChangeInformationComponent } from './change-information/change-information.component';
import { BuyTicketComponent } from './buy-ticket/buy-ticket.component';
import { TransferOwnVehicleComponent } from './transfer-own-vehicle/transfer-own-vehicle.component';
import { CanDeactivateGuard } from '@app/core/guards/can-dead-active';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'customer-register',
  },
  {
    path: 'customer-register',
    component: CustomerRegisterComponent,
    data: {
      title: 'menu.customer-management.customer-register',
    },
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: 'change-information',
    component: ChangeInformationComponent,
    data: {
      title: 'menu.customer-management.change-information',
    },
  },
  {
    path: 'connect-viettelpay',
    loadChildren: () =>
      import('./viettelpay-connect/viettelpay-connect.module').then(m => m.ViettelpayConnectModule),
    data: {
      title: 'menu.customer-management.connect-viettelpay',
    },
  },
  {
    path: 'account-recharge',
    loadChildren: () =>
      import('./account-recharge/account-recharge.module').then(m => m.AccountRechargeModule),
    data: {
      title: 'menu.customer-management.account-recharge',
    }
  },
  {
    path: 'buy-ticket',
    component: BuyTicketComponent,
    data: {
      title: 'menu.customer-management.buy-ticket',
    },
  },
  {
    path: 'change-card-rfid',
    loadChildren: () =>
      import('./change-card-rfid/change-card-rfid.module').then(m => m.ChangeCardRfidModule),
    data: {
      title: 'menu.customer-management.change-card-rfid',
    },
  },
  {
    path: 'transfer-own-vehicle',
    component: TransferOwnVehicleComponent,
    data: {
      title: 'menu.customer-management.transfer-own-vehicle',
    },
  },
  {
    path: 'search',
    loadChildren: () => import('./search-info/search-info.module').then(m => m.SearchInfoModule),
    data: {
      title: 'menu.customer-management.search-info',
    },
  },
  {
    path: 'cancel-ticket-refund',
    loadChildren: () =>
      import('./cancel-ticket-refund/cancel-ticket-refund.module').then(
        m => m.CancelTicketRefundModule
      ),
    data: {
      title: 'menu.customer-management.cancel-ticket-refund',
    },
  },
  {
    path: 'update-cancel-ticket-no-refund',
    loadChildren: () =>
      import('./update-cancel-ticket-no-refund/update-cancel-ticket-no-refund.module').then(
        m => m.UpdateCancelTicketNoRefundModule
      ),
    data: {
      title: 'menu.customer-management.update-cancel-ticket-no-refund',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateGuard]
})
export class CustomerManagementRoutingModule { }
