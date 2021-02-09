import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { ImpactCustomerComponent } from './impact-customer.component';
import { ImpactCustomerRoutes } from './impact-customer.routing';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ImpactCustomerRoutes
  ],
  declarations: [ImpactCustomerComponent]
})
export class ImpactModule { }
