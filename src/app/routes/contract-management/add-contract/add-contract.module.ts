//author hieulx

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { AddContractAddComponent } from './add-contract-add/add-contract-add.component';
import { AddContractRoutingModule } from './add-contract-routing.module';
import { AddContractComponent } from './add-contract-index/add-contract-index.component';

@NgModule({
    declarations: [
      AddContractAddComponent,
      AddContractComponent,
    ],
    imports: [
      CommonModule,
      SharedModule,
  
      AddContractRoutingModule,
    ],
    entryComponents: []
  })
  export class AddContractModule { }