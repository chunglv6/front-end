import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { ActionAuditComponent } from './info-customer/action-audit/action-audit.component';
import { ContractListComponent } from './info-customer/contract-list/contract-list.component';
import { InfoCustomerComponent } from './info-customer/info-customer.component';
import { EnterpriseCustomerComponent } from './info-customer/info/enterprise-customer/enterprise-customer.component';
import { InfoComponent } from './info-customer/info/info.component';
import { ContractAccountHistoryComponent } from './info-customer/search-contract/contract-account-history/contract-account-history.component';
import { ContractActionAuditComponent } from './info-customer/search-contract/contract-action-audit/contract-action-audit.component';
import { ContractAttachListComponent } from './info-customer/search-contract/contract-attach-list/contract-attach-list.component';
import { ContractBillingHistoryComponent } from './info-customer/search-contract/contract-billing-history/contract-billing-history.component';
import { ContractVehicleListComponent } from './info-customer/search-contract/contract-vehicle-list/contract-vehicle-list.component';
import { InfoContractComponent } from './info-customer/search-contract/info-contract/info-contract.component';
import { InfoVehicleComponent } from './info-customer/search-vehicle/info-vehicle/info-vehicle.component';
import { VehicleActionAuditComponent } from './info-customer/search-vehicle/vehicle-action-audit/vehicle-action-audit.component';
import { VehicleAttachListComponent } from './info-customer/search-vehicle/vehicle-attach-list/vehicle-attach-list.component';
import { VehicleRfidHistoryComponent } from './info-customer/search-vehicle/vehicle-rfid-history/vehicle-rfid-history.component';
import { CarStrationComponent } from './info-customer/transaction-history/car-stration/car-stration.component';
import { OtherTransactionComponent } from './info-customer/transaction-history/other-transaction/other-transaction.component';
import { TicketPurchaseComponent } from './info-customer/transaction-history/ticket-purchase/ticket-purchase.component';
import { TransactionHistoryComponent } from './info-customer/transaction-history/transaction-history.component';
import { SearchInfoIndexComponent } from './search-info-index/search-info-index.component';
import { SearchInfoRoutingModule } from './search-info-routing.module';
import { SearchInfoSearchComponent } from './search-info-search/search-info-search.component';

@NgModule({
  declarations: [
    SearchInfoIndexComponent,
    SearchInfoSearchComponent,
    InfoCustomerComponent,
    InfoComponent,
    ContractListComponent,
    ActionAuditComponent,
    TransactionHistoryComponent,
    TicketPurchaseComponent,
    CarStrationComponent,
    OtherTransactionComponent,
    InfoContractComponent,
    ContractVehicleListComponent,
    ContractAttachListComponent,
    ContractActionAuditComponent,
    ContractAccountHistoryComponent,
    ContractBillingHistoryComponent,
    InfoVehicleComponent,
    VehicleAttachListComponent,
    VehicleActionAuditComponent,
    VehicleRfidHistoryComponent,
    EnterpriseCustomerComponent,
  ],
  imports: [CommonModule, SharedModule, FormsModule, SearchInfoRoutingModule],
  entryComponents: [],
})
export class SearchInfoModule {}
