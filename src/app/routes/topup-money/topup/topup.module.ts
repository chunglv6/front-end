import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopupComponent } from './topup.component';
import { SharedModule } from '@app/shared';
import { TopupRoutes } from './topup.routing';

@NgModule({
  imports: [
    CommonModule,
    TopupRoutes,
    SharedModule
  ],
  declarations: [TopupComponent]
})
export class TopupModule { }
