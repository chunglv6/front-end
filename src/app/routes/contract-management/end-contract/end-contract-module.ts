import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { EndContractRoutingModule } from './end-contract-routing.module';
import { EndContractComponent } from './end-contract-index/end-contract-index.component';
import { EndContractEndComponent } from './end-contract-end/end-contract-end.component';

@NgModule({
    declarations: [
      EndContractEndComponent,
      EndContractComponent,
    ],
    imports: [
      CommonModule,
      SharedModule,
  
      EndContractRoutingModule,
    ],
    entryComponents: []
  })
  export class EndContractModule { }