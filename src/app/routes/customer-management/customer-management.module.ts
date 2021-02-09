import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { BuyTicketComponent } from './buy-ticket/buy-ticket.component';
import { ChangeInformationCustomerComponent } from './change-information/change-information-customer/change-information-customer.component';
import { AccountHistoryComponent } from './change-information/change-information-customer/contract-information-group-tab/account-history/account-history.component';
import { ContractInformationTabComponent } from './change-information/change-information-customer/contract-information-group-tab/contract-information-tab/contract-information-tab.component';
import { ContractProfileComponent } from './change-information/change-information-customer/contract-information-group-tab/contract-profile/contract-profile.component';
import { ImpactHistoryComponent } from './change-information/change-information-customer/contract-information-group-tab/impact-history/impact-history.component';
import { InvoiceHistoryComponent } from './change-information/change-information-customer/contract-information-group-tab/invoice-history/invoice-history.component';
import { ChangeStatusCardComponent } from './change-information/change-information-customer/contract-information-group-tab/vehicle-list/change-status-card/change-status-card.component';
import { RFIDTagComponent } from './change-information/change-information-customer/contract-information-group-tab/vehicle-list/rfid-tag/rfid-tag.component';
import { VehicleListComponent } from './change-information/change-information-customer/contract-information-group-tab/vehicle-list/vehicle-list.component';
import { ContractListTabComponent } from './change-information/change-information-customer/customer-information-group-tab/contract-list-tab/contract-list-tab.component';
import { AuthorizedComponent } from './change-information/change-information-customer/customer-information-group-tab/customer-information-tab/authorized/authorized.component';
import { CustomerInformationTabComponent } from './change-information/change-information-customer/customer-information-group-tab/customer-information-tab/customer-information-tab.component';
import { RepresentativeComponent } from './change-information/change-information-customer/customer-information-group-tab/customer-information-tab/representative/representative.component';
import { ProfileAttachmentTabComponent } from './change-information/change-information-customer/vehicle-information-group-tab/profile-attachment-tab/profile-attachment-tab.component';
import { VehicleInformationTabComponent } from './change-information/change-information-customer/vehicle-information-group-tab/vehicle-information-tab/vehicle-information-tab.component';
import { ChangeInformationComponent } from './change-information/change-information.component';
import { CustomerManagementRoutingModule } from './customer-management.routing';
import { CustomerInformationAuthorizedComponent } from './customer-register/customer-information/customer-information-authorized/customer-information-authorized.component';
import { CustomerInformationRepresentativeComponent } from './customer-register/customer-information/customer-information-representative/customer-information-representative.component';
import { CustomerInformationComponent } from './customer-register/customer-information/customer-information.component';
import { CustomerRegisterComponent } from './customer-register/customer-register.component';
import { TransferOwnVehicleComponent } from './transfer-own-vehicle/transfer-own-vehicle.component';
@NgModule({
  imports: [CommonModule, SharedModule, CustomerManagementRoutingModule],
  declarations: [
    CustomerRegisterComponent,
    CustomerInformationComponent,
    ChangeInformationComponent,
    ChangeInformationCustomerComponent,
    CustomerInformationTabComponent,
    ContractListTabComponent,
    VehicleInformationTabComponent,
    VehicleInformationTabComponent,
    BuyTicketComponent,
    ContractInformationTabComponent,
    VehicleListComponent,
    ContractProfileComponent,
    ImpactHistoryComponent,
    AccountHistoryComponent,
    InvoiceHistoryComponent,
    TransferOwnVehicleComponent,
    CustomerInformationRepresentativeComponent,
    RFIDTagComponent,
    RepresentativeComponent,
    ChangeStatusCardComponent,
    ProfileAttachmentTabComponent,
    AuthorizedComponent,
    CustomerInformationAuthorizedComponent
  ]
})
export class CustomerManagementModule { }
