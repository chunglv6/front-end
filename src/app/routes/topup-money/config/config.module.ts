import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigComponent } from './config.component';
import { TopupMoneyConfigRoutes } from './config.routing';
import { SharedModule } from '@app/shared';
import { DetailConfigTopupMoneyComponent } from './detail/detail.component';

@NgModule({
  imports: [
    CommonModule,
    TopupMoneyConfigRoutes,
    SharedModule,
  ],
  declarations: [ConfigComponent, DetailConfigTopupMoneyComponent]
})
export class TopupMoneyConfigModule { }
