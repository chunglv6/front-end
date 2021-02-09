import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PriorityForbiddenVehicleComponent } from './priority-forbidden-vehicle/priority-forbidden-vehicle.component';
import { ExceptionVehicleComponent } from './exception-vehicle/exception-vehicle.component';
import { ExceptionVehicleAccessComponent } from './exception-vehicle-access/exception-vehicle-access.component';
import { PriorityForbiddenVehicleAccessComponent } from './priority-forbidden-vehicle-access/priority-forbidden-vehicle-access.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'priority-forbidden-vehicle'
  },
  {
    path: 'priority-forbidden-vehicle',
    component: PriorityForbiddenVehicleComponent,
    data: {
      title: 'special-vehicle.title-page-priority'
    }
  },
  {
    path: 'exception-vehicle',
    component: ExceptionVehicleComponent,
    data: {
      title: 'special-vehicle.title-page-exception'
    }
  },
  {
    path: 'exception-vehicle-create',
    component: ExceptionVehicleAccessComponent,
    data: {
      title: 'special-vehicle.exception-vehicle-create'
    }
  },
  {
    path: 'exception-vehicle-update/:id',
    component: ExceptionVehicleAccessComponent,
    data: {
      title: 'special-vehicle.exception-vehicle-update'
    }
  },
  {
    path: 'priority-forbidden-vehicle-create',
    component: PriorityForbiddenVehicleAccessComponent,
    data: {
      title: 'special-vehicle.priority-forbidden-vehicle-create'
    }
  },
  {
    path: 'priority-forbidden-vehicle-update/:id',
    component: PriorityForbiddenVehicleAccessComponent,
    data: {
      title: 'special-vehicle.priority-forbidden-vehicle-update'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpecialVehicleManagementRoutingModule { }
