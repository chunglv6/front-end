import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { TransactionComponent } from './transaction.component';
import { TransactionRoutes } from './transaction.routing';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TransactionRoutes
  ],
  declarations: [TransactionComponent]
})
export class TransactionModule { }
