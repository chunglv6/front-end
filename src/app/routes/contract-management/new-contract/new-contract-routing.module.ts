//author hieulx

import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { SignNewContractComponent } from './new-contract-index/new-contract-index.component';

const routes: Routes = [
  {
    path: '',
    component: SignNewContractComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignNewContractRoutingModule { }
