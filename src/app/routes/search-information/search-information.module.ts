import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInformationRoutes } from './search-information.routing';
import { SearchTagRFIDComponent } from './search-tag-rfid/search-tag-rfid.component';
import { TagRfidDetailComponent } from './tag-rfid-detail/tag-rfid-detail.component';
import { SharedModule } from '@app/shared';
import { VehicleHistoryViaStationComponent } from './vehicle-history-via-station/vehicle-history-via-station.component';
import { SearchHistoryActionComponent } from './search-history-action/search-history-action.component';
import { HistoryActionDetailComponent } from './search-history-action/history-action-detail/history-action-detail.component';
import { SearchAgencyComponent } from './search-agency/search-agency.component';
import { LocationAgencyComponent } from './search-agency/location-agency/location-agency.component';
import { CustRegisComponent } from './cust-regis/cust-regis.component';
import { TopupEtcComponent } from './topup-etc/topup-etc.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    SearchInformationRoutes
  ],
  declarations: [
    SearchTagRFIDComponent,
    TagRfidDetailComponent,
    VehicleHistoryViaStationComponent,
    SearchHistoryActionComponent,
    HistoryActionDetailComponent,
    SearchAgencyComponent,
    LocationAgencyComponent,
    CustRegisComponent,
    TopupEtcComponent
  ]
})
export class SearchInformationModule { }
