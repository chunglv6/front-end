import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { SignAppendixContractComponent } from './appendix-contract-index/appendix-contract-index.component';
import { SignAppendixContractSignAppendixComponent } from './appendix-contract-appendix/appendix-contract-appendix.component';
import { SignAppendixContractRoutingModule } from './appendix-contract-routing.module';
import { ImportFileVehicleComponent } from './import-file-vehicle/import-file-vehicle.component';

@NgModule({
  declarations: [
    SignAppendixContractSignAppendixComponent,
    SignAppendixContractComponent,
    ImportFileVehicleComponent
  ],
  imports: [
    CommonModule,
    SharedModule,

    SignAppendixContractRoutingModule,
  ],
  entryComponents: []
})
export class SignAppendixContractModule { }
