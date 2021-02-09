import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { MergeContractRoutingModule } from './merge-contract-routing.module';
import { MergeContractMergeComponent } from './merge-contract-merge/merge-contract-merge.component';
import { MergeContractComponent } from './merge-contract-index/merge-contract-index.component';

@NgModule({
    declarations: [
      MergeContractMergeComponent,
      MergeContractComponent,
    ],
    imports: [
      CommonModule,
      SharedModule,
  
      MergeContractRoutingModule,
    ],
    entryComponents: []
  })
  export class MergeContractModule { }