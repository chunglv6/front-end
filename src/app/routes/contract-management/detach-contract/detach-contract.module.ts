import { NgModule } from '@angular/core';
import { DetachContractComponent } from './detach-contract-index/detach-contract-index.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { DetachContractRoutingModule } from './detach-contract-routing.module';
import { DetachContractDetachComponent } from './detach-contract-detach/detach-contract-detach.component';

@NgModule({
    declarations: [
      DetachContractDetachComponent,
      DetachContractComponent,
    ],
    imports: [
      CommonModule,
      SharedModule,
  
      DetachContractRoutingModule,
    ],
    entryComponents: []
  })
  export class DetachContractModule { }