import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { ReasonImpactRoutes } from './reason-impact.routing';
import { ReasonImpactComponent } from './reason-impact.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReasonImpactRoutes
  ],
  declarations: [ReasonImpactComponent]
})
export class ImpactModule { }
