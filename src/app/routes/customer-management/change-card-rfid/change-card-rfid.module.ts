import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeCardRfidComponent } from './change-card-rfid.component';
import { ChangeCardRfidRoutes } from './change-card-rfid.routing';
import { SharedModule } from '@app/shared';

@NgModule({
  imports: [
    CommonModule,
    ChangeCardRfidRoutes,
    SharedModule
  ],
  declarations: [ChangeCardRfidComponent]
})
export class ChangeCardRfidModule { }
