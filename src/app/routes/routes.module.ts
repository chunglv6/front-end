import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterContractServiceComponent } from './register-services/register-contract-service/register-contract-service.component';
import { RegisterCustomerAuthorizedComponent } from './register-services/register-customer-service/register-customer-authorized/register-customer-authorized.component';
import { RegisterCustomerRepresentativeComponent } from './register-services/register-customer-service/register-customer-representative/register-customer-representative.component';
import { RegisterCustomerServiceComponent } from './register-services/register-customer-service/register-customer-service.component';
import { AssignRfidDialogComponent } from './register-services/register-service-information/assign-rfid-dialog/assign-rfid-dialog.component';
import { RegisterServiceInformationComponent } from './register-services/register-service-information/register-service-information.component';
import { RegisterServicesComponent } from './register-services/register-services.component';
import { RegisterVehicleServiceComponent } from './register-services/register-vehicle-service/register-vehicle-service.component';
import { RoutesRoutingModule } from './routes-routing.module';
import { RouteStore } from './routes.store';

const COMPONENTS = [
  DashboardComponent,
  RegisterServicesComponent,
  RegisterCustomerServiceComponent,
  RegisterCustomerRepresentativeComponent,
  RegisterCustomerAuthorizedComponent,
  RegisterContractServiceComponent,
  RegisterVehicleServiceComponent,
  RegisterServiceInformationComponent,
  AssignRfidDialogComponent
];
const COMPONENTS_DYNAMIC = [];

@NgModule({
  imports: [CommonModule, SharedModule, RoutesRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC],
  entryComponents: COMPONENTS_DYNAMIC,
  providers: [RouteStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RoutesModule { }
