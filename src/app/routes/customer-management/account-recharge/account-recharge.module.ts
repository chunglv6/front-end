import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountRechargeComponent } from './account-recharge.component';
import { SharedModule } from '@app/shared';
import { AccountRechargeRoutes } from './account-recharge.routing';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AccountRechargeRoutes
  ],
  declarations: [AccountRechargeComponent]
})
export class AccountRechargeModule { }
