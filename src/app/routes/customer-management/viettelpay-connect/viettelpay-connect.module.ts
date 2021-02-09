import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViettelpayConnectComponent } from './viettelpay-connect.component';
import { ViettelpayConnectRoutes } from './viettelpay-connect.routing';
import { SharedModule } from '@app/shared';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ViettelpayConnectRoutes
  ],
  declarations: [ViettelpayConnectComponent]
})
export class ViettelpayConnectModule { }
