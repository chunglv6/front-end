import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { BriefcaseAddComponent } from './briefcase-add/briefcase-add.component';
import { BriefcaseApproveComponent } from './briefcase-approve/briefcase-approve.component';
import { BriefcaseDenialComponent } from './briefcase-approve/briefcase-denial/briefcase-denial.component';
import { TableContractComponent } from './briefcase-approve/table-contract/table-contract.component';
import { TableLicensePlatesComponent } from './briefcase-approve/table-licensePlates/table-licensePlates.component';
import { BriefcaseDetailComponent } from './briefcase-detail/briefcase-detail.component';
import { TableDetailComponent } from './briefcase-detail/table-detail/table-detail.component';
import { BriefcaseIndexComponent } from './briefcase-index/briefcase-index.component';
import { BriefcaseRoutingRoutes } from './briefcase-routing.module';
import { BriefcaseSearchComponent } from './briefcase-search/briefcase-search.component';
import { TableContractAdditionalComponent } from './briefcase-add/table-contract-additional/table-contract-additional.component';
import { TableVehicleAdditionalComponent } from './briefcase-add/table-vehicle-additional/table-vehicle-additional.component';

@NgModule({
  declarations: [
    BriefcaseIndexComponent,
    BriefcaseSearchComponent,
    BriefcaseDetailComponent,
    BriefcaseApproveComponent,
    BriefcaseAddComponent,
    TableContractComponent,
    TableLicensePlatesComponent,
    TableContractAdditionalComponent,
    TableDetailComponent,
    BriefcaseDenialComponent,
    TableVehicleAdditionalComponent,
  ],
  imports: [CommonModule, SharedModule, BriefcaseRoutingRoutes],
  entryComponents: [],
})
export class BriefcaseModule {}
