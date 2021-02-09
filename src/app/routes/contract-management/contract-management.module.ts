import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { ContractRoutingModule } from './contract-management.routing';
import { ContractManagementStore } from './contract-management.store';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ContractRoutingModule
  ],
  declarations: [],
  providers: [ContractManagementStore]
})
export class ContractManagementModule { }
