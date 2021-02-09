import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { SignNewContractSignNewComponent } from './new-contract-new/new-contract-new.component';
import { SignNewContractComponent } from './new-contract-index/new-contract-index.component';
import { SignNewContractRoutingModule } from './new-contract-routing.module';

@NgModule({
  declarations: [
    SignNewContractSignNewComponent,
    SignNewContractComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,

    SignNewContractRoutingModule,
  ],
  entryComponents: []
})
export class SignNewContractModule { }
