import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { CategoryManagementRoutingModule } from './category-management.routing';
import { BaseImpactCustomerComponent } from './impact-customer/base-impact-customer/base-impact-customer.component';
import { ConfirmLicenseComponent } from './impact-customer/confirm/confirm.component';
import { ImpactCustomerComponent } from './impact-customer/impact-customer.component';
import { BaseImpactLicenseComponent } from './impact-license/base-impact-license/base-impact-license.component';
import { ConfirmCustomerComponent } from './impact-license/confirm/confirm.component';
import { ImpactLicenseComponent } from './impact-license/impact-license.component';
import { BaseImpactComponent } from './impact/base-impact/base-impact.component';
import { ImpactComponent } from './impact/impact.component';
import { BaseImpactReasonComponent } from './reason-impact/base-impact-reason/base-impact-reason.component';
import { ReasonImpactComponent } from './reason-impact/reason-impact.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CategoryManagementRoutingModule
  ],
  declarations: [
    ImpactComponent,
    BaseImpactComponent,
    ReasonImpactComponent,
    BaseImpactReasonComponent,
    ImpactLicenseComponent,
    BaseImpactLicenseComponent,
    ImpactCustomerComponent,
    BaseImpactCustomerComponent,
    ConfirmCustomerComponent,
    ConfirmLicenseComponent
  ],
})
export class CategoryManagementModule { }
