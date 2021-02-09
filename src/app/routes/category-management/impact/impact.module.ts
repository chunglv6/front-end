import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { ImpactComponent } from './impact.component';
import { ImpactRoutes } from './impact.routing';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ImpactRoutes
  ],
  declarations: [ImpactComponent]
})
export class ImpactModule { }
