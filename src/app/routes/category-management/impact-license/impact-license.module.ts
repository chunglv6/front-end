import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { ImpactLicenseRoutes } from './impact-license.routing';
import { ImpactLicenseComponent } from './impact-license.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ImpactLicenseRoutes
  ],
  declarations: [ImpactLicenseComponent]
})
export class ImpactModule { }
